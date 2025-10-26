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

module.exports = router;
