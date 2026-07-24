const express = require('express');
const { body, validationResult } = require('express-validator');
const Investment = require('../models/Investment');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const investments = await Investment.find({ user: req.userId }).sort({ date: -1 });
    res.json(investments);
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
      res.status(201).json(investment);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

const ALLOWED_INVESTMENT_FIELDS = ['name', 'type', 'amount', 'currentValue', 'returnRate', 'date', 'notes'];

router.put('/:id', auth, async (req, res) => {
  try {
    let investment = await Investment.findOne({ _id: req.params.id, user: req.userId });
    if (!investment) return res.status(404).json({ message: 'Investment not found' });
    ALLOWED_INVESTMENT_FIELDS.forEach((f) => {
      if (req.body[f] !== undefined) investment[f] = req.body[f];
    });
    await investment.save();
    res.json(investment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const investment = await Investment.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!investment) return res.status(404).json({ message: 'Investment not found' });
    res.json({ message: 'Investment deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
