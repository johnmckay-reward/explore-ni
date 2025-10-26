const express = require('express');
const { Booking, Experience, Availability, User, Voucher } = require('../models');
const emailService = require('../services/email.service');
const smsService = require('../services/sms.service');

// Initialize Stripe only if API key is available
const stripe = process.env.STRIPE_SECRET_KEY 
  ? require('stripe')(process.env.STRIPE_SECRET_KEY)
  : null;

const router = express.Router();

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events
 * This endpoint receives notifications from Stripe when payment events occur
 */
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY.' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify webhook signature
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } else {
      // If no webhook secret configured, just parse the body
      // This is for development/testing only
      event = JSON.parse(req.body.toString());
      console.warn('[Stripe Webhook] No STRIPE_WEBHOOK_SECRET configured - skipping signature verification');
    }
  } catch (err) {
    console.error('[Stripe Webhook] Signature verification failed:', err.message);
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }

  // Handle the event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    
    try {
      // Check if this is a voucher purchase
      const voucherType = paymentIntent.metadata.voucherType;
      
      if (voucherType) {
        // Handle voucher payment
        await handleVoucherPayment(paymentIntent);
        return res.json({ received: true });
      }

      // Get booking ID from metadata
      const bookingId = paymentIntent.metadata.bookingId;
      
      if (!bookingId) {
        console.error('[Stripe Webhook] No bookingId found in PaymentIntent metadata');
        return res.status(400).json({ error: 'No bookingId in metadata' });
      }

      // Find the booking
      const booking = await Booking.findByPk(bookingId, {
        include: [
          {
            model: Experience,
            as: 'experience',
            include: [
              {
                model: User,
                as: 'vendor',
                attributes: ['id', 'firstName', 'lastName', 'email'],
              },
            ],
          },
          {
            model: Availability,
            as: 'availability',
          },
        ],
      });

      if (!booking) {
        console.error('[Stripe Webhook] Booking not found:', bookingId);
        return res.status(404).json({ error: 'Booking not found' });
      }

      // Update booking payment status
      booking.paymentStatus = 'succeeded';
      booking.transactionId = paymentIntent.latest_charge;
      await booking.save();

      // Decrement availability slots
      if (booking.availability) {
        booking.availability.availableSlots -= booking.quantity;
        await booking.availability.save();
      }

      // Check confirmation mode and update booking status accordingly
      if (booking.experience.confirmationMode === 'auto') {
        booking.status = 'confirmed';
        await booking.save();

        // Send booking confirmation email
        await emailService.sendBookingConfirmation({
          bookingId: booking.id,
          customerName: booking.customerName,
          customerEmail: booking.customerEmail,
          experienceTitle: booking.experience.title,
          bookingDate: booking.bookingDate,
          quantity: booking.quantity,
          totalPrice: booking.totalPrice,
        });
      } else if (booking.experience.confirmationMode === 'manual') {
        // For manual confirmation, send notification to vendor based on their preferences
        const vendor = booking.experience.vendor;
        
        // Check vendor's notification preference
        if (vendor.notificationPreference === 'email' || vendor.notificationPreference === 'both') {
          await emailService.sendVendorNewRequest({
            bookingId: booking.id,
            customerName: booking.customerName,
            customerEmail: booking.customerEmail,
            vendorName: `${vendor.firstName} ${vendor.lastName}`,
            vendorEmail: vendor.email,
            experienceTitle: booking.experience.title,
            bookingDate: booking.bookingDate,
            quantity: booking.quantity,
            totalPrice: booking.totalPrice,
          });
        }
        
        if ((vendor.notificationPreference === 'sms' || vendor.notificationPreference === 'both') && vendor.phoneNumber) {
          await smsService.sendVendorNewRequestSms(vendor, {
            experienceTitle: booking.experience.title,
            bookingDate: booking.bookingDate,
            quantity: booking.quantity,
            totalPrice: booking.totalPrice,
          });
        }
      }

      // Always send payment receipt
      await emailService.sendPaymentReceipt({
        bookingId: booking.id,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        experienceTitle: booking.experience.title,
        bookingDate: booking.bookingDate,
        quantity: booking.quantity,
        totalPrice: booking.totalPrice,
        transactionId: booking.transactionId,
      });

      console.log('[Stripe Webhook] Payment successful for booking:', bookingId);
    } catch (error) {
      console.error('[Stripe Webhook] Error processing payment_intent.succeeded:', error);
      return res.status(500).json({ error: 'Failed to process payment' });
    }
  }

  res.json({ received: true });
});

/**
 * Handle voucher payment success
 * @param {Object} paymentIntent - The Stripe PaymentIntent object
 */
async function handleVoucherPayment(paymentIntent) {
  try {
    const metadata = paymentIntent.metadata;
    const voucherType = metadata.voucherType;

    // Generate unique voucher code
    const code = `GIFT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Prepare voucher data
    const voucherData = {
      code,
      type: voucherType,
      initialValue: parseFloat(metadata.amount),
      currentBalance: parseFloat(metadata.amount),
      isEnabled: true,
      senderName: metadata.senderName,
      recipientName: metadata.recipientName,
      recipientEmail: metadata.recipientEmail,
      message: metadata.message || null,
    };

    // Add experience-specific fields
    if (voucherType === 'experience' && metadata.experienceId) {
      voucherData.experienceId = parseInt(metadata.experienceId);
      voucherData.experienceTitle = metadata.experienceTitle;
    }

    // Create the voucher
    const voucher = await Voucher.create(voucherData);

    // Send voucher email with PDF
    await emailService.sendVoucherEmail({
      code: voucher.code,
      type: voucher.type,
      initialValue: voucher.initialValue,
      senderName: voucher.senderName,
      recipientName: voucher.recipientName,
      recipientEmail: voucher.recipientEmail,
      message: voucher.message,
      experienceTitle: voucherData.experienceTitle,
    });

    console.log('[Stripe Webhook] Voucher created and email sent:', voucher.code);
  } catch (error) {
    console.error('[Stripe Webhook] Error processing voucher payment:', error);
    throw error;
  }
}

module.exports = router;
