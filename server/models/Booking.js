const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Booking = sequelize.define('Booking', {
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
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  participants: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
    },
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed'),
    defaultValue: 'pending',
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'refunded'),
    defaultValue: 'pending',
  },
  paymentId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  specialRequests: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  cancellationReason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  cancellationDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  refundAmount: {
    type: DataTypes.DECIMAL(10, 2),
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
      fields: ['status'],
    },
    {
      fields: ['startDate'],
    },
  ],
});

module.exports = Booking; 