const express = require('express');
const { Experience, User, Category, Review, Availability, sequelize } = require('../models');
const { Op } = require('sequelize');

const router = express.Router();

/**
 * GET /api/public/categories
 * Get all categories (public, no auth required)
 */
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.findAll({
      attributes: ['id', 'name', 'slug'],
      order: [['name', 'ASC']],
    });

    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

/**
 * GET /api/public/experiences
 * Get all approved experiences with filtering and pagination (public, no auth required)
 */
router.get('/experiences', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      location,
      minPrice,
      maxPrice,
      rating,
    } = req.query;

    // Build the where clause
    const where = { status: 'approved' };

    // Filter by location (case-insensitive search)
    // SQLite uses LIKE which is case-insensitive by default for ASCII characters
    // For full case-insensitivity, we use LOWER() on both sides
    if (location) {
      where[Op.and] = sequelize.where(
        sequelize.fn('LOWER', sequelize.col('location')),
        { [Op.like]: `%${location.toLowerCase()}%` }
      );
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) {
        where.price[Op.gte] = parseFloat(minPrice);
      }
      if (maxPrice) {
        where.price[Op.lte] = parseFloat(maxPrice);
      }
    }

    // Build include array
    const include = [
      {
        model: User,
        as: 'vendor',
        attributes: ['id', 'firstName', 'lastName'],
      },
      {
        model: Review,
        as: 'reviews',
        attributes: ['rating'],
      },
    ];

    // Filter by category slug if provided
    if (category) {
      include.push({
        model: Category,
        as: 'categories',
        where: { slug: category },
        attributes: ['id', 'name', 'slug'],
        required: true,
      });
    } else {
      include.push({
        model: Category,
        as: 'categories',
        attributes: ['id', 'name', 'slug'],
        required: false,
      });
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Fetch experiences
    const { count, rows: experiences } = await Experience.findAndCountAll({
      where,
      include,
      limit: limitNum,
      offset,
      order: [['createdAt', 'DESC']],
      distinct: true,
    });

    // Calculate average rating for each experience and filter by rating if needed
    let filteredExperiences = experiences.map(exp => {
      const expData = exp.toJSON();
      const reviews = expData.reviews || [];
      const avgRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;
      
      return {
        ...expData,
        averageRating: avgRating,
      };
    });

    // Filter by minimum rating if provided
    if (rating) {
      const minRating = parseFloat(rating);
      filteredExperiences = filteredExperiences.filter(exp => exp.averageRating >= minRating);
    }

    res.json({
      experiences: filteredExperiences,
      pagination: {
        total: count,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(count / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching experiences:', error);
    res.status(500).json({ error: 'Failed to fetch experiences' });
  }
});

/**
 * GET /api/public/experiences/:id
 * Get a single approved experience by ID (public, no auth required)
 */
router.get('/experiences/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const experience = await Experience.findOne({
      where: {
        id,
        status: 'approved',
      },
      include: [
        {
          model: User,
          as: 'vendor',
          attributes: ['id', 'firstName', 'lastName'],
        },
        {
          model: Category,
          as: 'categories',
          attributes: ['id', 'name', 'slug'],
        },
        {
          model: Review,
          as: 'reviews',
          include: [
            {
              model: User,
              as: 'customer',
              attributes: ['id', 'firstName', 'lastName'],
            },
          ],
        },
        {
          model: Availability,
          as: 'availabilities',
          attributes: ['id', 'date', 'startTime', 'endTime', 'availableSlots'],
        },
      ],
    });

    if (!experience) {
      return res.status(404).json({ error: 'Experience not found' });
    }

    // Calculate average rating
    const expData = experience.toJSON();
    const reviews = expData.reviews || [];
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    res.json({
      ...expData,
      averageRating,
    });
  } catch (error) {
    console.error('Error fetching experience:', error);
    res.status(500).json({ error: 'Failed to fetch experience' });
  }
});

module.exports = router;
