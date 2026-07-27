function calculateSavingsRate(income, expenses) {
  if (income <= 0) return 0;
  return ((income - expenses) / income) * 100;
}

function calculateHealthScore({
  savingsRate,
  totalGoals,
  completedGoals,
  activeHabitsCount,
  totalInvested,
  expenseRatio,
}) {
  const score =
    (savingsRate >= 20 ? 30 : (savingsRate / 20) * 30) +
    (totalGoals > 0 ? (completedGoals / totalGoals) * 20 : 10) +
    (activeHabitsCount >= 3 ? 20 : (activeHabitsCount / 3) * 20) +
    (totalInvested > 0 ? 15 : 0) +
    (expenseRatio <= 0.5 ? 15 : expenseRatio <= 0.75 ? 10 : 5);
  return Math.round(Math.min(100, Math.max(0, score)));
}

function calculateOverallGoalProgress(goals) {
  const totals = goals.reduce(
    (acc, g) => {
      if (g.targetAmount > 0) {
        acc.totalTarget += g.targetAmount;
        acc.totalCurrent += Math.min(g.currentAmount, g.targetAmount);
      }
      return acc;
    },
    { totalTarget: 0, totalCurrent: 0 }
  );
  return totals.totalTarget > 0
    ? Math.round((totals.totalCurrent / totals.totalTarget) * 100)
    : 0;
}

function calculateGoalProgress(currentAmount, targetAmount) {
  if (targetAmount <= 0) return 0;
  return Math.min(100, Math.round((currentAmount / targetAmount) * 100));
}

function aggregateByCategory(items, keyField, valueField) {
  return items.reduce((acc, item) => {
    const key = item[keyField];
    acc[key] = (acc[key] || 0) + item[valueField];
    return acc;
  }, {});
}

function buildDailyBalanceMap(expenses, incomes) {
  const map = new Map();
  expenses.forEach((e) => {
    const key = new Date(e.date).toDateString();
    map.set(key, (map.get(key) || 0) - e.amount);
  });
  incomes.forEach((i) => {
    const key = new Date(i.date).toDateString();
    map.set(key, (map.get(key) || 0) + i.amount);
  });
  return map;
}

module.exports = {
  calculateSavingsRate,
  calculateHealthScore,
  calculateOverallGoalProgress,
  calculateGoalProgress,
  aggregateByCategory,
  buildDailyBalanceMap,
};
