const express = require('express');
const router = express.Router();
const ReviewController = require('../controllers/reviewController');
const { authenticate, checkOwnership } = require('../middleware/auth');
const { reviewValidation } = require('../middleware/validation');

// Получение отзывов тура
router.get('/tour/:tourId', ReviewController.getTourReviews);

// Получение отзывов пользователя
router.get(
  '/my-reviews',
  authenticate,
  ReviewController.getUserReviews
);

// Создание нового отзыва
router.post(
  '/',
  authenticate,
  reviewValidation.create,
  ReviewController.createReview
);

// Обновление отзыва
router.patch(
  '/:id',
  authenticate,
  checkOwnership('review'),
  reviewValidation.create,
  ReviewController.updateReview
);

// Удаление отзыва
router.delete(
  '/:id',
  authenticate,
  checkOwnership('review'),
  ReviewController.deleteReview
);

module.exports = router; 