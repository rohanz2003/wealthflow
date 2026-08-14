const express = require('express');
const User = require('../models/User');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Habit = require('../models/Habit');
const SavingsGoal = require('../models/SavingsGoal');
const Investment = require('../models/Investment');
const Budget = require('../models/Budget');
const Debt = require('../models/Debt');
const Feedback = require('../models/Feedback');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

router.get('/users', auth, admin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 }).lean();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);

    const usersWithStats = await Promise.all(users.map(async (u) => {
      const [totalExpenses, totalIncome, expenseSum, incomeSum, activeDays] = await Promise.all([
        Expense.countDocuments({ user: u._id }),
        Income.countDocuments({ user: u._id }),
        Expense.aggregate([{ $match: { user: u._id } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
        Income.aggregate([{ $match: { user: u._id } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
        Expense.distinct('date', { user: u._id, date: { $gte: thirtyDaysAgo } }),
      ]);
      return {
        ...u,
        stats: {
          totalExpenses,
          totalIncome,
          totalExpenseAmount: Math.round(expenseSum[0]?.total || 0),
          totalIncomeAmount: Math.round(incomeSum[0]?.total || 0),
          activeDays: activeDays.length,
        },
      };
    }));

    res.json(usersWithStats);
  } catch {
    res.status(500).json({ message: 'Server error' });
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
      Budget.deleteMany({ user: req.params.id }),
      Debt.deleteMany({ user: req.params.id }),
      Feedback.deleteMany({ user: req.params.id }),
    ]);
    res.json({ message: 'User and all associated data deleted' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/analytics', auth, admin, async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);

    const [totalUsers, activeUsers, totalExpenses, totalIncome, totalHabits, totalGoals, totalInvestments, totalBudgets, totalDebts, openFeedback, resolvedFeedback] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ lastActive: { $gte: thirtyDaysAgo } }),
      Expense.countDocuments(),
      Income.countDocuments(),
      Habit.countDocuments(),
      SavingsGoal.countDocuments(),
      Investment.countDocuments(),
      Budget.countDocuments(),
      Debt.countDocuments(),
      Feedback.countDocuments({ status: 'open' }),
      Feedback.countDocuments({ status: 'resolved' }),
    ]);

    const [expenseAgg, incomeAgg, investmentAgg, habitComp, goalsAgg, debtAgg] = await Promise.all([
      Expense.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
      Income.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
      Investment.aggregate([{ $group: { _id: null, total: { $sum: '$currentValue' } } }]),
      Habit.aggregate([{ $group: { _id: null, totalCompletions: { $sum: '$totalCompletions' }, totalStreak: { $sum: '$streak' } } }]),
      SavingsGoal.aggregate([{ $group: { _id: null, totalTarget: { $sum: '$targetAmount' }, totalCurrent: { $sum: '$currentAmount' }, completed: { $sum: { $cond: ['$isCompleted', 1, 0] } } } }]),
      Debt.aggregate([{ $group: { _id: null, totalRemaining: { $sum: '$remainingAmount' }, totalOriginal: { $sum: '$totalAmount' } } }]),
    ]);

    const [expensesByCategory, incomeByCategory, recentUsers] = await Promise.all([
      Expense.aggregate([{ $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } }, { $sort: { total: -1 } }]),
      Income.aggregate([{ $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } }, { $sort: { total: -1 } }]),
      User.find().select('-password').sort({ lastActive: -1 }).limit(5).lean(),
    ]);

    res.json({
      totalUsers,
      activeUsers,
      totalExpenses,
      totalIncome,
      totalHabits,
      totalGoals,
      totalInvestments,
      totalBudgets,
      totalDebts,
      totalExpenseAmount: Math.round(expenseAgg[0]?.total || 0),
      totalIncomeAmount: Math.round(incomeAgg[0]?.total || 0),
      totalInvestmentValue: Math.round(investmentAgg[0]?.total || 0),
      totalHabitCompletions: habitComp[0]?.totalCompletions || 0,
      totalHabitStreak: habitComp[0]?.totalStreak || 0,
      totalGoalTarget: Math.round(goalsAgg[0]?.totalTarget || 0),
      totalGoalCurrent: Math.round(goalsAgg[0]?.totalCurrent || 0),
      totalGoalsCompleted: goalsAgg[0]?.completed || 0,
      totalDebtRemaining: Math.round(debtAgg[0]?.totalRemaining || 0),
      totalDebtOriginal: Math.round(debtAgg[0]?.totalOriginal || 0),
      openFeedback,
      resolvedFeedback,
      expensesByCategory,
      incomeByCategory,
      recentUsers,
    });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
