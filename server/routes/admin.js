const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const User = require('../models/User');
const Tour = require('../models/Tour');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const { Op } = require('sequelize');

// Middleware для проверки роли администратора
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Доступ запрещен. Требуются права администратора.'
    });
  }
  next();
};

// Получить всех пользователей
router.get('/users', authenticate, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const users = await User.findAndCountAll({
      attributes: { exclude: ['password'] },
      offset,
      limit,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      status: 'success',
      data: {
        data: users.rows,
        pagination: {
          page,
          pages: Math.ceil(users.count / limit),
          total: users.count,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      status: 'error',
      message: 'Ошибка при получении пользователей'
    });
  }
});

// Изменить роль пользователя
router.put('/users/:id/role', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'guide', 'admin'].includes(role)) {
      return res.status(400).json({
        status: 'error',
        message: 'Недопустимая роль'
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Пользователь не найден'
      });
    }

    user.role = role;
    await user.save();

    res.json({
      status: 'success',
      message: 'Роль пользователя успешно изменена',
      data: { user: { ...user.toJSON(), password: undefined } }
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({
      status: 'error',
      message: 'Ошибка при изменении роли пользователя'
    });
  }
});

// Удалить пользователя
router.delete('/users/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Проверить, что админ не удаляет себя
    if (id === req.user.id) {
      return res.status(400).json({
        status: 'error',
        message: 'Нельзя удалить собственный аккаунт'
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Пользователь не найден'
      });
    }

    // Проверить активные бронирования
    const activeBookings = await Booking.count({
      where: {
        userId: id,
        status: 'confirmed'
      }
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Нельзя удалить пользователя с активными бронированиями'
      });
    }

    await user.destroy();

    res.json({
      status: 'success',
      message: 'Пользователь успешно удален'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      status: 'error',
      message: 'Ошибка при удалении пользователя'
    });
  }
});

// Получить все бронирования
router.get('/bookings', authenticate, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const bookings = await Booking.findAndCountAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Tour,
          as: 'tour',
          attributes: ['id', 'title', 'price', 'region']
        }
      ],
      offset,
      limit,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      status: 'success',
      data: {
        data: bookings.rows,
        pagination: {
          page,
          pages: Math.ceil(bookings.count / limit),
          total: bookings.count,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      status: 'error',
      message: 'Ошибка при получении бронирований'
    });
  }
});

// Получить статистику для дашборда
router.get('/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    // Общая статистика
    const totalUsers = await User.count();
    const verifiedUsers = await User.count({ where: { isVerified: true } });
    const totalTours = await Tour.count();
    const activeTours = await Tour.count({ where: { isActive: true } });
    const totalBookings = await Booking.count();
    const pendingBookings = await Booking.count({ where: { status: 'pending' } });
    const confirmedBookings = await Booking.count({ where: { status: 'confirmed' } });

    // Подсчет общего дохода
    const totalRevenue = await Booking.sum('totalPrice', {
      where: { status: 'confirmed' }
    }) || 0;

    // Месячный доход (за последние 30 дней)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const monthlyRevenue = await Booking.sum('totalPrice', {
      where: {
        status: 'confirmed',
        createdAt: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    }) || 0;

    // Статистика по ролям
    const roleStats = await User.findAll({
      attributes: [
        'role',
        [User.sequelize.fn('COUNT', User.sequelize.col('id')), 'count']
      ],
      group: ['role']
    });

    // Статистика по статусам бронирований
    const bookingStats = await Booking.findAll({
      attributes: [
        'status',
        [Booking.sequelize.fn('COUNT', Booking.sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    // Топ туры по бронированиям
    const topTours = await Tour.findAll({
      attributes: [
        'id', 'title', 'price',
        [Tour.sequelize.fn('COUNT', Tour.sequelize.col('bookings.id')), 'bookingCount']
      ],
      include: [{
        model: Booking,
        as: 'bookings',
        attributes: []
      }],
      group: ['Tour.id'],
      order: [[Tour.sequelize.fn('COUNT', Tour.sequelize.col('bookings.id')), 'DESC']],
      limit: 5
    });

    res.json({
      status: 'success',
      data: {
        overview: {
          totalUsers,
          verifiedUsers,
          totalTours,
          activeTours,
          totalBookings,
          pendingBookings,
          confirmedBookings,
          totalRevenue,
          monthlyRevenue
        },
        roleStats: roleStats.map(stat => ({
          role: stat.role,
          count: parseInt(stat.dataValues.count)
        })),
        bookingStats: bookingStats.map(stat => ({
          status: stat.status,
          count: parseInt(stat.dataValues.count)
        })),
        topTours: topTours.map(tour => ({
          id: tour.id,
          title: tour.title,
          price: tour.price,
          bookingCount: parseInt(tour.dataValues.bookingCount)
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Ошибка при получении статистики'
    });
  }
});

module.exports = router; 