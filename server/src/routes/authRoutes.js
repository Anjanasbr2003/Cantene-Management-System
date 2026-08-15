const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mockStore = require('../utils/mockStore');
const { verifyToken } = require('../middleware/auth');
const { pool } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'antigravity_sci_fi_canteen_secret_key_2026';

// Sign in
router.post('/login', async (req, res) => {
  const { email, password, roleDemo } = req.body;

  // 1-Click Role Demo Switcher Support
  if (roleDemo) {
    let targetUser = null;
    try {
      const [dbUsers] = await pool.query('SELECT * FROM users WHERE role = ? LIMIT 1', [roleDemo]);
      if (dbUsers.length > 0) {
        const u = dbUsers[0];
        targetUser = {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          avatar: u.avatar,
          loyaltyPoints: u.loyalty_points || 0,
          phone: u.phone
        };
      }
    } catch {
      // Fallback
    }

    if (!targetUser) {
      targetUser = mockStore.users.find(u => u.role === roleDemo);
    }

    if (targetUser) {
      const token = jwt.sign(
        { id: targetUser.id, email: targetUser.email, role: targetUser.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      return res.json({
        success: true,
        token,
        user: targetUser
      });
    }
  }

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password required.' });
  }

  let user = null;
  try {
    const [dbUsers] = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1', [email]);
    if (dbUsers.length > 0) {
      const u = dbUsers[0];
      user = {
        id: u.id,
        name: u.name,
        email: u.email,
        passwordHash: u.password_hash,
        role: u.role,
        avatar: u.avatar,
        loyaltyPoints: u.loyalty_points || 0,
        phone: u.phone
      };
    }
  } catch (err) {
    console.error('MySQL user query fallback:', err.message);
  }

  if (!user) {
    user = mockStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

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
router.post('/register', async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'All fields required.' });
  }

  // Check existing user in MySQL DB or Mock
  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE LOWER(email) = LOWER(?)', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already registered in database.' });
    }
  } catch {
    // Proceed
  }

  const newId = 'usr_' + Date.now();
  const passwordHash = bcrypt.hashSync(password, 10);
  const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;
  const userPhone = phone || '+1 555-0100';
  const loyaltyPoints = 50;

  // Insert into MySQL users table
  try {
    await pool.query(
      `INSERT INTO users (id, name, email, password_hash, role, avatar, phone, loyalty_points) 
       VALUES (?, ?, ?, ?, 'customer', ?, ?, ?)`,
      [newId, name, email, passwordHash, avatar, userPhone, loyaltyPoints]
    );
    console.log(`✅ [MySQL] Inserted new user "${name}" (${email}) into users table`);
  } catch (err) {
    console.error('MySQL insert user warning:', err.message);
  }

  const newUser = {
    id: newId,
    name,
    email,
    passwordHash,
    role: 'customer',
    avatar,
    phone: userPhone,
    loyaltyPoints
  };

  mockStore.users.push(newUser);

  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, role: newUser.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(201).json({
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

module.exports = router;
