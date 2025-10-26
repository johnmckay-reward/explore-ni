const express = require('express');
const { Availability, Experience } = require('../models');
const { authMiddleware } = require('../middleware/auth.middleware');
const { checkRole } = require('../middleware/rbac.middleware');
const { Op } = require('sequelize');

const router = express.Router();

// All availability routes require authentication and vendor role
router.use(authMiddleware);
router.use(checkRole(['vendor']));

/**
 * GET /api/experiences/:experienceId/availability
 * Get all availability slots for a specific experience
 */
router.get('/experiences/:experienceId/availability', async (req, res) => {
  try {
    const { experienceId } = req.params;
    const vendorId = req.user.id;

    // Security check: verify the vendor owns this experience
    const experience = await Experience.findByPk(experienceId);
    if (!experience) {
      return res.status(404).json({ error: 'Experience not found' });
    }
    if (experience.vendorId !== vendorId) {
      return res.status(403).json({
        error: 'Forbidden: You do not have permission to access this experience',
      });
    }

    const availabilities = await Availability.findAll({
      where: { experienceId },
      order: [['date', 'ASC'], ['startTime', 'ASC']],
    });

    res.json(availabilities);
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
});

/**
 * POST /api/experiences/:experienceId/availability
 * Create a new availability slot
 */
router.post('/experiences/:experienceId/availability', async (req, res) => {
  try {
    const { experienceId } = req.params;
    const { date, startTime, endTime, availableSlots } = req.body;
    const vendorId = req.user.id;

    // Validate required fields
    if (!date || !startTime || !endTime || !availableSlots) {
      return res.status(400).json({
        error: 'Missing required fields: date, startTime, endTime, availableSlots',
      });
    }

    // Security check: verify the vendor owns this experience
    const experience = await Experience.findByPk(experienceId);
    if (!experience) {
      return res.status(404).json({ error: 'Experience not found' });
    }
    if (experience.vendorId !== vendorId) {
      return res.status(403).json({
        error: 'Forbidden: You do not have permission to modify this experience',
      });
    }

    // Create the availability slot
    const availability = await Availability.create({
      experienceId,
      date,
      startTime,
      endTime,
      availableSlots,
    });

    res.status(201).json({
      message: 'Availability slot created successfully',
      availability,
    });
  } catch (error) {
    console.error('Error creating availability:', error);
    res.status(500).json({ error: 'Failed to create availability slot' });
  }
});

/**
 * POST /api/experiences/:experienceId/availability-recurring
 * Create recurring availability slots
 */
router.post('/experiences/:experienceId/availability-recurring', async (req, res) => {
  try {
    const { experienceId } = req.params;
    const { startDate, endDate, startTime, endTime, daysOfWeek, availableSlots } = req.body;
    const vendorId = req.user.id;

    // Validate required fields
    if (!startDate || !endDate || !startTime || !endTime || !daysOfWeek || !availableSlots) {
      return res.status(400).json({
        error: 'Missing required fields: startDate, endDate, startTime, endTime, daysOfWeek, availableSlots',
      });
    }

    // Security check: verify the vendor owns this experience
    const experience = await Experience.findByPk(experienceId);
    if (!experience) {
      return res.status(404).json({ error: 'Experience not found' });
    }
    if (experience.vendorId !== vendorId) {
      return res.status(403).json({
        error: 'Forbidden: You do not have permission to modify this experience',
      });
    }

    // Day mapping for convenience
    const dayMap = {
      'SUN': 0,
      'MON': 1,
      'TUE': 2,
      'WED': 3,
      'THU': 4,
      'FRI': 5,
      'SAT': 6,
    };

    const dayNumbers = daysOfWeek.map(day => dayMap[day.toUpperCase()]);
    
    // Generate dates based on the date range and days of week
    const start = new Date(startDate);
    const end = new Date(endDate);
    const availabilitySlots = [];

    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dayOfWeek = date.getDay();
      if (dayNumbers.includes(dayOfWeek)) {
        // Format date as YYYY-MM-DD
        const dateString = date.toISOString().split('T')[0];
        availabilitySlots.push({
          experienceId,
          date: dateString,
          startTime,
          endTime,
          availableSlots,
        });
      }
    }

    // Bulk create all availability slots
    const createdSlots = await Availability.bulkCreate(availabilitySlots);

    res.status(201).json({
      message: `Created ${createdSlots.length} recurring availability slots`,
      count: createdSlots.length,
      availabilities: createdSlots,
    });
  } catch (error) {
    console.error('Error creating recurring availability:', error);
    res.status(500).json({ error: 'Failed to create recurring availability' });
  }
});

/**
 * PUT /api/availability/:id
 * Update a single availability slot
 */
router.put('/availability/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { date, startTime, endTime, availableSlots } = req.body;
    const vendorId = req.user.id;

    const availability = await Availability.findByPk(id, {
      include: [{ model: Experience, as: 'experience' }],
    });

    if (!availability) {
      return res.status(404).json({ error: 'Availability slot not found' });
    }

    // Security check: verify the vendor owns the experience
    if (availability.experience.vendorId !== vendorId) {
      return res.status(403).json({
        error: 'Forbidden: You do not have permission to modify this availability slot',
      });
    }

    // Update fields if provided
    if (date !== undefined) availability.date = date;
    if (startTime !== undefined) availability.startTime = startTime;
    if (endTime !== undefined) availability.endTime = endTime;
    if (availableSlots !== undefined) availability.availableSlots = availableSlots;

    await availability.save();

    res.json({
      message: 'Availability slot updated successfully',
      availability,
    });
  } catch (error) {
    console.error('Error updating availability:', error);
    res.status(500).json({ error: 'Failed to update availability slot' });
  }
});

/**
 * DELETE /api/availability/:id
 * Delete a single availability slot
 */
router.delete('/availability/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const vendorId = req.user.id;

    const availability = await Availability.findByPk(id, {
      include: [{ model: Experience, as: 'experience' }],
    });

    if (!availability) {
      return res.status(404).json({ error: 'Availability slot not found' });
    }

    // Security check: verify the vendor owns the experience
    if (availability.experience.vendorId !== vendorId) {
      return res.status(403).json({
        error: 'Forbidden: You do not have permission to delete this availability slot',
      });
    }

    await availability.destroy();

    res.json({
      message: 'Availability slot deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting availability:', error);
    res.status(500).json({ error: 'Failed to delete availability slot' });
  }
});

module.exports = router;
