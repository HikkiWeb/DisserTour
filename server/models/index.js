const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Tour = require('./Tour');
const Booking = require('./Booking');
const Review = require('./Review');

// Связи между моделями
User.hasMany(Tour, { foreignKey: 'guideId', as: 'guidedTours' });
Tour.belongsTo(User, { foreignKey: 'guideId', as: 'guide' });

User.hasMany(Booking, { foreignKey: 'userId', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Tour.hasMany(Booking, { foreignKey: 'tourId', as: 'bookings' });
Booking.belongsTo(Tour, { foreignKey: 'tourId', as: 'tour' });

User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Tour.hasMany(Review, { foreignKey: 'tourId', as: 'reviews' });
Review.belongsTo(Tour, { foreignKey: 'tourId', as: 'tour' });

Booking.hasOne(Review, { foreignKey: 'bookingId', as: 'review' });
Review.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });

module.exports = {
  sequelize,
  User,
  Tour,
  Booking,
  Review,
}; 