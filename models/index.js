const sequelize = require('../config/database');
const User = require('./User');
const Availability = require('./Availability');
const Appointment = require('./Appointment');

sequelize.sync({ force: true });

User.hasMany(Availability, { 
  foreignKey: 'professorId',
  as: 'availabilities'
});

Availability.belongsTo(User, {
  foreignKey: 'professorId',
  as: 'professor'
});

User.hasMany(Appointment, {
  foreignKey: 'studentId',
  as: 'appointments'
});

Appointment.belongsTo(User, {
  foreignKey: 'studentId',
  as: 'student'
});

Availability.hasOne(Appointment, { 
  foreignKey: 'availabilityId',
  as: 'availability'
});

Appointment.belongsTo(Availability, {
  foreignKey: 'availabilityId',
  as: 'availability'
});

module.exports = {
  sequelize,
  User,
  Availability,
  Appointment
};