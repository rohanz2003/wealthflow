const express = require('express');
const { body, validationResult } = require('express-validator');
const Habit = require('../models/Habit');
const auth = require('../middleware/auth');
const cache = require('../utils/cache');
const pick = require('../utils/pick');
const { HABIT_FREQUENCIES } = require('../../shared/constants');

const router = express.Router();

const ALLOWED_HABIT_FIELDS = ['name', 'description', 'frequency', 'type', 'isActive'];
const MAX_HISTORY_ENTRIES = 365;

router.get('/', auth, async (req, res) => {
  try {
    const filter = { user: req.userId };
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const skip = (page - 1) * limit;
    const [habits, total] = await Promise.all([
      Habit.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Habit.countDocuments(filter),
    ]);
    res.json({ data: habits, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post(
  '/',
  auth,
  [
    body('name').trim().notEmpty().withMessage('Habit name is required'),
    body('type').optional().trim().notEmpty().withMessage('Habit type is required').isLength({ max: 30 }).withMessage('Habit type must be 30 characters or less'),
    body('frequency').optional().isIn(HABIT_FREQUENCIES).withMessage('Invalid habit frequency'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const habit = await Habit.create({ ...pick(req.body, ALLOWED_HABIT_FIELDS), user: req.userId });
      cache.invalidateUserCache(req.userId);
      res.status(201).json(habit);
    } catch {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.put('/:id', auth, async (req, res) => {
  try {
    let habit = await Habit.findOne({ _id: req.params.id, user: req.userId });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });
    ALLOWED_HABIT_FIELDS.forEach((f) => {
      if (req.body[f] !== undefined) habit[f] = req.body[f];
    });
    await habit.save();
    cache.invalidateUserCache(req.userId);
    res.json(habit);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });
    cache.invalidateUserCache(req.userId);
    res.json({ message: 'Habit deleted' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:id/complete', auth, async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.userId });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const alreadyCompleted = habit.history.some(
      (h) => new Date(h.date).setHours(0, 0, 0, 0) === today.getTime() && h.completed
    );

    if (alreadyCompleted) {
      return res.status(400).json({ message: 'Habit already completed today' });
    }

    habit.history.push({ date: today, completed: true });
    if (habit.history.length > MAX_HISTORY_ENTRIES) {
      habit.history = habit.history.slice(-MAX_HISTORY_ENTRIES);
    }
    habit.totalCompletions += 1;

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const lastEntry = habit.history
      .slice()
      .reverse()
      .find((h) => {
        const d = new Date(h.date);
        return d.setHours(0, 0, 0, 0) !== today.getTime() && h.completed;
      });

    if (lastEntry && new Date(lastEntry.date).setHours(0, 0, 0, 0) === yesterday.getTime()) {
      habit.streak += 1;
    } else {
      habit.streak = 1;
    }

    if (habit.streak > habit.longestStreak) {
      habit.longestStreak = habit.streak;
    }

    await habit.save();
    cache.invalidateUserCache(req.userId);
    res.json(habit);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/stats', auth, async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.userId });
    const total = habits.length;
    const active = habits.filter((h) => h.isActive).length;
    const totalStreak = habits.reduce((sum, h) => sum + h.streak, 0);
    const now = Date.now();
    const totalCompletions = habits.reduce((sum, h) => sum + h.totalCompletions, 0);
    const totalExpected = habits.reduce((sum, h) => {
      if (!h.isActive) return sum;
      const daysSinceCreation = Math.max(1, Math.ceil((now - new Date(h.createdAt).getTime()) / (1000 * 60 * 60 * 24)));
      if (h.frequency === 'weekly') return sum + Math.ceil(daysSinceCreation / 7);
      if (h.frequency === 'monthly') return sum + Math.ceil(daysSinceCreation / 30);
      return sum + daysSinceCreation;
    }, 0);
    const completionRate = totalExpected > 0
      ? Math.min(100, Math.round((totalCompletions / totalExpected) * 100))
      : 0;
    res.json({ total, active, totalStreak, totalCompletions, completionRate });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
