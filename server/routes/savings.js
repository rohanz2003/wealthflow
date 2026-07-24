const express = require('express');
const { body, validationResult } = require('express-validator');
const SavingsGoal = require('../models/SavingsGoal');
const auth = require('../middleware/auth');

const router = express.Router();

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
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
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
      const goal = await SavingsGoal.create({ ...req.body, user: req.userId });
      res.status(201).json(goal);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

const ALLOWED_GOAL_FIELDS = ['title', 'description', 'targetAmount', 'currentAmount', 'category', 'targetDate'];

router.put('/:id', auth, async (req, res) => {
  try {
    const { targetAmount, currentAmount } = req.body;
    if (targetAmount !== undefined && (typeof targetAmount !== 'number' || targetAmount <= 0)) {
      return res.status(400).json({ message: 'Target amount must be a positive number' });
    }
    if (currentAmount !== undefined && (typeof currentAmount !== 'number' || currentAmount < 0)) {
      return res.status(400).json({ message: 'Current amount must be a non-negative number' });
    }
    let goal = await SavingsGoal.findOne({ _id: req.params.id, user: req.userId });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    ALLOWED_GOAL_FIELDS.forEach((f) => {
      if (req.body[f] !== undefined) goal[f] = req.body[f];
    });
    if (goal.currentAmount >= goal.targetAmount) {
      goal.isCompleted = true;
    }
    await goal.save();
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const goal = await SavingsGoal.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    res.json({ message: 'Goal deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
