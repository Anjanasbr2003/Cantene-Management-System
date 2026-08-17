const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const mockStore = require('../utils/mockStore');
const { verifyToken, authorizeRoles } = require('../middleware/auth');
const { pool } = require('../config/db');

// Get all users (Admin only)
router.get('/', verifyToken, authorizeRoles('admin'), async (req, res) => {
  let users = [];

  try {
    const [rows] = await pool.query('SELECT id, name, email, role, avatar, phone, loyalty_points as loyaltyPoints, created_at as createdAt FROM users ORDER BY created_at DESC');
    if (rows.length > 0) {
      users = rows.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        avatar: u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(u.name)}`,
        phone: u.phone || '+1 555-0100',
        loyaltyPoints: u.loyaltyPoints || 0,
        createdAt: u.createdAt
      }));
    }
  } catch (err) {
    console.error('MySQL users query fallback:', err.message);
  }

  if (users.length === 0) {
    users = mockStore.users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      avatar: u.avatar,
      phone: u.phone,
      loyaltyPoints: u.loyaltyPoints,
      createdAt: u.createdAt || new Date().toISOString()
    }));
  }

  const { role, search } = req.query;
  if (role && role !== 'All') {
    users = users.filter(u => u.role.toLowerCase() === role.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    users = users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }

  res.json({ success: true, count: users.length, data: users });
});

// Create new staff or diner user account (Admin only)
router.post('/', verifyToken, authorizeRoles('admin'), async (req, res) => {
  const { name, email, password, role, phone } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const safeRole = ['admin', 'staff', 'customer'].includes(role) ? role : 'staff';
  const trimmedName = String(name).trim().slice(0, 100);

  // Check existing
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
  const loyaltyPoints = safeRole === 'customer' ? 50 : 0;

  try {
    await pool.query(
      `INSERT INTO users (id, name, email, password_hash, role, avatar, phone, loyalty_points) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [newId, trimmedName, normalizedEmail, passwordHash, safeRole, avatar, userPhone, loyaltyPoints]
    );
    console.log(`✅ [MySQL] Admin ${req.user.name} created user "${trimmedName}" (${safeRole})`);
  } catch (err) {
    console.error('MySQL insert user warning:', err.message);
  }

  const newUser = {
    id: newId,
    name: trimmedName,
    email: normalizedEmail,
    passwordHash,
    role: safeRole,
    avatar,
    phone: userPhone,
    loyaltyPoints,
    createdAt: new Date().toISOString()
  };

  mockStore.users.push(newUser);

  res.status(201).json({
    success: true,
    data: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      avatar: newUser.avatar,
      phone: newUser.phone,
      loyaltyPoints: newUser.loyaltyPoints,
      createdAt: newUser.createdAt
    }
  });
});

// Update user role (Admin only)
router.patch('/:id/role', verifyToken, authorizeRoles('admin'), async (req, res) => {
  const { role } = req.body;
  const targetId = req.params.id;

  if (!['admin', 'staff', 'customer'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Invalid role. Allowed: admin, staff, customer' });
  }

  if (req.user.id === targetId && role !== 'admin') {
    return res.status(400).json({ success: false, message: 'You cannot demote your own admin account.' });
  }

  try {
    await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, targetId]);
    console.log(`✅ [MySQL] Updated role for user ${targetId} to "${role}" by ${req.user.name}`);
  } catch (err) {
    console.error('MySQL update user role warning:', err.message);
  }

  const u = mockStore.users.find(user => user.id === targetId);
  if (u) {
    u.role = role;
  }

  res.json({ success: true, message: `Updated user ${targetId} role to ${role}.`, data: { id: targetId, role } });
});

// Delete user account (Admin only)
router.delete('/:id', verifyToken, authorizeRoles('admin'), async (req, res) => {
  const targetId = req.params.id;

  if (req.user.id === targetId) {
    return res.status(400).json({ success: false, message: 'You cannot delete your own admin account.' });
  }

  try {
    await pool.query('DELETE FROM users WHERE id = ?', [targetId]);
    console.log(`🗑️ [MySQL] Admin ${req.user.name} deleted user "${targetId}"`);
  } catch (err) {
    console.error('MySQL delete user warning:', err.message);
  }

  const idx = mockStore.users.findIndex(u => u.id === targetId);
  if (idx > -1) {
    mockStore.users.splice(idx, 1);
  }

  res.json({ success: true, message: `User ${targetId} successfully removed.` });
});

module.exports = router;
