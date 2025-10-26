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
});

module.exports = Booking;
