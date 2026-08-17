const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mockStore = require('../utils/mockStore');
const { verifyToken } = require('../middleware/auth');
const { pool } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable is not set.');


const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Sign in
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  let user = null;
  try {
    const [dbUsers] = await pool.query('SELECT * FROM users WHERE LOWER(email) = ? LIMIT 1', [normalizedEmail]);
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
    user = mockStore.users.find(u => u.email.toLowerCase() === normalizedEmail);
  }

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  // Verify password via bcrypt
  const isMatch = user.passwordHash && bcrypt.compareSync(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
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
    return res.status(400).json({ success: false, message: 'Full name, email address, and password are required.' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const trimmedName = String(name).trim().slice(0, 100);

  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
  }

  if (typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
  }

  // Check existing user in MySQL DB or Mock
  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE LOWER(email) = ?', [normalizedEmail]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }
  } catch {
    // Proceed
  }

  const newId = 'usr_' + Date.now();
  const passwordHash = bcrypt.hashSync(password, 10);
  const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(trimmedName)}`;
  const userPhone = phone ? String(phone).trim().slice(0, 30) : '+1 555-0100';
  const loyaltyPoints = 50;

  // Insert into MySQL users table
  try {
    await pool.query(
      `INSERT INTO users (id, name, email, password_hash, role, avatar, phone, loyalty_points) 
       VALUES (?, ?, ?, ?, 'customer', ?, ?, ?)`,
      [newId, trimmedName, normalizedEmail, passwordHash, avatar, userPhone, loyaltyPoints]
    );
    console.log(`✅ [MySQL] Inserted new user "${trimmedName}" (${normalizedEmail}) into users table`);
  } catch (err) {
    console.error('MySQL insert user warning:', err.message);
  }

  const newUser = {
    id: newId,
    name: trimmedName,
    email: normalizedEmail,
    passwordHash,
    role: 'customer',
    avatar,
    phone: userPhone,
    loyaltyPoints
  };

  mockStore.users.push(newUser);

  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
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
