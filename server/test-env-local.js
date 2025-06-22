console.log('🧪 Тестирование Cloudinary на локальной машине...\n');

// Загружаем .env файл
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

console.log('📋 Переменные окружения:');
console.log('NODE_ENV:', process.env.NODE_ENV || 'undefined');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? `✅ ${process.env.CLOUDINARY_CLOUD_NAME}` : '❌ НЕ УСТАНОВЛЕНО');
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? `✅ ${process.env.CLOUDINARY_API_KEY.substring(0, 8)}...` : '❌ НЕ УСТАНОВЛЕНО');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? `✅ ${process.env.CLOUDINARY_API_SECRET.substring(0, 8)}...` : '❌ НЕ УСТАНОВЛЕНО');

console.log('\n🔧 Конфигурация приложения:');
const config = require('./config/config');
console.log('config.nodeEnv:', config.nodeEnv);

console.log('\n☁️ Тестирование Cloudinary сервиса:');
try {
  // Загружаем сервис
  const cloudinaryService = require('./services/cloudinaryService');
  
  console.log('\n🔍 Проверка storage объектов:');
  console.log('tourStorage:', cloudinaryService.tourStorage ? '✅ Создан' : '❌ Не создан');
  console.log('avatarStorage:', cloudinaryService.avatarStorage ? '✅ Создан' : '❌ Не создан');
  console.log('uploadTourImages:', cloudinaryService.uploadTourImages ? '✅ Создан' : '❌ Не создан');
  console.log('uploadAvatar:', cloudinaryService.uploadAvatar ? '✅ Создан' : '❌ Не создан');
  
  console.log('\n🔗 Тестирование генерации URL:');
  const testPaths = [
    'test-image.jpg',
    'tours/test-tour.jpg',
    '/uploads/avatars/test-avatar.jpg'
  ];
  
  testPaths.forEach(testPath => {
    try {
      const url = cloudinaryService.getImageUrl(testPath);
      console.log(`"${testPath}" -> "${url}"`);
    } catch (error) {
      console.log(`"${testPath}" -> ❌ ${error.message}`);
    }
  });

} catch (error) {
  console.error('❌ Ошибка при загрузке cloudinaryService:', error.message);
}

console.log('\n⚙️ Тестирование middleware upload:');
try {
  const uploadMiddleware = require('./middleware/upload');
  
  // Проверяем какие storage будут выбраны
  console.log('\nПри NODE_ENV =', config.nodeEnv, ':');
  if (config.nodeEnv === 'production') {
    console.log('- Будет использоваться Cloudinary storage (если настроен)');
  } else {
    console.log('- Будет использоваться локальное хранилище');
  }
  
} catch (error) {
  console.error('❌ Ошибка при загрузке upload middleware:', error.message);
}

console.log('\n✅ Тестирование завершено'); 