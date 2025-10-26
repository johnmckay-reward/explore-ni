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
  initialValue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  currentBalance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
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
  recipientEmail: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true,
    },
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
