const express = require('express');
const { body, validationResult } = require('express-validator');
const Income = require('../models/Income');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const incomes = await Income.find({ user: req.userId }).sort({ date: -1 });
    res.json(incomes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post(
  '/',
  auth,
  [
    body('source').trim().notEmpty().withMessage('Source is required'),
    body('amount').isNumeric().withMessage('Amount must be a number'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const income = await Income.create({ ...req.body, user: req.userId });
      res.status(201).json(income);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

const ALLOWED_INCOME_FIELDS = ['source', 'amount', 'category', 'date', 'description'];

router.put('/:id', auth, async (req, res) => {
  try {
    let income = await Income.findOne({ _id: req.params.id, user: req.userId });
    if (!income) return res.status(404).json({ message: 'Income record not found' });
    ALLOWED_INCOME_FIELDS.forEach((f) => {
      if (req.body[f] !== undefined) income[f] = req.body[f];
    });
    await income.save();
    res.json(income);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const income = await Income.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!income) return res.status(404).json({ message: 'Income record not found' });
    res.json({ message: 'Income record deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
