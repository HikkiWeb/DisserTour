const { Tour, User, Review, Booking } = require('../models');
const { Op } = require('sequelize');
const { deleteFile } = require('../middleware/upload');
const RecommendationService = require('../services/recommendationService');

class TourController {
  // Создание нового тура
  static async createTour(req, res, next) {
    try {
      const tourData = { 
        ...req.body,
        guideId: req.user.id,
        images: req.files ? req.files.map(file => file.path) : [],
      };

      const tour = await Tour.create(tourData);

      res.status(201).json({
        status: 'success',
        data: { tour },
      });
    } catch (error) {
      // Удаляем загруженные файлы в случае ошибки
      if (req.files) {
        req.files.forEach(file => deleteFile(file.path));
      }
      next(error);
    }
  }

  // Получение списка туров с фильтрацией
  static async getTours(req, res, next) {
    try {
      const {
        category,
        region,
        minPrice,
        maxPrice,
        duration,
        difficulty,
        season,
        search,
        page = 1,
        limit = 10,
        sort = 'rating',
        order = 'DESC',
      } = req.query;

      const where = { isActive: true };
      const orderBy = [[sort, order]];

      // Применяем фильтры
      if (category) where.category = category;
      if (region) where.region = region;
      if (difficulty) where.difficulty = difficulty;
      if (season) where.season = { [Op.contains]: [season] };
      if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price[Op.gte] = minPrice;
        if (maxPrice) where.price[Op.lte] = maxPrice;
      }
      if (duration) where.duration = duration;
      if (search) {
        where[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
          { shortDescription: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const offset = (page - 1) * limit;

      const { count, rows: tours } = await Tour.findAndCountAll({
        where,
        order: orderBy,
        limit: parseInt(limit),
        offset: parseInt(offset),
        include: [
          {
            model: User,
            as: 'guide',
            attributes: ['id', 'firstName', 'lastName', 'avatar'],
          },
        ],
      });

      res.json({
        status: 'success',
        data: {
          tours,
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

  // Получение тура по ID
  static async getTourById(req, res, next) {
    try {
      const tour = await Tour.findByPk(req.params.id, {
        include: [
          {
            model: User,
            as: 'guide',
            attributes: ['id', 'firstName', 'lastName', 'avatar', 'phone'],
          },
          {
            model: Review,
            as: 'reviews',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'firstName', 'lastName', 'avatar'],
              },
            ],
          },
        ],
      });

      if (!tour) {
        return res.status(404).json({
          status: 'error',
          message: 'Тур не найден',
        });
      }

      // Получаем похожие туры
      const similarTours = await RecommendationService.getSimilarTours(tour.id);

      res.json({
        status: 'success',
        data: {
          tour,
          similarTours,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Обновление тура
  static async updateTour(req, res, next) {
    try {
      const tour = await Tour.findByPk(req.params.id);

      if (!tour) {
        return res.status(404).json({
          status: 'error',
          message: 'Тур не найден',
        });
      }

      // Проверка прав доступа
      if (tour.guideId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          status: 'error',
          message: 'У вас нет прав для редактирования этого тура',
        });
      }

      const updateData = { ...req.body };
      
      // Обработка новых изображений
      if (req.files && req.files.length > 0) {
        // Удаляем старые изображения
        if (tour.images) {
          tour.images.forEach(image => deleteFile(image));
        }
        updateData.images = req.files.map(file => file.path);
      }

      await tour.update(updateData);

      res.json({
        status: 'success',
        data: { tour },
      });
    } catch (error) {
      if (req.files) {
        req.files.forEach(file => deleteFile(file.path));
      }
      next(error);
    }
  }

  // Удаление тура
  static async deleteTour(req, res, next) {
    try {
      const tour = await Tour.findByPk(req.params.id);

      if (!tour) {
        return res.status(404).json({
          status: 'error',
          message: 'Тур не найден',
        });
      }

      // Проверка прав доступа
      if (tour.guideId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          status: 'error',
          message: 'У вас нет прав для удаления этого тура',
        });
      }

      // Проверка наличия активных бронирований
      const activeBookings = await Booking.count({
        where: {
          tourId: tour.id,
          status: { [Op.in]: ['pending', 'confirmed'] },
        },
      });

      if (activeBookings > 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Невозможно удалить тур с активными бронированиями',
        });
      }

      // Удаляем изображения
      if (tour.images) {
        tour.images.forEach(image => deleteFile(image));
      }

      await tour.destroy();

      res.json({
        status: 'success',
        message: 'Тур успешно удален',
      });
    } catch (error) {
      next(error);
    }
  }

  // Получение туров гида
  static async getGuideTours(req, res, next) {
    try {
      const guideId = req.params.guideId || req.user.id;
      const { page = 1, limit = 10 } = req.query;

      const offset = (page - 1) * limit;

      const { count, rows: tours } = await Tour.findAndCountAll({
        where: {
          guideId,
          isActive: true,
        },
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
        include: [
          {
            model: Review,
            as: 'reviews',
            attributes: ['rating'],
          },
        ],
      });

      res.json({
        status: 'success',
        data: {
          tours,
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

  // Получение популярных туров
  static async getPopularTours(req, res, next) {
    try {
      const { limit = 6 } = req.query;
      const tours = await RecommendationService.getPopularTours(parseInt(limit));

      res.json({
        status: 'success',
        data: { tours },
      });
    } catch (error) {
      next(error);
    }
  }

  // Получение сезонных рекомендаций
  static async getSeasonalRecommendations(req, res, next) {
    try {
      const { limit = 6 } = req.query;
      const tours = await RecommendationService.getSeasonalRecommendations(parseInt(limit));

      res.json({
        status: 'success',
        data: { tours },
      });
    } catch (error) {
      next(error);
    }
  }

  // Получение персонализированных рекомендаций
  static async getPersonalizedRecommendations(req, res, next) {
    try {
      const { limit = 6 } = req.query;
      const tours = await RecommendationService.getPersonalizedRecommendations(
        req.user.id,
        parseInt(limit)
      );

      res.json({
        status: 'success',
        data: { tours },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TourController; 