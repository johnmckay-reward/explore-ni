const express = require('express');
const { Booking, Experience, Availability, User } = require('../models');
const emailService = require('../services/email.service');

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
        // For manual confirmation, send notification to vendor
        await emailService.sendVendorNewRequest({
          bookingId: booking.id,
          customerName: booking.customerName,
          customerEmail: booking.customerEmail,
          vendorName: `${booking.experience.vendor.firstName} ${booking.experience.vendor.lastName}`,
          vendorEmail: booking.experience.vendor.email,
          experienceTitle: booking.experience.title,
          bookingDate: booking.bookingDate,
          quantity: booking.quantity,
          totalPrice: booking.totalPrice,
        });
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

  // Return a response to acknowledge receipt of the event
  res.json({ received: true });
});

module.exports = router;
