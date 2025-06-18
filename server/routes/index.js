const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const tourRoutes = require('./tours');
const bookingRoutes = require('./bookings');
const reviewRoutes = require('./reviews');
const userRoutes = require('./users');
const adminRoutes = require('./admin');
const guideRoutes = require('./guide');
const aiRoutes = require('./ai');

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

// Маршруты AI ассистента
router.use('/ai', aiRoutes);

// Тестовый роут для проверки работы сервера
router.get('/test', (req, res) => {
  res.json({
    status: 'success',
    message: 'API работает нормально!',
    timestamp: new Date().toISOString(),
  });
});

// Тестовый роут для проверки изображений
router.get('/test-images', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  
  const uploadsDir = path.join(__dirname, '..', 'uploads', 'tours');
  
  try {
    const files = fs.readdirSync(uploadsDir);
    res.json({
      status: 'success',
      message: 'Найденные изображения в uploads/tours/',
      files: files.map(file => ({
        filename: file,
        webPath: `/uploads/tours/${file}`,
        fullUrl: `http://localhost:5000/uploads/tours/${file}`
      }))
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Ошибка чтения папки uploads',
      error: error.message
    });
  }
});

// Обработка несуществующих маршрутов
router.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Маршрут не найден',
  });
});

module.exports = router; 