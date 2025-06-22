const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const config = require('../config/config');
const { sendEmail } = require('../services/emailService');
const bcrypt = require('bcryptjs');
const { deleteFile } = require('../middleware/upload');

class AuthController {
  // Регистрация пользователя
  static async register(req, res, next) {
    try {
      const { email, password, firstName, lastName } = req.body;

      // Проверка существования пользователя
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          status: 'error',
          message: 'Пользователь с таким email уже существует',
        });
      }

      // Создание токена верификации
      const verificationToken = crypto.randomBytes(32).toString('hex');

      // Создание пользователя
      const user = await User.create({
        email,
        password,
        firstName,
        lastName,
        verificationToken,
      });

      // Отправка email для верификации
      await sendEmail(email, 'verification', verificationToken);

      res.status(201).json({
        status: 'success',
        message: 'Регистрация успешна! Проверьте вашу почту для подтверждения аккаунта.',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isVerified: user.isVerified,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Вход пользователя
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Поиск пользователя
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'Неверный email или пароль',
        });
      }

      // Проверка пароля
      const isValidPassword = await user.validatePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({
          status: 'error',
          message: 'Неверный email или пароль',
        });
      }

      // Проверка верификации
      if (!user.isVerified) {
        return res.status(403).json({
          status: 'error',
          message: 'Пожалуйста, подтвердите ваш email',
        });
      }

      // Создание JWT токена
      const token = jwt.sign(
        { id: user.id },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      res.json({
        status: 'success',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          },
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Подтверждение email
  static async verifyEmail(req, res, next) {
    try {
      let { token } = req.params;
      
      console.log('🔍 Получен токен для верификации:', token);

      // Декодируем токен из URL (на случай если он был закодирован)
      try {
        token = decodeURIComponent(token);
        console.log('📝 Декодированный токен:', token);
      } catch (decodeError) {
        console.log('⚠️ Ошибка декодирования токена, используем исходный');
      }

      if (!token || token.trim() === '') {
        console.log('❌ Пустой токен');
        return res.status(400).json({
          status: 'error',
          message: 'Токен верификации не предоставлен',
        });
      }

      const user = await User.findOne({
        where: { verificationToken: token },
      });

      console.log('👤 Найден пользователь:', user ? `${user.email} (ID: ${user.id})` : 'не найден');

      if (!user) {
        return res.status(400).json({
          status: 'error',
          message: 'Недействительный токен верификации',
        });
      }

      // Проверяем, не подтвержден ли уже email
      if (user.isVerified) {
        console.log('✅ Email уже подтвержден для пользователя:', user.email);
        return res.json({
          status: 'success',
          message: 'Email уже был подтвержден ранее',
        });
      }

      user.isVerified = true;
      user.verificationToken = null;
      await user.save();

      console.log('🎉 Email успешно подтвержден для пользователя:', user.email);

      res.json({
        status: 'success',
        message: 'Email успешно подтвержден',
      });
    } catch (error) {
      console.error('❌ Ошибка при подтверждении email:', error);
      next(error);
    }
  }

  // Запрос на сброс пароля
  static async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;

      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'Пользователь не найден',
        });
      }

      // Создание токена для сброса пароля
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 3600000); // 1 час

      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = resetExpires;
      await user.save();

      // Отправка email для сброса пароля
      await sendEmail(email, 'resetPassword', resetToken);

      res.json({
        status: 'success',
        message: 'Инструкции по сбросу пароля отправлены на ваш email',
      });
    } catch (error) {
      next(error);
    }
  }

  // Сброс пароля
  static async resetPassword(req, res, next) {
    try {
      const { token, password } = req.body;

      const user = await User.findOne({
        where: {
          resetPasswordToken: token,
          resetPasswordExpires: { [Op.gt]: new Date() },
        },
      });

      if (!user) {
        return res.status(400).json({
          status: 'error',
          message: 'Недействительный или истекший токен сброса пароля',
        });
      }

      user.password = password;
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();

      res.json({
        status: 'success',
        message: 'Пароль успешно изменен',
      });
    } catch (error) {
      next(error);
    }
  }

  // Получение текущего пользователя
  static async getCurrentUser(req, res, next) {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password', 'verificationToken', 'resetPasswordToken', 'resetPasswordExpires'] },
      });

      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'Пользователь не найден',
        });
      }

      res.json({
        status: 'success',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  // Обновление профиля пользователя
  static async updateProfile(req, res, next) {
    try {
      const { firstName, lastName, phone, email } = req.body;
      const user = await User.findByPk(req.user.id);

      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'Пользователь не найден',
        });
      }

      if (firstName !== undefined) user.firstName = firstName;
      if (lastName !== undefined) user.lastName = lastName;
      if (phone !== undefined) user.phone = phone;
      if (email !== undefined) user.email = email;

      await user.save();

      res.json({
        status: 'success',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            role: user.role,
            avatar: user.avatar,
            isVerified: user.isVerified,
            createdAt: user.createdAt,
          },
        },
        message: 'Профиль успешно обновлен',
      });
    } catch (error) {
      next(error);
    }
  }

  // Изменение пароля
  static async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findByPk(req.user.id);

      const isValidPassword = await user.validatePassword(currentPassword);
      if (!isValidPassword) {
        return res.status(401).json({
          status: 'error',
          message: 'Неверный текущий пароль',
        });
      }

      user.password = newPassword;
      await user.save();

      res.json({
        status: 'success',
        message: 'Пароль успешно изменен',
      });
    } catch (error) {
      next(error);
    }
  }

  // Загрузка аватара
  static async uploadAvatar(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          status: 'error',
          message: 'Файл не загружен',
        });
      }

      const user = await User.findByPk(req.user.id);
      
      // Удаляем старый аватар если он есть
      if (user.avatar) {
        await deleteFile(user.avatar);
      }

      // Сохраняем путь к новому аватару
      let avatarPath;
      if (config.nodeEnv === 'production') {
        // В продакшене используем Cloudinary URL
        avatarPath = req.file.path;
      } else {
        // В разработке используем локальный путь
        avatarPath = `/uploads/avatars/${req.file.filename}`;
      }
      
      user.avatar = avatarPath;
      await user.save();

      res.json({
        status: 'success',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            role: user.role,
            avatar: user.avatar,
            isVerified: user.isVerified,
          },
        },
        message: 'Аватар успешно загружен',
      });
    } catch (error) {
      // Удаляем загруженный файл в случае ошибки
      if (req.file) {
        if (config.nodeEnv === 'production') {
          await deleteFile(req.file.path);
        } else {
          await deleteFile(`uploads/avatars/${req.file.filename}`);
        }
      }
      next(error);
    }
  }

  // Получение статистики пользователя
  static async getUserStats(req, res, next) {
    try {
      const userId = req.user.id;

      // Получаем статистику бронирований
      const { Booking } = require('../models');
      const bookingStats = await Booking.findAll({
        where: { userId },
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['status'],
        raw: true
      });

      // Получаем статистику отзывов
      const { Review } = require('../models');
      const reviewStats = await Review.findAll({
        where: { userId },
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'totalReviews'],
          [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating']
        ],
        raw: true
      });

      // Получаем общую потраченную сумму
      const totalSpent = await Booking.sum('totalPrice', {
        where: { 
          userId,
          status: 'confirmed'
        }
      });

      res.json({
        status: 'success',
        data: {
          bookings: bookingStats,
          reviews: reviewStats[0] || { totalReviews: 0, averageRating: 0 },
          totalSpent: totalSpent || 0
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController; 