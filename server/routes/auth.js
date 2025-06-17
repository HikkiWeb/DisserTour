const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { authValidation } = require('../middleware/validation');

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
router.patch(
  '/me',
  authenticate,
  authValidation.register,
  AuthController.updateProfile
);

// Изменение пароля
router.post(
  '/change-password',
  authenticate,
  authValidation.login,
  AuthController.changePassword
);

module.exports = router; 