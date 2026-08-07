const CATEGORIES = ['Food', 'Groceries', 'Dining', 'Food Delivery', 'Transport', 'Fuel', 'Rent', 'Utilities', 'Entertainment', 'Shopping', 'Healthcare', 'Education', 'Insurance', 'Travel', 'Subscriptions', 'Fitness', 'Pets', 'Gifts', 'Personal Care', 'Other'];
const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Business', 'Rental', 'Gift', 'Bonus', 'Dividends', 'Interest', 'Refund', 'Side Hustle', 'Other'];
const HABIT_TYPES = ['saving', 'budgeting', 'investing', 'tracking', 'learning'];
const HABIT_FREQUENCIES = ['daily', 'weekly', 'monthly'];
const GOAL_CATEGORIES = ['Emergency Fund', 'Vacation', 'Travel', 'Education', 'Home', 'Renovation', 'Vehicle', 'Wedding', 'Business', 'Retirement', 'Investment', 'Gadgets', 'Debt Payment', 'Other'];
const INVESTMENT_TYPES = ['Stocks', 'Mutual Funds', 'Fixed Deposit', 'Real Estate', 'Gold', 'Cryptocurrency', 'Bonds', 'PPF', 'NPS', 'Other'];
const DEBT_TYPES = ['Credit Card', 'Student Loan', 'Personal Loan', 'Mortgage', 'Auto Loan', 'Medical', 'Business Loan', 'Payday Loan', 'Other'];
const CURRENCIES = ['USD', 'INR', 'EUR', 'GBP', 'AED', 'SGD', 'JPY'];
const CURRENCY_INFO = {
  USD: { symbol: '$', name: 'US Dollar', locale: 'en-US' },
  INR: { symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
  EUR: { symbol: '€', name: 'Euro', locale: 'de-DE' },
  GBP: { symbol: '£', name: 'British Pound', locale: 'en-GB' },
  AED: { symbol: 'د.إ', name: 'UAE Dirham', locale: 'en-AE' },
  SGD: { symbol: 'S$', name: 'Singapore Dollar', locale: 'en-SG' },
  JPY: { symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
};

module.exports = {
  CATEGORIES,
  INCOME_CATEGORIES,
  HABIT_TYPES,
  HABIT_FREQUENCIES,
  GOAL_CATEGORIES,
  INVESTMENT_TYPES,
  DEBT_TYPES,
  CURRENCIES,
  CURRENCY_INFO,
};
