#!/usr/bin/env node

/**
 * Стартовый скрипт для проверки и запуска сервера
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Цвета для вывода
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFileExists(filePath) {
  return fs.existsSync(path.join(__dirname, filePath));
}

function createEnvFile() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    log('✅ Файл .env уже существует', 'green');
    return true;
  }

  log('📝 Создание файла .env...', 'yellow');
  
  const envContent = `# Настройки сервера
PORT=5000
NODE_ENV=development

# Настройки базы данных
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tours_db
DB_USER=postgres
DB_PASSWORD=password

# JWT
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_secure_for_production
JWT_EXPIRES_IN=7d

# SMTP настройки (НАСТРОЙТЕ ЭТИ ЗНАЧЕНИЯ!)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# URL клиентского приложения
CLIENT_URL=http://localhost:3000

# Настройки загрузки файлов
UPLOAD_PATH=uploads
MAX_FILE_SIZE=5242880
`;

  try {
    fs.writeFileSync(envPath, envContent);
    log('✅ Файл .env создан успешно!', 'green');
    return true;
  } catch (error) {
    log(`❌ Ошибка создания .env файла: ${error.message}`, 'red');
    return false;
  }
}

function checkDependencies() {
  log('📦 Проверка зависимостей...', 'blue');
  
  if (!checkFileExists('node_modules')) {
    log('❌ node_modules не найден. Запуск npm install...', 'yellow');
    return new Promise((resolve) => {
      exec('npm install', { cwd: __dirname }, (error, stdout, stderr) => {
        if (error) {
          log(`❌ Ошибка установки зависимостей: ${error.message}`, 'red');
          resolve(false);
        } else {
          log('✅ Зависимости установлены успешно!', 'green');
          resolve(true);
        }
      });
    });
  } else {
    log('✅ Зависимости найдены', 'green');
    return Promise.resolve(true);
  }
}

function testDatabaseConnection() {
  log('🔌 Тестирование подключения к базе данных...', 'blue');
  
  return new Promise((resolve) => {
    exec('node -e "require(\'./config/database\').authenticate().then(() => console.log(\'SUCCESS\')).catch(err => console.log(\'ERROR:\', err.message))"', 
      { cwd: __dirname }, 
      (error, stdout, stderr) => {
        if (stdout.includes('SUCCESS')) {
          log('✅ Подключение к базе данных успешно!', 'green');
          resolve(true);
        } else {
          log('❌ Ошибка подключения к базе данных:', 'red');
          log(stderr || stdout, 'red');
          log('💡 Убедитесь, что PostgreSQL запущен и настройки в .env корректны', 'yellow');
          resolve(false);
        }
      }
    );
  });
}

function testSMTP() {
  log('📧 Тестирование SMTP (опционально)...', 'blue');
  
  return new Promise((resolve) => {
    exec('node test-smtp.js', { cwd: __dirname }, (error, stdout, stderr) => {
      if (stdout.includes('✅')) {
        log('✅ SMTP настроен корректно!', 'green');
        resolve(true);
      } else {
        log('⚠️ SMTP не настроен или работает с ошибками:', 'yellow');
        log('💡 Это не критично для базовой работы приложения', 'yellow');
        resolve(true); // Не блокируем запуск из-за SMTP
      }
    });
  });
}

function syncDatabase() {
  log('🗄️ Синхронизация базы данных...', 'blue');
  
  return new Promise((resolve) => {
    exec('node -e "require(\'./models\').sequelize.sync({alter: true}).then(() => console.log(\'SUCCESS\')).catch(err => console.log(\'ERROR:\', err.message))"', 
      { cwd: __dirname }, 
      (error, stdout, stderr) => {
        if (stdout.includes('SUCCESS')) {
          log('✅ База данных синхронизирована!', 'green');
          resolve(true);
        } else {
          log('❌ Ошибка синхронизации базы данных:', 'red');
          log(stderr || stdout, 'red');
          resolve(false);
        }
      }
    );
  });
}

function startServer() {
  log('🚀 Запуск сервера...', 'magenta');
  
  const server = exec('npm start', { cwd: __dirname });
  
  server.stdout.on('data', (data) => {
    process.stdout.write(data);
  });
  
  server.stderr.on('data', (data) => {
    process.stderr.write(data);
  });
  
  server.on('close', (code) => {
    log(`Сервер завершен с кодом ${code}`, code === 0 ? 'green' : 'red');
  });
}

async function main() {
  log('='.repeat(50), 'cyan');
  log('    TOURS SERVER - АВТОМАТИЧЕСКАЯ НАСТРОЙКА    ', 'cyan');
  log('='.repeat(50), 'cyan');
  
  // 1. Создание .env файла
  if (!createEnvFile()) {
    process.exit(1);
  }
  
  // 2. Проверка зависимостей
  const depsOk = await checkDependencies();
  if (!depsOk) {
    process.exit(1);
  }
  
  // 3. Тестирование базы данных
  const dbOk = await testDatabaseConnection();
  if (!dbOk) {
    log('❌ Остановка из-за проблем с базой данных', 'red');
    log('💡 Проверьте настройки в .env файле и убедитесь, что PostgreSQL запущен', 'yellow');
    process.exit(1);
  }
  
  // 4. Синхронизация базы данных
  const syncOk = await syncDatabase();
  if (!syncOk) {
    log('❌ Остановка из-за проблем с синхронизацией базы данных', 'red');
    process.exit(1);
  }
  
  // 5. Тестирование SMTP (не критично)
  await testSMTP();
  
  // 6. Запуск сервера
  log('🎉 Все проверки пройдены успешно!', 'green');
  log('📝 Не забудьте настроить SMTP в .env файле для работы email', 'yellow');
  log('', 'white');
  
  startServer();
}

// Запуск
main().catch(error => {
  log(`❌ Критическая ошибка: ${error.message}`, 'red');
  process.exit(1);
}); 