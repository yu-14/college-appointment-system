const jwt = require('jsonwebtoken');
const { User } = require('../models/index');

module.exports = (role) => async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, 'YOUR_SECRET_KEY');
    const user = await User.findByPk(decoded.id);
    if (!user || (role && user.role !== role)) throw new Error('Unauthorized');
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};