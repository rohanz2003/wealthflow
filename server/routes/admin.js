const express = require('express');
const User = require('../models/User');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Habit = require('../models/Habit');
const SavingsGoal = require('../models/SavingsGoal');
const Investment = require('../models/Investment');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

router.get('/users', auth, admin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/users/:id', auth, admin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await Promise.all([
      Expense.deleteMany({ user: req.params.id }),
      Income.deleteMany({ user: req.params.id }),
      Habit.deleteMany({ user: req.params.id }),
      SavingsGoal.deleteMany({ user: req.params.id }),
      Investment.deleteMany({ user: req.params.id }),
    ]);
    res.json({ message: 'User and all associated data deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/analytics', auth, admin, async (req, res) => {
  try {
    const [totalUsers, totalExpenses, totalIncome, totalHabits, totalGoals, totalInvestments] =
      await Promise.all([
        User.countDocuments(),
        Expense.countDocuments(),
        Income.countDocuments(),
        Habit.countDocuments(),
        SavingsGoal.countDocuments(),
        Investment.countDocuments(),
      ]);

    const expenseAgg = await Expense.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const incomeAgg = await Income.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const investmentAgg = await Investment.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const habitCompletion = await Habit.aggregate([
      { $group: { _id: null, totalCompletions: { $sum: '$totalCompletions' }, totalStreak: { $sum: '$streak' } } },
    ]);

    const goalsAgg = await SavingsGoal.aggregate([
      { $group: { _id: null, totalTarget: { $sum: '$targetAmount' }, totalCurrent: { $sum: '$currentAmount' } } },
    ]);

    const expensesByCategory = await Expense.aggregate([
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);

    const incomeByCategory = await Income.aggregate([
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);

    res.json({
      totalUsers,
      totalExpenses,
      totalIncome,
      totalHabits,
      totalGoals,
      totalInvestments,
      totalExpenseAmount: expenseAgg[0]?.total || 0,
      totalIncomeAmount: incomeAgg[0]?.total || 0,
      totalInvestmentAmount: investmentAgg[0]?.total || 0,
      totalHabitCompletions: habitCompletion[0]?.totalCompletions || 0,
      totalHabitStreak: habitCompletion[0]?.totalStreak || 0,
      totalGoalTarget: goalsAgg[0]?.totalTarget || 0,
      totalGoalCurrent: goalsAgg[0]?.totalCurrent || 0,
      expensesByCategory,
      incomeByCategory,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/users/recent', auth, admin, async (req, res) => {
  try {
    const recentUsers = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(recentUsers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
