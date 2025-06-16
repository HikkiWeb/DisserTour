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
    const type = req.params.type || 'misc';
    const dir = path.join(uploadDir, type);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

// Фильтр файлов
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
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