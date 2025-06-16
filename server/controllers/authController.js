const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User } = require('../models');
const { Op } = require('sequelize');
const config = require('../config/config');
const { sendEmail } = require('../services/emailService');

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

      // Создание JWT токена
      const token = jwt.sign(
        { id: user.id },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      res.status(201).json({
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
      const { token } = req.params;

      const user = await User.findOne({
        where: { verificationToken: token },
      });

      if (!user) {
        return res.status(400).json({
          status: 'error',
          message: 'Недействительный токен верификации',
        });
      }

      user.isVerified = true;
      user.verificationToken = null;
      await user.save();

      res.json({
        status: 'success',
        message: 'Email успешно подтвержден',
      });
    } catch (error) {
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
      const { firstName, lastName, phone } = req.body;
      const user = await User.findByPk(req.user.id);

      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (phone) user.phone = phone;

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
          },
        },
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
}

module.exports = AuthController; 