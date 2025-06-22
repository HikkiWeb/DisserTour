const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config/config');

// Импортируем Cloudinary сервис
const cloudinaryService = require('../services/cloudinaryService');

// Создаем директорию для загрузок, если она не существует
const uploadDir = path.join(__dirname, '..', config.upload.path);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Настройка хранилища для туров
const tourLocalStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(uploadDir, 'tours');
    
    console.log('📁 Настройка папки назначения для туров:', dir);
    
    if (!fs.existsSync(dir)) {
      console.log('📂 Создание папки для туров:', dir);
      fs.mkdirSync(dir, { recursive: true });
    }
    
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = file.fieldname + '-' + uniqueSuffix + ext;
    
    console.log('📝 Генерация имени файла тура:', {
      originalname: file.originalname,
      fieldname: file.fieldname,
      filename: filename
    });
    
    cb(null, filename);
  },
});

// Настройка хранилища для аватаров
const avatarLocalStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(uploadDir, 'avatars');
    
    console.log('📁 Настройка папки назначения для аватаров:', dir);
    
    if (!fs.existsSync(dir)) {
      console.log('📂 Создание папки для аватаров:', dir);
      fs.mkdirSync(dir, { recursive: true });
    }
    
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = file.fieldname + '-' + uniqueSuffix + ext;
    
    console.log('📝 Генерация имени файла аватара:', {
      originalname: file.originalname,
      fieldname: file.fieldname,
      filename: filename
    });
    
    cb(null, filename);
  },
});

// Фильтр файлов
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  
  console.log('🔍 Проверка файла:', {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size
  });
  
  if (allowedTypes.includes(file.mimetype)) {
    console.log('✅ Файл разрешен:', file.originalname);
    cb(null, true);
  } else {
    console.log('❌ Файл отклонен:', file.originalname, '- неподдерживаемый тип:', file.mimetype);
    cb(new Error('Неподдерживаемый тип файла. Разрешены только JPEG, PNG и WebP.'), false);
  }
};

// Выбираем хранилище для туров
const getTourStorage = () => {
  if (config.nodeEnv === 'production' && process.env.CLOUDINARY_CLOUD_NAME) {
    console.log('☁️ Используем Cloudinary для хранения туров');
    return cloudinaryService.tourStorage;
  } else {
    console.log('💾 Используем локальное хранилище для туров');
    return tourLocalStorage;
  }
};

// Выбираем хранилище для аватаров  
const getAvatarStorage = () => {
  if (config.nodeEnv === 'production' && process.env.CLOUDINARY_CLOUD_NAME) {
    console.log('☁️ Используем Cloudinary для хранения аватаров');
    return cloudinaryService.avatarStorage;
  } else {
    console.log('💾 Используем локальное хранилище для аватаров');
    return avatarLocalStorage;
  }
};

// Настройка multer для туров
const uploadTours = multer({
  storage: getTourStorage(),
  fileFilter: fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize, // 5MB
  },
});

// Настройка multer для аватаров
const uploadAvatars = multer({
  storage: avatarLocalStorage, // Всегда используем локальное хранилище для аватаров в разработке
  fileFilter: fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize, // 5MB
  },
});

// Устаревший upload для совместимости (используем для туров)
const upload = uploadTours;

// Middleware для обработки ошибок загрузки
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: 'error',
        message: 'Размер файла превышает допустимый предел',
      });
    }
    return res.status(400).json({
      status: 'error',
      message: err.message,
    });
  }
  
  if (err) {
    return res.status(400).json({
      status: 'error',
      message: err.message,
    });
  }
  
  next();
};

// Middleware для удаления файлов
const deleteFile = async (filePath) => {
  try {
    if (config.nodeEnv === 'production' && process.env.CLOUDINARY_CLOUD_NAME) {
      // Удаляем из Cloudinary
      await cloudinaryService.deleteFile(filePath);
    } else {
      // Удаляем локальный файл
      // Если путь начинается с /, убираем его для правильного пути к файлу
      const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
      const fullPath = path.join(__dirname, '..', cleanPath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        console.log('🗑️ Локальный файл удален:', fullPath);
      }
    }
  } catch (error) {
    console.error('Ошибка при удалении файла:', error);
  }
};

// Функция для получения URL изображения
const getImageUrl = (filePath, options = {}) => {
  if (!filePath) return null;
  
  if (config.nodeEnv === 'production' && process.env.CLOUDINARY_CLOUD_NAME) {
    // Возвращаем Cloudinary URL
    return cloudinaryService.getImageUrl(filePath, options);
  } else {
    // Возвращаем локальный URL
    return filePath;
  }
};

module.exports = {
  upload, // Для обратной совместимости (туры)
  uploadTours,
  uploadAvatars,
  uploadTourImages: cloudinaryService.uploadTourImages,
  uploadAvatar: cloudinaryService.uploadAvatar,
  handleUploadError,
  deleteFile,
  getImageUrl,
}; 