const { Tour, User, Booking, Review } = require('../models');
const { Op } = require('sequelize');

class RecommendationService {
  // Получение популярных туров
  static async getPopularTours(limit = 6) {
    return Tour.findAll({
      where: {
        isActive: true,
      },
      order: [
        ['rating', 'DESC'],
        ['ratingCount', 'DESC'],
      ],
      limit,
      include: [
        {
          model: User,
          as: 'guide',
          attributes: ['id', 'firstName', 'lastName', 'avatar'],
        },
      ],
    });
  }

  // Получение рекомендаций на основе предпочтений пользователя
  static async getPersonalizedRecommendations(userId, limit = 6) {
    const user = await User.findByPk(userId, {
      include: [
        {
          model: Booking,
          as: 'bookings',
          include: [
            {
              model: Tour,
              as: 'tour',
              attributes: ['category', 'region', 'difficulty'],
            },
          ],
        },
        {
          model: Review,
          as: 'reviews',
          include: [
            {
              model: Tour,
              as: 'tour',
              attributes: ['category', 'region', 'difficulty'],
            },
          ],
        },
      ],
    });

    // Анализ предпочтений пользователя
    const preferences = this.analyzeUserPreferences(user);

    // Поиск туров, соответствующих предпочтениям
    return Tour.findAll({
      where: {
        isActive: true,
        [Op.or]: [
          { category: preferences.categories },
          { region: preferences.regions },
          { difficulty: preferences.difficulties },
        ],
      },
      order: [
        ['rating', 'DESC'],
        ['ratingCount', 'DESC'],
      ],
      limit,
      include: [
        {
          model: User,
          as: 'guide',
          attributes: ['id', 'firstName', 'lastName', 'avatar'],
        },
      ],
    });
  }

  // Анализ предпочтений пользователя
  static analyzeUserPreferences(user) {
    const preferences = {
      categories: new Set(),
      regions: new Set(),
      difficulties: new Set(),
    };

    // Анализ бронирований
    user.bookings.forEach(booking => {
      if (booking.tour) {
        preferences.categories.add(booking.tour.category);
        preferences.regions.add(booking.tour.region);
        preferences.difficulties.add(booking.tour.difficulty);
      }
    });

    // Анализ отзывов
    user.reviews.forEach(review => {
      if (review.tour) {
        preferences.categories.add(review.tour.category);
        preferences.regions.add(review.tour.region);
        preferences.difficulties.add(review.tour.difficulty);
      }
    });

    // Преобразование Set в массивы
    return {
      categories: Array.from(preferences.categories),
      regions: Array.from(preferences.regions),
      difficulties: Array.from(preferences.difficulties),
    };
  }

  // Получение похожих туров
  static async getSimilarTours(tourId, limit = 4) {
    const tour = await Tour.findByPk(tourId);
    
    if (!tour) {
      throw new Error('Тур не найден');
    }

    return Tour.findAll({
      where: {
        id: { [Op.ne]: tourId },
        isActive: true,
        [Op.or]: [
          { category: tour.category },
          { region: tour.region },
          { difficulty: tour.difficulty },
        ],
      },
      order: [
        ['rating', 'DESC'],
        ['ratingCount', 'DESC'],
      ],
      limit,
      include: [
        {
          model: User,
          as: 'guide',
          attributes: ['id', 'firstName', 'lastName', 'avatar'],
        },
      ],
    });
  }

  // Получение сезонных рекомендаций
  static async getSeasonalRecommendations(limit = 6) {
    const currentMonth = new Date().getMonth();
    const season = this.getCurrentSeason(currentMonth);

    return Tour.findAll({
      where: {
        isActive: true,
        season: {
          [Op.contains]: [season],
        },
      },
      order: [
        ['rating', 'DESC'],
        ['ratingCount', 'DESC'],
      ],
      limit,
      include: [
        {
          model: User,
          as: 'guide',
          attributes: ['id', 'firstName', 'lastName', 'avatar'],
        },
      ],
    });
  }

  // Определение текущего сезона
  static getCurrentSeason(month) {
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  }
}

module.exports = RecommendationService; 