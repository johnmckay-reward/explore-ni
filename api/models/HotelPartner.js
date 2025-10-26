const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HotelPartner = sequelize.define('HotelPartner', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});

module.exports = HotelPartner;
