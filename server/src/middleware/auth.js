const jwt = require('jsonwebtoken');
const mockStore = require('../utils/mockStore');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable is not set.');


const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Access token required.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Check mock store first, then attach decoded claims directly
    const mockUser = mockStore.users.find(u => u.id === decoded.id || u.email === decoded.email);
    req.user = mockUser || { id: decoded.id, email: decoded.email, role: decoded.role, name: decoded.name };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token expired or invalid.' });
  }
};

// Optional auth — attaches user if token present, proceeds even if not
const optionalVerifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const mockUser = mockStore.users.find(u => u.id === decoded.id || u.email === decoded.email);
    req.user = mockUser || { id: decoded.id, email: decoded.email, role: decoded.role, name: decoded.name };
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
        message: `Forbidden: Role '${req.user ? req.user.role : 'unauthenticated'}' lacks required permissions [${roles.join(', ')}].`
      });
    }
    next();
  };
};

module.exports = { verifyToken, optionalVerifyToken, authorizeRoles };

