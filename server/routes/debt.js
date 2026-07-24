const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Debt = require('../models/Debt');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const debts = await Debt.find({ user: req.userId }).sort({ createdAt: -1 }).lean();
    const totalDebt = debts.reduce((s, d) => s + d.remainingAmount, 0);
    const totalOriginal = debts.reduce((s, d) => s + d.totalAmount, 0);
    const paidOff = debts.filter((d) => d.isPaid).length;
    const active = debts.filter((d) => !d.isPaid).length;
    res.json({ debts, totalDebt, totalOriginal, paidOff, active });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post(
  '/',
  auth,
  [
    body('name').trim().notEmpty().withMessage('Debt name is required'),
    body('totalAmount').isNumeric().withMessage('Total amount is required'),
    body('remainingAmount').isNumeric().withMessage('Remaining amount is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const debt = await Debt.create({ user: req.userId, ...req.body });
      res.status(201).json(debt);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

const ALLOWED_DEBT_FIELDS = ['name', 'type', 'totalAmount', 'remainingAmount', 'interestRate', 'minimumPayment', 'dueDate', 'isPaid'];

router.put('/:id', auth, async (req, res) => {
  try {
    const debt = await Debt.findOne({ _id: req.params.id, user: req.userId });
    if (!debt) return res.status(404).json({ message: 'Debt not found' });
    ALLOWED_DEBT_FIELDS.forEach((f) => {
      if (req.body[f] !== undefined) debt[f] = req.body[f];
    });
    await debt.save();
    res.json(debt);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const debt = await Debt.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!debt) return res.status(404).json({ message: 'Debt not found' });
    res.json({ message: 'Debt deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Debt.findOneAndDelete({ _id: req.params.id, user: req.userId });
    res.json({ message: 'Debt deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;