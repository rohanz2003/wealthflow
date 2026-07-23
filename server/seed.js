const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Income = require('./models/Income');
const Expense = require('./models/Expense');
const Habit = require('./models/Habit');
const SavingsGoal = require('./models/SavingsGoal');
const Investment = require('./models/Investment');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Promise.all([
      User.deleteMany({}),
      Income.deleteMany({}),
      Expense.deleteMany({}),
      Habit.deleteMany({}),
      SavingsGoal.deleteMany({}),
      Investment.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@wealthflow.com',
      password: 'admin123',
      role: 'admin',
      profile: { occupation: 'Platform Administrator', monthlyIncome: 8000 },
    });

    const user = await User.create({
      name: 'John Doe',
      email: 'user@wealthflow.com',
      password: 'user123',
      role: 'user',
      profile: { occupation: 'Software Engineer', monthlyIncome: 5000 },
    });

    console.log('Created users');

    const today = new Date();
    const incomes = [];
    const expenses = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(today);
      d.setMonth(d.getMonth() - i);
      incomes.push({ user: user._id, source: 'Monthly Salary', amount: 5000, category: 'Salary', date: d, description: 'Monthly salary payment' });
    }
    await Income.insertMany(incomes);

    const expenseData = [
      { title: 'Rent Payment', amount: 1200, category: 'Rent', date: new Date(today.getFullYear(), today.getMonth(), 1) },
      { title: 'Grocery Shopping', amount: 350, category: 'Groceries', date: new Date(today.getFullYear(), today.getMonth(), 5) },
      { title: 'Uber Rides', amount: 45, category: 'Transport', date: new Date(today.getFullYear(), today.getMonth(), 3) },
      { title: 'Netflix Subscription', amount: 15, category: 'Entertainment', date: new Date(today.getFullYear(), today.getMonth(), 10) },
      { title: 'Lunch at Cafe', amount: 25, category: 'Dining', date: new Date(today.getFullYear(), today.getMonth(), 8) },
      { title: 'Electricity Bill', amount: 95, category: 'Utilities', date: new Date(today.getFullYear(), today.getMonth(), 12) },
      { title: 'Gym Membership', amount: 50, category: 'Healthcare', date: new Date(today.getFullYear(), today.getMonth(), 15) },
      { title: 'Amazon Shopping', amount: 120, category: 'Shopping', date: new Date(today.getFullYear(), today.getMonth(), 7) },
      { title: 'Online Course', amount: 200, category: 'Education', date: new Date(today.getFullYear(), today.getMonth(), 14) },
      { title: 'Health Insurance', amount: 180, category: 'Insurance', date: new Date(today.getFullYear(), today.getMonth(), 20) },
    ];
    for (const ed of expenseData) {
      expenses.push({ user: user._id, ...ed });
    }
    await Expense.insertMany(expenses);

    const habits = [
      { user: user._id, name: 'Save $50 Daily', description: 'Transfer $50 to savings account every day', frequency: 'daily', type: 'saving' },
      { user: user._id, name: 'Track Daily Expenses', description: 'Log all expenses at the end of the day', frequency: 'daily', type: 'tracking' },
      { user: user._id, name: 'Weekly Budget Review', description: 'Review weekly spending against budget', frequency: 'weekly', type: 'budgeting' },
      { user: user._id, name: 'Invest Monthly', description: 'Invest $500 in mutual funds every month', frequency: 'monthly', type: 'investing' },
      { user: user._id, name: 'Read Finance News', description: 'Read one finance article daily', frequency: 'daily', type: 'learning' },
    ];
    const createdHabits = await Habit.insertMany(habits);

    for (const habit of createdHabits) {
      const history = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        history.push({ date: d, completed: i < 5 });
      }
      habit.history = history;
      habit.streak = 5;
      habit.longestStreak = 7;
      habit.totalCompletions = 10;
      await habit.save();
    }

    const goals = [
      { user: user._id, title: 'Emergency Fund', description: '6 months of living expenses', targetAmount: 15000, currentAmount: 8500, category: 'Emergency Fund', targetDate: new Date(2027, 5, 1) },
      { user: user._id, title: 'Europe Trip', description: 'Summer vacation to Europe', targetAmount: 5000, currentAmount: 1800, category: 'Vacation', targetDate: new Date(2027, 6, 1) },
      { user: user._id, title: 'New Laptop', description: 'MacBook Pro for work', targetAmount: 2500, currentAmount: 2500, category: 'Other', targetDate: new Date(2026, 8, 1), isCompleted: true },
    ];
    await SavingsGoal.insertMany(goals);

    const investments = [
      { user: user._id, name: 'S&P 500 Index Fund', type: 'Mutual Funds', amount: 5000, currentValue: 5850, returnRate: 17 },
      { user: user._id, name: 'AAPL Stock', type: 'Stocks', amount: 2000, currentValue: 2400, returnRate: 20 },
      { user: user._id, name: 'Fixed Deposit', type: 'Fixed Deposit', amount: 3000, currentValue: 3200, returnRate: 6.7 },
      { user: user._id, name: 'Gold ETF', type: 'Gold', amount: 1500, currentValue: 1620, returnRate: 8 },
    ];
    await Investment.insertMany(investments);

    console.log('Seed data created successfully!');
    console.log('Admin: admin@wealthflow.com / admin123');
    console.log('User: user@wealthflow.com / user123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
