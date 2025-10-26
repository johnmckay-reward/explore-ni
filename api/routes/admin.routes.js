const express = require('express');
const { User, Experience } = require('../models');
const { authMiddleware } = require('../middleware/auth.middleware');
const { checkRole } = require('../middleware/rbac.middleware');
const settingsService = require('../services/settings.service');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(checkRole(['admin']));

/**
 * GET /api/admin/users?status=pending_vendor
 * Get list of users filtered by status
 */
router.get('/users', async (req, res) => {
  try {
    const { status } = req.query;
    
    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }

    const users = await User.findAll({
      where: whereClause,
      attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'status', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/**
 * PUT /api/admin/users/:id/approve
 * Approve a pending vendor
 */
router.put('/users/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.status !== 'pending_vendor') {
      return res.status(400).json({ error: 'User is not pending vendor approval' });
    }

    user.status = 'active';
    await user.save();

    res.json({
      message: 'Vendor approved successfully',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error('Error approving vendor:', error);
    res.status(500).json({ error: 'Failed to approve vendor' });
  }
});

/**
 * PUT /api/admin/users/:id/reject
 * Reject a pending vendor application
 */
router.put('/users/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Reset to customer with active status
    user.role = 'customer';
    user.status = 'active';
    await user.save();

    res.json({
      message: 'Vendor application rejected',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error('Error rejecting vendor:', error);
    res.status(500).json({ error: 'Failed to reject vendor' });
  }
});

/**
 * GET /api/admin/experiences?status=pending
 * Get list of experiences filtered by status
 */
router.get('/experiences', async (req, res) => {
  try {
    const { status } = req.query;
    
    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }

    const experiences = await Experience.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'vendor',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json(experiences);
  } catch (error) {
    console.error('Error fetching experiences:', error);
    res.status(500).json({ error: 'Failed to fetch experiences' });
  }
});

/**
 * PUT /api/admin/experiences/:id/approve
 * Approve a pending experience
 */
router.put('/experiences/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;

    const experience = await Experience.findByPk(id);
    if (!experience) {
      return res.status(404).json({ error: 'Experience not found' });
    }

    if (experience.status !== 'pending') {
      return res.status(400).json({ error: 'Experience is not pending approval' });
    }

    experience.status = 'approved';
    await experience.save();

    res.json({
      message: 'Experience approved successfully',
      experience,
    });
  } catch (error) {
    console.error('Error approving experience:', error);
    res.status(500).json({ error: 'Failed to approve experience' });
  }
});

/**
 * PUT /api/admin/experiences/:id/reject
 * Reject a pending experience
 */
router.put('/experiences/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;

    const experience = await Experience.findByPk(id);
    if (!experience) {
      return res.status(404).json({ error: 'Experience not found' });
    }

    experience.status = 'rejected';
    await experience.save();

    res.json({
      message: 'Experience rejected',
      experience,
    });
  } catch (error) {
    console.error('Error rejecting experience:', error);
    res.status(500).json({ error: 'Failed to reject experience' });
  }
});

/**
 * GET /api/admin/settings
 * Get all settings (keys and descriptions only, NOT values)
 */
router.get('/settings', async (req, res) => {
  try {
    const settings = await settingsService.getAllSettings();
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

/**
 * PUT /api/admin/settings
 * Update a setting value
 * Body: { key: '...', value: '...' }
 */
router.put('/settings', async (req, res) => {
  try {
    const { key, value } = req.body;

    if (!key || !value) {
      return res.status(400).json({ error: 'Missing required fields: key and value' });
    }

    await settingsService.updateSetting(key, value);

    res.json({
      message: 'Setting updated successfully',
      key,
    });
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ error: error.message || 'Failed to update setting' });
  }
});

module.exports = router;
