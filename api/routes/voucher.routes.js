const express = require('express');
const { Voucher, Booking, Experience } = require('../models');
const { authMiddleware } = require('../middleware/auth.middleware');
const { checkRole } = require('../middleware/rbac.middleware');

// Initialize Stripe only if API key is available
const stripe = process.env.STRIPE_SECRET_KEY 
  ? require('stripe')(process.env.STRIPE_SECRET_KEY)
  : null;

const router = express.Router();

/**
 * POST /api/vouchers/purchase-fixed
 * Create a Stripe PaymentIntent for purchasing a fixed-amount voucher
 */
router.post('/purchase-fixed', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY.' });
    }

    const { amount, senderName, recipientName, recipientEmail, message } = req.body;

    // Validate required fields
    if (!amount || !senderName || !recipientName || !recipientEmail) {
      return res.status(400).json({ 
        error: 'Missing required fields: amount, senderName, recipientName, recipientEmail' 
      });
    }

    // Validate amount
    const voucherAmount = parseFloat(amount);
    if (isNaN(voucherAmount) || voucherAmount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Convert price to pence (Stripe expects amounts in smallest currency unit)
    const amountInPence = Math.round(voucherAmount * 100);

    // Create a PaymentIntent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInPence,
      currency: 'gbp',
      metadata: {
        voucherType: 'fixed_amount',
        amount: voucherAmount.toString(),
        senderName,
        recipientName,
        recipientEmail,
        message: message || '',
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating fixed voucher payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

/**
 * POST /api/vouchers/purchase-experience
 * Create a Stripe PaymentIntent for purchasing an experience voucher
 */
router.post('/purchase-experience', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY.' });
    }

    const { experienceId, senderName, recipientName, recipientEmail, message } = req.body;

    // Validate required fields
    if (!experienceId || !senderName || !recipientName || !recipientEmail) {
      return res.status(400).json({ 
        error: 'Missing required fields: experienceId, senderName, recipientName, recipientEmail' 
      });
    }

    // Find the experience
    const experience = await Experience.findByPk(experienceId);
    if (!experience) {
      return res.status(404).json({ error: 'Experience not found' });
    }

    // Convert price to pence
    const amountInPence = Math.round(parseFloat(experience.price) * 100);

    // Create a PaymentIntent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInPence,
      currency: 'gbp',
      metadata: {
        voucherType: 'experience',
        experienceId: experienceId.toString(),
        experienceTitle: experience.title,
        amount: experience.price.toString(),
        senderName,
        recipientName,
        recipientEmail,
        message: message || '',
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating experience voucher payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

/**
 * POST /api/vouchers/apply
 * Apply a voucher to a booking
 */
router.post('/apply', async (req, res) => {
  try {
    const { code, bookingId } = req.body;

    // Validate required fields
    if (!code || !bookingId) {
      return res.status(400).json({ error: 'Missing required fields: code, bookingId' });
    }

    // Find the voucher
    const voucher = await Voucher.findOne({ where: { code } });
    if (!voucher) {
      return res.status(404).json({ error: 'Voucher not found' });
    }

    // Validate voucher
    if (!voucher.isEnabled) {
      return res.status(400).json({ error: 'Voucher is not enabled or has been fully used' });
    }

    // Check if expired
    if (voucher.expiryDate && new Date(voucher.expiryDate) < new Date()) {
      return res.status(400).json({ error: 'Voucher has expired' });
    }

    // Find the booking
    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if booking is already paid
    if (booking.paymentStatus === 'succeeded') {
      return res.status(400).json({ error: 'Booking has already been paid' });
    }

    let newBalance = voucher.currentBalance;
    let newTotalPrice = booking.totalPrice;

    // Handle voucher application based on type
    if (voucher.type === 'fixed_amount') {
      // Calculate new booking total
      const currentTotal = parseFloat(booking.totalPrice);
      const voucherBalance = parseFloat(voucher.currentBalance);
      
      if (currentTotal <= voucherBalance) {
        // Voucher covers full amount
        newBalance = voucherBalance - currentTotal;
        newTotalPrice = 0;
        booking.paymentStatus = 'succeeded';
        
        // If voucher is fully used, disable it
        if (newBalance === 0) {
          voucher.isEnabled = false;
        }
      } else {
        // Voucher covers partial amount
        newBalance = 0;
        newTotalPrice = currentTotal - voucherBalance;
        voucher.isEnabled = false;
      }

      voucher.currentBalance = newBalance;
      booking.totalPrice = newTotalPrice;
    } else if (voucher.type === 'experience') {
      // Check if voucher is valid for this experience
      if (voucher.experienceId !== booking.experienceId) {
        return res.status(400).json({ error: 'Voucher not valid for this experience' });
      }

      // Set booking total to 0 and mark as paid
      booking.totalPrice = 0;
      booking.paymentStatus = 'succeeded';
      voucher.isEnabled = false;
    }

    // Save changes
    await voucher.save();
    await booking.save();

    // If there's still an amount to pay, update the PaymentIntent
    if (newTotalPrice > 0 && booking.paymentIntentId && stripe) {
      try {
        const amountInPence = Math.round(parseFloat(newTotalPrice) * 100);
        await stripe.paymentIntents.update(booking.paymentIntentId, {
          amount: amountInPence,
        });
      } catch (error) {
        console.error('Error updating PaymentIntent:', error);
        // Don't fail the request if PaymentIntent update fails
      }
    }

    res.json({
      message: 'Voucher applied successfully',
      booking: {
        id: booking.id,
        totalPrice: booking.totalPrice,
        paymentStatus: booking.paymentStatus,
      },
      voucher: {
        code: voucher.code,
        currentBalance: voucher.currentBalance,
        isEnabled: voucher.isEnabled,
      },
    });
  } catch (error) {
    console.error('Error applying voucher:', error);
    res.status(500).json({ error: 'Failed to apply voucher' });
  }
});

// Admin routes - all require authentication and admin role
router.get('/admin/vouchers', authMiddleware, checkRole(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: vouchers } = await Voucher.findAndCountAll({
      include: [
        {
          model: Experience,
          as: 'experience',
          attributes: ['id', 'title'],
          required: false,
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: offset,
    });

    res.json({
      vouchers,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit)),
    });
  } catch (error) {
    console.error('Error fetching vouchers:', error);
    res.status(500).json({ error: 'Failed to fetch vouchers' });
  }
});

router.post('/admin/vouchers', authMiddleware, checkRole(['admin']), async (req, res) => {
  try {
    const { 
      type, 
      amount, 
      senderName, 
      recipientName, 
      recipientEmail, 
      message, 
      experienceId,
      expiryDate 
    } = req.body;

    // Validate required fields
    if (!type || !amount) {
      return res.status(400).json({ error: 'Missing required fields: type, amount' });
    }

    // Generate unique code
    const code = `GIFT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const voucherData = {
      code,
      type,
      initialValue: amount,
      currentBalance: amount,
      isEnabled: true,
      senderName,
      recipientName,
      recipientEmail,
      message,
      expiryDate,
    };

    if (type === 'experience' && experienceId) {
      voucherData.experienceId = experienceId;
    }

    const voucher = await Voucher.create(voucherData);

    res.status(201).json({
      message: 'Voucher created successfully',
      voucher,
    });
  } catch (error) {
    console.error('Error creating voucher:', error);
    res.status(500).json({ error: 'Failed to create voucher' });
  }
});

router.put('/admin/vouchers/:id', authMiddleware, checkRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { currentBalance, expiryDate, isEnabled } = req.body;

    const voucher = await Voucher.findByPk(id);
    if (!voucher) {
      return res.status(404).json({ error: 'Voucher not found' });
    }

    if (currentBalance !== undefined) {
      voucher.currentBalance = currentBalance;
    }
    if (expiryDate !== undefined) {
      voucher.expiryDate = expiryDate;
    }
    if (isEnabled !== undefined) {
      voucher.isEnabled = isEnabled;
    }

    await voucher.save();

    res.json({
      message: 'Voucher updated successfully',
      voucher,
    });
  } catch (error) {
    console.error('Error updating voucher:', error);
    res.status(500).json({ error: 'Failed to update voucher' });
  }
});

module.exports = router;
