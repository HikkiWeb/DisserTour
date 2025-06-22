const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Проверяем доступность переменных окружения Cloudinary
const isCloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET
);

console.log('☁️ Cloudinary конфигурация:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? '✅ Установлено' : '❌ Не установлено',
  api_key: process.env.CLOUDINARY_API_KEY ? '✅ Установлено' : '❌ Не установлено',
  api_secret: process.env.CLOUDINARY_API_SECRET ? '✅ Установлено' : '❌ Не установлено',
  configured: isCloudinaryConfigured ? '✅ Готов к работе' : '❌ Требует настройки'
});

if (!isCloudinaryConfigured) {
  console.log('⚠️ ВНИМАНИЕ: Cloudinary не настроен! Некоторые функции могут не работать.');
  console.log('📝 Для настройки добавьте переменные окружения:');
  console.log('   - CLOUDINARY_CLOUD_NAME');
  console.log('   - CLOUDINARY_API_KEY');
  console.log('   - CLOUDINARY_API_SECRET');
}

// Настройка Cloudinary только если есть все переменные
if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Создание хранилища для туров (только если Cloudinary настроен)
let tourStorage = null;
let avatarStorage = null;

if (isCloudinaryConfigured) {
  tourStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'tours',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [
        { width: 800, height: 600, crop: 'limit' },
        { quality: 'auto' }
      ],
    },
  });

  // Создание хранилища для аватаров
  avatarStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'avatars',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [
        { width: 300, height: 300, crop: 'fill' },
        { quality: 'auto' }
      ],
    },
  });
}

// Multer конфигурации (только если Cloudinary настроен)
let uploadTourImages = null;
let uploadAvatar = null;

if (isCloudinaryConfigured && tourStorage && avatarStorage) {
  // Multer конфигурация для туров
  uploadTourImages = multer({
    storage: tourStorage,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Неподдерживаемый тип файла. Разрешены только JPEG, PNG и WebP.'), false);
      }
    },
  });

  // Multer конфигурация для аватаров
  uploadAvatar = multer({
    storage: avatarStorage,
    limits: {
      fileSize: 2 * 1024 * 1024, // 2MB
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Неподдерживаемый тип файла. Разрешены только JPEG, PNG и WebP.'), false);
      }
    },
  });
}

// Функция для удаления файла из Cloudinary
const deleteFile = async (publicId) => {
  try {
    if (!publicId) return;
    
    if (!isCloudinaryConfigured) {
      console.log('⚠️ Cloudinary не настроен, пропускаем удаление:', publicId);
      return { result: 'not_found', reason: 'cloudinary_not_configured' };
    }
    
    console.log('🗑️ Попытка удаления из Cloudinary:', publicId);
    
    // Извлекаем public_id из URL если передана полная ссылка
    let cloudinaryPublicId = publicId;
    if (publicId.includes('cloudinary.com')) {
      const urlParts = publicId.split('/');
      const folderIndex = urlParts.findIndex(part => part === 'upload') + 2;
      cloudinaryPublicId = urlParts.slice(folderIndex).join('/').split('.')[0];
    } else if (publicId.startsWith('/uploads/')) {
      // Обработка локальных путей типа /uploads/tours/filename.jpg
      const pathParts = publicId.split('/');
      const folderName = pathParts[2]; // tours или avatars
      const fileName = pathParts[3];
      cloudinaryPublicId = `${folderName}/${fileName.split('.')[0]}`;
    }
    
    console.log('🗑️ Извлеченный public_id:', cloudinaryPublicId);
    
    const result = await cloudinary.uploader.destroy(cloudinaryPublicId);
    console.log('✅ Файл удален из Cloudinary:', result);
    return result;
  } catch (error) {
    console.error('❌ Ошибка при удалении файла из Cloudinary:', error);
    throw error;
  }
};

// Функция для получения URL изображения
const getImageUrl = (publicId, options = {}) => {
  if (!publicId) return null;
  
  // Если это уже полный URL Cloudinary, возвращаем как есть
  if (publicId.includes('cloudinary.com')) {
    return publicId;
  }
  
  if (!isCloudinaryConfigured) {
    console.log('⚠️ Cloudinary не настроен, возвращаем исходный путь:', publicId);
    return publicId;
  }
  
  const defaultOptions = {
    width: 800,
    height: 600,
    crop: 'limit',
    quality: 'auto',
    fetch_format: 'auto',
    ...options
  };
  
  try {
    return cloudinary.url(publicId, defaultOptions);
  } catch (error) {
    console.error('Ошибка генерации Cloudinary URL:', error);
    return publicId;
  }
};

module.exports = {
  cloudinary,
  tourStorage,
  avatarStorage,
  uploadTourImages,
  uploadAvatar,
  deleteFile,
  getImageUrl,
}; 