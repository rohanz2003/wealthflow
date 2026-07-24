const express = require('express');
const { body, validationResult } = require('express-validator');
const Habit = require('../models/Habit');
const auth = require('../middleware/auth');

const router = express.Router();

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
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post(
  '/',
  auth,
  [
    body('name').trim().notEmpty().withMessage('Habit name is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const habit = await Habit.create({ ...req.body, user: req.userId });
      res.status(201).json(habit);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

const ALLOWED_HABIT_FIELDS = ['name', 'description', 'frequency', 'type', 'isActive'];

router.put('/:id', auth, async (req, res) => {
  try {
    let habit = await Habit.findOne({ _id: req.params.id, user: req.userId });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });
    ALLOWED_HABIT_FIELDS.forEach((f) => {
      if (req.body[f] !== undefined) habit[f] = req.body[f];
    });
    await habit.save();
    res.json(habit);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });
    res.json({ message: 'Habit deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
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
    } else if (!lastEntry) {
      habit.streak = 1;
    } else {
      habit.streak = 1;
    }

    if (habit.streak > habit.longestStreak) {
      habit.longestStreak = habit.streak;
    }

    await habit.save();
    res.json(habit);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/stats', auth, async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.userId });
    const total = habits.length;
    const active = habits.filter((h) => h.isActive).length;
    const totalStreak = habits.reduce((sum, h) => sum + h.streak, 0);
    const completionRate = total > 0
      ? habits.reduce((sum, h) => sum + h.totalCompletions, 0) / total
      : 0;
    res.json({ total, active, totalStreak, completionRate: Math.round(completionRate * 10) / 10 });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
