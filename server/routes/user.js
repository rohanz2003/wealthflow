const express = require('express');
const User = require('../models/User');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Habit = require('../models/Habit');
const SavingsGoal = require('../models/SavingsGoal');
const Investment = require('../models/Investment');
const Budget = require('../models/Budget');
const Debt = require('../models/Debt');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/export', auth, async (req, res) => {
  try {
    const [expenses, incomes, habits, goals, investments, budgets, debts] = await Promise.all([
      Expense.find({ user: req.userId }).lean(),
      Income.find({ user: req.userId }).lean(),
      Habit.find({ user: req.userId }).lean(),
      SavingsGoal.find({ user: req.userId }).lean(),
      Investment.find({ user: req.userId }).lean(),
      Budget.find({ user: req.userId }).lean(),
      Debt.find({ user: req.userId }).lean(),
    ]);
    const data = {
      exportedAt: new Date().toISOString(),
      user: { name: req.user.name, email: req.user.email },
      expenses,
      incomes,
      habits,
      goals,
      investments,
      budgets,
      debts,
    };
    res.json(data);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/account', auth, async (req, res) => {
  try {
    await Promise.all([
      Expense.deleteMany({ user: req.userId }),
      Income.deleteMany({ user: req.userId }),
      Habit.deleteMany({ user: req.userId }),
      SavingsGoal.deleteMany({ user: req.userId }),
      Investment.deleteMany({ user: req.userId }),
      Budget.deleteMany({ user: req.userId }),
      Debt.deleteMany({ user: req.userId }),
    ]);
    await User.findByIdAndDelete(req.userId);
    res.clearCookie('token');
    res.clearCookie('refreshToken', { path: '/api/auth' });
    res.json({ message: 'Account and all data permanently deleted' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
