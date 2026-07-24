const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Budget = require('../models/Budget');
const Expense = require('../models/Expense');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month) || now.getMonth() + 1;
    const year = parseInt(req.query.year) || now.getFullYear();

    const budgets = await Budget.find({ user: req.userId, month, year }).lean();

    const startOfMonth = new Date(year, month - 1, 1);
    const startOfNext = new Date(year, month, 1);

    const expenses = await Expense.find({
      user: req.userId,
      date: { $gte: startOfMonth, $lt: startOfNext },
    }).lean();

    const spentByCategory = {};
    expenses.forEach((e) => {
      spentByCategory[e.category] = (spentByCategory[e.category] || 0) + e.amount;
    });

    let totalBudgeted = 0;
    let totalSpent = 0;

    const result = budgets.map((b) => {
      const spent = spentByCategory[b.category] || 0;
      totalBudgeted += b.monthlyLimit;
      totalSpent += spent;
      return {
        ...b,
        spent,
        remaining: b.monthlyLimit - spent,
        percentUsed: b.monthlyLimit > 0 ? Math.round((spent / b.monthlyLimit) * 100) : 0,
        isOverBudget: spent > b.monthlyLimit,
      };
    });

    const categoriesWithoutBudget = Object.keys(spentByCategory).filter(
      (cat) => !budgets.some((b) => b.category === cat)
    ).map((cat) => ({
      category: cat,
      spent: spentByCategory[cat],
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
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post(
  '/',
  auth,
  [
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('monthlyLimit').isNumeric().withMessage('Monthly limit must be a number'),
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
        return res.json(existing);
      }

      const budget = await Budget.create({
        user: req.userId,
        category: req.body.category,
        monthlyLimit: req.body.monthlyLimit,
        month,
        year,
      });
      res.status(201).json(budget);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

router.put('/:id', auth, async (req, res) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, user: req.userId });
    if (!budget) return res.status(404).json({ message: 'Budget not found' });
    if (req.body.monthlyLimit) budget.monthlyLimit = req.body.monthlyLimit;
    await budget.save();
    res.json(budget);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!budget) return res.status(404).json({ message: 'Budget not found' });
    res.json({ message: 'Budget deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
