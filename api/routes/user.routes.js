const express = require('express');
const { User } = require('../models');
const { authMiddleware } = require('../middleware/auth.middleware');
const { checkRole } = require('../middleware/rbac.middleware');

const router = express.Router();

/**
 * POST /api/users/apply-vendor
 * Apply to become a vendor
 * Protected: requires logged-in customer
 */
router.post('/apply-vendor', authMiddleware, checkRole(['customer']), async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user role and status
    user.role = 'vendor';
    user.status = 'pending_vendor';
    await user.save();

    res.json({
      message: 'Your application to become a vendor has been submitted and is pending review.',
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
    console.error('Error in vendor application:', error);
    res.status(500).json({ error: 'Failed to submit vendor application' });
  }
});

/**
 * GET /api/users/profile
 * Get current user's profile
 * Protected: requires authentication
 */
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'status', 'phoneNumber', 'notificationPreference'],
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

/**
 * PUT /api/users/profile
 * Update current user's profile
 * Protected: requires authentication
 */
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { phoneNumber, notificationPreference } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update only allowed fields
    if (phoneNumber !== undefined) {
      user.phoneNumber = phoneNumber;
    }
    if (notificationPreference !== undefined) {
      // Validate enum value
      const validPreferences = ['email', 'sms', 'both', 'none'];
      if (!validPreferences.includes(notificationPreference)) {
        return res.status(400).json({ 
          error: 'Invalid notification preference. Must be one of: email, sms, both, none' 
        });
      }
      user.notificationPreference = notificationPreference;
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status,
        phoneNumber: user.phoneNumber,
        notificationPreference: user.notificationPreference,
      },
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

module.exports = router;
