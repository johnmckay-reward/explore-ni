const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  bookingDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'declined', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending',
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  experienceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Experiences',
      key: 'id',
    },
  },
  availabilityId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Availabilities',
      key: 'id',
    },
  },
  paymentIntentId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'succeeded', 'failed'),
    allowNull: false,
    defaultValue: 'pending',
  },
  transactionId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  commissionRate: {
    type: DataTypes.DECIMAL(5, 4),
    allowNull: true,
    defaultValue: 0.15,
  },
  commissionAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  customerName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  customerEmail: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isEscalated: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});

module.exports = Booking;
