const express = require('express');
const auth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Habit = require('../models/Habit');
const SavingsGoal = require('../models/SavingsGoal');
const Investment = require('../models/Investment');
const Debt = require('../models/Debt');
const cache = require('../utils/cache');
const { convert } = require('../utils/currency');
const {
  calculateSavingsRate,
  calculateHealthScore,
  calculateOverallGoalProgress,
  aggregateByCategory,
  buildDailyBalanceMap,
} = require('../utils/calculations');

const router = express.Router();

router.get('/', auth, asyncHandler(async (req, res) => {
  const cacheKey = `dashboard:${req.userId}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json(cached);

  const userId = req.userId;
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [expenses, incomes, habits, goals, investments, debts] = await Promise.all([
    Expense.find({ user: userId, date: { $gte: thirtyDaysAgo } }).sort({ date: -1 }).lean(),
    Income.find({ user: userId, date: { $gte: thirtyDaysAgo } }).sort({ date: -1 }).lean(),
    Habit.find({ user: userId }).lean(),
    SavingsGoal.find({ user: userId }).lean(),
    Investment.find({ user: userId }).lean(),
    Debt.find({ user: userId }).lean(),
  ]);

  const monthlyExpenses = expenses.filter((e) => e.date >= startOfMonth);
  const monthlyIncomes = incomes.filter((i) => i.date >= startOfMonth);

  const base = req.user.currency || 'INR';
  const toBase = (item) => convert(item.amount, item.currency, base);

  const summary = {
    monthlyExpense: monthlyExpenses.reduce((s, e) => s + toBase(e), 0),
    monthlyIncome: monthlyIncomes.reduce((s, i) => s + toBase(i), 0),
    totalSavings: goals.reduce((s, g) => s + convert(g.currentAmount, g.currency, base), 0),
    totalInvested: investments.reduce((s, i) => s + convert(i.currentValue, i.currency, base), 0),
  };

  const totalDebt = debts.reduce((s, d) => s + convert(d.remainingAmount, d.currency, base), 0);
  const netWorth = summary.totalSavings + summary.totalInvested - totalDebt;
  const savingsRate = calculateSavingsRate(summary.monthlyIncome, summary.monthlyExpense);
  const expenseCategories = aggregateByCategory(expenses, 'category', 'amount', toBase);
  const expenseRatio = summary.monthlyIncome > 0 ? summary.monthlyExpense / summary.monthlyIncome : 0;

  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (29 - i));
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  const dailyMap = buildDailyBalanceMap(expenses, incomes, toBase);
  const dailyBalances = last30Days.map((_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (29 - i));
    return dailyMap.get(d.toDateString()) || 0;
  });

  const activeHabits = habits.filter((h) => h.isActive);
  const totalGoals = goals.length;
  const completedGoals = goals.filter((g) => g.isCompleted).length;
  const overallGoalPct = calculateOverallGoalProgress(goals);

  const healthScore = calculateHealthScore({
    savingsRate,
    totalGoals,
    completedGoals,
    activeHabitsCount: activeHabits.length,
    totalInvested: summary.totalInvested,
    expenseRatio,
  });

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
}));

module.exports = router;
