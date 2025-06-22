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
  if (config.nodeEnv === 'production') {
    if (cloudinaryService.tourStorage) {
      console.log('☁️ Используем Cloudinary для хранения туров в production');
      return cloudinaryService.tourStorage;
    } else {
      console.log('⚠️ Cloudinary недоступен, используем локальное хранилище для туров');
      return tourLocalStorage;
    }
  } else {
    console.log('💾 Используем локальное хранилище для туров в development');
    return tourLocalStorage;
  }
};

// Выбираем хранилище для аватаров  
const getAvatarStorage = () => {
  if (config.nodeEnv === 'production') {
    if (cloudinaryService.avatarStorage) {
      console.log('☁️ Используем Cloudinary для хранения аватаров в production');
      return cloudinaryService.avatarStorage;
    } else {
      console.log('⚠️ Cloudinary недоступен, используем локальное хранилище для аватаров');
      return avatarLocalStorage;
    }
  } else {
    console.log('💾 Используем локальное хранилище для аватаров в development');
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
  storage: getAvatarStorage(),
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
    if (config.nodeEnv === 'production') {
      // Удаляем из Cloudinary в production
      console.log('🗑️ Удаление файла из Cloudinary:', filePath);
      await cloudinaryService.deleteFile(filePath);
    } else {
      // Удаляем локальный файл в development
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
  
  if (config.nodeEnv === 'production') {
    // Возвращаем Cloudinary URL в production
    return cloudinaryService.getImageUrl(filePath, options);
  } else {
    // Возвращаем локальный URL в development
    return filePath;
  }
};

module.exports = {
  upload, // Для обратной совместимости (туры)
  uploadTours,
  uploadAvatars,
  uploadTourImages: cloudinaryService.uploadTourImages || uploadTours, // fallback
  uploadAvatar: cloudinaryService.uploadAvatar || uploadAvatars, // fallback
  handleUploadError,
  deleteFile,
  getImageUrl,
}; 