# Используем официальный Node.js образ
FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json файлы
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Устанавливаем зависимости
RUN npm ci --only=production --prefix server
RUN npm ci --prefix client

# Копируем исходный код
COPY . .

# Собираем клиентское приложение
RUN cd client && npm run build

# Открываем порт
EXPOSE 3000

# Устанавливаем переменную окружения
ENV NODE_ENV=production

# Запускаем сервер
CMD ["node", "server/app.js"] 