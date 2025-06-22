const crypto = require('crypto');
const { User } = require('./models');
const emailService = require('./services/emailService');

async function testForgotPassword() {
  console.log('🧪 Тестирование функционала "Забыли пароль"...\n');

  try {
    // 1. Найдем первого пользователя для тестирования
    const user = await User.findOne({ 
      where: { isVerified: true },
      order: [['createdAt', 'DESC']]
    });

    if (!user) {
      console.log('❌ Нет подтвержденных пользователей для тестирования');
      console.log('💡 Создайте пользователя через регистрацию и подтвердите email');
      return;
    }

    console.log(`👤 Тестируем с пользователем: ${user.email}`);

    // 2. Создаем токен сброса пароля
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 час

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await user.save();

    console.log(`🔑 Создан токен сброса: ${resetToken.substring(0, 10)}...`);
    console.log(`⏰ Срок действия до: ${resetExpires.toLocaleString()}`);

    // 3. Отправляем email
    await emailService.sendEmail({
      to: user.email,
      template: 'resetPassword',
      data: resetToken,
    });
    console.log('📧 Email отправлен успешно!');

    // 4. Симулируем проверку токена
    const foundUser = await User.findOne({
      where: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: { $gt: new Date() }
      }
    });

    if (foundUser) {
      console.log('✅ Токен найден и действителен');
    } else {
      console.log('❌ Токен не найден или истек');
    }

    // 5. Выводим ссылку для ручного тестирования
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;
    
    console.log('\n🔗 Ссылка для тестирования:');
    console.log(resetUrl);
    
    console.log('\n📋 Что дальше:');
    console.log('1. Перейдите по ссылке выше');
    console.log('2. Введите новый пароль');
    console.log('3. Попробуйте войти с новым паролем');

    // 6. Проверяем возможные проблемы
    console.log('\n🔍 Диагностика:');
    
    // Проверка SMTP настроек
    const smtpConfigured = process.env.SMTP_USER && process.env.SMTP_PASS;
    console.log(`📨 SMTP настроен: ${smtpConfigured ? '✅' : '❌'}`);
    
    if (!smtpConfigured) {
      console.log('⚠️  Проверьте настройки SMTP в .env файле');
    }

    // Проверка CLIENT_URL
    console.log(`🌐 CLIENT_URL: ${process.env.CLIENT_URL || 'НЕ УСТАНОВЛЕН'}`);
    
    if (!process.env.CLIENT_URL) {
      console.log('⚠️  Установите CLIENT_URL в .env файле');
    }

  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error.message);
    
    if (error.message.includes('SMTP')) {
      console.log('\n💡 Возможные причины проблем с SMTP:');
      console.log('- Неверные SMTP_USER или SMTP_PASS');
      console.log('- SMTP_HOST недоступен');
      console.log('- Блокировка "менее безопасных приложений"');
      console.log('- Нужен пароль приложения вместо обычного пароля');
    }
  }
}

// Проверяем модель User на наличие нужных полей
async function checkUserModel() {
  console.log('🔍 Проверка модели User...\n');
  
  try {
    const user = await User.findOne();
    if (user) {
      const hasResetToken = user.hasOwnProperty('resetPasswordToken');
      const hasResetExpires = user.hasOwnProperty('resetPasswordExpires');
      
      console.log(`resetPasswordToken поле: ${hasResetToken ? '✅' : '❌'}`);
      console.log(`resetPasswordExpires поле: ${hasResetExpires ? '✅' : '❌'}`);
      
      if (!hasResetToken || !hasResetExpires) {
        console.log('\n⚠️  Модель User не содержит необходимые поля для сброса пароля');
        console.log('Добавьте в модель User:');
        console.log('- resetPasswordToken: STRING');
        console.log('- resetPasswordExpires: DATE');
      }
    }
  } catch (error) {
    console.error('❌ Ошибка проверки модели:', error.message);
  }
}

// Запуск тестирования
if (require.main === module) {
  console.log('🔧 Тестирование функционала "Забыли пароль"\n');
  
  checkUserModel()
    .then(() => testForgotPassword())
    .then(() => {
      console.log('\n✅ Тестирование завершено');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Критическая ошибка:', error);
      process.exit(1);
    });
}

module.exports = { testForgotPassword, checkUserModel }; 