const jwt = require('jsonwebtoken');
const {JWT_SECRET} = require('../config');

const verifyToken = token => jwt.verify(token, JWT_SECRET);

const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({error: 'Unauthorized'});
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    res.status(401).json({error: 'Invalid token'});
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({error: 'Forbidden'});
  }
  next();
};

module.exports = {verifyToken, authMiddleware, requireRole};
