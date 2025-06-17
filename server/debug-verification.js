/**
 * Скрипт для диагностики проблем с верификацией email
 * Запуск: node debug-verification.js [email]
 */

require('dotenv').config();
const { User } = require('./models');

async function debugVerification() {
  const email = process.argv[2];
  
  if (!email) {
    console.log('❌ Укажите email адрес:');
    console.log('   node debug-verification.js user@example.com');
    process.exit(1);
  }

  try {
    console.log('🔍 Поиск пользователя с email:', email);
    
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      console.log('❌ Пользователь не найден');
      process.exit(1);
    }

    console.log('\n👤 Информация о пользователе:');
    console.log('ID:', user.id);
    console.log('Email:', user.email);
    console.log('Имя:', user.firstName, user.lastName);
    console.log('Подтвержден:', user.isVerified ? '✅ Да' : '❌ Нет');
    console.log('Токен верификации:', user.verificationToken || 'отсутствует');
    console.log('Роль:', user.role);
    console.log('Создан:', user.createdAt);

    if (!user.isVerified && user.verificationToken) {
      console.log('\n🔗 Ссылка для подтверждения:');
      console.log(`http://localhost:3000/verify-email?token=${user.verificationToken}`);
      
      console.log('\n🛠️ Команды для исправления:');
      console.log('Подтвердить пользователя:');
      console.log(`node -e "const {User} = require('./models'); User.update({isVerified: true, verificationToken: null}, {where: {email: '${email}'}}).then(() => console.log('Пользователь подтвержден')).catch(console.error)"`);
    }

    if (user.isVerified) {
      console.log('\n✅ Пользователь уже подтвержден, можно войти в систему');
    }

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  } finally {
    process.exit(0);
  }
}

debugVerification(); 