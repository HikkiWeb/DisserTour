const { Booking, Tour, User, Review } = require('../models');
const { Op } = require('sequelize');
const emailService = require('../services/emailService');

class BookingController {
  // Создание нового бронирования
  static async createBooking(req, res, next) {
    try {
      const { tourId, startDate, participants, specialRequests } = req.body;
      const userId = req.user.id;

      // Проверяем существование тура
      const tour = await Tour.findByPk(tourId, {
        include: [
          {
            model: User,
            as: 'guide',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
        ],
      });
      if (!tour) {
        return res.status(404).json({
          status: 'error',
          message: 'Тур не найден',
        });
      }

      // Проверяем доступность даты
      const existingBooking = await Booking.findOne({
        where: {
          tourId,
          startDate,
          status: { [Op.in]: ['pending', 'confirmed'] },
        },
      });

      if (existingBooking) {
        return res.status(400).json({
          status: 'error',
          message: 'Выбранная дата уже забронирована',
        });
      }

      // Создаем бронирование
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + tour.duration);
      
      const booking = await Booking.create({
        userId,
        tourId,
        startDate,
        endDate,
        participants,
        specialRequests,
        totalPrice: tour.price * participants,
        status: 'pending',
      });

      // Отправляем уведомление гиду
      try {
        await emailService.sendEmail({
          to: tour.guide.email,
          template: 'bookingNotification',
          data: {
            guideName: `${tour.guide.firstName} ${tour.guide.lastName}`,
            tourTitle: tour.title,
            bookingId: booking.id,
            startDate: booking.startDate,
            participants: booking.participants,
            totalPrice: booking.totalPrice,
          },
        });
      } catch (emailError) {
        console.log('Ошибка отправки email:', emailError.message);
      }

      res.status(201).json({
        status: 'success',
        data: { booking },
      });
    } catch (error) {
      next(error);
    }
  }

  // Получение списка бронирований пользователя
  static async getUserBookings(req, res, next) {
    try {
      const { status, page = 1, limit = 10 } = req.query;
      const userId = req.user.id;

      const where = { userId };
      if (status) {
        where.status = status;
      }

      const offset = (page - 1) * limit;

      const { count, rows: bookings } = await Booking.findAndCountAll({
        where,
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
        include: [
          {
            model: Tour,
            as: 'tour',
            include: [
              {
                model: User,
                as: 'guide',
                attributes: ['id', 'firstName', 'lastName', 'avatar', 'phone'],
              },
            ],
          },
          {
            model: Review,
            as: 'review',
          },
        ],
      });

      res.json({
        status: 'success',
        data: {
          bookings,
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

  // Получение списка бронирований для гида
  static async getGuideBookings(req, res, next) {
    try {
      const { status, page = 1, limit = 10 } = req.query;
      const guideId = req.user.id;

      const where = {};
      if (status) {
        where.status = status;
      }

      const offset = (page - 1) * limit;

      const { count, rows: bookings } = await Booking.findAndCountAll({
        where,
        include: [
          {
            model: Tour,
            as: 'tour',
            where: { guideId },
            include: [
              {
                model: User,
                as: 'guide',
                attributes: ['id', 'firstName', 'lastName', 'avatar', 'phone'],
              },
            ],
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'avatar', 'phone'],
          },
          {
            model: Review,
            as: 'review',
          },
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      res.json({
        status: 'success',
        data: {
          bookings,
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

  // Получение бронирования по ID
  static async getBookingById(req, res, next) {
    try {
      const booking = await Booking.findByPk(req.params.id, {
        include: [
          {
            model: Tour,
            as: 'tour',
            include: [
              {
                model: User,
                as: 'guide',
                attributes: ['id', 'firstName', 'lastName', 'avatar', 'phone'],
              },
            ],
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'avatar', 'phone'],
          },
          {
            model: Review,
            as: 'review',
          },
        ],
      });

      if (!booking) {
        return res.status(404).json({
          status: 'error',
          message: 'Бронирование не найдено',
        });
      }

      // Проверка прав доступа
      if (
        booking.userId !== req.user.id &&
        booking.tour.guideId !== req.user.id &&
        req.user.role !== 'admin'
      ) {
        return res.status(403).json({
          status: 'error',
          message: 'У вас нет прав для просмотра этого бронирования',
        });
      }

      res.json({
        status: 'success',
        data: { booking },
      });
    } catch (error) {
      next(error);
    }
  }

  // Обновление статуса бронирования
  static async updateBookingStatus(req, res, next) {
    try {
      const { status, cancellationReason } = req.body;
      const booking = await Booking.findByPk(req.params.id, {
        include: [
          {
            model: Tour,
            as: 'tour',
            include: [
              {
                model: User,
                as: 'guide',
              },
            ],
          },
          {
            model: User,
            as: 'user',
          },
        ],
      });

      if (!booking) {
        return res.status(404).json({
          status: 'error',
          message: 'Бронирование не найдено',
        });
      }

      // Проверка прав доступа
      if (
        booking.tour.guideId !== req.user.id &&
        booking.userId !== req.user.id &&
        req.user.role !== 'admin'
      ) {
        return res.status(403).json({
          status: 'error',
          message: 'У вас нет прав для изменения статуса этого бронирования',
        });
      }

      // Проверка возможности изменения статуса
      if (
        (status === 'cancelled' && booking.status !== 'pending') ||
        (status === 'confirmed' && booking.status !== 'pending') ||
        (status === 'completed' && booking.status !== 'confirmed')
      ) {
        return res.status(400).json({
          status: 'error',
          message: 'Невозможно изменить статус бронирования',
        });
      }

      // Обновляем статус
      await booking.update({
        status,
        cancellationReason: status === 'cancelled' ? cancellationReason : null,
      });

      // Отправляем уведомления
      if (status === 'confirmed') {
        await emailService.sendEmail({
          to: booking.user.email,
          template: 'bookingConfirmation',
          data: {
            userName: `${booking.user.firstName} ${booking.user.lastName}`,
            tourTitle: booking.tour.title,
            startDate: booking.startDate,
            participants: booking.participants,
            totalPrice: booking.totalPrice,
          },
        });
      } else if (status === 'cancelled') {
        await emailService.sendEmail({
          to: booking.user.email,
          template: 'bookingCancellation',
          data: {
            userName: `${booking.user.firstName} ${booking.user.lastName}`,
            tourTitle: booking.tour.title,
            cancellationReason,
          },
        });
      }

      res.json({
        status: 'success',
        data: { booking },
      });
    } catch (error) {
      next(error);
    }
  }

  // Отмена бронирования
  static async cancelBooking(req, res, next) {
    try {
      const { reason } = req.body;
      const cancellationReason = reason;
      const booking = await Booking.findByPk(req.params.id, {
        include: [
          {
            model: Tour,
            as: 'tour',
            include: [
              {
                model: User,
                as: 'guide',
              },
            ],
          },
          {
            model: User,
            as: 'user',
          },
        ],
      });

      if (!booking) {
        return res.status(404).json({
          status: 'error',
          message: 'Бронирование не найдено',
        });
      }

      // Проверка прав доступа
      if (booking.userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          status: 'error',
          message: 'У вас нет прав для отмены этого бронирования',
        });
      }

      // Проверка возможности отмены
      if (booking.status !== 'pending') {
        return res.status(400).json({
          status: 'error',
          message: 'Невозможно отменить бронирование в текущем статусе',
        });
      }

      // Отменяем бронирование
      await booking.update({
        status: 'cancelled',
        cancellationReason,
      });

      // Отправляем уведомления
      await emailService.sendEmail({
        to: booking.tour.guide.email,
        template: 'bookingCancellation',
        data: {
          guideName: `${booking.tour.guide.firstName} ${booking.tour.guide.lastName}`,
          tourTitle: booking.tour.title,
          cancellationReason,
        },
      });

      res.json({
        status: 'success',
        data: { booking },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = BookingController; 