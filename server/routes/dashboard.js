const express = require('express');
const auth = require('../middleware/auth');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Habit = require('../models/Habit');
const SavingsGoal = require('../models/SavingsGoal');
const Investment = require('../models/Investment');
const cache = require('../utils/cache');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const cacheKey = `dashboard:${req.userId}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const userId = req.userId;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [expenses, incomes, habits, goals, investments] = await Promise.all([
      Expense.find({ user: userId, date: { $gte: thirtyDaysAgo } }).sort({ date: -1 }).lean(),
      Income.find({ user: userId, date: { $gte: thirtyDaysAgo } }).sort({ date: -1 }).lean(),
      Habit.find({ user: userId }).lean(),
      SavingsGoal.find({ user: userId }).lean(),
      Investment.find({ user: userId }).lean(),
    ]);

    const monthlyExpenses = expenses.filter((e) => e.date >= startOfMonth);
    const monthlyIncomes = incomes.filter((i) => i.date >= startOfMonth);

    const summary = {
      monthlyExpense: monthlyExpenses.reduce((s, e) => s + e.amount, 0),
      monthlyIncome: monthlyIncomes.reduce((s, i) => s + i.amount, 0),
      totalSavings: goals.reduce((s, g) => s + g.currentAmount, 0),
      totalInvested: investments.reduce((s, i) => s + i.currentValue, 0),
    };

    const netWorth = summary.monthlyIncome + summary.totalSavings + summary.totalInvested - summary.monthlyExpense;
    const savingsRate = summary.monthlyIncome > 0 ? ((summary.monthlyIncome - summary.monthlyExpense) / summary.monthlyIncome) * 100 : 0;

    const expenseCategories = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});

    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (29 - i));
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    const dailyMap = new Map();
    expenses.forEach((e) => {
      const key = new Date(e.date).toDateString();
      dailyMap.set(key, (dailyMap.get(key) || 0) - e.amount);
    });
    incomes.forEach((i) => {
      const key = new Date(i.date).toDateString();
      dailyMap.set(key, (dailyMap.get(key) || 0) + i.amount);
    });

    const dailyBalances = last30Days.map((_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (29 - i));
      return dailyMap.get(d.toDateString()) || 0;
    });

    const activeHabits = habits.filter((h) => h.isActive);
    const totalGoals = goals.length;
    const completedGoals = goals.filter((g) => g.isCompleted).length;

    const goalProgress = goals.reduce(
      (acc, g) => {
        if (g.targetAmount > 0) {
          acc.totalTarget += g.targetAmount;
          acc.totalCurrent += Math.min(g.currentAmount, g.targetAmount);
        }
        return acc;
      },
      { totalTarget: 0, totalCurrent: 0 }
    );
    const overallGoalPct = goalProgress.totalTarget > 0 ? Math.round((goalProgress.totalCurrent / goalProgress.totalTarget) * 100) : 0;

    const expenseRatio = summary.monthlyIncome > 0 ? summary.monthlyExpense / summary.monthlyIncome : 0;
    const healthScore = Math.round(
      Math.min(100, Math.max(0,
        (savingsRate >= 20 ? 30 : (savingsRate / 20) * 30) +
        (totalGoals > 0 ? (completedGoals / totalGoals) * 20 : 10) +
        (activeHabits.length >= 3 ? 20 : (activeHabits.length / 3) * 20) +
        (summary.totalInvested > 0 ? 15 : 0) +
        (expenseRatio <= 0.5 ? 15 : expenseRatio <= 0.75 ? 10 : 5)
      ))
    );

    const result = {
      summary,
      netWorth,
      savingsRate: Math.round(savingsRate * 10) / 10,
      expenseCategories,
      dailyBalances,
      last30Days,
      activeHabits: activeHabits.length,
      totalGoals,
      completedGoals,
      overallGoalPct,
      healthScore,
      recentHabits: activeHabits.slice(0, 6),
      habits,
    };

    cache.set(cacheKey, result, 30 * 1000);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
