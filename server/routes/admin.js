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

// Изменить статус бронирования
router.put('/bookings/:id/status', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Недопустимый статус бронирования'
      });
    }

    const booking = await Booking.findByPk(id);
    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Бронирование не найдено'
      });
    }

    booking.status = status;
    await booking.save();

    res.json({
      status: 'success',
      message: 'Статус бронирования успешно изменен',
      data: { booking }
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({
      status: 'error',
      message: 'Ошибка при изменении статуса бронирования'
    });
  }
});

// Удалить бронирование
router.delete('/bookings/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findByPk(id);
    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Бронирование не найдено'
      });
    }

    await booking.destroy();

    res.json({
      status: 'success',
      message: 'Бронирование успешно удалено'
    });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({
      status: 'error',
      message: 'Ошибка при удалении бронирования'
    });
  }
});

// CRUD для туров
// Получить все туры
router.get('/tours', authenticate, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const tours = await Tour.findAndCountAll({
      include: [
        {
          model: User,
          as: 'guide',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      offset,
      limit,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      status: 'success',
      data: {
        data: tours.rows,
        pagination: {
          page,
          pages: Math.ceil(tours.count / limit),
          total: tours.count,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Error fetching tours:', error);
    res.status(500).json({
      status: 'error',
      message: 'Ошибка при получении туров'
    });
  }
});

// Создать новый тур
router.post('/tours', authenticate, requireAdmin, async (req, res) => {
  try {
    const {
      title,
      description,
      shortDescription,
      price,
      duration,
      maxGroupSize,
      difficulty,
      category,
      region,
      season,
      guideId,
      startLocation,
      locations,
      itinerary,
      included,
      excluded,
      requirements,
      tags
    } = req.body;

    // Проверка обязательных полей
    if (!title || !description || !price || !duration || !region) {
      return res.status(400).json({
        status: 'error',
        message: 'Не заполнены обязательные поля'
      });
    }

    // Проверка существования гида
    if (guideId) {
      const guide = await User.findOne({
        where: { id: guideId, role: 'guide' }
      });
      if (!guide) {
        return res.status(400).json({
          status: 'error',
          message: 'Указанный гид не найден'
        });
      }
    }

    const tour = await Tour.create({
      title,
      description,
      shortDescription: shortDescription || null,
      price,
      duration,
      maxGroupSize: maxGroupSize || 10,
      difficulty: difficulty || 'moderate',
      category: category || 'nature',
      region,
      season: season ? [season] : ['all'],
      guideId: guideId || null,
      startLocation: startLocation && typeof startLocation === 'string' 
        ? (startLocation.startsWith('{') ? JSON.parse(startLocation) : { address: startLocation })
        : startLocation || null,
      locations: locations || [],
      itinerary: Array.isArray(itinerary) ? itinerary : null,
      included: included || [],
      excluded: excluded || [],
      requirements: requirements || [],
      tags: tags || [],
      images: [],
      isActive: true,
      rating: 0,
      ratingCount: 0
    });

    res.status(201).json({
      status: 'success',
      message: 'Тур успешно создан',
      data: { tour }
    });
  } catch (error) {
    console.error('Error creating tour:', error);
    res.status(500).json({
      status: 'error',
      message: 'Ошибка при создании тура'
    });
  }
});

// Обновить тур
router.put('/tours/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    console.log('=== SERVER TOUR UPDATE ===');
    console.log('Received data:', JSON.stringify(updateData, null, 2));
    console.log('========================');


    const tour = await Tour.findByPk(id);
    if (!tour) {
      return res.status(404).json({
        status: 'error',
        message: 'Тур не найден'
      });
    }

    // Проверка гида если указан
    if (updateData.guideId) {
      const guide = await User.findOne({
        where: { id: updateData.guideId, role: 'guide' }
      });
      if (!guide) {
        return res.status(400).json({
          status: 'error',
          message: 'Указанный гид не найден'
        });
      }
    }

    // Обработка данных перед обновлением
    const processedData = { ...updateData };
    
    // Обработка массивов - проверяем что поле не пустое
    if (processedData.season !== undefined && processedData.season !== null && processedData.season !== '') {
      if (!Array.isArray(processedData.season)) {
        if (processedData.season === 'all') {
          processedData.season = ['spring', 'summer', 'autumn', 'winter'];
        } else {
          processedData.season = [processedData.season];
        }
      }
    }
    
    if (processedData.included !== undefined && processedData.included !== null && processedData.included !== '') {
      if (!Array.isArray(processedData.included)) {
        if (typeof processedData.included === 'string') {
          processedData.included = processedData.included.split(',').map(item => item.trim()).filter(item => item);
        } else {
          processedData.included = [];
        }
      }
    }
    
    if (processedData.excluded !== undefined && processedData.excluded !== null && processedData.excluded !== '') {
      if (!Array.isArray(processedData.excluded)) {
        if (typeof processedData.excluded === 'string') {
          processedData.excluded = processedData.excluded.split(',').map(item => item.trim()).filter(item => item);
        } else {
          processedData.excluded = [];
        }
      }
    }
    
    if (processedData.requirements !== undefined && processedData.requirements !== null && processedData.requirements !== '') {
      if (!Array.isArray(processedData.requirements)) {
        if (typeof processedData.requirements === 'string') {
          processedData.requirements = processedData.requirements.split(',').map(item => item.trim()).filter(item => item);
        } else {
          processedData.requirements = [];
        }
      }
    }
    
    if (processedData.tags !== undefined && processedData.tags !== null && processedData.tags !== '') {
      if (!Array.isArray(processedData.tags)) {
        if (typeof processedData.tags === 'string') {
          processedData.tags = processedData.tags.split(',').map(item => item.trim()).filter(item => item);
        } else {
          processedData.tags = [];
        }
      }
    }
    
    // Обработка locations
    if (processedData.locations !== undefined && processedData.locations !== null) {
      if (!Array.isArray(processedData.locations)) {
        if (typeof processedData.locations === 'string') {
          processedData.locations = processedData.locations.split(',').map(item => item.trim()).filter(item => item);
        } else {
          processedData.locations = [];
        }
      }
    }
    
    // Обработка startLocation
    if (processedData.startLocation && typeof processedData.startLocation === 'string') {
      processedData.startLocation = processedData.startLocation.startsWith('{') 
        ? JSON.parse(processedData.startLocation) 
        : { address: processedData.startLocation };
    }
    
    // Обработка itinerary
    if (processedData.itinerary && !Array.isArray(processedData.itinerary)) {
      if (typeof processedData.itinerary === 'string') {
        try {
          processedData.itinerary = JSON.parse(processedData.itinerary);
        } catch {
          processedData.itinerary = processedData.itinerary.split('\n').map((item, index) => ({
            day: index + 1,
            description: item.trim()
          })).filter(item => item.description);
        }
      }
    }

    // Удаляем поля с пустыми значениями, которые могут вызвать ошибки
    const cleanedData = {};
    Object.keys(processedData).forEach(key => {
      const value = processedData[key];
      if (value !== undefined && value !== null && value !== '') {
        // Для массивов проверяем, что они не пустые
        if (Array.isArray(value)) {
          if (value.length > 0) {
            cleanedData[key] = value;
          }
        } else {
          cleanedData[key] = value;
        }
      }
    });
    

    
    await tour.update(cleanedData);

    res.json({
      status: 'success',
      message: 'Тур успешно обновлен',
      data: { tour }
    });
  } catch (error) {
    console.error('Error updating tour:', error);
    res.status(500).json({
      status: 'error',
      message: 'Ошибка при обновлении тура'
    });
  }
});

// Удалить тур
router.delete('/tours/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const tour = await Tour.findByPk(id);
    if (!tour) {
      return res.status(404).json({
        status: 'error',
        message: 'Тур не найден'
      });
    }

    // Проверить активные бронирования
    const activeBookings = await Booking.count({
      where: {
        tourId: id,
        status: ['confirmed', 'pending']
      }
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Нельзя удалить тур с активными бронированиями'
      });
    }

    await tour.destroy();

    res.json({
      status: 'success',
      message: 'Тур успешно удален'
    });
  } catch (error) {
    console.error('Error deleting tour:', error);
    res.status(500).json({
      status: 'error',
      message: 'Ошибка при удалении тура'
    });
  }
});

// CRUD для пользователей (дополнительные операции)
// Создать пользователя
router.post('/users', authenticate, requireAdmin, async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      role,
      phone
    } = req.body;

    // Проверка обязательных полей
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        status: 'error',
        message: 'Не заполнены обязательные поля'
      });
    }

    // Проверка существования пользователя
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Пользователь с таким email уже существует'
      });
    }

    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      role: role || 'user',
      phone,
      isVerified: true // Админ создает уже верифицированных пользователей
    });

    res.status(201).json({
      status: 'success',
      message: 'Пользователь успешно создан',
      data: { user: { ...user.toJSON(), password: undefined } }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      status: 'error',
      message: 'Ошибка при создании пользователя'
    });
  }
});

// Обновить пользователя
router.put('/users/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Убираем пароль из обновления (для этого отдельный endpoint)
    delete updateData.password;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Пользователь не найден'
      });
    }

    await user.update(updateData);

    res.json({
      status: 'success',
      message: 'Пользователь успешно обновлен',
      data: { user: { ...user.toJSON(), password: undefined } }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      status: 'error',
      message: 'Ошибка при обновлении пользователя'
    });
  }
});

// CRUD для отзывов
// Получить все отзывы
router.get('/reviews', authenticate, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const reviews = await Review.findAndCountAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Tour,
          as: 'tour',
          attributes: ['id', 'title', 'region']
        }
      ],
      offset,
      limit,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      status: 'success',
      data: {
        data: reviews.rows,
        pagination: {
          page,
          pages: Math.ceil(reviews.count / limit),
          total: reviews.count,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      status: 'error',
      message: 'Ошибка при получении отзывов'
    });
  }
});

// Удалить отзыв
router.delete('/reviews/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByPk(id);
    if (!review) {
      return res.status(404).json({
        status: 'error',
        message: 'Отзыв не найден'
      });
    }

    await review.destroy();

    res.json({
      status: 'success',
      message: 'Отзыв успешно удален'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      status: 'error',
      message: 'Ошибка при удалении отзыва'
    });
  }
});

// Ответить на отзыв
router.put('/reviews/:id/response', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;

    const review = await Review.findByPk(id);
    if (!review) {
      return res.status(404).json({
        status: 'error',
        message: 'Отзыв не найден'
      });
    }

    review.response = response;
    review.responseDate = new Date();
    await review.save();

    res.json({
      status: 'success',
      message: 'Ответ на отзыв успешно добавлен',
      data: { review }
    });
  } catch (error) {
    console.error('Error responding to review:', error);
    res.status(500).json({
      status: 'error',
      message: 'Ошибка при ответе на отзыв'
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