const express = require('express');
const { Booking, Experience, Availability, User } = require('../models');
const emailService = require('../services/email.service');

// Initialize Stripe only if API key is available
const stripe = process.env.STRIPE_SECRET_KEY 
  ? require('stripe')(process.env.STRIPE_SECRET_KEY)
  : null;

const router = express.Router();

/**
 * POST /api/payments/stripe/create-intent
 * Create a Stripe PaymentIntent for a booking
 */
router.post('/stripe/create-intent', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY.' });
    }

    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ error: 'Missing required field: bookingId' });
    }

    // Find the booking
    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if payment already succeeded
    if (booking.paymentStatus === 'succeeded') {
      return res.status(400).json({ error: 'Booking has already been paid' });
    }

    // Convert price to cents (Stripe expects amounts in smallest currency unit)
    const amountInPence = Math.round(parseFloat(booking.totalPrice) * 100);

    // Create a PaymentIntent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInPence,
      currency: 'gbp',
      metadata: {
        bookingId: booking.id.toString(),
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Update the booking with the PaymentIntent ID
    booking.paymentIntentId = paymentIntent.id;
    await booking.save();

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating Stripe PaymentIntent:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

module.exports = router;
