const express = require('express');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const User = require('../models/User');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Habit = require('../models/Habit');
const SavingsGoal = require('../models/SavingsGoal');
const Investment = require('../models/Investment');
const cache = require('../utils/cache');

const router = express.Router();

router.get('/kpis', auth, async (req, res) => {
  try {
    const cacheKey = `kpis:${req.userId}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const userId = req.userId;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [habits, goals, monthlyExpenses, monthlyIncomes, yearlyExpenses, yearlyIncomes, investments] = await Promise.all([
      Habit.find({ user: userId }).lean(),
      SavingsGoal.find({ user: userId }).lean(),
      Expense.find({ user: userId, date: { $gte: startOfMonth } }).lean(),
      Income.find({ user: userId, date: { $gte: startOfMonth } }).lean(),
      Expense.find({ user: userId, date: { $gte: startOfYear } }).sort({ date: 1 }).lean(),
      Income.find({ user: userId, date: { $gte: startOfYear } }).sort({ date: 1 }).lean(),
      Investment.find({ user: userId }).lean(),
    ]);

    const activeHabits = habits.filter((h) => h.isActive);
    const totalHabits = habits.length;

    let totalExpectedCompletions = 0;
    let totalActualCompletions = 0;
    activeHabits.forEach((h) => {
      const daysSinceCreation = Math.max(1, Math.ceil((now - new Date(h.createdAt)) / (1000 * 60 * 60 * 24)));
      let expected;
      if (h.frequency === 'daily') expected = daysSinceCreation;
      else if (h.frequency === 'weekly') expected = Math.ceil(daysSinceCreation / 7);
      else expected = Math.ceil(daysSinceCreation / 30);
      totalExpectedCompletions += expected;
      totalActualCompletions += h.totalCompletions || 0;
    });

    const habitCompletionRate = totalExpectedCompletions > 0 ? Math.round((totalActualCompletions / totalExpectedCompletions) * 100) : 0;

    const totalGoalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
    const totalGoalCurrent = goals.reduce((s, g) => s + g.currentAmount, 0);
    const avgGoalCompletionRate = totalGoalTarget > 0 ? Math.round((totalGoalCurrent / totalGoalTarget) * 100) : 0;

    const totalGoals = goals.length;
    const completedGoals = goals.filter((g) => g.isCompleted).length;
    const goalCompletionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

    const monthlyExpenseTotal = monthlyExpenses.reduce((s, e) => s + e.amount, 0);
    const monthlyIncomeTotal = monthlyIncomes.reduce((s, i) => s + i.amount, 0);

    const investmentTotal = investments.reduce((s, i) => s + i.currentValue, 0);

    const monthlyExpenseCount = monthlyExpenses.length;
    const monthlyIncomeCount = monthlyIncomes.length;
    const totalMonthlyTransactions = monthlyExpenseCount + monthlyIncomeCount;

    const today = new Date().toDateString();
    const habitsCompletedToday = habits.filter((h) =>
      h.history?.some((x) => new Date(x.date).toDateString() === today && x.completed)
    ).length;

    const weeklyExpenses = await Expense.find({ user: userId, date: { $gte: sevenDaysAgo } }).lean();
    const weeklyIncomes = await Income.find({ user: userId, date: { $gte: sevenDaysAgo } }).lean();
    const weeklyTransactions = weeklyExpenses.length + weeklyIncomes.length;

    const result = {
      habitCompletionRate,
      avgGoalCompletionRate,
      goalCompletionRate,
      totalGoals,
      completedGoals,
      activeHabits: activeHabits.length,
      totalHabits,
      habitsCompletedToday,
      monthlyExpenseTotal,
      monthlyIncomeTotal,
      monthlyNetCashflow: monthlyIncomeTotal - monthlyExpenseTotal,
      investmentTotal,
      totalMonthlyTransactions,
      weeklyTransactions,
    };

    cache.set(cacheKey, result, 60 * 1000);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/monthly-activity', auth, async (req, res) => {
  try {
    const cacheKey = `monthly:${req.userId}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const userId = req.userId;
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const [expenses, incomes] = await Promise.all([
      Expense.find({ user: userId, date: { $gte: twelveMonthsAgo } }).sort({ date: 1 }).lean(),
      Income.find({ user: userId, date: { $gte: twelveMonthsAgo } }).sort({ date: 1 }).lean(),
    ]);

    const monthlyMap = {};

    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
      const key = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      monthlyMap[key] = {
        month: key,
        income: 0,
        expense: 0,
        count: 0,
      };
    }

    expenses.forEach((e) => {
      const d = new Date(e.date);
      const key = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      if (monthlyMap[key]) {
        monthlyMap[key].expense += e.amount;
        monthlyMap[key].count += 1;
      }
    });

    incomes.forEach((i) => {
      const d = new Date(i.date);
      const key = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      if (monthlyMap[key]) {
        monthlyMap[key].income += i.amount;
        monthlyMap[key].count += 1;
      }
    });

    const months = Object.values(monthlyMap);
    months.forEach((m) => {
      m.savings = m.income - m.expense;
    });

    const result = { months };

    cache.set(cacheKey, result, 60 * 1000);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/admin/kpis', auth, admin, async (req, res) => {

  try {
    const cacheKey = 'admin:kpis';
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalActiveUsers,
      weeklyActiveUsers,
      habits,
      goals,
      totalExpenses,
      totalIncomes,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ lastActive: { $gte: thirtyDaysAgo } }),
      User.countDocuments({ lastActive: { $gte: sevenDaysAgo } }),
      Habit.find().lean(),
      SavingsGoal.find().lean(),
      Expense.aggregate([
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Income.aggregate([
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
    ]);

    const totalHabits = habits.length;
    const totalHabitCompletions = habits.reduce((s, h) => s + (h.totalCompletions || 0), 0);
    const avgHabitCompletions = totalHabits > 0 ? Math.round((totalHabitCompletions / totalHabits) * 10) / 10 : 0;

    const totalGoalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
    const totalGoalCurrent = goals.reduce((s, g) => s + g.currentAmount, 0);
    const avgGoalProgressPct = totalGoalTarget > 0 ? Math.round((totalGoalCurrent / totalGoalTarget) * 100) : 0;

    const totalExpenseAmount = totalExpenses[0]?.total || 0;
    const totalIncomeAmount = totalIncomes[0]?.total || 0;
    const totalTransactions = (totalExpenses[0]?.count || 0) + (totalIncomes[0]?.count || 0);

    const userEngagementRate = totalUsers > 0 ? Math.round((totalActiveUsers / totalUsers) * 100) : 0;

    const result = {
      totalUsers,
      monthlyActiveUsers: totalActiveUsers,
      weeklyActiveUsers,
      userEngagementRate,
      totalHabits,
      totalHabitCompletions,
      avgHabitCompletions,
      totalGoalTarget,
      totalGoalCurrent,
      avgGoalProgressPct,
      totalExpenseAmount,
      totalIncomeAmount,
      totalTransactions,
    };

    cache.set(cacheKey, result, 120 * 1000);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/spending-insights', auth, async (req, res) => {
  try {
    const cacheKey = `insights:${req.userId}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const userId = req.userId;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

    const [currentExpenses, recentExpenses, incomes] = await Promise.all([
      Expense.find({ user: userId, date: { $gte: startOfMonth } }).lean(),
      Expense.find({ user: userId, date: { $gte: threeMonthsAgo, $lt: startOfMonth } }).lean(),
      Income.find({ user: userId, date: { $gte: startOfMonth } }).lean(),
    ]);

    const previousExpenses = await Expense.find({ user: userId, date: { $gte: sixMonthsAgo, $lt: threeMonthsAgo } }).lean();

    const currentByCat = {};
    currentExpenses.forEach((e) => { currentByCat[e.category] = (currentByCat[e.category] || 0) + e.amount; });
    const prevByCat = {};
    previousExpenses.forEach((e) => { prevByCat[e.category] = (prevByCat[e.category] || 0) + e.amount; });

    const anomalies = [];
    Object.entries(currentByCat).forEach(([cat, amount]) => {
      const prevAvg = prevByCat[cat] || 0;
      const prevAvgMonthly = prevAvg / 3;
      if (prevAvgMonthly > 0 && amount > prevAvgMonthly * 1.5) {
        anomalies.push({
          category: cat,
          currentAmount: Math.round(amount),
          averageAmount: Math.round(prevAvgMonthly),
          percentIncrease: Math.round(((amount - prevAvgMonthly) / prevAvgMonthly) * 100),
          severity: amount > prevAvgMonthly * 2 ? 'high' : 'medium',
        });
      }
    });

    const currentTotal = currentExpenses.reduce((s, e) => s + e.amount, 0);
    const prevTotal = recentExpenses.reduce((s, e) => s + e.amount, 0);
    const prevMonthlyAvg = prevTotal / 3;
    const spendingTrend = prevMonthlyAvg > 0
      ? Math.round(((currentTotal - prevMonthlyAvg) / prevMonthlyAvg) * 100)
      : 0;

    const topCategories = Object.entries(currentByCat)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat, amt]) => ({
        category: cat,
        amount: Math.round(amt),
        percentOfTotal: currentTotal > 0 ? Math.round((amt / currentTotal) * 100) : 0,
      }));

    const monthlyIncome = incomes.reduce((s, i) => s + i.amount, 0);
    const expenseRatio = monthlyIncome > 0 ? Math.round((currentTotal / monthlyIncome) * 100) : 0;

    const recommendations = [];
    if (expenseRatio > 80) {
      recommendations.push({ type: 'warning', message: 'Your expenses are over 80% of income. Try to reduce spending to build savings.', category: 'spending' });
    }
    if (anomalies.length > 0) {
      recommendations.push({ type: 'alert', message: `${anomalies.length} spending categories are significantly higher than usual this month.`, category: 'anomaly' });
    }
    if (monthlyIncome > 0 && (monthlyIncome - currentTotal) / monthlyIncome < 0.1) {
      recommendations.push({ type: 'suggestion', message: 'Your savings rate is below 10%. Aim to save at least 20% of income.', category: 'savings' });
    }
    if (topCategories.length > 0 && topCategories[0].percentOfTotal > 40) {
      recommendations.push({ type: 'suggestion', message: `Your top spending category "${topCategories[0].category}" is ${topCategories[0].percentOfTotal}% of expenses. Consider if this aligns with your priorities.`, category: 'spending' });
    }

    const result = {
      anomalies,
      spendingTrend,
      topCategories,
      expenseRatio,
      totalSpentThisMonth: Math.round(currentTotal),
      totalIncomeThisMonth: Math.round(monthlyIncome),
      recommendations,
    };

    cache.set(cacheKey, result, 120 * 1000);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/goal-projections', auth, async (req, res) => {
  try {
    const cacheKey = `goalproj:${req.userId}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const userId = req.userId;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [goals, monthlyExpenses, monthlyIncomes] = await Promise.all([
      SavingsGoal.find({ user: userId, isCompleted: false }).lean(),
      Expense.find({ user: userId, date: { $gte: startOfMonth } }).lean(),
      Income.find({ user: userId, date: { $gte: startOfMonth } }).lean(),
    ]);

    const monthlyIncome = monthlyIncomes.reduce((s, i) => s + i.amount, 0);
    const monthlyExpense = monthlyExpenses.reduce((s, e) => s + e.amount, 0);
    const monthlySurplus = Math.max(0, monthlyIncome - monthlyExpense);

    const projections = goals.map((g) => {
      const remaining = g.targetAmount - g.currentAmount;
      let monthsToGoal = remaining > 0 && monthlySurplus > 0
        ? Math.ceil(remaining / monthlySurplus)
        : null;
      if (g.targetDate) {
        const monthsUntilTarget = (new Date(g.targetDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);
        const neededMonthly = monthsUntilTarget > 0 ? remaining / monthsUntilTarget : null;
        return {
          ...g,
          remaining,
          monthsToGoal,
          targetMonthsAway: Math.round(monthsUntilTarget),
          neededMonthly: neededMonthly ? Math.round(neededMonthly) : null,
          projectedDate: monthsToGoal ? new Date(now.getTime() + monthsToGoal * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null,
          onTrack: neededMonthly ? monthlySurplus >= neededMonthly : null,
        };
      }
      return {
        ...g,
        remaining,
        monthsToGoal,
        projectedDate: monthsToGoal ? new Date(now.getTime() + monthsToGoal * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null,
        neededMonthly: null,
        targetMonthsAway: null,
        onTrack: null,
      };
    });

    const result = { projections, monthlySurplus: Math.round(monthlySurplus) };

    cache.set(cacheKey, result, 60 * 1000);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/wealth-projections', auth, async (req, res) => {
  try {
    const cacheKey = `wealthproj:${req.userId}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const userId = req.userId;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [investments, goals, monthlyExpenses, monthlyIncomes] = await Promise.all([
      Investment.find({ user: userId }).lean(),
      SavingsGoal.find({ user: userId, isCompleted: false }).lean(),
      Expense.find({ user: userId, date: { $gte: startOfMonth } }).lean(),
      Income.find({ user: userId, date: { $gte: startOfMonth } }).lean(),
    ]);

    const monthlyIncome = monthlyIncomes.reduce((s, i) => s + i.amount, 0);
    const monthlyExpense = monthlyExpenses.reduce((s, e) => s + e.amount, 0);
    const monthlySavings = Math.max(0, monthlyIncome - monthlyExpense);

    const currentInvestments = investments.reduce((s, i) => s + i.currentValue, 0);
    const totalInvested = investments.reduce((s, i) => s + i.amount, 0);
    const avgReturn = investments.length > 0
      ? investments.reduce((s, i) => s + (i.returnRate || 0), 0) / investments.length
      : 7;

    const goalSavings = goals.reduce((s, g) => s + g.currentAmount, 0);
    const currentNetWorth = monthlyIncome + currentInvestments + goalSavings - monthlyExpense;

    const years = [1, 3, 5, 10, 20];
    const projectionScenarios = [];

    for (const savingsRate of [monthlySavings, monthlySavings * 0.75, monthlySavings * 1.25]) {
      if (savingsRate <= 0) continue;
      const points = years.map((y) => {
        const periods = y * 12;
        const monthlyRate = avgReturn / 100 / 12;
        const fv = currentInvestments * Math.pow(1 + monthlyRate, periods) +
          savingsRate * ((Math.pow(1 + monthlyRate, periods) - 1) / monthlyRate);
        return { year: y, projectedValue: Math.round(fv + goalSavings + monthlyIncome * y * 12) };
      });
      projectionScenarios.push({
        label: savingsRate >= monthlySavings * 1.2 ? 'Aggressive' : savingsRate <= monthlySavings * 0.8 ? 'Conservative' : 'Current',
        monthlySavings: Math.round(savingsRate),
        points,
      });
    }

    const avgReturnLabel = avgReturn > 0 ? `${avgReturn.toFixed(1)}%` : '7.0%';

    const result = {
      currentInvestments,
      currentNetWorth: Math.round(currentNetWorth),
      monthlySavings: Math.round(monthlySavings),
      avgReturnRate: avgReturnLabel,
      projectionScenarios,
    };

    cache.set(cacheKey, result, 120 * 1000);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/stability', auth, async (req, res) => {
  try {
    const cacheKey = `stability:${req.userId}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const userId = req.userId;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [monthlyExpenses, goals, debts, habits, investments, incomes] = await Promise.all([
      Expense.find({ user: userId, date: { $gte: startOfMonth } }).lean(),
      SavingsGoal.find({ user: userId }).lean(),
      require('../models/Debt').find({ user: userId }).lean().catch((err) => { console.error('Debt fetch error:', err); return []; }),
      Habit.find({ user: userId }).lean(),
      Investment.find({ user: userId }).lean(),
      Income.find({ user: userId, date: { $gte: startOfMonth } }).lean(),
    ]);

    const monthlyExpense = monthlyExpenses.reduce((s, e) => s + e.amount, 0);
    const monthlyIncome = incomes.reduce((s, i) => s + i.amount, 0);
    const totalSavings = goals.reduce((s, g) => s + g.currentAmount, 0);
    const totalInvested = investments.reduce((s, i) => s + i.currentValue, 0);
    const totalDebt = debts.reduce((s, d) => s + d.remainingAmount, 0);
    const totalAssets = totalSavings + totalInvested;
    const netWorth = totalAssets - totalDebt;

    const emergencyFundMonths = monthlyExpense > 0 ? Math.round((totalSavings / monthlyExpense) * 10) / 10 : 0;
    const emergencyFundAdequate = emergencyFundMonths >= 6 ? 'excellent' : emergencyFundMonths >= 3 ? 'adequate' : emergencyFundMonths >= 1 ? 'minimal' : 'none';
    const emergencyFundTarget = Math.round(monthlyExpense * 6);
    const emergencyFundProgress = emergencyFundTarget > 0 ? Math.round((totalSavings / emergencyFundTarget) * 100) : 0;

    const debtToIncome = monthlyIncome > 0 ? Math.round((totalDebt / (monthlyIncome * 12)) * 100) : 0;
    const debtBurden = debtToIncome <= 20 ? 'low' : debtToIncome <= 40 ? 'moderate' : 'high';

    const activeHabits = habits.filter((h) => h.isActive).length;
    const habitScore = activeHabits >= 3 ? 'strong' : activeHabits >= 1 ? 'developing' : 'none';

    const incomeDiversity = new Set(incomes.map((i) => i.category)).size;
    const incomeDiversityScore = incomeDiversity >= 3 ? 'high' : incomeDiversity >= 2 ? 'medium' : 'low';

    const result = {
      netWorth: Math.round(netWorth),
      totalAssets: Math.round(totalAssets),
      totalDebt: Math.round(totalDebt),
      emergencyFundMonths,
      emergencyFundAdequate,
      emergencyFundTarget,
      emergencyFundProgress,
      debtToIncome,
      debtBurden,
      habitScore,
      activeHabits,
      incomeDiversity,
      incomeDiversityScore,
    };

    cache.set(cacheKey, result, 120 * 1000);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
