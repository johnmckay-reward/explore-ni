const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Availability = sequelize.define('Availability', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  availableSlots: {
    type: DataTypes.INTEGER,
    allowNull: false,
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

module.exports = Availability;
