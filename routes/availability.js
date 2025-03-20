const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { Availability } = require('../models');

router.post('/', authMiddleware('professor'), async (req, res) => {
  try {
    const availability = await Availability.create({
      ...req.body,
      professorId: req.user.id
    });
    res.status(201).json(availability);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:professorId', authMiddleware('student'), async (req, res) => {
  const slots = await Availability.findAll({
    where: { professorId: req.params.professorId, isAvailable: true }
  });
  res.json(slots);
});

module.exports = router;