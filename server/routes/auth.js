const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const auth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

const setTokenCookies = (res, accessToken, refreshToken) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('token', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'strict',
    maxAge: 15 * 60 * 1000,
  });
  if (refreshToken) {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'strict',
      path: '/api/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
};

router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
      .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
      .matches(/[0-9]/).withMessage('Password must contain a number'),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const user = await User.create({ name, email, password });
    const accessToken = generateToken(user);
    const refreshToken = user.generateRefreshToken();
    await user.save();
    setTokenCookies(res, accessToken, refreshToken);
    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  })
);

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    if (user.isLocked) {
      const remaining = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({ message: `Account locked. Try again in ${remaining} minute(s).` });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incrementLoginAttempts();
      const remaining = 5 - user.loginAttempts;
      const msg = remaining > 0
        ? `Invalid email or password. ${remaining} attempt(s) remaining.`
        : 'Account locked due to too many failed attempts. Try again in 30 minutes.';
      return res.status(400).json({ message: msg });
    }
    await user.resetLoginAttempts();
    const accessToken = generateToken(user);
    const refreshToken = user.generateRefreshToken();
    await user.save();
    setTokenCookies(res, accessToken, refreshToken);
    res.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  })
);

router.post('/refresh', asyncHandler(async (req, res) => {
  const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token required' });
  }
  const hash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  const user = await User.findOne({ refreshToken: hash });
  if (!user) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
  const accessToken = generateToken(user);
  const newRefreshToken = user.generateRefreshToken();
  await user.save();
  setTokenCookies(res, accessToken, newRefreshToken);
  res.json({ message: 'Token refreshed' });
}));

router.post('/logout', auth, asyncHandler(async (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  req.user.refreshToken = null;
  await req.user.save();
  res.clearCookie('token', { secure: isProduction, sameSite: isProduction ? 'none' : 'strict' });
  res.clearCookie('refreshToken', { path: '/api/auth', secure: isProduction, sameSite: isProduction ? 'none' : 'strict' });
  res.json({ message: 'Logged out successfully' });
}));

router.get('/me', auth, asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId).select('-password -refreshToken');
  res.json(user);
}));

router.put('/profile', auth, asyncHandler(async (req, res) => {
  const { occupation, monthlyIncome, bio } = req.body;
  const user = await User.findByIdAndUpdate(
    req.userId,
    { profile: { occupation, monthlyIncome, bio } },
    { new: true }
  ).select('-password -refreshToken');
  res.json(user);
}));

router.put('/password', auth, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current and new password are required' });
  }
  if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
    return res.status(400).json({ message: 'New password must be at least 8 characters with uppercase, lowercase, and number' });
  }
  const user = await User.findById(req.userId);
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return res.status(400).json({ message: 'Current password is incorrect' });
  }
  user.password = newPassword;
  const isProduction = process.env.NODE_ENV === 'production';
  user.refreshToken = null;
  await user.save();
  res.clearCookie('token', { secure: isProduction, sameSite: isProduction ? 'none' : 'strict' });
  res.clearCookie('refreshToken', { path: '/api/auth', secure: isProduction, sameSite: isProduction ? 'none' : 'strict' });
  res.json({ message: 'Password updated. Please log in again.' });
}));

module.exports = router;
