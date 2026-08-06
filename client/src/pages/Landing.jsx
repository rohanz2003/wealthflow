import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import {
  FiTrendingUp, FiTarget, FiDollarSign, FiPieChart, FiCheckCircle, FiMenu, FiX,
  FiMoon, FiSun, FiArrowRight, FiShield, FiBarChart2, FiStar, FiCheck,
} from 'react-icons/fi';
import { useState } from 'react';
import Logo from '../components/Logo';
import CountUp from '../components/CountUp';
import { expenseCategoryMeta, chartPalette } from '../utils/categoryMeta';

const features = [
  { icon: FiDollarSign, color: 'from-primary-500 to-magenta-500', title: 'Track Income & Expenses', desc: 'Log every transaction with category tagging. See exactly where your money goes with visual breakdowns.' },
  { icon: FiCheckCircle, color: 'from-mint-500 to-mint-700', title: 'Build Financial Habits', desc: 'Set daily, weekly or monthly saving, budgeting, and investing habits. Build streaks and earn consistency rewards.' },
  { icon: FiTarget, color: 'from-sun-400 to-sun-600', title: 'Savings Goals', desc: 'Set targets for emergencies, vacations, retirement. Track progress with beautiful animated progress bars.' },
  { icon: FiBarChart2, color: 'from-blue-500 to-primary-600', title: 'Investment Portfolio', desc: 'Monitor stocks, mutual funds, crypto, and more. See your portfolio allocation at a glance.' },
  { icon: FiPieChart, color: 'from-magenta-500 to-magenta-700', title: 'Wealth Analytics', desc: 'Comprehensive charts showing net worth trends, monthly comparisons, and savings rates.' },
  { icon: FiShield, color: 'from-cyan-500 to-blue-600', title: 'Secure & Private', desc: 'Your financial data is encrypted and private. JWT-secured API with role-based access control.' },
];

const steps = [
  {
    title: 'Track your cash flow',
    desc: 'Log every expense and income in seconds, or manage multiple wallets, bank accounts and cash. WealthFlow keeps everything in one place.',
    points: ['Add cash expenses manually in one tap', 'Track multiple accounts and wallets', 'See your full balance at a glance'],
    color: 'from-primary-500 to-magenta-500',
  },
  {
    title: 'Understand your financial habits',
    desc: 'Analyze your finance with beautiful, simple and easy to understand graphics. No need for complicated Excel sheets.',
    points: ['See where your money goes every month', 'Spending insights and anomaly alerts', 'Financial health score out of 100'],
    color: 'from-mint-500 to-cyan-500',
  },
  {
    title: 'Make your spending stress-free',
    desc: 'Set smart budgets to help you not to overspend in any category. Save money for your future dreams with goal tracking.',
    points: ['Smart budgets with live usage bars', 'Daily savings goals and habit streaks', 'Debt payoff and net worth tracking'],
    color: 'from-sun-400 to-magenta-500',
  },
];

const transactions = [
  { label: 'Rent', value: '- ₹28,000', icon: 'Rent' },
  { label: 'Groceries', value: '- ₹4,850', icon: 'Groceries' },
  { label: 'Dining', value: '- ₹1,240', icon: 'Dining' },
  { label: 'Salary', value: '+ ₹95,000', icon: 'Other' },
];

export default function Landing() {
  const { dark, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-navy-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-navy-950/80 backdrop-blur-xl border-b border-gray-100 dark:border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center group">
              <Logo size={34} />
            </Link>

            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-sm text-gray-600 dark:text-navy-300 hover:text-primary-600 dark:hover:text-primary-300 transition-all duration-200 hover:-translate-y-0.5">Features</a>
              <a href="#how" className="text-sm text-gray-600 dark:text-navy-300 hover:text-primary-600 dark:hover:text-primary-300 transition-all duration-200 hover:-translate-y-0.5">How it works</a>
              <a href="#stats" className="text-sm text-gray-600 dark:text-navy-300 hover:text-primary-600 dark:hover:text-primary-300 transition-all duration-200 hover:-translate-y-0.5">Stats</a>
              <Link to="/login" className="text-sm font-medium text-gray-700 dark:text-navy-200 hover:text-primary-600 dark:hover:text-primary-300 transition-colors">Sign in</Link>
              <Link to="/register" className="btn-primary text-sm">Get Started Free</Link>
              <button
                onClick={toggle}
                aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-gray-600 dark:text-sun-300 shadow-sm hover:bg-gray-50 dark:hover:bg-navy-700 hover:scale-110 hover:rotate-12 transition-all duration-300"
                title={dark ? 'Light mode' : 'Dark mode'}
              >
                {dark ? <FiSun size={18} /> : <FiMoon size={18} />}
              </button>
            </div>

            <div className="flex items-center space-x-2 md:hidden">
              <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-gray-600 dark:text-navy-300">
                {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
              <button
                onClick={toggle}
                aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-gray-600 dark:text-sun-300 shadow-sm transition-all duration-300"
                title={dark ? 'Light mode' : 'Dark mode'}
              >
                {dark ? <FiSun size={18} /> : <FiMoon size={18} />}
              </button>
            </div>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 dark:border-navy-800 bg-white dark:bg-navy-900 animate-fade-down">
            <div className="px-4 py-3 space-y-2">
              <a href="#features" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-xl text-sm text-gray-600 dark:text-navy-300 hover:bg-gray-50 dark:hover:bg-navy-800">Features</a>
              <a href="#how" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-xl text-sm text-gray-600 dark:text-navy-300 hover:bg-gray-50 dark:hover:bg-navy-800">How it works</a>
              <a href="#stats" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-xl text-sm text-gray-600 dark:text-navy-300 hover:bg-gray-50 dark:hover:bg-navy-800">Stats</a>
              <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-navy-200">Sign in</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-xl text-sm font-medium text-white bg-primary-600 text-center shadow-glow">Get Started Free</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 sm:pt-40 sm:pb-32 overflow-hidden gradient-hero">
        <div className="decor-blob w-96 h-96 bg-primary-600/40 top-[-80px] left-[-60px] animate-float-slow" />
        <div className="decor-blob w-80 h-80 bg-magenta-600/30 bottom-[-60px] right-[-40px] animate-float" />
        <div className="decor-blob w-64 h-64 bg-mint-600/20 top-1/3 right-1/4 animate-float-slow" style={{ animationDelay: '1.5s' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-white/10 text-white border border-white/20 mb-6 backdrop-blur-sm animate-fade-down">
                <FiStar className="mr-1.5 text-sun-300" size={14} /> The only app that gets your money into shape
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight animate-fade-up">
                Take full control of your{' '}
                <span className="animated-gradient-text">financial future</span>
              </h1>
              <p className="mt-6 text-lg text-primary-100/80 max-w-xl mx-auto lg:mx-0 leading-relaxed animate-fade-up" style={{ animationDelay: '0.1s' }}>
                Track expenses, build saving habits, set budgets and monitor your investments — all in one beautiful, intelligent dashboard.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-fade-up" style={{ animationDelay: '0.2s' }}>
                <Link to="/register" className="btn-primary text-base px-8 py-3 shadow-glow">
                  Start Free <FiArrowRight className="ml-2" size={18} />
                </Link>
                <a href="#how" className="inline-flex items-center justify-center px-8 py-3 rounded-xl text-base font-semibold border-2 border-white/30 text-white hover:bg-white/10 transition-all duration-300 hover:-translate-y-0.5">
                  Learn More
                </a>
              </div>
              <div className="mt-10 flex items-center justify-center lg:justify-start space-x-8 animate-fade-up" style={{ animationDelay: '0.3s' }}>
                <div>
                  <p className="text-2xl font-extrabold text-white">4.7★</p>
                  <p className="text-xs text-primary-200/70 mt-0.5">App Store rating</p>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div>
                  <p className="text-2xl font-extrabold text-white">UX Awards</p>
                  <p className="text-xs text-primary-200/70 mt-0.5">Mobile UX winner</p>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div>
                  <p className="text-2xl font-extrabold text-white">50K+</p>
                  <p className="text-xs text-primary-200/70 mt-0.5">Transactions tracked</p>
                </div>
              </div>
            </div>

            {/* Phone mockup */}
            <div className="relative hidden sm:block animate-fade-up" style={{ animationDelay: '0.15s' }}>
              <div className="relative mx-auto max-w-[300px]">
                <div className="absolute -inset-6 gradient-primary opacity-30 blur-3xl rounded-full" />
                <div className="relative bg-white dark:bg-navy-900 rounded-[2.5rem] border-8 border-navy-950 dark:border-navy-800 shadow-elevated overflow-hidden">
                  <div className="bg-navy-950 dark:bg-navy-800 h-6 rounded-t-[2rem] flex items-center justify-center">
                    <div className="w-16 h-1.5 bg-white/20 rounded-full" />
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="gradient-primary rounded-2xl p-4 text-white">
                      <p className="text-[10px] text-white/70">Total Balance</p>
                      <p className="text-xl font-extrabold tracking-tight mt-0.5">₹4,82,390</p>
                      <p className="text-[10px] text-mint-200 mt-0.5 flex items-center">
                        <FiTrendingUp className="mr-1" size={11} /> +12.4% this month
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-navy-800 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-semibold text-gray-700 dark:text-navy-200">Monthly Spending</p>
                        <span className="text-[9px] text-gray-400">Dec 1 – Dec 31</span>
                      </div>
                      <div className="flex items-end gap-1.5 h-14">
                        {[45, 62, 38, 74, 52, 88, 60, 42, 70, 55, 80, 66].map((h, i) => (
                          <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: chartPalette[i % chartPalette.length], opacity: 0.85 }} />
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      {transactions.map((t, i) => {
                        const meta = expenseCategoryMeta[t.icon] || expenseCategoryMeta.Other;
                        const Icon = meta.icon;
                        return (
                          <div key={i} className="flex items-center justify-between bg-white dark:bg-navy-800 border border-gray-100 dark:border-navy-700 rounded-xl px-3 py-2">
                            <div className="flex items-center space-x-2">
                              <div className={`w-7 h-7 rounded-lg ${meta.bg} ${meta.text} flex items-center justify-center`}>
                                <Icon size={13} />
                              </div>
                              <p className="text-[11px] font-medium text-gray-700 dark:text-navy-200">{t.label}</p>
                            </div>
                            <p className={`text-[11px] font-semibold ${t.value.startsWith('+') ? 'text-mint-600 dark:text-mint-400' : 'text-gray-900 dark:text-white'}`}>{t.value}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Floating cards */}
                <div className="absolute -left-16 top-16 card p-3 animate-float shadow-glow">
                  <p className="text-[10px] text-gray-500 dark:text-navy-400">Savings Goal</p>
                  <p className="text-sm font-extrabold text-gray-900 dark:text-white">Vacation ✦ 68%</p>
                  <div className="mt-1.5 w-24 h-1.5 bg-gray-100 dark:bg-navy-700 rounded-full overflow-hidden">
                    <div className="h-full w-[68%] bg-gradient-to-r from-mint-500 to-mint-600 rounded-full progress-shimmer" />
                  </div>
                </div>
                <div className="absolute -right-14 top-1/2 card p-3 animate-float-slow" style={{ animationDelay: '1s' }}>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-sun-100 dark:bg-sun-900/30 text-sun-600 dark:text-sun-400 flex items-center justify-center"><FiTarget size={14} /></div>
                    <div>
                      <p className="text-[10px] text-gray-500 dark:text-navy-400">Budget left</p>
                      <p className="text-sm font-extrabold text-gray-900 dark:text-white">₹6,450</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-6 left-8 card p-3 animate-float" style={{ animationDelay: '0.6s' }}>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-sun-100 dark:bg-sun-900/30 text-sun-600 dark:text-sun-400 flex items-center justify-center"><FiCheckCircle size={14} /></div>
                    <div>
                      <p className="text-[10px] text-gray-500 dark:text-navy-400">Habit streak</p>
                      <p className="text-sm font-extrabold text-gray-900 dark:text-white">14 days</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="py-16 bg-gray-50 dark:bg-navy-900 border-b border-gray-100 dark:border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: 10000, label: 'Active Users', format: (v) => `${Math.round(v / 1000)}K+` },
              { value: 50000, label: 'Transactions Tracked', format: (v) => `${Math.round(v / 1000)}K+` },
              { value: 95, label: 'Satisfaction Rate', format: (v) => `${Math.round(v)}%` },
              { value: 247, label: 'Access Your Data', format: (v) => (v >= 247 ? '24/7' : '') },
            ].map((s, i) => (
              <div key={i} className="text-center reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
                <p className="text-3xl sm:text-4xl font-extrabold text-gradient">
                  <CountUp value={s.value} format={s.format} />
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-navy-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 reveal">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-primary-50 dark:bg-navy-800 text-primary-700 dark:text-primary-300 mb-5 border border-primary-200/60 dark:border-navy-700">
              Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Everything you need to manage your money
            </h2>
            <p className="mt-4 text-lg text-gray-500 dark:text-navy-300 max-w-2xl mx-auto">
              From tracking daily expenses to growing long-term wealth — WealthFlow has you covered.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="card p-7 card-hover reveal" style={{ transitionDelay: `${(i % 3) * 0.1}s` }}>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white mb-5 shadow-lg transition-transform duration-300 group-hover:scale-110 hover:scale-110 hover:rotate-6`}>
                  <f.icon size={22} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-gray-500 dark:text-navy-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20 bg-gray-50 dark:bg-navy-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 reveal">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-mint-100 dark:bg-mint-900/30 text-mint-700 dark:text-mint-300 mb-5 border border-mint-200/60 dark:border-mint-800">
              How it works
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              How to get your <span className="text-gradient">money into shape?</span>
            </h2>
          </div>
          <div className="space-y-16">
            {steps.map((step, i) => (
              <div key={i} className="grid md:grid-cols-2 gap-10 items-center">
                <div className={`${i % 2 === 1 ? 'md:order-2' : ''} reveal-${i % 2 === 1 ? 'right' : 'left'}`}>
                  <div className="flex items-center space-x-4 mb-5">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white text-lg font-extrabold shadow-lg`}>
                      {i + 1}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{step.title}</h3>
                  </div>
                  <p className="text-gray-500 dark:text-navy-300 leading-relaxed mb-6">{step.desc}</p>
                  <ul className="space-y-3">
                    {step.points.map((pt, j) => (
                      <li key={j} className="flex items-start space-x-3">
                        <span className={`mt-0.5 w-5 h-5 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center shrink-0`}>
                          <FiCheck size={11} className="text-white" />
                        </span>
                        <span className="text-sm text-gray-700 dark:text-navy-200">{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={`${i % 2 === 1 ? 'md:order-1' : ''} reveal-${i % 2 === 1 ? 'left' : 'right'}`}>
                  <div className="card p-6 relative overflow-hidden group">
                    <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br ${step.color} opacity-15 group-hover:opacity-25 transition-opacity duration-500`} />
                    {i === 0 && (
                      <div className="space-y-3">
                        {[
                          { label: 'Salary', value: '₹95,000', color: 'from-mint-500 to-mint-600', tag: 'income' },
                          { label: 'Rent', value: '₹28,000', color: 'from-primary-500 to-primary-700', tag: 'expense' },
                          { label: 'Groceries', value: '₹4,850', color: 'from-magenta-500 to-magenta-700', tag: 'expense' },
                          { label: 'Dining', value: '₹1,240', color: 'from-sun-400 to-sun-600', tag: 'expense' },
                        ].map((tx, j) => (
                          <div key={j} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-navy-800 rounded-xl border border-gray-100 dark:border-navy-700 transition-transform duration-300 hover:translate-x-1">
                            <div className="flex items-center space-x-3">
                              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${tx.color} flex items-center justify-center text-white`}>
                                {tx.tag === 'income' ? <FiTrendingUp size={15} /> : <FiDollarSign size={15} />}
                              </div>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">{tx.label}</p>
                            </div>
                            <p className={`text-sm font-bold ${tx.tag === 'income' ? 'text-mint-600 dark:text-mint-400' : 'text-gray-900 dark:text-white'}`}>{tx.value}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {i === 1 && (
                      <div className="flex items-end gap-2 h-48">
                        {[35, 55, 40, 65, 48, 78, 60, 45, 70, 52, 85, 64].map((h, j) => (
                          <div key={j} className="flex-1 rounded-lg transition-all duration-500 hover:scale-105" style={{ height: `${h}%`, background: `linear-gradient(to top, ${step.color.includes('mint') ? '#00d9a6' : '#6554ff'}, #d9167a)` }} />
                        ))}
                      </div>
                    )}
                    {i === 2 && (
                      <div className="space-y-4">
                        {[
                          { label: 'Food & Drink', pct: 62, color: 'from-magenta-500 to-magenta-700', value: '₹21,420' },
                          { label: 'Travel', pct: 50, color: 'from-sun-400 to-sun-600', value: '₹13,670' },
                          { label: 'Shopping', pct: 35, color: 'from-primary-500 to-magenta-500', value: '₹8,900' },
                        ].map((b, j) => (
                          <div key={j}>
                            <div className="flex justify-between text-sm mb-1.5">
                              <span className="font-medium text-gray-700 dark:text-navy-200">{b.label}</span>
                              <span className="font-semibold text-gray-900 dark:text-white">{b.value}</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-navy-700 rounded-full h-2.5 overflow-hidden">
                              <div className={`h-full rounded-full bg-gradient-to-r ${b.color} progress-shimmer`} style={{ width: `${b.pct}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="gradient-hero rounded-3xl p-10 sm:p-14 text-center relative overflow-hidden card-hover reveal">
            <div className="decor-blob w-64 h-64 bg-primary-600/50 -top-20 -left-20 animate-float-slow" />
            <div className="decor-blob w-64 h-64 bg-magenta-600/40 -bottom-20 -right-20 animate-float" />
            <div className="relative">
              <Logo size={48} withText={false} className="mx-auto mb-6 animate-float" />
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
                Ready to transform your finances?
              </h2>
              <p className="text-lg text-primary-200/80 mb-8 max-w-xl mx-auto">
                Join thousands of users who have taken control of their financial future. Start your journey today.
              </p>
              <Link to="/register" className="btn-primary text-base px-8 py-3 shadow-glow">
                Create Free Account <FiArrowRight className="ml-2" size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-navy-950 border-t border-gray-100 dark:border-navy-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link to="/" className="flex items-center">
              <Logo size={30} />
            </Link>
            <p className="text-sm text-gray-500 dark:text-navy-400">
              &copy; {new Date().getFullYear()} WealthFlow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
