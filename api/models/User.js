const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('customer', 'vendor', 'admin'),
    allowNull: false,
    defaultValue: 'customer',
  },
  status: {
    type: DataTypes.ENUM('active', 'pending_vendor', 'rejected'),
    allowNull: false,
    defaultValue: 'active',
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  notificationPreference: {
    type: DataTypes.ENUM('email', 'sms', 'both', 'none'),
    allowNull: false,
    defaultValue: 'email',
  },
});

module.exports = User;
