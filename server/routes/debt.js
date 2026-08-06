const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Debt = require('../models/Debt');
const cache = require('../utils/cache');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const filter = { user: req.userId };
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const skip = (page - 1) * limit;
    const [debts, total] = await Promise.all([
      Debt.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Debt.countDocuments(filter),
    ]);
    const totalDebt = debts.reduce((s, d) => s + d.remainingAmount, 0);
    const totalOriginal = debts.reduce((s, d) => s + d.totalAmount, 0);
    const paidOff = debts.filter((d) => d.isPaid).length;
    const active = debts.filter((d) => !d.isPaid).length;
    res.json({ data: debts, total, page, limit, totalPages: Math.ceil(total / limit), totalDebt, totalOriginal, paidOff, active });
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
      cache.invalidateUserCache(req.userId);
      res.status(201).json(debt);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

const ALLOWED_DEBT_FIELDS = ['name', 'type', 'totalAmount', 'remainingAmount', 'interestRate', 'minimumPayment', 'dueDate', 'isPaid'];

router.put('/:id', auth, async (req, res) => {
  try {
    const { totalAmount, remainingAmount, interestRate, minimumPayment } = req.body;
    if (totalAmount !== undefined) {
      const num = Number(totalAmount);
      if ((typeof totalAmount !== 'number' && typeof totalAmount !== 'string') || !Number.isFinite(num) || num <= 0) {
        return res.status(400).json({ message: 'Total amount must be a positive number' });
      }
      req.body.totalAmount = num;
    }
    if (remainingAmount !== undefined) {
      const num = Number(remainingAmount);
      if ((typeof remainingAmount !== 'number' && typeof remainingAmount !== 'string') || !Number.isFinite(num) || num < 0) {
        return res.status(400).json({ message: 'Remaining amount must be a non-negative number' });
      }
      req.body.remainingAmount = num;
    }
    if (interestRate !== undefined) {
      const num = Number(interestRate);
      if ((typeof interestRate !== 'number' && typeof interestRate !== 'string') || !Number.isFinite(num)) {
        return res.status(400).json({ message: 'Interest rate must be a number' });
      }
      req.body.interestRate = num;
    }
    if (minimumPayment !== undefined) {
      const num = Number(minimumPayment);
      if ((typeof minimumPayment !== 'number' && typeof minimumPayment !== 'string') || !Number.isFinite(num) || num < 0) {
        return res.status(400).json({ message: 'Minimum payment must be a non-negative number' });
      }
      req.body.minimumPayment = num;
    }
    const debt = await Debt.findOne({ _id: req.params.id, user: req.userId });
    if (!debt) return res.status(404).json({ message: 'Debt not found' });
    ALLOWED_DEBT_FIELDS.forEach((f) => {
      if (req.body[f] !== undefined && req.body[f] !== '') debt[f] = req.body[f];
    });
    await debt.save();
    cache.invalidateUserCache(req.userId);
    res.json(debt);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const debt = await Debt.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!debt) return res.status(404).json({ message: 'Debt not found' });
    cache.invalidateUserCache(req.userId);
    res.json({ message: 'Debt deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;