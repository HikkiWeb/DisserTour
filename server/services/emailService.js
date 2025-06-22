const nodemailer = require('nodemailer');
const config = require('../config/config');

// Создаем транспорт для отправки email
const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.port === 465,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

// Шаблоны email
const emailTemplates = {
  verification: (token) => ({
    subject: 'Подтверждение регистрации',
    html: `
      <h1>Добро пожаловать!</h1>
      <p>Спасибо за регистрацию на нашей платформе. Для подтверждения вашего email адреса, пожалуйста, перейдите по ссылке:</p>
      <a href="${config.clientUrl}/verify-email?token=${token}">Подтвердить email</a>
      <p>Если вы не регистрировались на нашей платформе, проигнорируйте это письмо.</p>
    `,
  }),
  
  resetPassword: (token) => ({
    subject: 'Сброс пароля',
    html: `
      <h1>Сброс пароля</h1>
      <p>Вы запросили сброс пароля. Для создания нового пароля, пожалуйста, перейдите по ссылке:</p>
      <a href="${config.clientUrl}/reset-password?token=${token}">Сбросить пароль</a>
      <p>Если вы не запрашивали сброс пароля, проигнорируйте это письмо.</p>
      <p>Ссылка действительна в течение 1 часа.</p>
    `,
  }),
  
  bookingConfirmation: (data) => ({
    subject: 'Подтверждение бронирования',
    html: `
      <h1>Бронирование подтверждено</h1>
      <p>Уважаемый(ая) ${data.userName},</p>
      <p>Ваше бронирование тура "${data.tourTitle}" подтверждено.</p>
      <h2>Детали бронирования:</h2>
      <ul>
        <li>Дата начала: ${data.startDate ? new Date(data.startDate).toLocaleDateString() : 'Не указана'}</li>
        <li>Количество участников: ${data.participants}</li>
        <li>Общая стоимость: ${data.totalPrice} тенге</li>
      </ul>
      <p>Спасибо за выбор нашей платформы!</p>
    `,
  }),
  
  bookingCancellation: (data) => ({
    subject: 'Отмена бронирования',
    html: `
      <h1>Бронирование отменено</h1>
      <p>Уважаемый(ая) ${data.userName || data.guideName || 'Пользователь'},</p>
      <p>Бронирование тура "${data.tourTitle}" было отменено.</p>
      <p>Причина отмены: ${data.cancellationReason}</p>
      <p>Если у вас возникли вопросы, пожалуйста, свяжитесь с нами.</p>
    `,
  }),
  
  reviewNotification: (review) => ({
    subject: 'Новый отзыв о туре',
    html: `
      <h1>Новый отзыв</h1>
      <p>Получен новый отзыв о туре "${review.tour.title}" от ${review.user.firstName} ${review.user.lastName}.</p>
      <h2>Детали отзыва:</h2>
      <ul>
        <li>Оценка: ${review.rating}/5</li>
        <li>Заголовок: ${review.title}</li>
        <li>Комментарий: ${review.comment}</li>
      </ul>
    `,
  }),
};

// Функция отправки email
const sendEmail = async (params) => {
  try {
    // Поддерживаем два формата вызова: старый (to, template, data) и новый ({ to, template, data })
    let to, template, data;
    
    if (typeof params === 'string') {
      // Старый формат: sendEmail(to, template, data)
      to = arguments[0];
      template = arguments[1];
      data = arguments[2];
    } else {
      // Новый формат: sendEmail({ to, template, data })
      to = params.to;
      template = params.template;
      data = params.data;
    }

    // Проверяем настройки SMTP
    if (!config.email.user || !config.email.pass) {
      console.error('❌ SMTP настройки не установлены. Проверьте переменные SMTP_USER и SMTP_PASS в .env файле');
      throw new Error('SMTP настройки не установлены');
    }

    // Проверяем, что шаблон существует
    if (!emailTemplates[template]) {
      throw new Error(`emailTemplates[${template}] is not a function - шаблон не найден`);
    }

    const { subject, html } = emailTemplates[template](data);
    
    const mailOptions = {
      from: `"Nomad Route" <${config.email.user}>`,
      to,
      subject,
      html,
    };
    
    console.log(`📧 Отправка email: ${template} -> ${to}`);
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email отправлен успешно:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Ошибка отправки email:', error.message);
    console.error('📋 Настройки SMTP:', {
      host: config.email.host,
      port: config.email.port,
      user: config.email.user,
      pass: config.email.pass ? '***' : 'НЕ УСТАНОВЛЕН'
    });
    throw new Error('Не удалось отправить email: ' + error.message);
  }
};

module.exports = {
  sendEmail,
}; 