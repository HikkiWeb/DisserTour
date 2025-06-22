const { User, Tour, Booking, Review } = require('../models');
const { Op } = require('sequelize');
const { deleteFile } = require('../middleware/upload');
const bcrypt = require('bcryptjs');
const config = require('../config/config');

class UserController {
  // Получение списка пользователей (только для админа)
  static async getUsers(req, res, next) {
    try {
      const { role, search, page = 1, limit = 10 } = req.query;

      const where = {};
      if (role) {
        where.role = role;
      }
      if (search) {
        where[Op.or] = [
          { firstName: { [Op.iLike]: `%${search}%` } },
          { lastName: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const offset = (page - 1) * limit;

      const { count, rows: users } = await User.findAndCountAll({
        where,
        attributes: { exclude: ['password'] },
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      res.json({
        status: 'success',
        data: {
          users,
          pagination: {
            total: count,
            page: parseInt(page),
            pages: Math.ceil(count / limit),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Получение профиля пользователя
  static async getUserProfile(req, res, next) {
    try {
      const userId = req.params.id || req.user.id;

      const user = await User.findByPk(userId, {
        attributes: { exclude: ['password'] },
        include: [
          {
            model: Tour,
            as: 'guidedTours',
            where: { isActive: true },
            required: false,
            attributes: ['id', 'title', 'images', 'rating', 'ratingCount'],
          },
          {
            model: Booking,
            as: 'bookings',
            include: [
              {
                model: Tour,
                as: 'tour',
                attributes: ['id', 'title', 'images'],
              },
            ],
            required: false,
          },
          {
            model: Review,
            as: 'reviews',
            include: [
              {
                model: Tour,
                as: 'tour',
                attributes: ['id', 'title', 'images'],
              },
            ],
            required: false,
          },
        ],
      });

      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'Пользователь не найден',
        });
      }

      // Если запрашивается не свой профиль, скрываем конфиденциальную информацию
      if (userId !== req.user.id && req.user.role !== 'admin') {
        user.phone = undefined;
        user.email = undefined;
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
  static async updateUserProfile(req, res, next) {
    try {
      const userId = req.params.id || req.user.id;
      const updateData = { ...req.body };

      // Проверка прав доступа
      if (userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          status: 'error',
          message: 'У вас нет прав для редактирования этого профиля',
        });
      }

      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'Пользователь не найден',
        });
      }

      // Обработка загрузки аватара
      if (req.file) {
        // Удаляем старый аватар
        if (user.avatar) {
          await deleteFile(user.avatar);
        }
        
        // Сохраняем новый аватар
        if (config.nodeEnv === 'production' && process.env.CLOUDINARY_CLOUD_NAME) {
          updateData.avatar = req.file.path;
        } else {
          updateData.avatar = `/uploads/avatars/${req.file.filename}`;
        }
      }

      // Если обновляется пароль
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }

      // Если обновляется роль (только для админа)
      if (updateData.role && req.user.role !== 'admin') {
        delete updateData.role;
      }

      await user.update(updateData);

      // Получаем обновленные данные пользователя
      const updatedUser = await User.findByPk(userId, {
        attributes: { exclude: ['password'] },
      });

      res.json({
        status: 'success',
        data: { user: updatedUser },
      });
    } catch (error) {
      if (req.file) {
        if (config.nodeEnv === 'production' && process.env.CLOUDINARY_CLOUD_NAME) {
          deleteFile(req.file.path);
        } else {
          deleteFile(`avatars/${req.file.filename}`);
        }
      }
      next(error);
    }
  }

  // Удаление пользователя
  static async deleteUser(req, res, next) {
    try {
      const userId = req.params.id;

      // Проверка прав доступа
      if (userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          status: 'error',
          message: 'У вас нет прав для удаления этого пользователя',
        });
      }

      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'Пользователь не найден',
        });
      }

      // Проверяем наличие активных туров
      const activeTours = await Tour.count({
        where: {
          guideId: userId,
          isActive: true,
        },
      });

      if (activeTours > 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Невозможно удалить пользователя с активными турами',
        });
      }

      // Проверяем наличие активных бронирований
      const activeBookings = await Booking.count({
        where: {
          userId,
          status: { [Op.in]: ['pending', 'confirmed'] },
        },
      });

      if (activeBookings > 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Невозможно удалить пользователя с активными бронированиями',
        });
      }

      // Удаляем аватар
      if (user.avatar) {
        deleteFile(user.avatar);
      }

      await user.destroy();

      res.json({
        status: 'success',
        message: 'Пользователь успешно удален',
      });
    } catch (error) {
      next(error);
    }
  }

  // Получение статистики пользователя
  static async getUserStats(req, res, next) {
    try {
      const userId = req.params.id || req.user.id;

      // Проверка прав доступа
      if (userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          status: 'error',
          message: 'У вас нет прав для просмотра этой статистики',
        });
      }

      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'Пользователь не найден',
        });
      }

      // Получаем статистику в зависимости от роли пользователя
      let stats = {};

      if (user.role === 'guide') {
        // Статистика для гида
        const [
          totalTours,
          activeTours,
          totalBookings,
          completedBookings,
          averageRating,
          totalReviews,
        ] = await Promise.all([
          Tour.count({ where: { guideId: userId } }),
          Tour.count({ where: { guideId: userId, isActive: true } }),
          Booking.count({
            where: { tourId: { [Op.in]: user.guidedTours.map(tour => tour.id) } },
          }),
          Booking.count({
            where: {
              tourId: { [Op.in]: user.guidedTours.map(tour => tour.id) },
              status: 'completed',
            },
          }),
          Tour.findAll({
            where: { guideId: userId },
            attributes: ['rating'],
          }).then(tours => {
            const ratings = tours.map(tour => tour.rating).filter(rating => rating > 0);
            return ratings.length > 0
              ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
              : 0;
          }),
          Review.count({
            where: { tourId: { [Op.in]: user.guidedTours.map(tour => tour.id) } },
          }),
        ]);

        stats = {
          totalTours,
          activeTours,
          totalBookings,
          completedBookings,
          averageRating,
          totalReviews,
        };
      } else {
        // Статистика для обычного пользователя
        const [
          totalBookings,
          completedBookings,
          totalReviews,
          averageRating,
        ] = await Promise.all([
          Booking.count({ where: { userId } }),
          Booking.count({ where: { userId, status: 'completed' } }),
          Review.count({ where: { userId } }),
          Review.findAll({
            where: { userId },
            attributes: ['rating'],
          }).then(reviews => {
            return reviews.length > 0
              ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
              : 0;
          }),
        ]);

        stats = {
          totalBookings,
          completedBookings,
          totalReviews,
          averageRating,
        };
      }

      res.json({
        status: 'success',
        data: { stats },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController; 