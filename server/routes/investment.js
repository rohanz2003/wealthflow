const express = require('express');
const { body, validationResult } = require('express-validator');
const Investment = require('../models/Investment');
const auth = require('../middleware/auth');
const cache = require('../utils/cache');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const filter = { user: req.userId };
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const skip = (page - 1) * limit;
    const [investments, total] = await Promise.all([
      Investment.find(filter).sort({ date: -1 }).skip(skip).limit(limit),
      Investment.countDocuments(filter),
    ]);
    res.json({ data: investments, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post(
  '/',
  auth,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('amount').isNumeric().withMessage('Amount must be a number'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      if (!req.body.currentValue) req.body.currentValue = req.body.amount;
      const investment = await Investment.create({ ...req.body, user: req.userId });
      cache.invalidateUserCache(req.userId);
      res.status(201).json(investment);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

const ALLOWED_INVESTMENT_FIELDS = ['name', 'type', 'amount', 'currentValue', 'returnRate', 'date', 'notes'];

router.put('/:id', auth, async (req, res) => {
  try {
    const { amount, currentValue, returnRate } = req.body;
    const isNumStr = (v) => (typeof v === 'number' || typeof v === 'string') && Number.isFinite(Number(v));
    if (amount !== undefined && (!isNumStr(amount) || Number(amount) < 0)) {
      return res.status(400).json({ message: 'Amount must be a non-negative number' });
    }
    if (currentValue !== undefined && (!isNumStr(currentValue) || Number(currentValue) < 0)) {
      return res.status(400).json({ message: 'Current value must be a non-negative number' });
    }
    if (returnRate !== undefined && !isNumStr(returnRate)) {
      return res.status(400).json({ message: 'Return rate must be a number' });
    }
    ['amount', 'currentValue', 'returnRate'].forEach((f) => {
      if (req.body[f] !== undefined) req.body[f] = Number(req.body[f]);
    });
    let investment = await Investment.findOne({ _id: req.params.id, user: req.userId });
    if (!investment) return res.status(404).json({ message: 'Investment not found' });
    ALLOWED_INVESTMENT_FIELDS.forEach((f) => {
      if (req.body[f] !== undefined && req.body[f] !== '') investment[f] = req.body[f];
    });
    await investment.save();
    cache.invalidateUserCache(req.userId);
    res.json(investment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const investment = await Investment.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!investment) return res.status(404).json({ message: 'Investment not found' });
    cache.invalidateUserCache(req.userId);
    res.json({ message: 'Investment deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
