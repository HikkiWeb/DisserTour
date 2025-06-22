const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadAvatars, uploadAvatar } = require('../middleware/upload');
const { authValidation } = require('../middleware/validation');
const config = require('../config/config');

// Выбираем middleware загрузки аватара в зависимости от окружения
const getAvatarUploadMiddleware = () => {
  if (config.nodeEnv === 'production') {
    console.log('🌥️ Используем Cloudinary для пользователей в production');
    return uploadAvatar.single('avatar');
  } else {
    console.log('💾 Используем локальное хранилище для пользователей в development');
    return uploadAvatars.single('avatar');
  }
};

// Получение списка пользователей (только для админа)
router.get(
  '/',
  authenticate,
  authorize('admin'),
  UserController.getUsers
);

// Получение профиля пользователя
router.get(
  '/:id?',
  authenticate,
  UserController.getUserProfile
);

// Получение статистики пользователя
router.get(
  '/:id/stats',
  authenticate,
  UserController.getUserStats
);

// Обновление профиля пользователя
router.patch(
  '/:id?',
  authenticate,
  getAvatarUploadMiddleware(),
  authValidation.register,
  UserController.updateUserProfile
);

// Удаление пользователя
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  UserController.deleteUser
);

module.exports = router; 