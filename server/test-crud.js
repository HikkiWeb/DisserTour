const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Импортируем маршруты
const adminRoutes = require('./routes/admin');

// Тестовый middleware для аутентификации
app.use((req, res, next) => {
  // Имитируем аутентифицированного админа
  req.user = {
    id: 'test-admin-id',
    role: 'admin',
    firstName: 'Тест',
    lastName: 'Админ'
  };
  next();
});

// Подключаем админские маршруты
app.use('/api/admin', adminRoutes);

// Тестовые endpoints
app.get('/test', (req, res) => {
  res.json({ message: 'CRUD API работает!' });
});

// Запускаем тестовый сервер
const PORT = 3002;
app.listen(PORT, () => {
  console.log(`🧪 Тестовый CRUD сервер запущен на порту ${PORT}`);
  console.log('\n📋 Доступные CRUD endpoints:');
  console.log('🔹 Пользователи:');
  console.log(`   GET    http://localhost:${PORT}/api/admin/users`);
  console.log(`   POST   http://localhost:${PORT}/api/admin/users`);
  console.log(`   PUT    http://localhost:${PORT}/api/admin/users/:id`);
  console.log(`   DELETE http://localhost:${PORT}/api/admin/users/:id`);
  console.log('🔹 Туры:');
  console.log(`   GET    http://localhost:${PORT}/api/admin/tours`);
  console.log(`   POST   http://localhost:${PORT}/api/admin/tours`);
  console.log(`   PUT    http://localhost:${PORT}/api/admin/tours/:id`);
  console.log(`   DELETE http://localhost:${PORT}/api/admin/tours/:id`);
  console.log('🔹 Бронирования:');
  console.log(`   GET    http://localhost:${PORT}/api/admin/bookings`);
  console.log(`   PUT    http://localhost:${PORT}/api/admin/bookings/:id/status`);
  console.log(`   DELETE http://localhost:${PORT}/api/admin/bookings/:id`);
  console.log('🔹 Отзывы:');
  console.log(`   GET    http://localhost:${PORT}/api/admin/reviews`);
  console.log(`   DELETE http://localhost:${PORT}/api/admin/reviews/:id`);
  console.log(`   PUT    http://localhost:${PORT}/api/admin/reviews/:id/response`);
  
  console.log('\n🧪 Тест в браузере:');
  console.log(`http://localhost:${PORT}/test`);
}); 