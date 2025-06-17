const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const tourRoutes = require('./tours');
const bookingRoutes = require('./bookings');
const reviewRoutes = require('./reviews');
const userRoutes = require('./users');
const adminRoutes = require('./admin');
const guideRoutes = require('./guide');

// Маршруты аутентификации
router.use('/auth', authRoutes);

// Маршруты туров
router.use('/tours', tourRoutes);

// Маршруты бронирований
router.use('/bookings', bookingRoutes);

// Маршруты отзывов
router.use('/reviews', reviewRoutes);

// Маршруты пользователей
router.use('/users', userRoutes);

// Маршруты администратора
router.use('/admin', adminRoutes);

// Маршруты гида
router.use('/guide', guideRoutes);

// Обработка несуществующих маршрутов
router.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Маршрут не найден',
  });
});

module.exports = router; 