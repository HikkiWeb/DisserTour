const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { User } = require('../models');

// Middleware для проверки JWT токена
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Требуется авторизация',
      });
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Пользователь не найден',
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        status: 'error',
        message: 'Пожалуйста, подтвердите ваш email',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Недействительный токен',
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Срок действия токена истек',
      });
    }
    next(error);
  }
};

// Middleware для проверки роли пользователя
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'У вас нет прав для выполнения этого действия',
      });
    }
    next();
  };
};

// Middleware для проверки владельца ресурса
const checkOwnership = (model) => {
  return async (req, res, next) => {
    try {
      const resource = await model.findByPk(req.params.id);
      
      if (!resource) {
        return res.status(404).json({
          status: 'error',
          message: 'Ресурс не найден',
        });
      }

      const isOwner = resource.userId === req.user.id;
      const isAdmin = req.user.role === 'admin';
      const isGuide = req.user.role === 'guide' && model.name === 'Tour' && resource.guideId === req.user.id;

      if (!isOwner && !isAdmin && !isGuide) {
        return res.status(403).json({
          status: 'error',
          message: 'У вас нет прав для выполнения этого действия',
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  authenticate,
  authorize,
  checkOwnership,
}; 