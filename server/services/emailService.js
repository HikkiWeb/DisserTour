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
  
  bookingConfirmation: (booking) => ({
    subject: 'Подтверждение бронирования',
    html: `
      <h1>Бронирование подтверждено</h1>
      <p>Уважаемый(ая) ${booking.user.firstName} ${booking.user.lastName},</p>
      <p>Ваше бронирование тура "${booking.tour.title}" подтверждено.</p>
      <h2>Детали бронирования:</h2>
      <ul>
        <li>Дата начала: ${new Date(booking.startDate).toLocaleDateString()}</li>
        <li>Дата окончания: ${new Date(booking.endDate).toLocaleDateString()}</li>
        <li>Количество участников: ${booking.participants}</li>
        <li>Общая стоимость: ${booking.totalPrice} тенге</li>
      </ul>
      <p>Спасибо за выбор нашей платформы!</p>
    `,
  }),
  
  bookingCancellation: (booking) => ({
    subject: 'Отмена бронирования',
    html: `
      <h1>Бронирование отменено</h1>
      <p>Уважаемый(ая) ${booking.user.firstName} ${booking.user.lastName},</p>
      <p>Ваше бронирование тура "${booking.tour.title}" было отменено.</p>
      <p>Причина отмены: ${booking.cancellationReason}</p>
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
const sendEmail = async (to, template, data) => {
  try {
    const { subject, html } = emailTemplates[template](data);
    
    const mailOptions = {
      from: `"Tours Platform" <${config.email.user}>`,
      to,
      subject,
      html,
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email отправлен:', info.messageId);
    return true;
  } catch (error) {
    console.error('Ошибка отправки email:', error);
    throw new Error('Не удалось отправить email');
  }
};

module.exports = {
  sendEmail,
}; 