const express = require('express');
const authRoutes = require('./routes/auth');
const availabilityRoutes = require('./routes/availability');
const appointmentRoutes = require('./routes/appointments');
const { sequelize } = require('./models/index');

const app = express();
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/availability', availabilityRoutes);
app.use('/appointments', appointmentRoutes);

if (process.env.NODE_ENV !== 'test') {
  sequelize.sync().then(() => {
    app.listen(3000, () => console.log('Server running on port 3000'));
  });
}

module.exports = app;