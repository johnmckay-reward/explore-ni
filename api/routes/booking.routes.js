const express = require('express');
const { Booking, Experience, Availability, User } = require('../models');

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

module.exports = router;
