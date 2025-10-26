const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Voucher = sequelize.define('Voucher', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  type: {
    type: DataTypes.ENUM('fixed_amount', 'experience'),
    allowNull: false,
    defaultValue: 'fixed_amount',
  },
  initialValue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  currentBalance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  isEnabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  senderName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  recipientName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  recipientEmail: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true,
    },
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  expiryDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  isGiftedExperience: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  experienceId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Experiences',
      key: 'id',
    },
  },
});

module.exports = Voucher;
