const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Debt = require('../models/Debt');
const cache = require('../utils/cache');
const pick = require('../utils/pick');
const { convert } = require('../utils/currency');
const { CURRENCIES } = require('../../shared/constants');

const router = express.Router();

const ALLOWED_DEBT_FIELDS = ['name', 'type', 'totalAmount', 'remainingAmount', 'interestRate', 'minimumPayment', 'dueDate', 'isPaid', 'currency'];

router.get('/', auth, async (req, res) => {
  try {
    const filter = { user: req.userId };
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const skip = (page - 1) * limit;
    const [debts, total, allDebts, paidOff, active] = await Promise.all([
      Debt.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Debt.countDocuments(filter),
      Debt.find(filter).select('totalAmount remainingAmount currency isPaid').lean(),
      Debt.countDocuments({ ...filter, isPaid: true }),
      Debt.countDocuments({ ...filter, isPaid: false }),
    ]);
    const base = req.user.currency || 'INR';
    const totalDebt = allDebts.reduce((s, d) => s + convert(d.remainingAmount, d.currency, base), 0);
    const totalOriginal = allDebts.reduce((s, d) => s + convert(d.totalAmount, d.currency, base), 0);
    res.json({ data: debts, total, page, limit, totalPages: Math.ceil(total / limit), totalDebt, totalOriginal, paidOff, active });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post(
  '/',
  auth,
  [
    body('name').trim().notEmpty().withMessage('Debt name is required'),
    body('type').optional().trim().notEmpty().withMessage('Debt type is required').isLength({ max: 30 }).withMessage('Debt type must be 30 characters or less'),
    body('totalAmount').isNumeric().withMessage('Total amount is required'),
    body('remainingAmount').isNumeric().withMessage('Remaining amount is required'),
    body('interestRate').optional().isNumeric().withMessage('Interest rate must be a number'),
    body('minimumPayment').optional().isNumeric().withMessage('Minimum payment must be a number'),
    body('currency').optional().isIn(CURRENCIES).withMessage('Invalid currency'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const data = pick(req.body, ALLOWED_DEBT_FIELDS);
      if (data.currency === undefined) data.currency = req.user.currency || 'INR';
      const debt = await Debt.create({ ...data, user: req.userId });
      cache.invalidateUserCache(req.userId);
      res.status(201).json(debt);
    } catch {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

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
    if (req.body.dueDate === '') debt.dueDate = undefined;
    await debt.save();
    cache.invalidateUserCache(req.userId);
    res.json(debt);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const debt = await Debt.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!debt) return res.status(404).json({ message: 'Debt not found' });
    cache.invalidateUserCache(req.userId);
    res.json({ message: 'Debt deleted' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;