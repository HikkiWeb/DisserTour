const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const User = require('../models/User');
const Tour = require('../models/Tour');
const Booking = require('../models/Booking');
const Review = require('../models/Review');

// Middleware для проверки роли гида
const requireGuide = (req, res, next) => {
  if (req.user.role !== 'guide' && req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Доступ запрещен. Требуются права гида.'
    });
  }
  next();
};

// Получить туры гида
router.get('/tours', authenticate, requireGuide, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const tours = await Tour.findAndCountAll({
      where: { guideId: req.user.id },
      include: [
        {
          model: User,
          as: 'guide',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      offset,
      limit,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      status: 'success',
      data: {
        data: tours.rows,
        pagination: {
          page,
          pages: Math.ceil(tours.count / limit),
          total: tours.count,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Error fetching guide tours:', error);
    res.status(500).json({
      status: 'error',
      message: 'Ошибка при получении туров'
    });
  }
});

// Получить бронирования туров гида
router.get('/bookings', authenticate, requireGuide, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const bookings = await Booking.findAndCountAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Tour,
          as: 'tour',
          where: { guideId: req.user.id },
          attributes: ['id', 'title', 'price', 'region']
        }
      ],
      offset,
      limit,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      status: 'success',
      data: {
        data: bookings.rows,
        pagination: {
          page,
          pages: Math.ceil(bookings.count / limit),
          total: bookings.count,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Error fetching guide bookings:', error);
    res.status(500).json({
      status: 'error',
      message: 'Ошибка при получении бронирований'
    });
  }
});

// Получить статистику гида
router.get('/stats', authenticate, requireGuide, async (req, res) => {
  try {
    // Количество туров гида
    const totalTours = await Tour.count({
      where: { guideId: req.user.id }
    });

    const activeTours = await Tour.count({
      where: { 
        guideId: req.user.id,
        isActive: true 
      }
    });

    // Бронирования туров гида
    const totalBookings = await Booking.count({
      include: [{
        model: Tour,
        as: 'tour',
        where: { guideId: req.user.id }
      }]
    });

    const confirmedBookings = await Booking.count({
      where: { status: 'confirmed' },
      include: [{
        model: Tour,
        as: 'tour',
        where: { guideId: req.user.id }
      }]
    });

    // Доход от туров
    const totalRevenue = await Booking.sum('totalPrice', {
      where: { status: 'confirmed' },
      include: [{
        model: Tour,
        as: 'tour',
        where: { guideId: req.user.id }
      }]
    }) || 0;

    // Средний рейтинг туров
    const avgRating = await Tour.findOne({
      where: { guideId: req.user.id },
      attributes: [
        [Tour.sequelize.fn('AVG', Tour.sequelize.col('rating')), 'avgRating']
      ]
    });

    res.json({
      status: 'success',
      data: {
        totalTours,
        activeTours,
        totalBookings,
        confirmedBookings,
        totalRevenue,
        averageRating: parseFloat(avgRating?.dataValues?.avgRating || 0).toFixed(1)
      }
    });
  } catch (error) {
    console.error('Error fetching guide stats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Ошибка при получении статистики'
    });
  }
});

module.exports = router; 