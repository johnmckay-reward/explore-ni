const { Sequelize } = require('sequelize');

// Initialize Sequelize to use in-memory SQLite
const sequelize = new Sequelize('sqlite::memory:', {
  logging: false, // Disable SQL query logging for cleaner output
});

module.exports = sequelize;
