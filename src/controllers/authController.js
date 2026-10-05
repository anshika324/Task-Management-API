const jwt = require('jsonwebtoken');
const User = require('../models/user');

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// POST /api/auth/register
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ success: false, message: 'Email is already registered' });
  }

  const user = await User.create({ name, email, password });
  const token = signToken(user._id);

  res.status(201).json({ success: true, token, user });
};

// POST /api/auth/login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  const valid = user && (await user.comparePassword(password));

  // Same message for both cases so attackers can't discover which emails exist
  if (!valid) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  const token = signToken(user._id);
  res.json({ success: true, token, user });
};

// GET /api/auth/profile  (protected)
exports.getProfile = async (req, res) => {
  res.json({ success: true, user: req.user });
};