const express = require('express');
const { body, validationResult } = require('express-validator');
const Income = require('../models/Income');
const auth = require('../middleware/auth');
const cache = require('../utils/cache');
const pick = require('../utils/pick');
const { INCOME_CATEGORIES } = require('../../shared/constants');

const router = express.Router();

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const ALLOWED_INCOME_FIELDS = ['source', 'amount', 'category', 'date', 'description'];

router.get('/', auth, async (req, res) => {
  try {
    const { search } = req.query;
    const filter = { user: req.userId };
    if (search) filter.source = { $regex: escapeRegex(search), $options: 'i' };
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const skip = (page - 1) * limit;
    const [incomes, total] = await Promise.all([
      Income.find(filter).sort({ date: -1 }).skip(skip).limit(limit),
      Income.countDocuments(filter),
    ]);
    res.json({ data: incomes, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post(
  '/',
  auth,
  [
    body('source').trim().notEmpty().withMessage('Source is required'),
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('category').optional().isIn(INCOME_CATEGORIES).withMessage('Invalid income category'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const income = await Income.create({ ...pick(req.body, ALLOWED_INCOME_FIELDS), user: req.userId });
      cache.invalidateUserCache(req.userId);
      res.status(201).json(income);
    } catch {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.put('/:id', auth, async (req, res) => {
  try {
    const { amount, category } = req.body;
    if (amount !== undefined) {
      const num = Number(amount);
      if ((typeof amount !== 'number' && typeof amount !== 'string') || !Number.isFinite(num) || num < 0) {
        return res.status(400).json({ message: 'Amount must be a non-negative number' });
      }
      req.body.amount = num;
    }
    if (category !== undefined && !INCOME_CATEGORIES.includes(category)) {
      return res.status(400).json({ message: 'Invalid income category' });
    }
    let income = await Income.findOne({ _id: req.params.id, user: req.userId });
    if (!income) return res.status(404).json({ message: 'Income record not found' });
    ALLOWED_INCOME_FIELDS.forEach((f) => {
      if (req.body[f] !== undefined && req.body[f] !== '') income[f] = req.body[f];
    });
    await income.save();
    cache.invalidateUserCache(req.userId);
    res.json(income);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const income = await Income.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!income) return res.status(404).json({ message: 'Income record not found' });
    cache.invalidateUserCache(req.userId);
    res.json({ message: 'Income record deleted' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
