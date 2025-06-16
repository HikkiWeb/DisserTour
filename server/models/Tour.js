const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Tour = sequelize.define('Tour', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  shortDescription: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  duration: {
    type: DataTypes.INTEGER, // в днях
    allowNull: false,
  },
  maxGroupSize: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  difficulty: {
    type: DataTypes.ENUM('easy', 'moderate', 'challenging', 'hard'),
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  region: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  season: {
    type: DataTypes.ARRAY(DataTypes.STRING), // ['summer', 'winter', 'spring', 'autumn']
    allowNull: false,
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  itinerary: {
    type: DataTypes.JSONB,
    allowNull: false,
  },
  included: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  excluded: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  requirements: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0,
  },
  ratingCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  guideId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  startLocation: {
    type: DataTypes.JSONB,
    allowNull: false,
  },
  locations: {
    type: DataTypes.ARRAY(DataTypes.JSONB),
    defaultValue: [],
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
}, {
  indexes: [
    {
      fields: ['category'],
    },
    {
      fields: ['region'],
    },
    {
      fields: ['guideId'],
    },
  ],
});

module.exports = Tour; 