const express = require('express');
const aiAssistantController = require('../controllers/aiAssistantController');
const { verifyToken, optionalAuth } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting для AI запросов
const aiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 30, // максимум 30 запросов за 15 минут
  message: {
    status: 'error',
    message: 'Слишком много запросов к AI ассистенту. Попробуйте позже.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Более строгий лимит для анонимных пользователей
const anonymousRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 10, // максимум 10 запросов за 15 минут для анонимов
  message: {
    status: 'error',
    message: 'Слишком много запросов. Зарегистрируйтесь для увеличения лимита.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware для выбора подходящего rate limit
const selectRateLimit = (req, res, next) => {
  if (req.user) {
    // Авторизованный пользователь - обычный лимит
    aiRateLimit(req, res, next);
  } else {
    // Анонимный пользователь - строгий лимит
    anonymousRateLimit(req, res, next);
  }
};

/**
 * @route   POST /api/ai/chat
 * @desc    Отправить сообщение AI ассистенту
 * @access  Public (с rate limiting)
 * @body    { message: string, chatHistory?: array, userPreferences?: object }
 */
router.post('/chat', optionalAuth, selectRateLimit, aiAssistantController.sendMessage);

/**
 * @route   POST /api/ai/recommendations
 * @desc    Получить персонализированные рекомендации туров
 * @access  Public (с rate limiting)
 * @body    { preferences?: object }
 */
router.post('/recommendations', optionalAuth, selectRateLimit, aiAssistantController.getPersonalizedRecommendations);

/**
 * @route   GET /api/ai/quick-questions
 * @desc    Получить быстрые вопросы для начала разговора
 * @access  Public (с rate limiting)
 * @query   context?: string (JSON)
 */
router.get('/quick-questions', optionalAuth, selectRateLimit, aiAssistantController.getQuickQuestions);

/**
 * @route   POST /api/ai/analyze-intent
 * @desc    Анализ намерений пользователя
 * @access  Public (с rate limiting)
 * @body    { message: string }
 */
router.post('/analyze-intent', optionalAuth, selectRateLimit, aiAssistantController.analyzeIntent);

/**
 * @route   GET /api/ai/status
 * @desc    Проверить статус AI сервиса
 * @access  Public
 */
router.get('/status', aiAssistantController.getStatus);

module.exports = router; 