# Туры Казахстана - Веб-приложение

Полнофункциональное веб-приложение для бронирования авторских туров по Казахстану с профессиональными гидами.

## Архитектура проекта

```
Tours/
├── server/             # Backend API (Node.js + Express + PostgreSQL)
├── client/             # Frontend (React + TypeScript + Material-UI)
└── README.md
```

## Технический стек

### Backend
- **Node.js** + **Express.js** - Серверная платформа
- **PostgreSQL** + **Sequelize** - База данных и ORM
- **JWT** - Аутентификация
- **Multer** - Загрузка файлов
- **Nodemailer** - Отправка email
- **bcrypt** - Хеширование паролей
- **Jest** - Тестирование

### Frontend
- **React 19** + **TypeScript** - Пользовательский интерфейс
- **Material-UI** - UI компоненты
- **React Router** - Маршрутизация
- **Axios** - HTTP клиент
- **React Hook Form** + **Yup** - Формы и валидация

## Основные возможности

### Для пользователей
- ✅ Регистрация и аутентификация
- ✅ Просмотр каталога туров с фильтрацией
- ✅ Поиск туров по различным критериям
- ✅ Детальная информация о турах
- ✅ Бронирование туров
- ✅ Управление профилем
- ✅ Просмотр истории бронирований
- ✅ Оставление отзывов

### Для гидов
- ✅ Создание и управление турами
- ✅ Загрузка изображений
- ✅ Управление бронированиями
- ✅ Просмотр статистики

### Для администраторов
- ✅ Управление пользователями
- ✅ Модерация туров
- ✅ Управление системой

## База данных

### Основные модели
- **User** - Пользователи (клиенты, гиды, администраторы)
- **Tour** - Туры с маршрутами и описанием
- **Booking** - Бронирования со статусами
- **Review** - Отзывы и рейтинги

### Связи
- User → Tour (1:N) - гид создает туры
- User → Booking (1:N) - пользователь делает бронирования
- Tour → Booking (1:N) - тур имеет бронирования
- Booking → Review (1:1) - к бронированию можно оставить отзыв

## API Endpoints

### Аутентификация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/auth/me` - Текущий пользователь
- `PATCH /api/auth/me` - Обновление профиля

### Туры
- `GET /api/tours` - Список туров с фильтрацией
- `GET /api/tours/:id` - Детали тура
- `POST /api/tours` - Создание тура (гид)
- `PATCH /api/tours/:id` - Обновление тура
- `DELETE /api/tours/:id` - Удаление тура

### Бронирования
- `GET /api/bookings/my-bookings` - Мои бронирования
- `POST /api/bookings` - Создание бронирования
- `PATCH /api/bookings/:id/status` - Изменение статуса

### Отзывы
- `GET /api/reviews/tour/:tourId` - Отзывы по туру
- `POST /api/reviews` - Создание отзыва
- `PATCH /api/reviews/:id` - Обновление отзыва

## Установка и запуск

### Требования
- Node.js 18+
- PostgreSQL 13+
- npm или yarn

### Backend

1. Перейдите в папку server:
```bash
cd server
```

2. Установите зависимости:
```bash
npm install
```

3. Создайте .env файл:
```bash
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tours_kazakhstan
DB_USERNAME=your_username
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_password
```

4. Создайте базу данных и запустите миграции:
```bash
npm run db:create
npm start
```

5. Запустите тесты:
```bash
npm test
```

### Frontend

1. Перейдите в папку client:
```bash
cd client
```

2. Установите зависимости:
```bash
npm install
```

3. Создайте .env файл:
```bash
REACT_APP_API_URL=http://localhost:3000/api
```

4. Запустите приложение:
```bash
npm start
```

Приложение будет доступно по адресу:
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000

## Тестирование

### Backend
- Полное покрытие API тестами
- Тестирование всех эндпоинтов
- Проверка аутентификации и авторизации

```bash
cd server
npm test
```

### Frontend
```bash
cd client
npm test
```

## Безопасность

- ✅ JWT аутентификация
- ✅ Хеширование паролей bcrypt
- ✅ Валидация входных данных
- ✅ Проверка ролей и прав доступа
- ✅ Защита от SQL инъекций (Sequelize ORM)
- ✅ CORS настройка

## Производительность

- ✅ Пагинация для больших списков
- ✅ Оптимизация запросов к БД
- ✅ Сжатие изображений
- ✅ Кеширование статики

## Deployment

### Production сборка Frontend
```bash
cd client
npm run build
```

### Production настройки Backend
- Настройте переменные окружения
- Используйте PM2 для управления процессами
- Настройте reverse proxy (nginx)
- Включите HTTPS

## Структура проекта

### Backend (`/server`)
```
server/
├── controllers/        # Контроллеры API
├── middleware/         # Middleware функции
├── models/            # Модели Sequelize
├── routes/            # Маршруты API
├── services/          # Бизнес логика
├── tests/             # Тесты API
├── utils/             # Утилиты
└── app.js             # Главный файл приложения
```

### Frontend (`/client`)
```
client/
├── src/
│   ├── components/    # React компоненты
│   ├── pages/         # Страницы приложения
│   ├── context/       # React контексты
│   ├── hooks/         # Кастомные хуки
│   ├── services/      # API сервисы
│   ├── types/         # TypeScript типы
│   └── utils/         # Утилиты
└── public/            # Статические файлы
```

## Развитие проекта

### Планируемые возможности
- [ ] Интеграция с картами
- [ ] Онлайн оплата
- [ ] Мобильное приложение
- [ ] Многоязычность
- [ ] Чат с гидами
- [ ] Календарь доступности

### Вклад в проект
1. Fork репозиторий
2. Создайте feature branch
3. Внесите изменения
4. Добавьте тесты
5. Создайте Pull Request

## Лицензия

MIT License

## Контакты

Для вопросов и предложений:
- Email: contact@tours-kazakhstan.kz
- GitHub: [ссылка на репозиторий]
