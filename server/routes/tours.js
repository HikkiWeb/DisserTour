const express = require('express');
const router = express.Router();
const TourController = require('../controllers/tourController');
const { authenticate, authorize, checkOwnership } = require('../middleware/auth');
const { upload, uploadTourImages } = require('../middleware/upload');
const { tourValidation, searchValidation } = require('../middleware/validation');
const config = require('../config/config');

// Выбираем middleware загрузки в зависимости от окружения
const getUploadMiddleware = () => {
  if (config.nodeEnv === 'production' && process.env.CLOUDINARY_CLOUD_NAME) {
    return uploadTourImages.array('images', 5);
  } else {
    return upload.array('images', 5);
  }
};

// Получение списка туров с фильтрацией
router.get('/', searchValidation.tours, TourController.getTours);

// Получение популярных туров
router.get('/popular', TourController.getPopularTours);

// Получение сезонных рекомендаций
router.get('/seasonal', TourController.getSeasonalRecommendations);

// Получение персонализированных рекомендаций
router.get(
  '/recommendations',
  authenticate,
  TourController.getPersonalizedRecommendations
);

// Получение тура по ID
router.get('/:id', TourController.getTourById);

// Получение туров гида
router.get('/guide/:guideId?', TourController.getGuideTours);

// Создание нового тура (только для гидов и админов)
router.post(
  '/',
  authenticate,
  authorize('guide', 'admin'),
  getUploadMiddleware(),
  tourValidation.create,
  TourController.createTour
);

// Обновление тура
router.patch(
  '/:id',
  authenticate,
  checkOwnership('tour'),
  getUploadMiddleware(),
  tourValidation.update,
  TourController.updateTour
);

// Удаление тура
router.delete(
  '/:id',
  authenticate,
  checkOwnership('tour'),
  TourController.deleteTour
);

module.exports = router; 