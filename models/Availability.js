const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Availability = sequelize.define('Availability', {
  startTime: DataTypes.DATE,
  endTime: DataTypes.DATE,
  isAvailable: { type: DataTypes.BOOLEAN, defaultValue: true }
});

module.exports = Availability;