# Переменные окружения для Railway

## Обязательные переменные для копирования в Railway:

```
NODE_ENV=production
JWT_SECRET=ваш_супер_секретный_jwt_ключ_минимум_32_символа
PORT=3000
```

## После получения домена Railway:
```
CLIENT_URL=https://ваш-проект.up.railway.app
```

## Для email функций (опционально):
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=ваш_email@gmail.com
SMTP_PASS=ваш_пароль_приложения_gmail
```

## Для Gemini AI (опционально):
```
GEMINI_API_KEY=ваш_ключ_от_google_ai_studio
```

**Примечание:** DATABASE_URL автоматически создается Railway при добавлении PostgreSQL сервиса.

## Как получить ключи:

### JWT_SECRET
Сгенерируйте случайную строку минимум 32 символа. Можно использовать:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Gmail App Password  
1. Включите 2FA в Google аккаунте
2. Перейдите в настройки безопасности Google
3. Создайте "Пароль приложения" для SMTP

### Gemini API Key
1. Перейдите на https://aistudio.google.com/
2. Создайте новый проект или выберите существующий
3. Получите API ключ в разделе API keys 