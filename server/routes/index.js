const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const tourRoutes = require('./tours');
const bookingRoutes = require('./bookings');
const reviewRoutes = require('./reviews');
const userRoutes = require('./users');

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

// Обработка несуществующих маршрутов
router.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Маршрут не найден',
  });
});

module.exports = router; 