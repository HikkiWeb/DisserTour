const request = require('supertest');
const app = require('../app');
const { sequelize, User, Tour, Booking, Review } = require('../models');

// Мокаем email сервис чтобы избежать ошибок SMTP
jest.mock('../services/emailService', () => ({
  sendEmail: jest.fn().mockResolvedValue(true)
}));

let token;
let tourId;
let bookingId;
let reviewId;
let userId;

beforeAll(async () => {
  // Полностью пересоздаем базу для тестов
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Аутентификация', () => {
  test('Регистрация пользователя', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'testuser@example.com',
        password: 'test1234',
        firstName: 'Test',
        lastName: 'User',
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.user.email).toBe('testuser@example.com');
    userId = res.body.data.user.id;
    
    // Верифицируем пользователя для дальнейших тестов
    await User.update({ isVerified: true }, { where: { id: userId } });
  });

  test('Логин пользователя', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testuser@example.com',
        password: 'test1234',
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.token).toBeDefined();
    token = res.body.data.token;
  });
});

describe('Туры', () => {
  test('Создание тура', async () => {
    // Убеждаемся что token существует
    expect(token).toBeDefined();
    
    // Делаем пользователя гидом и верифицированным
    await User.update({ role: 'guide', isVerified: true }, { where: { id: userId } });
    
    const res = await request(app)
      .post('/api/tours')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Tour',
        description: 'Описание тестового тура, которое достаточно длинное для валидации. '.repeat(2),
        shortDescription: 'Краткое описание',
        price: 100,
        duration: 2,
        maxGroupSize: 10,
        difficulty: 'easy',
        category: 'adventure',
        region: 'Almaty',
        season: ['summer'],
        itinerary: [{ day: 1, description: 'День 1' }, { day: 2, description: 'День 2' }],
        startLocation: { type: 'Point', coordinates: [76.9, 43.2] },
        locations: []
      });
    
    if (res.statusCode !== 201) {
      console.log('Response body:', res.body);
    }
    
    expect(res.statusCode).toBe(201);
    expect(res.body.data.tour.title).toBe('Test Tour');
    tourId = res.body.data.tour.id;
  });

  test('Получение списка туров', async () => {
    const res = await request(app)
      .get('/api/tours');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data.tours)).toBe(true);
  });
});

describe('Бронирования', () => {
  test('Создание бронирования', async () => {
    // Убеждаемся что tourId существует
    expect(tourId).toBeDefined();
    expect(token).toBeDefined();
    
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        tourId,
        startDate: new Date(Date.now() + 86400000).toISOString(),
        participants: 2,
      });
    
    if (res.statusCode !== 201) {
      console.log('Booking response body:', res.body);
    }
    
    expect(res.statusCode).toBe(201);
    expect(res.body.data.booking.tourId).toBe(tourId);
    bookingId = res.body.data.booking.id;
  });

  test('Получение своих бронирований', async () => {
    const res = await request(app)
      .get('/api/bookings/my-bookings')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data.bookings)).toBe(true);
  });
});

describe('Отзывы', () => {
  test('Создание отзыва', async () => {
    // Убеждаемся что все необходимые ID существуют
    expect(tourId).toBeDefined();
    expect(bookingId).toBeDefined();
    expect(token).toBeDefined();
    
    // Обновляем статус бронирования на 'completed' для возможности создания отзыва
    await Booking.update({ status: 'completed' }, { where: { id: bookingId } });
    
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({
        tourId,
        bookingId,
        rating: 5,
        title: 'Отлично!',
        comment: 'Очень понравилось!'
      });
    
    if (res.statusCode !== 201) {
      console.log('Review response body:', res.body);
    }
    
    expect(res.statusCode).toBe(201);
    expect(res.body.data.review.tourId).toBe(tourId);
    reviewId = res.body.data.review.id;
  });

  test('Получение отзывов по туру', async () => {
    // Убеждаемся что tourId существует
    expect(tourId).toBeDefined();
    
    const res = await request(app)
      .get(`/api/reviews/tour/${tourId}`);
    
    if (res.statusCode !== 200) {
      console.log('Get reviews response body:', res.body);
    }
    
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data.reviews)).toBe(true);
  });
}); 