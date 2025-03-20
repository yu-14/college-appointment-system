const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Appointment = sequelize.define('Appointment', {
  professorId: DataTypes.INTEGER,
  studentId: DataTypes.INTEGER,
  availabilityId: {
    type: DataTypes.INTEGER,
    unique: true
  }
}, {
  underscored: true,
  timestamps: true
});

module.exports = Appointment;