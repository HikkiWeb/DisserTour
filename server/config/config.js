require('dotenv').config();

module.exports = {
  // Настройки сервера
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Настройки базы данных
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || 'tours_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '1234',
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  // Email
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },

  // Загрузка файлов
  upload: {
    path: process.env.UPLOAD_PATH || 'uploads',
    maxFileSize: process.env.MAX_FILE_SIZE || 5242880, // 5MB
  },

  // URL клиентского приложения
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',

  // CORS
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  },

  // Railway specific settings
  railway: {
    port: process.env.PORT || 3000,
    host: '0.0.0.0', // Railway требует прослушивание всех интерфейсов
  },

  // Gemini AI
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
  },
}; 