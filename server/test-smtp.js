/**
 * Скрипт для тестирования SMTP настроек
 * Запуск: node test-smtp.js
 */

require('dotenv').config();
const nodemailer = require('nodemailer');
const config = require('./config/config');

async function testSMTP() {
  console.log('🔧 Тестирование SMTP настроек...\n');
  
  // Проверяем наличие настроек
  console.log('📋 Настройки SMTP:');
  console.log('Host:', config.email.host);
  console.log('Port:', config.email.port);
  console.log('User:', config.email.user);
  console.log('Pass:', config.email.pass ? '***' : 'НЕ УСТАНОВЛЕН');
  console.log('');

  if (!config.email.user || !config.email.pass) {
    console.log('❌ Ошибка: SMTP_USER и SMTP_PASS должны быть установлены в .env файле');
    return;
  }

  try {
    // Создаем транспорт
    const transporter = nodemailer.createTransporter({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.port === 465,
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });

    // Тестируем подключение
    console.log('🔌 Проверка подключения к SMTP серверу...');
    await transporter.verify();
    console.log('✅ Подключение к SMTP серверу успешно!\n');

    // Отправляем тестовое письмо
    console.log('📧 Отправка тестового письма...');
    const testEmail = {
      from: `"Tours Platform Test" <${config.email.user}>`,
      to: config.email.user, // отправляем самому себе
      subject: 'Тест SMTP настроек',
      html: `
        <h1>Тест успешен!</h1>
        <p>Если вы получили это письмо, значит SMTP настроен правильно.</p>
        <p>Время отправки: ${new Date().toLocaleString()}</p>
        <p>Настройки:</p>
        <ul>
          <li>Host: ${config.email.host}</li>
          <li>Port: ${config.email.port}</li>
          <li>User: ${config.email.user}</li>
        </ul>
      `,
    };

    const info = await transporter.sendMail(testEmail);
    console.log('✅ Тестовое письмо отправлено успешно!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📬 Проверьте почту:', config.email.user);
    
  } catch (error) {
    console.log('❌ Ошибка:', error.message);
    console.log('\n💡 Возможные причины:');
    console.log('- Неверные данные для входа');
    console.log('- Заблокирован доступ для приложений (для Gmail включите двухфакторную аутентификацию и создайте пароль приложения)');
    console.log('- Неверные настройки хоста/порта');
    console.log('- Проблемы с сетью/файрволом');
  }
}

// Запускаем тест
testSMTP().then(() => {
  console.log('\n🏁 Тест завершен');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Критическая ошибка:', error);
  process.exit(1);
}); 