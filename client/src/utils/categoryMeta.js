import {
  FiTruck, FiHome, FiZap, FiFilm, FiShoppingBag, FiHeart, FiBookOpen,
  FiShield, FiShoppingCart, FiCoffee, FiMoreHorizontal, FiGlobe, FiSun, FiTrendingUp,
  FiCreditCard, FiTarget, FiUser, FiFileText, FiDollarSign, FiBarChart2, FiCheckSquare, FiTag,
  FiSend, FiNavigation, FiRepeat, FiActivity, FiSmile, FiGift, FiDroplet, FiBriefcase,
  FiPenTool, FiLayers, FiAward, FiPercent, FiCornerUpLeft, FiAlertTriangle, FiTool, FiMonitor,
} from 'react-icons/fi';

const COLORS = {
  violet: { text: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-100 dark:bg-primary-900/30' },
  magenta: { text: 'text-magenta-600 dark:text-magenta-400', bg: 'bg-magenta-100 dark:bg-magenta-900/30' },
  mint: { text: 'text-mint-600 dark:text-mint-400', bg: 'bg-mint-100 dark:bg-mint-900/30' },
  sun: { text: 'text-sun-600 dark:text-sun-400', bg: 'bg-sun-100 dark:bg-sun-900/30' },
  blue: { text: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  red: { text: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
  orange: { text: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  cyan: { text: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-100 dark:bg-cyan-900/30' },
  purple: { text: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  gray: { text: 'text-gray-600 dark:text-navy-300', bg: 'bg-gray-100 dark:bg-navy-700' },
};

function meta(icon, color) {
  return { icon, ...COLORS[color] };
}

export const expenseCategoryMeta = {
  Food: meta(FiShoppingBag, 'magenta'),
  Dining: meta(FiCoffee, 'sun'),
  Groceries: meta(FiShoppingCart, 'mint'),
  'Food Delivery': meta(FiSend, 'orange'),
  Transport: meta(FiTruck, 'blue'),
  Fuel: meta(FiZap, 'sun'),
  Rent: meta(FiHome, 'violet'),
  Utilities: meta(FiZap, 'sun'),
  Entertainment: meta(FiFilm, 'purple'),
  Shopping: meta(FiTag, 'cyan'),
  Healthcare: meta(FiHeart, 'red'),
  Education: meta(FiBookOpen, 'orange'),
  Insurance: meta(FiShield, 'mint'),
  Travel: meta(FiNavigation, 'cyan'),
  Subscriptions: meta(FiRepeat, 'violet'),
  Fitness: meta(FiActivity, 'mint'),
  Pets: meta(FiSmile, 'red'),
  Gifts: meta(FiGift, 'magenta'),
  'Personal Care': meta(FiDroplet, 'cyan'),
  Other: meta(FiMoreHorizontal, 'gray'),
};

export const incomeCategoryMeta = {
  Salary: meta(FiBriefcase, 'violet'),
  Freelance: meta(FiPenTool, 'blue'),
  Investment: meta(FiTrendingUp, 'magenta'),
  Business: meta(FiLayers, 'sun'),
  Rental: meta(FiHome, 'cyan'),
  Gift: meta(FiGift, 'magenta'),
  Bonus: meta(FiAward, 'sun'),
  Dividends: meta(FiBarChart2, 'mint'),
  Interest: meta(FiPercent, 'blue'),
  Refund: meta(FiCornerUpLeft, 'mint'),
  'Side Hustle': meta(FiZap, 'orange'),
  Other: meta(FiMoreHorizontal, 'gray'),
};

export const goalCategoryMeta = {
  'Emergency Fund': meta(FiShield, 'mint'),
  Vacation: meta(FiGlobe, 'cyan'),
  Travel: meta(FiNavigation, 'blue'),
  Education: meta(FiBookOpen, 'orange'),
  Home: meta(FiHome, 'violet'),
  Renovation: meta(FiTool, 'orange'),
  Vehicle: meta(FiTruck, 'blue'),
  Wedding: meta(FiHeart, 'magenta'),
  Business: meta(FiBriefcase, 'violet'),
  Retirement: meta(FiSun, 'sun'),
  Investment: meta(FiTrendingUp, 'magenta'),
  Gadgets: meta(FiMonitor, 'cyan'),
  'Debt Payment': meta(FiCreditCard, 'red'),
  Other: meta(FiTarget, 'gray'),
};

export const habitTypeMeta = {
  saving: meta(FiDollarSign, 'mint'),
  budgeting: meta(FiBarChart2, 'violet'),
  investing: meta(FiTrendingUp, 'magenta'),
  tracking: meta(FiCheckSquare, 'cyan'),
  learning: meta(FiBookOpen, 'sun'),
};

export const debtTypeMeta = {
  'Credit Card': meta(FiCreditCard, 'magenta'),
  'Student Loan': meta(FiBookOpen, 'orange'),
  'Personal Loan': meta(FiUser, 'blue'),
  Mortgage: meta(FiHome, 'violet'),
  'Auto Loan': meta(FiTruck, 'cyan'),
  Medical: meta(FiHeart, 'red'),
  'Business Loan': meta(FiBriefcase, 'violet'),
  'Payday Loan': meta(FiAlertTriangle, 'red'),
  Other: meta(FiFileText, 'gray'),
};

export const categoryIcon = (category, map) => {
  const m = map[category] || COLORS.gray;
  const Icon = m.icon || FiMoreHorizontal;
  return { ...m, icon: Icon };
};

export const chartPalette = ['#6554ff', '#d9167a', '#00d9a6', '#ffc24b', '#4d6bfe', '#ff8a65', '#9d8bff', '#12bf93', '#f564b1', '#38bdf8'];

export const chartAnimation = { duration: 1200, easing: 'easeOutQuart' };
