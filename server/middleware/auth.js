const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

const auth = async (req, res, next) => {
  try {
    let token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }
    if (!token) {
      return res.status(401).json({ message: 'No authentication token provided' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password -refreshToken');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    if (user.isLocked) {
      return res.status(423).json({ message: 'Account is temporarily locked. Try again later.' });
    }
    const now = Date.now();
    if (!user._lastActiveUpdatedAt || now - user._lastActiveUpdatedAt > 10 * 60 * 1000) {
      user._lastActiveUpdatedAt = now;
      await User.findByIdAndUpdate(user._id, { lastActive: new Date() });
    }
    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    logger.error('Authentication error:', error.message);
    res.status(401).json({ message: 'Authentication failed' });
  }
};

module.exports = auth;
