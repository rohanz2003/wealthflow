const express = require('express');
const { body, validationResult } = require('express-validator');
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;
    const filter = { user: req.userId };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    if (category) filter.category = category;
    const expenses = await Expense.find(filter).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post(
  '/',
  auth,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('category').notEmpty().withMessage('Category is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const expense = await Expense.create({ ...req.body, user: req.userId });
      res.status(201).json(expense);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

const ALLOWED_EXPENSE_FIELDS = ['title', 'amount', 'category', 'date', 'description', 'isRecurring'];

router.put('/:id', auth, async (req, res) => {
  try {
    let expense = await Expense.findOne({ _id: req.params.id, user: req.userId });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    ALLOWED_EXPENSE_FIELDS.forEach((f) => {
      if (req.body[f] !== undefined) expense[f] = req.body[f];
    });
    await expense.save();
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json({ message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/summary', auth, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const expenses = await Expense.find({ user: req.userId, date: { $gte: startOfMonth } });
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const byCategory = {};
    expenses.forEach((e) => {
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
    });
    res.json({ total, byCategory, count: expenses.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
