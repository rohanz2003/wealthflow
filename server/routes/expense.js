const express = require('express');
const { body, validationResult } = require('express-validator');
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');
const cache = require('../utils/cache');
const pick = require('../utils/pick');
const { convert } = require('../utils/currency');
const { CURRENCIES } = require('../../shared/constants');

const router = express.Router();

const ALLOWED_EXPENSE_FIELDS = ['title', 'amount', 'category', 'date', 'description', 'isRecurring', 'currency'];

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

router.get('/', auth, async (req, res) => {
  try {
    const { startDate, endDate, category, search } = req.query;
    const filter = { user: req.userId };
    if (startDate || endDate) {
      const dateFilter = {};
      if (startDate) {
        const sd = new Date(startDate);
        if (isNaN(sd.getTime())) return res.status(400).json({ message: 'Invalid startDate' });
        dateFilter.$gte = sd;
      }
      if (endDate) {
        const ed = new Date(endDate);
        if (isNaN(ed.getTime())) return res.status(400).json({ message: 'Invalid endDate' });
        dateFilter.$lte = ed;
      }
      filter.date = dateFilter;
    }
    if (category) filter.category = category;
    if (search) filter.title = { $regex: escapeRegex(search), $options: 'i' };
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const skip = (page - 1) * limit;
    const [expenses, total] = await Promise.all([
      Expense.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Expense.countDocuments(filter),
    ]);
    res.json({ data: expenses, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post(
  '/',
  auth,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('category').notEmpty().withMessage('Category is required'),
    body('currency').optional().isIn(CURRENCIES).withMessage('Invalid currency'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const data = pick(req.body, ALLOWED_EXPENSE_FIELDS);
      if (data.currency === undefined) data.currency = req.user.currency || 'INR';
      const expense = await Expense.create({ ...data, user: req.userId });
      cache.invalidateUserCache(req.userId);
      res.status(201).json(expense);
    } catch {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.get('/summary', auth, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const expenses = await Expense.find({ user: req.userId, date: { $gte: startOfMonth } });
    const base = req.user.currency || 'INR';
    const toBase = (e) => convert(e.amount, e.currency, base);
    const total = expenses.reduce((sum, e) => sum + toBase(e), 0);
    const byCategory = {};
    expenses.forEach((e) => {
      byCategory[e.category] = (byCategory[e.category] || 0) + toBase(e);
    });
    res.json({ total, byCategory, count: expenses.length });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { amount } = req.body;
    if (amount !== undefined) {
      const num = Number(amount);
      if ((typeof amount !== 'number' && typeof amount !== 'string') || !Number.isFinite(num) || num < 0) {
        return res.status(400).json({ message: 'Amount must be a non-negative number' });
      }
      req.body.amount = num;
    }
    let expense = await Expense.findOne({ _id: req.params.id, user: req.userId });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    ALLOWED_EXPENSE_FIELDS.forEach((f) => {
      if (req.body[f] !== undefined && req.body[f] !== '') expense[f] = req.body[f];
    });
    await expense.save();
    cache.invalidateUserCache(req.userId);
    res.json(expense);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    cache.invalidateUserCache(req.userId);
    res.json({ message: 'Expense deleted' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
