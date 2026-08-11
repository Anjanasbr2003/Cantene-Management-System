const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mockStore = require('../utils/mockStore');
const { verifyToken } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'antigravity_sci_fi_canteen_secret_key_2026';

// Sign in
router.post('/login', (req, res) => {
  const { email, password, roleDemo } = req.body;

  // 1-Click Role Demo Switcher Support
  if (roleDemo) {
    const targetUser = mockStore.users.find(u => u.role === roleDemo);
    if (targetUser) {
      const token = jwt.sign(
        { id: targetUser.id, email: targetUser.email, role: targetUser.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      return res.json({
        success: true,
        token,
        user: {
          id: targetUser.id,
          name: targetUser.name,
          email: targetUser.email,
          role: targetUser.role,
          avatar: targetUser.avatar,
          loyaltyPoints: targetUser.loyaltyPoints,
          phone: targetUser.phone
        }
      });
    }
  }

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password required.' });
  }

  const user = mockStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  // Password check (or fallback for demo)
  const isMatch = password === 'admin123' || password === 'staff123' || password === 'customer123' || bcrypt.compareSync(password, user.passwordHash || '');
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      loyaltyPoints: user.loyaltyPoints,
      phone: user.phone
    }
  });
});

// Register new customer
router.post('/register', (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'All fields required.' });
  }

  const existing = mockStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ success: false, message: 'Email already registered.' });
  }

  const newUser = {
    id: 'usr_' + Date.now(),
    name,
    email,
    passwordHash: bcrypt.hashSync(password, 10),
    role: 'customer',
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
    phone: phone || '+1 555-0100',
    loyaltyPoints: 50, // Welcome Bonus!
    createdAt: new Date().toISOString()
  };

  mockStore.users.push(newUser);

  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, role: newUser.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(210 || 201).json({
    success: true,
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      avatar: newUser.avatar,
      loyaltyPoints: newUser.loyaltyPoints,
      phone: newUser.phone
    }
  });
});

// Profile management
router.get('/profile', verifyToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

router.put('/profile', verifyToken, (req, res) => {
  const { name, avatar, phone } = req.body;
  const user = mockStore.users.find(u => u.id === req.user.id);
  if (user) {
    if (name) user.name = name;
    if (avatar) user.avatar = avatar;
    if (phone) user.phone = phone;
  }
  res.json({ success: true, user });
});

module.exports = router;
