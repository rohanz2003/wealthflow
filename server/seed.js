const mongoose = require('mongoose');
const dns = require('dns');
const dotenv = require('dotenv');

dns.setServers(['8.8.8.8', '8.8.4.4']);

if (process.env.NODE_ENV === 'production') {
  console.error('Seed script cannot run in production!');
  process.exit(1);
}

const User = require('./models/User');
const Income = require('./models/Income');
const Expense = require('./models/Expense');
const Habit = require('./models/Habit');
const SavingsGoal = require('./models/SavingsGoal');
const Investment = require('./models/Investment');
const Budget = require('./models/Budget');
const Debt = require('./models/Debt');

dotenv.config();

const now = new Date();

const usersData = [
  { name: 'Admin User', email: 'admin@wealthflow.com', password: 'Admin@123', role: 'admin', profile: { occupation: 'Platform Administrator', monthlyIncome: 8500 } },
  { name: 'Ravi Sharma', email: 'ravi@wealthflow.com', password: 'User@123', role: 'user', profile: { occupation: 'Software Engineer', monthlyIncome: 12000 } },
  { name: 'Priya Patel', email: 'priya@wealthflow.com', password: 'User@123', role: 'user', profile: { occupation: 'Marketing Manager', monthlyIncome: 7500 } },
  { name: 'Amit Singh', email: 'amit@wealthflow.com', password: 'User@123', role: 'user', profile: { occupation: 'Small Business Owner', monthlyIncome: 15000 } },
  { name: 'Neha Gupta', email: 'neha@wealthflow.com', password: 'User@123', role: 'user', profile: { occupation: 'Freelance Designer', monthlyIncome: 5500 } },
  { name: 'Vikram Reddy', email: 'vikram@wealthflow.com', password: 'User@123', role: 'user', profile: { occupation: 'Doctor', monthlyIncome: 18000 } },
  { name: 'Ananya Joshi', email: 'ananya@wealthflow.com', password: 'User@123', role: 'user', profile: { occupation: 'Teacher', monthlyIncome: 4500 } },
  { name: 'Rohit Verma', email: 'rohit@wealthflow.com', password: 'User@123', role: 'user', profile: { occupation: 'College Student', monthlyIncome: 1500 } },
  { name: 'Deepa Nair', email: 'deepa@wealthflow.com', password: 'User@123', role: 'user', profile: { occupation: 'HR Director', monthlyIncome: 9500 } },
  { name: 'Karan Mehta', email: 'karan@wealthflow.com', password: 'User@123', role: 'user', profile: { occupation: 'Investment Banker', monthlyIncome: 25000 } },
];

function generateIncome(userId, profile) {
  const records = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    records.push({ user: userId, source: 'Monthly Salary', amount: profile.monthlyIncome, category: 'Salary', date: d, description: 'Monthly salary' });
    if (i % 2 === 0 && profile.monthlyIncome > 3000) {
      records.push({ user: userId, source: 'Freelance Project', amount: Math.round(profile.monthlyIncome * 0.08), category: 'Freelance', date: new Date(now.getFullYear(), now.getMonth() - i, 15), description: 'Side project payment' });
    }
    if (i === 0 && profile.monthlyIncome > 10000) {
      records.push({ user: userId, source: 'Annual Bonus', amount: Math.round(profile.monthlyIncome * 1.5), category: 'Business', date: new Date(now.getFullYear(), now.getMonth(), 28), description: 'Performance bonus' });
    }
  }
  return records;
}

function generateExpenses(userId, incomeLevel) {
  const monthlyBase = Math.round(incomeLevel * 0.7);
  const categories = [
    { title: 'Rent / Mortgage', pct: 0.3, cat: 'Rent', recurring: true },
    { title: 'Grocery Shopping', pct: 0.1, cat: 'Groceries' },
    { title: 'Electricity Bill', pct: 0.03, cat: 'Utilities', recurring: true },
    { title: 'Internet & Phone', pct: 0.015, cat: 'Utilities', recurring: true },
    { title: 'Dining Out', pct: 0.05, cat: 'Dining' },
    { title: 'Fuel / Transport', pct: 0.04, cat: 'Transport' },
    { title: 'Shopping', pct: 0.04, cat: 'Shopping' },
    { title: 'Health Insurance', pct: 0.03, cat: 'Insurance', recurring: true },
    { title: 'Entertainment', pct: 0.02, cat: 'Entertainment' },
    { title: 'Education / Courses', pct: 0.025, cat: 'Education' },
    { title: 'Healthcare', pct: 0.02, cat: 'Healthcare' },
  ];
  const records = [];
  for (let monthOff = 5; monthOff >= 0; monthOff--) {
    for (const cat of categories) {
      const day = Math.floor(Math.random() * 25) + 1;
      const amount = Math.round(monthlyBase * cat.pct * (0.8 + Math.random() * 0.4));
      if (amount < 5) continue;
      records.push({
        user: userId,
        title: cat.title,
        amount,
        category: cat.cat,
        date: new Date(now.getFullYear(), now.getMonth() - monthOff, day),
        isRecurring: cat.recurring || false,
      });
    }
    if (monthOff === 0) {
      records.push({ user: userId, title: 'Car Insurance', amount: Math.round(monthlyBase * 0.04), category: 'Insurance', date: new Date(now.getFullYear(), now.getMonth(), 5), isRecurring: true });
      records.push({ user: userId, title: 'Gym Membership', amount: 50, category: 'Healthcare', date: new Date(now.getFullYear(), now.getMonth(), 1), isRecurring: true });
    }
  }
  return records;
}

function generateHabits(userId) {
  const habitsTemplates = [
    { name: 'Daily Savings Transfer', desc: 'Auto-transfer to savings account', freq: 'daily', type: 'saving' },
    { name: 'Track All Expenses', desc: 'Log every expense before bed', freq: 'daily', type: 'tracking' },
    { name: 'Weekly Budget Review', desc: 'Review spending vs budget every Sunday', freq: 'weekly', type: 'budgeting' },
    { name: 'Read Financial News', desc: 'Read one article about personal finance', freq: 'daily', type: 'learning' },
    { name: 'Review Portfolio', desc: 'Check investment portfolio performance', freq: 'weekly', type: 'investing' },
  ];
  return habitsTemplates.map((h, idx) => ({
    user: userId,
    name: h.name,
    description: h.desc,
    frequency: h.freq,
    type: h.type,
    isActive: idx < 4,
    streak: Math.floor(Math.random() * 12) + 1,
    longestStreak: Math.floor(Math.random() * 20) + 5,
    totalCompletions: Math.floor(Math.random() * 50) + 10,
    history: Array.from({ length: 14 }, (_, i) => ({
      date: new Date(now.getTime() - i * 86400000),
      completed: Math.random() > 0.3,
    })),
  }));
}

function generateGoals(userId, incomeLevel) {
  const multi = incomeLevel / 5000;
  return [
    { title: 'Emergency Fund', desc: '6 months living expenses', target: Math.round(incomeLevel * 6 * 0.7), current: Math.round(incomeLevel * 2.5 * 0.7), cat: 'Emergency Fund', date: new Date(2027, 11, 31) },
    { title: 'Dream Vacation', desc: 'Trip to Europe', target: Math.round(6000 * multi), current: Math.round(2000 * multi), cat: 'Vacation', date: new Date(2028, 5, 1) },
    { title: 'Retirement Corpus', desc: 'Building long-term wealth', target: Math.round(100000 * multi), current: Math.round(15000 * multi), cat: 'Retirement', date: new Date(2040, 0, 1) },
    { title: 'New Car', desc: 'Down payment for car', target: Math.round(8000 * Math.min(multi, 3)), current: Math.round(3000 * Math.min(multi, 3)), cat: 'Other', date: new Date(2027, 5, 1) },
  ].filter(() => Math.random() > 0.25).map((g) => ({
    user: userId,
    title: g.title,
    description: g.desc,
    targetAmount: g.target,
    currentAmount: g.current,
    category: g.cat,
    targetDate: g.date,
  }));
}

function generateInvestments(userId, incomeLevel) {
  const multi = incomeLevel / 5000;
  const portfolio = [
    { name: 'S&P 500 Index Fund', type: 'Mutual Funds', amount: Math.round(5000 * multi), ret: 15.2 },
    { name: 'Government Bonds', type: 'Bonds', amount: Math.round(3000 * multi), ret: 6.8 },
    { name: 'Gold ETF', type: 'Gold', amount: Math.round(2000 * multi), ret: 9.5 },
    { name: 'REIT', type: 'Real Estate', amount: Math.round(4000 * multi), ret: 11.3 },
    { name: 'Tech Stocks Portfolio', type: 'Stocks', amount: Math.round(3000 * multi), ret: 22.1 },
  ].filter(() => Math.random() > 0.3);
  return portfolio.map((p) => ({
    user: userId,
    name: p.name,
    type: p.type,
    amount: p.amount,
    currentValue: Math.round(p.amount * (1 + (p.ret / 100) * (0.8 + Math.random() * 0.4))),
    returnRate: p.ret + (Math.random() * 4 - 2),
    date: new Date(now.getTime() - Math.floor(Math.random() * 365) * 86400000),
  }));
}

function generateBudgets(userId, incomeLevel) {
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  return [
    { category: 'Groceries', limit: Math.round(incomeLevel * 0.1) },
    { category: 'Dining', limit: Math.round(incomeLevel * 0.04) },
    { category: 'Entertainment', limit: Math.round(incomeLevel * 0.025) },
    { category: 'Shopping', limit: Math.round(incomeLevel * 0.05) },
    { category: 'Transport', limit: Math.round(incomeLevel * 0.04) },
  ].map((b) => ({
    user: userId, category: b.category, monthlyLimit: b.limit, month, year,
  }));
}

function generateDebts(userId, incomeLevel) {
  if (Math.random() > 0.6) return [];
  const multi = incomeLevel / 5000;
  const debts = [
    { name: 'Home Loan', type: 'Mortgage', total: Math.round(300000 * Math.min(multi, 2)), remaining: Math.round(250000 * Math.min(multi, 2)), rate: 8.5, minPmt: Math.round(2500 * multi) },
    { name: 'Car Loan', type: 'Auto Loan', total: Math.round(25000 * multi), remaining: Math.round(15000 * multi), rate: 9.0, minPmt: Math.round(500 * multi) },
    { name: 'Credit Card', type: 'Credit Card', total: Math.round(5000 * multi), remaining: Math.round(2000 * multi), rate: 24.0, minPmt: Math.round(200 * multi) },
  ].filter(() => Math.random() > 0.5);
  return debts.map((d) => ({
    user: userId, name: d.name, type: d.type, totalAmount: d.total, remainingAmount: d.remaining, interestRate: d.rate, minimumPayment: d.minPmt, dueDate: new Date(now.getFullYear(), now.getMonth() + 1, 15),
  }));
}

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Promise.all([
      User.deleteMany({}), Income.deleteMany({}), Expense.deleteMany({}),
      Habit.deleteMany({}), SavingsGoal.deleteMany({}), Investment.deleteMany({}),
      Budget.deleteMany({}), Debt.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    for (const ud of usersData) {
      const user = await User.create(ud);
      console.log(`  Created user: ${user.email} / ${ud.password}`);

      const incomes = generateIncome(user._id, ud.profile);
      await Income.insertMany(incomes);

      const expenses = generateExpenses(user._id, ud.profile.monthlyIncome);
      await Expense.insertMany(expenses);

      const habits = generateHabits(user._id);
      await Habit.insertMany(habits);

      const goals = generateGoals(user._id, ud.profile.monthlyIncome);
      if (goals.length > 0) await SavingsGoal.insertMany(goals);

      const investments = generateInvestments(user._id, ud.profile.monthlyIncome);
      if (investments.length > 0) await Investment.insertMany(investments);

      const budgets = generateBudgets(user._id, ud.profile.monthlyIncome);
      await Budget.insertMany(budgets);

      const debts = generateDebts(user._id, ud.profile.monthlyIncome);
      if (debts.length > 0) await Debt.insertMany(debts);
    }

    console.log('\n--- Demo Accounts ---');
    usersData.forEach((u) => {
      console.log(`  ${u.email.padEnd(32)} ${u.password.padEnd(12)} ${u.profile.occupation}`);
    });

    console.log('\nSeed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
