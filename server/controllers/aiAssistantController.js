const geminiService = require('../services/geminiService');
const { Tour } = require('../models');
const { Op } = require('sequelize');

class AIAssistantController {
  // Отправить сообщение AI ассистенту
  async sendMessage(req, res) {
    try {
      console.log('📨 Получен запрос к AI:', req.body);
      
      const { message, chatHistory = [], userPreferences = {} } = req.body;
      const userId = req.user?.id;

      console.log('👤 User ID:', userId);
      console.log('💬 Message:', message);
      console.log('📚 Chat History length:', chatHistory.length);

      if (!message || message.trim().length === 0) {
        console.log('❌ Пустое сообщение');
        return res.status(400).json({
          status: 'error',
          message: 'Сообщение не может быть пустым'
        });
      }

      // Получаем доступные туры для контекста
      console.log('🔍 Загружаем туры из БД...');
      const availableTours = await Tour.findAll({
        attributes: ['id', 'title', 'description', 'price', 'region', 'duration', 'rating'],
        where: {
          isActive: true
        },
        limit: 20,
        order: [['rating', 'DESC'], ['createdAt', 'DESC']]
      });
      console.log('📋 Найдено туров:', availableTours.length);

      // Создаем контекст для AI
      console.log('🎯 Создаем контекст для AI...');
      const context = geminiService.createTourismContext(userPreferences, availableTours);

      // Генерируем ответ
      console.log('🤖 Отправляем запрос к Gemini...');
      const aiResponse = await geminiService.generateResponse(message, context, chatHistory);
      console.log('✅ Получен ответ от Gemini:', aiResponse.substring(0, 100));

      // Анализируем интент для возможных дополнительных действий
      const intent = await geminiService.analyzeIntent(message);

      let additionalData = {};

      // В зависимости от интента добавляем дополнительную информацию
      if (intent === 'tour_search') {
        // Если пользователь ищет туры, предлагаем конкретные варианты
        const searchTerms = message.toLowerCase();
        const suggestedTours = availableTours.filter(tour => 
          tour.title.toLowerCase().includes(searchTerms) ||
          tour.description.toLowerCase().includes(searchTerms) ||
          tour.region.toLowerCase().includes(searchTerms)
        ).slice(0, 3);

        additionalData.suggestedTours = suggestedTours;
      }

      // Генерируем быстрые вопросы для следующего взаимодействия
      console.log('❓ Генерируем быстрые вопросы...');
      const quickQuestions = await geminiService.generateQuickQuestions(userPreferences);
      console.log('📝 Быстрые вопросы:', quickQuestions);

      console.log('📤 Отправляем ответ клиенту...');
      res.json({
        status: 'success',
        data: {
          response: aiResponse,
          intent,
          quickQuestions,
          ...additionalData
        }
      });
      console.log('✅ Ответ успешно отправлен');

    } catch (error) {
      console.error('❌ Ошибка в sendMessage:', error);
      console.error('❌ Stack trace:', error.stack);
      res.status(500).json({
        status: 'error',
        message: 'Произошла ошибка при обработке сообщения',
        error: error.message
      });
    }
  }

  // Получить персонализированные рекомендации
  async getPersonalizedRecommendations(req, res) {
    try {
      const userId = req.user?.id;
      const { preferences = {} } = req.body;

      // Получаем профиль пользователя (если авторизован)
      let userProfile = {};
      if (userId) {
        const { User, Booking } = require('../models');
        const user = await User.findByPk(userId, {
          include: [{
            model: Booking,
            include: [Tour]
          }]
        });
        
        if (user) {
                     userProfile = {
             id: user.id,
             name: user.name,
             previousBookings: user.Bookings?.map(booking => ({
               tourTitle: booking.Tour?.title,
               region: booking.Tour?.region,
               rating: booking.rating
             })) || []
           };
        }
      }

      // Получаем все доступные туры
      const availableTours = await Tour.findAll({
        where: {
          isActive: true
        },
        order: [['rating', 'DESC'], ['createdAt', 'DESC']]
      });

      // Генерируем рекомендации с помощью AI
      const recommendations = await geminiService.generatePersonalizedRecommendations(
        userProfile, 
        availableTours, 
        preferences
      );

      // Получаем детали рекомендованных туров
      if (recommendations.recommendations && recommendations.recommendations.length > 0) {
        const tourIds = recommendations.recommendations.map(rec => rec.tourId);
        const detailedTours = await Tour.findAll({
          where: {
            id: {
              [Op.in]: tourIds
            }
          }
        });

        // Объединяем данные туров с рекомендациями AI
        recommendations.recommendations = recommendations.recommendations.map(rec => {
          const tour = detailedTours.find(t => t.id.toString() === rec.tourId.toString());
          return {
            ...rec,
            tour: tour || null
          };
        }).filter(rec => rec.tour); // Убираем рекомендации без найденных туров
      }

      res.json({
        status: 'success',
        data: recommendations
      });

    } catch (error) {
      console.error('Ошибка в getPersonalizedRecommendations:', error);
      res.status(500).json({
        status: 'error',
        message: 'Произошла ошибка при получении рекомендаций'
      });
    }
  }

  // Получить быстрые вопросы для начала разговора
  async getQuickQuestions(req, res) {
    try {
      const { context = {} } = req.query;
      const userContext = typeof context === 'string' ? JSON.parse(context) : context;

      const questions = await geminiService.generateQuickQuestions(userContext);

      res.json({
        status: 'success',
        data: {
          questions
        }
      });

    } catch (error) {
      console.error('Ошибка в getQuickQuestions:', error);
      res.status(500).json({
        status: 'error',
        message: 'Произошла ошибка при получении быстрых вопросов'
      });
    }
  }

  // Анализ намерений пользователя
  async analyzeIntent(req, res) {
    try {
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({
          status: 'error',
          message: 'Сообщение обязательно'
        });
      }

      const intent = await geminiService.analyzeIntent(message);

      res.json({
        status: 'success',
        data: {
          intent,
          message
        }
      });

    } catch (error) {
      console.error('Ошибка в analyzeIntent:', error);
      res.status(500).json({
        status: 'error',
        message: 'Произошла ошибка при анализе намерений'
      });
    }
  }

  // Получить информацию о статусе AI сервиса
  async getStatus(req, res) {
    try {
      // Простая проверка работоспособности AI сервиса
      console.log('🔍 Проверяем статус Gemini API...');
      
      const testResponse = await geminiService.generateResponse(
        'Привет! Ты работаешь?', 
        'Ты туристический ассистент по Казахстану. Ответь кратко на русском.', 
        []
      );

      console.log('✅ Gemini API работает, ответ получен:', testResponse.substring(0, 100));

      res.json({
        status: 'success',
        data: {
          aiServiceActive: !!testResponse,
          model: 'gemini-2.0-flash',
          timestamp: new Date().toISOString(),
          testResponse: testResponse.substring(0, 100) + '...'
        }
      });

    } catch (error) {
      console.error('❌ Ошибка Gemini API:', error.message);
      res.status(200).json({
        status: 'success',
        data: {
          aiServiceActive: false,
          error: error.message,
          model: 'gemini-2.0-flash',
          timestamp: new Date().toISOString()
        }
      });
    }
  }
}

module.exports = new AIAssistantController(); 