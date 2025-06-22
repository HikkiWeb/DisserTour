const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { authValidation } = require('../middleware/validation');
const { uploadAvatars, uploadAvatar, handleUploadError } = require('../middleware/upload');
const config = require('../config/config');

// Функция для выбора middleware загрузки аватара
const getAvatarUploadMiddleware = () => {
  if (config.nodeEnv === 'production' && process.env.CLOUDINARY_CLOUD_NAME) {
    console.log('🌥️ Используем Cloudinary для аватаров');
    return uploadAvatar.single('avatar');
  } else {
    console.log('💾 Используем локальное хранилище для аватаров');
    return uploadAvatars.single('avatar');
  }
};

// Регистрация нового пользователя
router.post('/register', authValidation.register, AuthController.register);

// Вход в систему
router.post('/login', authValidation.login, AuthController.login);

// Подтверждение email
router.get('/verify-email/:token', AuthController.verifyEmail);

// Запрос на сброс пароля
router.post('/forgot-password', authValidation.forgotPassword, AuthController.forgotPassword);

// Сброс пароля
router.post('/reset-password', authValidation.resetPassword, AuthController.resetPassword);

// Получение информации о текущем пользователе
router.get('/me', authenticate, AuthController.getCurrentUser);

// Обновление профиля
router.put(
  '/profile',
  authenticate,
  authValidation.updateProfile,
  AuthController.updateProfile
);

// Изменение пароля
router.put(
  '/change-password',
  authenticate,
  authValidation.changePassword,
  AuthController.changePassword
);

// Загрузка аватара
router.post(
  '/upload-avatar',
  authenticate,
  uploadAvatars.single('avatar'), // Используем напрямую uploadAvatars в разработке
  handleUploadError,
  AuthController.uploadAvatar
);

// Получение статистики пользователя
router.get('/stats', authenticate, AuthController.getUserStats);

module.exports = router; 