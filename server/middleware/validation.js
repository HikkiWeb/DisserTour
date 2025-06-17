const { body, param, query, validationResult } = require('express-validator');

// Общий обработчик ошибок валидации
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

// Валидация для аутентификации
const authValidation = {
  register: [
    body('email')
      .isEmail()
      .withMessage('Введите корректный email адрес')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Пароль должен содержать минимум 6 символов'),
    body('firstName')
      .trim()
      .notEmpty()
      .withMessage('Введите имя')
      .isLength({ min: 2 })
      .withMessage('Имя должно содержать минимум 2 символа'),
    body('lastName')
      .trim()
      .notEmpty()
      .withMessage('Введите фамилию')
      .isLength({ min: 2 })
      .withMessage('Фамилия должна содержать минимум 2 символа'),
    handleValidationErrors,
  ],
  login: [
    body('email')
      .isEmail()
      .withMessage('Введите корректный email адрес')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Введите пароль'),
    handleValidationErrors,
  ],
  forgotPassword: [
    body('email')
      .isEmail()
      .withMessage('Введите корректный email адрес')
      .normalizeEmail(),
    handleValidationErrors,
  ],
  resetPassword: [
    body('token')
      .notEmpty()
      .withMessage('Токен обязателен'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Новый пароль должен содержать минимум 6 символов'),
    handleValidationErrors,
  ],
  updateProfile: [
    body('firstName')
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage('Имя должно содержать минимум 2 символа'),
    body('lastName')
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage('Фамилия должна содержать минимум 2 символа'),
    body('phone')
      .optional()
      .trim(),
    body('email')
      .optional()
      .isEmail()
      .withMessage('Введите корректный email адрес')
      .normalizeEmail(),
    handleValidationErrors,
  ],
  changePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('Введите текущий пароль'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('Новый пароль должен содержать минимум 6 символов'),
    handleValidationErrors,
  ],
};

// Валидация для туров
const tourValidation = {
  create: [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Введите название тура')
      .isLength({ min: 3, max: 100 })
      .withMessage('Название должно содержать от 3 до 100 символов'),
    body('description')
      .trim()
      .notEmpty()
      .withMessage('Введите описание тура')
      .isLength({ min: 50 })
      .withMessage('Описание должно содержать минимум 50 символов'),
    body('shortDescription')
      .trim()
      .notEmpty()
      .withMessage('Введите краткое описание')
      .isLength({ max: 200 })
      .withMessage('Краткое описание не должно превышать 200 символов'),
    body('price')
      .isFloat({ min: 0 })
      .withMessage('Цена должна быть положительным числом'),
    body('duration')
      .isInt({ min: 1 })
      .withMessage('Длительность должна быть положительным числом'),
    body('maxGroupSize')
      .isInt({ min: 1 })
      .withMessage('Размер группы должен быть положительным числом'),
    body('difficulty')
      .isIn(['easy', 'moderate', 'challenging', 'hard'])
      .withMessage('Выберите корректный уровень сложности'),
    body('category')
      .trim()
      .notEmpty()
      .withMessage('Выберите категорию тура'),
    body('region')
      .trim()
      .notEmpty()
      .withMessage('Выберите регион'),
    body('season')
      .isArray()
      .withMessage('Выберите сезоны')
      .custom((value) => {
        const validSeasons = ['summer', 'winter', 'spring', 'autumn'];
        return value.every(season => validSeasons.includes(season));
      })
      .withMessage('Выберите корректные сезоны'),
    body('itinerary')
      .isArray()
      .withMessage('Укажите маршрут')
      .custom((value) => {
        return value.every(day => 
          day.day && 
          typeof day.day === 'number' && 
          day.description && 
          typeof day.description === 'string'
        );
      })
      .withMessage('Некорректный формат маршрута'),
    handleValidationErrors,
  ],
  update: [
    param('id')
      .isUUID()
      .withMessage('Некорректный ID тура'),
    body('title')
      .optional()
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage('Название должно содержать от 3 до 100 символов'),
    body('price')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Цена должна быть положительным числом'),
    handleValidationErrors,
  ],
};

// Валидация для бронирований
const bookingValidation = {
  create: [
    body('tourId')
      .isUUID()
      .withMessage('Некорректный ID тура'),
    body('startDate')
      .isISO8601()
      .withMessage('Введите корректную дату начала')
      .custom((value) => {
        return new Date(value) > new Date();
      })
      .withMessage('Дата начала должна быть в будущем'),
    body('participants')
      .isInt({ min: 1 })
      .withMessage('Количество участников должно быть положительным числом'),
    handleValidationErrors,
  ],
};

// Валидация для отзывов
const reviewValidation = {
  create: [
    body('tourId')
      .isUUID()
      .withMessage('Некорректный ID тура'),
    body('bookingId')
      .isUUID()
      .withMessage('Некорректный ID бронирования'),
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Оценка должна быть от 1 до 5'),
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Введите заголовок отзыва')
      .isLength({ max: 100 })
      .withMessage('Заголовок не должен превышать 100 символов'),
    body('comment')
      .trim()
      .notEmpty()
      .withMessage('Введите текст отзыва')
      .isLength({ min: 10 })
      .withMessage('Отзыв должен содержать минимум 10 символов'),
    handleValidationErrors,
  ],
};

// Валидация для поиска и фильтрации
const searchValidation = {
  tours: [
    query('category')
      .optional()
      .trim(),
    query('region')
      .optional()
      .trim(),
    query('minPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Минимальная цена должна быть положительным числом'),
    query('maxPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Максимальная цена должна быть положительным числом')
      .custom((value, { req }) => {
        if (req.query.minPrice && Number(value) <= Number(req.query.minPrice)) {
          throw new Error('Максимальная цена должна быть больше минимальной');
        }
        return true;
      }),
    query('duration')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Длительность должна быть положительным числом'),
    query('difficulty')
      .optional()
      .isIn(['easy', 'moderate', 'challenging', 'hard'])
      .withMessage('Выберите корректный уровень сложности'),
    query('season')
      .optional()
      .isIn(['summer', 'winter', 'spring', 'autumn'])
      .withMessage('Выберите корректный сезон'),
    handleValidationErrors,
  ],
};

module.exports = {
  authValidation,
  tourValidation,
  bookingValidation,
  reviewValidation,
  searchValidation,
  handleValidationErrors,
}; 