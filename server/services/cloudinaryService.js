const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Настройка Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Создание хранилища для туров
const tourStorage = new CloudinaryStorage({
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
const avatarStorage = new CloudinaryStorage({
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

// Multer конфигурация для туров
const uploadTourImages = multer({
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
const uploadAvatar = multer({
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

// Функция для удаления файла из Cloudinary
const deleteFile = async (publicId) => {
  try {
    if (!publicId) return;
    
    // Извлекаем public_id из URL если передана полная ссылка
    let cloudinaryPublicId = publicId;
    if (publicId.includes('cloudinary.com')) {
      const urlParts = publicId.split('/');
      const folderIndex = urlParts.findIndex(part => part === 'upload') + 2;
      cloudinaryPublicId = urlParts.slice(folderIndex).join('/').split('.')[0];
    }
    
    const result = await cloudinary.uploader.destroy(cloudinaryPublicId);
    console.log('Файл удален из Cloudinary:', result);
    return result;
  } catch (error) {
    console.error('Ошибка при удалении файла из Cloudinary:', error);
    throw error;
  }
};

// Функция для получения URL изображения
const getImageUrl = (publicId, options = {}) => {
  if (!publicId) return null;
  
  const defaultOptions = {
    width: 800,
    height: 600,
    crop: 'limit',
    quality: 'auto',
    ...options
  };
  
  return cloudinary.url(publicId, defaultOptions);
};

module.exports = {
  cloudinary,
  uploadTourImages,
  uploadAvatar,
  deleteFile,
  getImageUrl,
}; 