// backend/routes/auth.js

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const router = express.Router();

const jwtSecret = 'your_jwt_secret';

// User registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).send('User already exists');
    
    user = new User({ name, email, password });
    await user.save();
    
    const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '1h' });
    res.status(201).send({ token, user: { name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// User login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send('Invalid email or password');
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).send('Invalid email or password');
    
    const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '1h' });
    res.status(200).send({ token, user: { name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Get user details
router.get('/me', async (req, res) => {
  const token = req.headers['x-auth-token'];
  if (!token) return res.status(401).send('No token provided');

  try {
    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findById(decoded.userId).select('-password');
    res.send(user);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
