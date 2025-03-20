const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Appointment, Availability, sequelize } = require('../models/index');

router.get('/', auth('student'), async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      where: { studentId: req.user.id },
      include: [{
        model: Availability,
        as: 'availability',
        required: true
      }]
    });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', auth('student'), async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const availability = await Availability.findByPk(req.body.availabilityId, {
      lock: true,
      transaction
    });
    
    if (!availability) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Availability slot not found' });
    }
    
    if (!availability.isAvailable) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Slot already booked' });
    }

    const appointment = await Appointment.create({
      availabilityId: availability.id,
      professorId: availability.professorId,
      studentId: req.user.id
    }, { transaction });

    await availability.update({ isAvailable: false }, { transaction });
    await transaction.commit();
    
    res.status(201).json(appointment);
  } catch (error) {
    await transaction.rollback();
    res.status(400).json({ error: error.message });
  }
});
router.delete('/:id', auth('professor'), async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const appointment = await Appointment.findByPk(req.params.id, {
      transaction
    });
    
    if (!appointment) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const availability = await Availability.findByPk(appointment.availabilityId, {
      transaction
    });
    
    await availability.update({ isAvailable: true }, { transaction });
    await appointment.destroy({ transaction });
    await transaction.commit();
    
    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    await transaction.rollback();
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;