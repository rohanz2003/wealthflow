const express = require('express');
const { body, validationResult } = require('express-validator');
const SavingsGoal = require('../models/SavingsGoal');
const auth = require('../middleware/auth');
const cache = require('../utils/cache');
const pick = require('../utils/pick');

const router = express.Router();

const ALLOWED_GOAL_FIELDS = ['title', 'description', 'targetAmount', 'currentAmount', 'category', 'targetDate'];
const ALLOWED_GOAL_CREATE_FIELDS = ['title', 'description', 'targetAmount', 'category', 'targetDate'];

router.get('/', auth, async (req, res) => {
  try {
    const filter = { user: req.userId };
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const skip = (page - 1) * limit;
    const [goals, total] = await Promise.all([
      SavingsGoal.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      SavingsGoal.countDocuments(filter),
    ]);
    res.json({ data: goals, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post(
  '/',
  auth,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('targetAmount').isNumeric().withMessage('Target amount must be a number'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const goal = await SavingsGoal.create({ ...pick(req.body, ALLOWED_GOAL_CREATE_FIELDS), user: req.userId });
      cache.invalidateUserCache(req.userId);
      res.status(201).json(goal);
    } catch {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.put('/:id', auth, async (req, res) => {
  try {
    const { targetAmount, currentAmount } = req.body;
    if (targetAmount !== undefined) {
      const num = Number(targetAmount);
      if ((typeof targetAmount !== 'number' && typeof targetAmount !== 'string') || !Number.isFinite(num) || num <= 0) {
        return res.status(400).json({ message: 'Target amount must be a positive number' });
      }
      req.body.targetAmount = num;
    }
    if (currentAmount !== undefined) {
      const num = Number(currentAmount);
      if ((typeof currentAmount !== 'number' && typeof currentAmount !== 'string') || !Number.isFinite(num) || num < 0) {
        return res.status(400).json({ message: 'Current amount must be a non-negative number' });
      }
      req.body.currentAmount = num;
    }
    let goal = await SavingsGoal.findOne({ _id: req.params.id, user: req.userId });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    ALLOWED_GOAL_FIELDS.forEach((f) => {
      if (req.body[f] !== undefined && req.body[f] !== '') goal[f] = req.body[f];
    });
    if (goal.currentAmount >= goal.targetAmount) {
      goal.isCompleted = true;
    }
    await goal.save();
    cache.invalidateUserCache(req.userId);
    res.json(goal);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const goal = await SavingsGoal.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    cache.invalidateUserCache(req.userId);
    res.json({ message: 'Goal deleted' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
