const cron = require('node-cron');
const { Booking, Experience, Availability, User } = require('../models');
const emailService = require('../services/email.service');
const stripeService = require('../services/stripe.service');

// Business hours configuration (24-hour format)
const BIZ_HOURS_START = 9; // 9 AM
const BIZ_HOURS_END = 17; // 5 PM

// Timeout thresholds in milliseconds
const TIMEOUT_BIZ_HOURS = 2 * 60 * 60 * 1000; // 2 hours
const TIMEOUT_NON_BIZ_HOURS = 12 * 60 * 60 * 1000; // 12 hours

// Admin email for escalations
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@explore-ni.com';

/**
 * Check if current time is within business hours
 * @param {Date} date - The date to check
 * @returns {boolean}
 */
const isBusinessHours = (date) => {
  const hour = date.getHours();
  const day = date.getDay(); // 0 = Sunday, 6 = Saturday
  
  // Check if it's a weekday and within business hours
  return day >= 1 && day <= 5 && hour >= BIZ_HOURS_START && hour < BIZ_HOURS_END;
};

/**
 * Process a timed-out booking based on the experience's timeout behavior
 * @param {Object} booking - The booking to process
 */
const processTimedOutBooking = async (booking) => {
  try {
    const { experience, availability } = booking;
    const timeoutBehavior = experience.timeoutBehavior || 'auto-decline';

    console.log(`[Timeout Job] Processing timed-out booking ${booking.id} with behavior: ${timeoutBehavior}`);

    switch (timeoutBehavior) {
      case 'auto-confirm':
        // Check if availability still exists
        if (availability && availability.availableSlots > 0) {
          booking.status = 'confirmed';
          await booking.save();

          // Send confirmation email to customer
          await emailService.sendBookingConfirmation({
            bookingId: booking.id,
            customerName: booking.customerName,
            customerEmail: booking.customerEmail,
            experienceTitle: experience.title,
            bookingDate: booking.bookingDate,
            quantity: booking.quantity,
            totalPrice: booking.totalPrice,
          });

          console.log(`[Timeout Job] Auto-confirmed booking ${booking.id}`);
        } else {
          // Not enough slots, fall back to decline
          await declineBooking(booking, experience, availability);
        }
        break;

      case 'auto-decline':
        await declineBooking(booking, experience, availability);
        break;

      case 'escalate':
        booking.isEscalated = true;
        await booking.save();

        // Send escalation email to admin
        await emailService.sendBookingConfirmation({
          bookingId: booking.id,
          customerName: 'Admin',
          customerEmail: ADMIN_EMAIL,
          experienceTitle: `[ESCALATION] ${experience.title}`,
          bookingDate: booking.bookingDate,
          quantity: booking.quantity,
          totalPrice: booking.totalPrice,
        });

        console.log(`[Timeout Job] Escalated booking ${booking.id} to admin`);
        break;

      default:
        console.warn(`[Timeout Job] Unknown timeout behavior: ${timeoutBehavior}`);
    }
  } catch (error) {
    console.error(`[Timeout Job] Error processing timed-out booking ${booking.id}:`, error);
  }
};

/**
 * Decline a booking and issue refund
 * @param {Object} booking - The booking to decline
 * @param {Object} experience - The experience
 * @param {Object} availability - The availability slot
 */
const declineBooking = async (booking, experience, availability) => {
  // Update booking status
  booking.status = 'declined';
  await booking.save();

  // Issue refund via Stripe (if payment was made)
  const stripe = stripeService.getStripeClient();
  if (stripe && booking.paymentIntentId) {
    try {
      await stripe.refunds.create({
        payment_intent: booking.paymentIntentId,
      });
      console.log(`[Timeout Job] Refund issued for payment intent: ${booking.paymentIntentId}`);
    } catch (refundError) {
      console.error('[Timeout Job] Error issuing refund:', refundError);
    }
  }

  // Restore availability slots
  if (availability) {
    availability.availableSlots += booking.quantity;
    await availability.save();
    console.log(`[Timeout Job] Restored ${booking.quantity} slots to availability ${availability.id}`);
  }

  // Send decline notification to customer
  await emailService.sendBookingDeclined({
    bookingId: booking.id,
    customerName: booking.customerName,
    customerEmail: booking.customerEmail,
    experienceTitle: experience.title,
    bookingDate: booking.bookingDate,
    quantity: booking.quantity,
    totalPrice: booking.totalPrice,
  });

  console.log(`[Timeout Job] Auto-declined booking ${booking.id}`);
};

/**
 * Main job to check and process timed-out bookings
 */
const checkBookingTimeouts = async () => {
  try {
    const now = new Date();
    const isBizHours = isBusinessHours(now);
    const timeoutThreshold = isBizHours ? TIMEOUT_BIZ_HOURS : TIMEOUT_NON_BIZ_HOURS;

    console.log(`[Timeout Job] Running at ${now.toISOString()}, Business Hours: ${isBizHours}, Threshold: ${timeoutThreshold / 1000 / 60} minutes`);

    // Find all pending bookings that are not yet escalated
    const pendingBookings = await Booking.findAll({
      where: {
        status: 'pending',
        paymentStatus: 'succeeded',
        isEscalated: false,
      },
      include: [
        {
          model: Experience,
          as: 'experience',
          attributes: ['id', 'title', 'timeoutBehavior'],
        },
        {
          model: Availability,
          as: 'availability',
        },
      ],
    });

    console.log(`[Timeout Job] Found ${pendingBookings.length} pending booking(s)`);

    for (const booking of pendingBookings) {
      const createdAt = new Date(booking.createdAt);
      const elapsedTime = now - createdAt;

      // Check if booking has exceeded timeout threshold
      if (elapsedTime > timeoutThreshold) {
        console.log(`[Timeout Job] Booking ${booking.id} timed out (elapsed: ${elapsedTime / 1000 / 60} minutes)`);
        await processTimedOutBooking(booking);
      }
    }

    console.log('[Timeout Job] Completed');
  } catch (error) {
    console.error('[Timeout Job] Error checking booking timeouts:', error);
  }
};

/**
 * Start the booking timeout cron job
 * Runs every 10 minutes
 */
const startBookingTimeoutJob = () => {
  // Schedule job to run every 10 minutes
  cron.schedule('*/10 * * * *', () => {
    checkBookingTimeouts();
  });

  console.log('[Timeout Job] Booking timeout job scheduled to run every 10 minutes');
};

module.exports = {
  startBookingTimeoutJob,
  checkBookingTimeouts, // Export for manual testing
};
