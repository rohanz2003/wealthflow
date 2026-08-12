const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Budget = require('../models/Budget');
const Expense = require('../models/Expense');
const cache = require('../utils/cache');
const { convert } = require('../utils/currency');
const { CURRENCIES } = require('../../shared/constants');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month) || now.getMonth() + 1;
    const year = parseInt(req.query.year) || now.getFullYear();

    const budgets = await Budget.find({ user: req.userId, month, year }).sort({ createdAt: -1 }).lean();

    const startOfMonth = new Date(year, month - 1, 1);
    const startOfNext = new Date(year, month, 1);

    const expenses = await Expense.find({
      user: req.userId,
      date: { $gte: startOfMonth, $lt: startOfNext },
    }).lean();

    const base = req.user.currency || 'INR';

    const spentBaseByCategory = {};
    expenses.forEach((e) => {
      spentBaseByCategory[e.category] = (spentBaseByCategory[e.category] || 0) + convert(e.amount, e.currency, base);
    });

    let totalBudgeted = 0;
    let totalSpent = 0;

    const result = budgets.map((b) => {
      const spentBase = spentBaseByCategory[b.category] || 0;
      const spent = convert(spentBase, base, b.currency || 'INR');
      totalBudgeted += convert(b.monthlyLimit, b.currency || 'INR', base);
      totalSpent += spentBase;
      return {
        ...b,
        spent,
        remaining: b.monthlyLimit - spent,
        percentUsed: b.monthlyLimit > 0 ? Math.round((spent / b.monthlyLimit) * 100) : 0,
        isOverBudget: spent > b.monthlyLimit,
      };
    });

    const categoriesWithoutBudget = Object.keys(spentBaseByCategory).filter(
      (cat) => !budgets.some((b) => b.category === cat)
    ).map((cat) => ({
      category: cat,
      spent: spentBaseByCategory[cat],
    }));

    res.json({
      budgets: result,
      totalBudgeted,
      totalSpent,
      totalRemaining: totalBudgeted - totalSpent,
      categoriesWithoutBudget,
      month,
      year,
    });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post(
  '/',
  auth,
  [
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('monthlyLimit').isNumeric().withMessage('Monthly limit must be a number'),
    body('currency').optional().isIn(CURRENCIES).withMessage('Invalid currency'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const now = new Date();
      const month = req.body.month || now.getMonth() + 1;
      const year = req.body.year || now.getFullYear();

      const existing = await Budget.findOne({
        user: req.userId,
        category: req.body.category,
        month,
        year,
      });
      if (existing) {
        existing.monthlyLimit = req.body.monthlyLimit;
        await existing.save();
        cache.invalidateUserCache(req.userId);
        return res.json(existing);
      }

      const budget = await Budget.create({
        user: req.userId,
        category: req.body.category,
        monthlyLimit: req.body.monthlyLimit,
        month,
        year,
        currency: req.body.currency || req.user.currency || 'INR',
      });
      cache.invalidateUserCache(req.userId);
      res.status(201).json(budget);
    } catch {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.put('/:id', auth, async (req, res) => {
  try {
    const { monthlyLimit } = req.body;
    if (monthlyLimit !== undefined) {
      const num = Number(monthlyLimit);
      if ((typeof monthlyLimit !== 'number' && typeof monthlyLimit !== 'string') || !Number.isFinite(num) || num < 1) {
        return res.status(400).json({ message: 'Monthly limit must be a number >= 1' });
      }
      req.body.monthlyLimit = num;
    }
    const budget = await Budget.findOne({ _id: req.params.id, user: req.userId });
    if (!budget) return res.status(404).json({ message: 'Budget not found' });
    if (req.body.monthlyLimit !== undefined) budget.monthlyLimit = req.body.monthlyLimit;
    if (req.body.currency !== undefined) {
      if (!CURRENCIES.includes(req.body.currency)) {
        return res.status(400).json({ message: 'Invalid currency' });
      }
      budget.currency = req.body.currency;
    }
    await budget.save();
    cache.invalidateUserCache(req.userId);
    res.json(budget);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!budget) return res.status(404).json({ message: 'Budget not found' });
    cache.invalidateUserCache(req.userId);
    res.json({ message: 'Budget deleted' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
