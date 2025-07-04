const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const { sequelize } = require('./models');
const routes = require('./routes');
const config = require('./config/config');
const { handleValidationErrors } = require('./middleware/validation');

// Создание экземпляра приложения
const app = express();

// Middleware
app.use(helmet()); // Безопасность

// CORS настройки (упрощенные для разработки)
if (config.nodeEnv === 'development') {
  app.use(cors({
    origin: true, // Разрешаем любые origins в разработке
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
  }));
} else {
  app.use(cors({
    origin: function (origin, callback) {
      // Разрешаем запросы без origin (например, мобильные приложения)
      if (!origin) return callback(null, true);
      
      // Разрешенные домены для продакшена
      const allowedOrigins = [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        config.cors.origin
      ];
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
  }));
}
app.use(compression()); // Сжатие ответов
app.use(morgan('dev')); // Логирование

// Увеличенные лимиты для JSON и urlencoded
app.use(express.json({ limit: '50mb' })); // Парсинг JSON с лимитом 50mb
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // Парсинг URL-encoded с лимитом 50mb

// Статические файлы с правильными заголовками CORS
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  
  // Обработка preflight запросов
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Маршруты API
app.use('/api', routes);

// Вместо этого можно добавить простой ответ для корня
if (config.nodeEnv === 'production') {
  app.get('/', (req, res) => {
    res.send('API сервер работает');
  });
}

// Обработка ошибок валидации
app.use(handleValidationErrors);

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Внутренняя ошибка сервера';

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
});

// Запуск сервера  
const PORT = process.env.PORT || config.port || 5000;

async function startServer() {
  try {
    // Синхронизация с базой данных (не запускаем при тестировании)
    if (process.env.NODE_ENV !== 'test') {
      await sequelize.sync({ alter: config.nodeEnv === 'development' });
      console.log('База данных синхронизирована');
    }

    // Запуск сервера
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Сервер запущен на ${config.nodeEnv === 'production' ? 'Railway' : 'localhost'}:${PORT}`);
    });
  } catch (error) {
    console.error('Ошибка при запуске сервера:', error);
    process.exit(1);
  }
}

// Запуск сервера только если файл запущен напрямую (не через require)
if (require.main === module) {
  startServer();
}

// Обработка необработанных исключений
process.on('uncaughtException', (err) => {
  console.error('Необработанное исключение:', err);
  process.exit(1);
});

// Обработка необработанных отклонений промисов
process.on('unhandledRejection', (err) => {
  console.error('Необработанное отклонение промиса:', err);
  process.exit(1);
});

module.exports = app; 