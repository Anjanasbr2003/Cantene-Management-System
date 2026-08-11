const jwt = require('jsonwebtoken');
const mockStore = require('../utils/mockStore');

const JWT_SECRET = process.env.JWT_SECRET || 'antigravity_sci_fi_canteen_secret_key_2026';

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Access token required.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = mockStore.users.find(u => u.id === decoded.id || u.email === decoded.email);
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid token user context.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token expired or invalid.' });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user ? req.user.role : 'unauthenticated'}' lacks required permissions [${roles.join(', ')}].`
      });
    }
    next();
  };
};

module.exports = { verifyToken, authorizeRoles };
