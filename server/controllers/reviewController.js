const { Review, Tour, User, Booking } = require('../models');
const { Op } = require('sequelize');
const emailService = require('../services/emailService');

class ReviewController {
  // Создание нового отзыва
  static async createReview(req, res, next) {
    try {
      const { tourId, bookingId, rating, title, comment } = req.body;
      const userId = req.user.id;

      // Проверяем существование тура
      const tour = await Tour.findByPk(tourId, {
        include: [
          {
            model: User,
            as: 'guide',
          },
        ],
      });

      if (!tour) {
        return res.status(404).json({
          status: 'error',
          message: 'Тур не найден',
        });
      }

      // Проверяем существование бронирования
      const booking = await Booking.findOne({
        where: {
          id: bookingId,
          userId,
          tourId,
          status: 'completed',
        },
      });

      if (!booking) {
        return res.status(404).json({
          status: 'error',
          message: 'Бронирование не найдено или не завершено',
        });
      }

      // Проверяем, не оставлял ли пользователь уже отзыв
      const existingReview = await Review.findOne({
        where: {
          userId,
          tourId,
          bookingId,
        },
      });

      if (existingReview) {
        return res.status(400).json({
          status: 'error',
          message: 'Вы уже оставили отзыв на этот тур',
        });
      }

      // Создаем отзыв
      const review = await Review.create({
        userId,
        tourId,
        bookingId,
        rating,
        title,
        comment,
      });

      // Обновляем средний рейтинг тура
      const tourReviews = await Review.findAll({
        where: { tourId },
        attributes: ['rating'],
      });

      const averageRating =
        tourReviews.reduce((sum, review) => sum + review.rating, 0) /
        tourReviews.length;

      await tour.update({
        rating: averageRating,
        ratingCount: tourReviews.length,
      });

      // Отправляем уведомление гиду
      await emailService.sendEmail({
        to: tour.guide.email,
        template: 'reviewNotification',
        data: {
          guideName: `${tour.guide.firstName} ${tour.guide.lastName}`,
          tourTitle: tour.title,
          rating,
          title,
          comment,
        },
      });

      res.status(201).json({
        status: 'success',
        data: { review },
      });
    } catch (error) {
      next(error);
    }
  }

  // Получение отзывов тура
  static async getTourReviews(req, res, next) {
    try {
      const { tourId } = req.params;
      const { page = 1, limit = 10, sort = 'createdAt', order = 'DESC' } = req.query;

      const offset = (page - 1) * limit;

      const { count, rows: reviews } = await Review.findAndCountAll({
        where: { tourId },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'avatar'],
          },
        ],
        order: [[sort, order]],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      res.json({
        status: 'success',
        data: {
          reviews,
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

  // Получение отзывов пользователя
  static async getUserReviews(req, res, next) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10 } = req.query;

      const offset = (page - 1) * limit;

      const { count, rows: reviews } = await Review.findAndCountAll({
        where: { userId },
        include: [
          {
            model: Tour,
            as: 'tour',
            attributes: ['id', 'title', 'images'],
          },
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      res.json({
        status: 'success',
        data: {
          reviews,
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

  // Обновление отзыва
  static async updateReview(req, res, next) {
    try {
      const { rating, title, comment } = req.body;
      const review = await Review.findByPk(req.params.id, {
        include: [
          {
            model: Tour,
            as: 'tour',
          },
        ],
      });

      if (!review) {
        return res.status(404).json({
          status: 'error',
          message: 'Отзыв не найден',
        });
      }

      // Проверка прав доступа
      if (review.userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          status: 'error',
          message: 'У вас нет прав для редактирования этого отзыва',
        });
      }

      // Обновляем отзыв
      await review.update({
        rating,
        title,
        comment,
      });

      // Обновляем средний рейтинг тура
      const tourReviews = await Review.findAll({
        where: { tourId: review.tourId },
        attributes: ['rating'],
      });

      const averageRating =
        tourReviews.reduce((sum, review) => sum + review.rating, 0) /
        tourReviews.length;

      await review.tour.update({
        rating: averageRating,
        ratingCount: tourReviews.length,
      });

      res.json({
        status: 'success',
        data: { review },
      });
    } catch (error) {
      next(error);
    }
  }

  // Удаление отзыва
  static async deleteReview(req, res, next) {
    try {
      const review = await Review.findByPk(req.params.id, {
        include: [
          {
            model: Tour,
            as: 'tour',
          },
        ],
      });

      if (!review) {
        return res.status(404).json({
          status: 'error',
          message: 'Отзыв не найден',
        });
      }

      // Проверка прав доступа
      if (review.userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          status: 'error',
          message: 'У вас нет прав для удаления этого отзыва',
        });
      }

      // Удаляем отзыв
      await review.destroy();

      // Обновляем средний рейтинг тура
      const tourReviews = await Review.findAll({
        where: { tourId: review.tourId },
        attributes: ['rating'],
      });

      if (tourReviews.length > 0) {
        const averageRating =
          tourReviews.reduce((sum, review) => sum + review.rating, 0) /
          tourReviews.length;

        await review.tour.update({
          rating: averageRating,
          ratingCount: tourReviews.length,
        });
      } else {
        await review.tour.update({
          rating: 0,
          ratingCount: 0,
        });
      }

      res.json({
        status: 'success',
        message: 'Отзыв успешно удален',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ReviewController; 