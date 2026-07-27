const {
  calculateSavingsRate,
  calculateHealthScore,
  calculateOverallGoalProgress,
  calculateGoalProgress,
  aggregateByCategory,
  buildDailyBalanceMap,
} = require('../utils/calculations');

describe('calculateSavingsRate', () => {
  test('returns correct percentage for normal values', () => {
    expect(calculateSavingsRate(5000, 3500)).toBe(30);
  });

  test('returns 0 when income is 0', () => {
    expect(calculateSavingsRate(0, 0)).toBe(0);
  });

  test('returns 0 when income is negative', () => {
    expect(calculateSavingsRate(-1000, 0)).toBe(0);
  });

  test('returns 100 when expenses are 0', () => {
    expect(calculateSavingsRate(5000, 0)).toBe(100);
  });

  test('returns negative rate when expenses exceed income', () => {
    expect(calculateSavingsRate(3000, 4000)).toBeCloseTo(-33.33, 1);
  });
});

describe('calculateHealthScore', () => {
  test('returns 100 for perfect financial health', () => {
    const score = calculateHealthScore({
      savingsRate: 30,
      totalGoals: 5,
      completedGoals: 5,
      activeHabitsCount: 5,
      totalInvested: 10000,
      expenseRatio: 0.3,
    });
    expect(score).toBe(100);
  });

  test('returns minimum score for worst financial health', () => {
    const score = calculateHealthScore({
      savingsRate: 0,
      totalGoals: 0,
      completedGoals: 0,
      activeHabitsCount: 0,
      totalInvested: 0,
      expenseRatio: 1,
    });
    expect(score).toBe(15);
  });

  test('scales savings rate component proportionally', () => {
    const half = calculateHealthScore({
      savingsRate: 10, totalGoals: 5, completedGoals: 2,
      activeHabitsCount: 2, totalInvested: 0, expenseRatio: 0.6,
    });
    expect(half).toBeGreaterThan(15);
    expect(half).toBeLessThan(100);
  });

  test('caps score at 100', () => {
    const score = calculateHealthScore({
      savingsRate: 200, totalGoals: 1, completedGoals: 10,
      activeHabitsCount: 50, totalInvested: 1e9, expenseRatio: 0.1,
    });
    expect(score).toBe(100);
  });

  test('floors score at 0', () => {
    // This is hard to hit with current formula but test for stability
    const score = calculateHealthScore({
      savingsRate: 0, totalGoals: 0, completedGoals: 0,
      activeHabitsCount: 0, totalInvested: 0, expenseRatio: 2,
    });
    expect(score).toBeGreaterThanOrEqual(0);
  });
});

describe('calculateOverallGoalProgress', () => {
  test('returns correct percentage from multiple goals', () => {
    const goals = [
      { targetAmount: 1000, currentAmount: 500 },
      { targetAmount: 1000, currentAmount: 300 },
    ];
    expect(calculateOverallGoalProgress(goals)).toBe(40);
  });

  test('returns 0 for empty goals array', () => {
    expect(calculateOverallGoalProgress([])).toBe(0);
  });

  test('caps at 100% when current exceeds target', () => {
    const goals = [
      { targetAmount: 1000, currentAmount: 2000 },
    ];
    expect(calculateOverallGoalProgress(goals)).toBe(100);
  });

  test('skips goals with zero target', () => {
    const goals = [
      { targetAmount: 0, currentAmount: 500 },
    ];
    expect(calculateOverallGoalProgress(goals)).toBe(0);
  });
});

describe('calculateGoalProgress', () => {
  test('returns correct percentage', () => {
    expect(calculateGoalProgress(500, 1000)).toBe(50);
  });

  test('returns 0 when target is 0', () => {
    expect(calculateGoalProgress(100, 0)).toBe(0);
  });

  test('caps at 100', () => {
    expect(calculateGoalProgress(2000, 1000)).toBe(100);
  });
});

describe('aggregateByCategory', () => {
  test('groups items by category and sums values', () => {
    const items = [
      { category: 'Food', amount: 100 },
      { category: 'Food', amount: 50 },
      { category: 'Transport', amount: 30 },
    ];
    expect(aggregateByCategory(items, 'category', 'amount')).toEqual({
      Food: 150,
      Transport: 30,
    });
  });

  test('returns empty object for empty array', () => {
    expect(aggregateByCategory([], 'category', 'amount')).toEqual({});
  });
});

describe('buildDailyBalanceMap', () => {
  test('calculates net daily balance', () => {
    const expenses = [
      { date: new Date('2024-01-01'), amount: 100 },
      { date: new Date('2024-01-02'), amount: 50 },
    ];
    const incomes = [
      { date: new Date('2024-01-01'), amount: 500 },
    ];
    const map = buildDailyBalanceMap(expenses, incomes);
    expect(map.get('Mon Jan 01 2024')).toBe(400);
    expect(map.get('Tue Jan 02 2024')).toBe(-50);
  });

  test('returns empty map for empty arrays', () => {
    const map = buildDailyBalanceMap([], []);
    expect(map.size).toBe(0);
  });
});
