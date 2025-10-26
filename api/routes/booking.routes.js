const express = require('express');
const { Booking, Experience, Availability, User } = require('../models');
const { authMiddleware } = require('../middleware/auth.middleware');
const { checkRole } = require('../middleware/rbac.middleware');
const emailService = require('../services/email.service');
const stripeService = require('../services/stripe.service');

const router = express.Router();

/**
 * POST /api/bookings
 * Create a new booking (first step of checkout)
 */
router.post('/', async (req, res) => {
  try {
    const { experienceId, availabilityId, quantity, customerDetails } = req.body;

    // Validate required fields
    if (!experienceId || !availabilityId || !quantity || !customerDetails) {
      return res.status(400).json({
        error: 'Missing required fields: experienceId, availabilityId, quantity, customerDetails',
      });
    }

    if (!customerDetails.name || !customerDetails.email) {
      return res.status(400).json({
        error: 'Customer details must include name and email',
      });
    }

    // Find the availability slot
    const availability = await Availability.findByPk(availabilityId);
    if (!availability) {
      return res.status(404).json({ error: 'Availability slot not found' });
    }

    // Check if enough slots are available
    if (quantity > availability.availableSlots) {
      return res.status(400).json({
        error: `Not enough slots available. Only ${availability.availableSlots} slots remaining.`,
      });
    }

    // Find the experience to get price and confirmationMode
    const experience = await Experience.findByPk(experienceId);
    if (!experience) {
      return res.status(404).json({ error: 'Experience not found' });
    }

    // Calculate total price and commission
    const totalPrice = parseFloat(experience.price) * quantity;
    const commissionRate = 0.15; // 15% commission
    const commissionAmount = totalPrice * commissionRate;

    // Create the booking with status 'pending' and paymentStatus 'pending'
    const booking = await Booking.create({
      experienceId,
      availabilityId,
      quantity,
      bookingDate: availability.date,
      totalPrice,
      status: 'pending',
      paymentStatus: 'pending',
      commissionRate,
      commissionAmount,
      customerName: customerDetails.name,
      customerEmail: customerDetails.email,
      customerId: 1, // TODO: Use actual customer ID when auth is implemented
    });

    res.status(201).json({
      message: 'Booking created successfully',
      bookingId: booking.id,
      totalPrice,
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

/**
 * GET /api/bookings/requests
 * Get all pending booking requests for the authenticated vendor
 * Protected: requires vendor role
 */
router.get('/requests', authMiddleware, checkRole(['vendor']), async (req, res) => {
  try {
    const vendorId = req.user.id;

    // Get all pending bookings for the vendor's experiences
    const bookings = await Booking.findAll({
      where: {
        status: 'pending',
        paymentStatus: 'succeeded',
      },
      include: [
        {
          model: Experience,
          as: 'experience',
          where: { vendorId },
          attributes: ['id', 'title', 'location'],
        },
        {
          model: Availability,
          as: 'availability',
          attributes: ['id', 'date', 'startTime', 'endTime'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching booking requests:', error);
    res.status(500).json({ error: 'Failed to fetch booking requests' });
  }
});

/**
 * GET /api/bookings/:id
 * Get booking details by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findByPk(id, {
      include: [
        {
          model: Experience,
          as: 'experience',
          attributes: ['id', 'title', 'description', 'price', 'confirmationMode'],
        },
        {
          model: Availability,
          as: 'availability',
          attributes: ['id', 'date', 'startTime', 'endTime'],
        },
      ],
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

/**
 * PUT /api/bookings/:id/confirm
 * Confirm a pending booking
 * Protected: requires vendor role
 */
router.put('/:id/confirm', authMiddleware, checkRole(['vendor']), async (req, res) => {
  try {
    const { id } = req.params;
    const vendorId = req.user.id;

    // Find the booking with related experience
    const booking = await Booking.findByPk(id, {
      include: [
        {
          model: Experience,
          as: 'experience',
          where: { vendorId },
        },
        {
          model: Availability,
          as: 'availability',
        },
      ],
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found or unauthorized' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ error: 'Booking is not in pending status' });
    }

    // Update booking status
    booking.status = 'confirmed';
    await booking.save();

    // Send confirmation email to customer
    await emailService.sendBookingConfirmation({
      bookingId: booking.id,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      experienceTitle: booking.experience.title,
      bookingDate: booking.bookingDate,
      quantity: booking.quantity,
      totalPrice: booking.totalPrice,
    });

    res.json({
      message: 'Booking confirmed successfully',
      booking,
    });
  } catch (error) {
    console.error('Error confirming booking:', error);
    res.status(500).json({ error: 'Failed to confirm booking' });
  }
});

/**
 * PUT /api/bookings/:id/decline
 * Decline a pending booking and refund the customer
 * Protected: requires vendor role
 */
router.put('/:id/decline', authMiddleware, checkRole(['vendor']), async (req, res) => {
  try {
    const { id } = req.params;
    const vendorId = req.user.id;

    // Find the booking with related experience and availability
    const booking = await Booking.findByPk(id, {
      include: [
        {
          model: Experience,
          as: 'experience',
          where: { vendorId },
        },
        {
          model: Availability,
          as: 'availability',
        },
      ],
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found or unauthorized' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ error: 'Booking is not in pending status' });
    }

    // Update booking status
    booking.status = 'declined';
    await booking.save();

    // Issue refund via Stripe (if payment was made)
    if (stripe && booking.paymentIntentId) {
      try {
        await stripe.refunds.create({
          payment_intent: booking.paymentIntentId,
        });
        console.log(`[Booking Decline] Refund issued for payment intent: ${booking.paymentIntentId}`);
      } catch (refundError) {
        console.error('[Booking Decline] Error issuing refund:', refundError);
        // Continue with the decline even if refund fails - log for manual review
      }
    }

    // Restore availability slots
    if (booking.availability) {
      booking.availability.availableSlots += booking.quantity;
      await booking.availability.save();
      console.log(`[Booking Decline] Restored ${booking.quantity} slots to availability ${booking.availability.id}`);
    }

    // Send decline notification to customer
    await emailService.sendBookingDeclined({
      bookingId: booking.id,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      experienceTitle: booking.experience.title,
      bookingDate: booking.bookingDate,
      quantity: booking.quantity,
      totalPrice: booking.totalPrice,
    });

    res.json({
      message: 'Booking declined successfully, refund processed',
      booking,
    });
  } catch (error) {
    console.error('Error declining booking:', error);
    res.status(500).json({ error: 'Failed to decline booking' });
  }
});

module.exports = router;
