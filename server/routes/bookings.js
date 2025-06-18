const express = require('express');
const router = express.Router();
const BookingController = require('../controllers/bookingController');
const { authenticate, authorize, checkOwnership } = require('../middleware/auth');
const { bookingValidation } = require('../middleware/validation');

// Получение списка бронирований пользователя
router.get(
  '/my',
  authenticate,
  BookingController.getUserBookings
);

// Получение списка бронирований для гида
router.get(
  '/guide-bookings',
  authenticate,
  authorize('guide', 'admin'),
  BookingController.getGuideBookings
);

// Получение бронирования по ID
router.get(
  '/:id',
  authenticate,
  checkOwnership('booking'),
  BookingController.getBookingById
);

// Создание нового бронирования
router.post(
  '/',
  authenticate,
  bookingValidation.create,
  BookingController.createBooking
);

// Обновление статуса бронирования
router.patch(
  '/:id/status',
  authenticate,
  checkOwnership('booking'),
  bookingValidation.create,
  BookingController.updateBookingStatus
);

// Отмена бронирования
router.put(
  '/:id/cancel',
  authenticate,
  checkOwnership('booking'),
  BookingController.cancelBooking
);

module.exports = router; 