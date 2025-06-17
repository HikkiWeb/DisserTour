const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config/config');

// Создаем директорию для загрузок, если она не существует
const uploadDir = path.join(__dirname, '..', config.upload.path);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Настройка хранилища
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Для туров используем отдельную директорию
    const dir = path.join(uploadDir, 'tours');
    
    console.log('📁 Настройка папки назначения:', dir);
    
    if (!fs.existsSync(dir)) {
      console.log('📂 Создание папки:', dir);
      fs.mkdirSync(dir, { recursive: true });
    }
    
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = file.fieldname + '-' + uniqueSuffix + ext;
    
    console.log('📝 Генерация имени файла:', {
      originalname: file.originalname,
      fieldname: file.fieldname,
      filename: filename
    });
    
    cb(null, filename);
  },
});

// Фильтр файлов
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  
  console.log('🔍 Проверка файла:', {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size
  });
  
  if (allowedTypes.includes(file.mimetype)) {
    console.log('✅ Файл разрешен:', file.originalname);
    cb(null, true);
  } else {
    console.log('❌ Файл отклонен:', file.originalname, '- неподдерживаемый тип:', file.mimetype);
    cb(new Error('Неподдерживаемый тип файла. Разрешены только JPEG, PNG и WebP.'), false);
  }
};

// Настройка multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize, // 5MB
  },
});

// Middleware для обработки ошибок загрузки
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: 'error',
        message: 'Размер файла превышает допустимый предел',
      });
    }
    return res.status(400).json({
      status: 'error',
      message: err.message,
    });
  }
  
  if (err) {
    return res.status(400).json({
      status: 'error',
      message: err.message,
    });
  }
  
  next();
};

// Middleware для удаления файлов
const deleteFile = (filePath) => {
  const fullPath = path.join(uploadDir, filePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

module.exports = {
  upload,
  handleUploadError,
  deleteFile,
}; 