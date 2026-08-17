const jwt = require('jsonwebtoken');
const mockStore = require('../utils/mockStore');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable is not set.');

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required. Please sign in.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ success: false, message: 'Invalid authentication token.' });
    }

    // Lookup user in mockStore or MySQL
    let user = mockStore.users.find(u => u.id === decoded.id || u.email === decoded.email);
    if (!user) {
      try {
        const { pool } = require('../config/db');
        const [rows] = await pool.query('SELECT id, name, email, role, phone, loyalty_points as loyaltyPoints FROM users WHERE id = ? LIMIT 1', [decoded.id]);
        if (rows.length > 0) {
          user = rows[0];
        }
      } catch (err) {
        // Fallback to decoded token claims
      }
    }

    req.user = user || { id: decoded.id, email: decoded.email, role: decoded.role, name: decoded.name || 'User' };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Session expired or invalid token. Please sign in again.' });
  }
};

// Optional auth — attaches user if token present and valid
const optionalVerifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded && decoded.id) {
      let user = mockStore.users.find(u => u.id === decoded.id || u.email === decoded.email);
      if (!user) {
        try {
          const { pool } = require('../config/db');
          const [rows] = await pool.query('SELECT id, name, email, role, phone, loyalty_points as loyaltyPoints FROM users WHERE id = ? LIMIT 1', [decoded.id]);
          if (rows.length > 0) {
            user = rows[0];
          }
        } catch (err) {
          // Fallback to decoded claims
        }
      }
      req.user = user || { id: decoded.id, email: decoded.email, role: decoded.role, name: decoded.name || 'User' };
    }
  } catch {
    // Invalid token — proceed unauthenticated
  }
  next();
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied: Role '${req.user ? req.user.role : 'unauthenticated'}' does not have permission.`
      });
    }
    next();
  };
};

module.exports = { verifyToken, optionalVerifyToken, authorizeRoles };

