const express = require('express');
const { Experience, User } = require('../models');
const { authMiddleware } = require('../middleware/auth.middleware');
const { checkRole } = require('../middleware/rbac.middleware');

const router = express.Router();

// All experience routes require authentication
router.use(authMiddleware);

/**
 * POST /api/experiences
 * Create a new experience (vendor only)
 */
router.post('/', checkRole(['vendor']), async (req, res) => {
  try {
    const { title, description, location, duration, price, capacity } = req.body;
    const vendorId = req.user.id;

    // Validate required fields
    if (!title || !location || !duration || !price || !capacity) {
      return res.status(400).json({
        error: 'Missing required fields: title, location, duration, price, capacity',
      });
    }

    // Create the experience with pending status
    const experience = await Experience.create({
      title,
      description,
      location,
      duration,
      price,
      capacity,
      vendorId,
      status: 'pending',
    });

    res.status(201).json({
      message: 'Experience created successfully and is pending approval',
      experience,
    });
  } catch (error) {
    console.error('Error creating experience:', error);
    res.status(500).json({ error: 'Failed to create experience' });
  }
});

/**
 * GET /api/experiences/my-listings
 * Get all experiences for the logged-in vendor
 */
router.get('/my-listings', checkRole(['vendor']), async (req, res) => {
  try {
    const vendorId = req.user.id;

    const experiences = await Experience.findAll({
      where: { vendorId },
      order: [['createdAt', 'DESC']],
    });

    res.json(experiences);
  } catch (error) {
    console.error('Error fetching vendor experiences:', error);
    res.status(500).json({ error: 'Failed to fetch experiences' });
  }
});

/**
 * GET /api/experiences/:id
 * Get a specific experience
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const experience = await Experience.findByPk(id, {
      include: [
        {
          model: User,
          as: 'vendor',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
    });

    if (!experience) {
      return res.status(404).json({ error: 'Experience not found' });
    }

    res.json(experience);
  } catch (error) {
    console.error('Error fetching experience:', error);
    res.status(500).json({ error: 'Failed to fetch experience' });
  }
});

/**
 * PUT /api/experiences/:id
 * Update an experience
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, location, duration, price, capacity } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const experience = await Experience.findByPk(id);
    if (!experience) {
      return res.status(404).json({ error: 'Experience not found' });
    }

    // Security check: only the vendor who owns this or an admin can update
    if (userRole !== 'admin' && experience.vendorId !== userId) {
      return res.status(403).json({
        error: 'Forbidden: You do not have permission to update this experience',
      });
    }

    // Update fields if provided
    if (title !== undefined) experience.title = title;
    if (description !== undefined) experience.description = description;
    if (location !== undefined) experience.location = location;
    if (duration !== undefined) experience.duration = duration;
    if (price !== undefined) experience.price = price;
    if (capacity !== undefined) experience.capacity = capacity;

    await experience.save();

    res.json({
      message: 'Experience updated successfully',
      experience,
    });
  } catch (error) {
    console.error('Error updating experience:', error);
    res.status(500).json({ error: 'Failed to update experience' });
  }
});

/**
 * DELETE /api/experiences/:id
 * Delete an experience
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const experience = await Experience.findByPk(id);
    if (!experience) {
      return res.status(404).json({ error: 'Experience not found' });
    }

    // Security check: only the vendor who owns this or an admin can delete
    if (userRole !== 'admin' && experience.vendorId !== userId) {
      return res.status(403).json({
        error: 'Forbidden: You do not have permission to delete this experience',
      });
    }

    await experience.destroy();

    res.json({
      message: 'Experience deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting experience:', error);
    res.status(500).json({ error: 'Failed to delete experience' });
  }
});

module.exports = router;
