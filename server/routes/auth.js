const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { authValidation } = require('../middleware/validation');
const { upload, handleUploadError } = require('../middleware/upload');

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
router.post(
  '/change-password',
  authenticate,
  authValidation.changePassword,
  AuthController.changePassword
);

// Загрузка аватара
router.post(
  '/upload-avatar',
  authenticate,
  (req, res, next) => {
    // Устанавливаем тип для middleware загрузки
    req.params.type = 'avatars';
    next();
  },
  upload.single('avatar'),
  handleUploadError,
  AuthController.uploadAvatar
);

// Получение статистики пользователя
router.get('/stats', authenticate, AuthController.getUserStats);

module.exports = router; 