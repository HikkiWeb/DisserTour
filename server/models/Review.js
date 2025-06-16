const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  tourId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Tours',
      key: 'id',
    },
  },
  bookingId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Bookings',
      key: 'id',
    },
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  response: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  responseDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  indexes: [
    {
      fields: ['userId'],
    },
    {
      fields: ['tourId'],
    },
    {
      fields: ['bookingId'],
    },
    {
      fields: ['rating'],
    },
  ],
});

module.exports = Review; 