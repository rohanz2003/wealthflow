# WealthFlow — Detailed Project Report

**Project Name:** WealthFlow — Financial Habit Builder & Wealth Growth Tracker
**Version:** 1.0.0
**Repository:** https://github.com/rohanz2003/wealthflow
**Report Date:** August 6, 2026

---

## 1. Executive Summary

WealthFlow is a full-stack MERN (MongoDB, Express.js, React, Node.js) web application designed to help users take control of their personal finances by building consistent money habits, tracking income and expenses, setting savings goals, monitoring investments and debts, and projecting long-term wealth growth.

The application combines traditional expense tracking with a behavioral-psychology approach — a built-in **financial habit tracker** with streaks and completion history — so users don't just record money movements but actively build the routines that improve financial health. A proprietary **Financial Health Score** (0–100) synthesizes savings rate, habit consistency, goal progress, investment activity, and expense discipline into a single actionable metric.

The frontend is a modern, Spendee/Wealthstreet-inspired UI with a violet–magenta–mint brand palette, full dark/light theming, scroll-reveal animations, count-up statistics, and fully responsive mobile-first layouts. The backend is a secure, rate-limited Express API with JWT authentication, role-based access (user/admin), in-memory caching, input validation, and graceful-degradation MongoDB connectivity.

---

## 2. Project Objectives

1. **Simplify personal finance tracking** — provide a single platform for income, expenses, budgets, savings, debts, and investments.
2. **Build financial habits, not just records** — gamify consistency with streaks, best-streak tracking, and daily completion flows.
3. **Make financial health measurable** — compute a transparent Health Score and stability indicators (emergency fund months, debt-to-income ratio, habit strength, income diversity).
4. **Project the future** — goal-completion timelines, monthly surplus, and 1/3/5/10/20-year wealth projection scenarios (conservative / current / aggressive).
5. **Deliver a professional-grade UX** — Spendee-inspired design system, animations, dark mode, mobile responsiveness, and accessibility-minded components.

---

## 3. Problem Statement & Motivation

Most finance apps are either too complex (full accounting suites) or too passive (dumb expense logs). Users commonly report:

- **No guidance** on *what to do* — they log money but never improve.
- **No habit layer** — saving is a one-time event, not a routine.
- **No forward view** — apps show the past but not whether the user is on track for retirement, a house, or a vacation.
- **Generic dashboards** — no single score that tells them "how healthy am I financially?"

WealthFlow addresses this by combining tracking, habit formation, analytics, and projection into one cohesive experience with an admin platform for platform-wide oversight.

---

## 4. Scope

### In Scope
- User registration, login, profile management, password change, JWT refresh-token flow.
- Income & expense tracking with 20 expense / 12 income categories.
- Monthly category budgets with per-month/year selection and over-budget alerts.
- Financial habit tracker (daily/weekly/monthly) with streaks and 7-day history view.
- Savings goals with targets, target dates, "Add Funds", and AI-style projections.
- Debt tracking with type, interest rate, minimum payment, due date, payoff progress.
- Investment portfolio with type, current value, return rate.
- Wealth analytics: net worth trend, income vs expenses, expense breakdown, portfolio allocation, 30-day balance trend.
- Insights engine: spending anomalies, month-over-month trend, top categories, expense ratio, personalized recommendations.
- Goal & wealth projections; dashboard with Health Score and stability analysis.
- Admin panel: platform KPIs, user management, engagement metrics.
- Dark/light themes, animations, responsive mobile design.

### Out of Scope (Current Version)
- Bank/Payment gateway integrations and real-time transaction sync.
- Multi-currency conversion (single ₹ currency symbol; amounts stored as numbers).
- Mobile native apps (web application only; mobile-first responsive).
- Email/SMS notifications.

---

## 5. Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend framework | React | 18.2 |
| Routing | React Router (v6) | 6.21 |
| Build tool | Vite | 5.0 |
| Styling | Tailwind CSS | 3.4 |
| Charts | Chart.js + react-chartjs-2 | 4.4 / 5.2 |
| Icons | react-icons (Feather set) | 4.12 |
| HTTP client | Axios | 1.6 |
| Backend | Node.js + Express | 4.18 |
| Database | MongoDB (Mongoose ODM) | 7.6 |
| Authentication | JWT (jsonwebtoken) + bcryptjs | 9.0 / 2.4 |
| Validation | express-validator | 7.0 |
| Security | Helmet, CORS, express-rate-limit, cookie-parser | — |
| Logging | Morgan + custom logger | 1.11 |
| Testing | Jest + Supertest (server), Cypress (client E2E config) | 30.4 / — |
| Code quality | ESLint, lint-staged, Husky pre-commit hooks | — |
| Deployment | Vercel (client), Render (server), MongoDB Atlas | — |

**Shared constants module** (`shared/constants.js`) keeps category enums identical between server models and client lists, guaranteeing DB-validated values always match the UI.

---

## 6. System Architecture

```
┌────────────────────────────┐          ┌──────────────────────────────┐
│  React SPA (Vercel)        │  HTTPS   │  Express API (Render)        │
│  /login /register /landing │ ───────► │  /api/*                      │
│  /dashboard /expenses ...  │  CORS    │  Auth JWT · Rate limit       │
│  Lazy-loaded pages         │          │  Cache layer (LRU, in-mem)   │
└────────────────────────────┘          └──────────────┬───────────────┘
                                                       │ Mongoose
                                                ┌──────▼───────────────┐
                                                │ MongoDB Atlas        │
                                                │ 8 collections        │
                                                └──────────────────────┘
```

### 6.1 Client Architecture
- **Code splitting:** every protected page is lazy-loaded via `React.lazy` + `Suspense`, producing per-page JS chunks.
- **Contexts:** `AuthContext` (user, token, login/logout) and `ThemeContext` (dark/light, persisted to localStorage).
- **Protected routing:** `PrivateRoute` redirects unauthenticated users; authenticated users are redirected away from `/login` and `/register`.
- **Reusable components:** `Logo`, `Navbar` (with "More" dropdown containing every tab), `Select` (custom app-styled dropdown), `CountUp` (animated numbers), `RevealObserver` (scroll-reveal via IntersectionObserver + MutationObserver).
- **Design system:** Tailwind config with brand palette (`primary` violet #6554ff, `magenta` #d9167a, `mint` #00d9a6, `sun` #ffc24b, `navy` dark scale) plus custom keyframes (fade-up/down, pop-in, float, shimmer, page-in, gradient pan). `index.css` defines reusable component classes (`.card`, `.stat-card`, `.btn-primary`, `.input-field`, `.badge-*`, `.modal-*`, `.gradient-*`, `.reveal` system) with `prefers-reduced-motion` fallback.

### 6.2 Server Architecture
- **Middleware pipeline:** `helmet` → `compression` → `morgan` → CORS (dynamic origin allowlist) → `express.json` (10 kb limit) → cookie parser → global rate limiter (100 req/15 min) → routes → error handler.
- **Controllers:** routes use `asyncHandler` wrapper and centralized `AppError` + `errorHandler`.
- **Caching:** in-memory LRU-style cache (`utils/cache.js`, max 100 entries, TTL per endpoint, 30–120 s) with `invalidateUserCache` on writes.
- **Graceful degradation:** server keeps running if MongoDB is temporarily unavailable; `/api/health` reports DB connection state; unhandled rejections and SIGTERM/SIGINT shut down cleanly.
- **Seeding:** `server/seed.js` creates 10 realistic users (1 admin) with 6 months of generated incomes, expenses, habits, goals, budgets, investments, and debts.

---

## 7. Module-wise Features

### 7.1 Authentication & Profiles (`/api/auth`)
- Register with name/email/password validation (8+ chars, upper, lower, digit); login with **account lockout after 5 failed attempts (30 min lock)** and per-IP rate limit (10 req/15 min).
- **JWT dual-token flow:** 15-minute access token (httpOnly cookie + returned in body) and 7-day rotating refresh token stored as a SHA-256 hash, with `/refresh` endpoint.
- Logout clears cookies and invalidates the refresh token server-side.
- Profile: occupation, monthly income, bio; joined/last-active tracking; password change forces re-login.

### 7.2 Income & Expense Tracking (`/api/income`, `/api/expenses`)
- Add/edit/delete transactions with title, amount, category, date, description; recurring flag on expenses.
- **20 expense categories** (Food, Groceries, Dining, Food Delivery, Transport, Fuel, Rent, Utilities, Entertainment, Shopping, Healthcare, Education, Insurance, Travel, Subscriptions, Fitness, Pets, Gifts, Personal Care, Other) and **12 income categories** (Salary, Freelance, Investment, Business, Rental, Gift, Bonus, Dividends, Interest, Refund, Side Hustle, Other) — validated server-side via shared enums.
- Search, filter by category, tabbed expenses/incomes views.

### 7.3 Budgets (`/api/budgets`)
- Set monthly limits per category for a specific month/year; one budget per category per period.
- Aggregates: total budgeted, total spent, remaining, usage %, per-category progress bars with over-budget highlighting; categories without a budget surfaced as suggestions.

### 7.4 Financial Habits (`/api/habits`)
- Habit name, description, frequency (daily/weekly/monthly), type (saving, budgeting, investing, tracking, learning).
- **Streak engine:** completing on consecutive days increments streak; best streak tracked; completion history stores dated entries (prevents double-completion per day).
- Stats: active habits, completed today, longest streak, all-time completions.
- 7-day weekday strip per habit; pause/resume; guided empty state with 5 one-click starter habits; toast feedback.

### 7.5 Savings Goals (`/api/savings`)
- Goal title, target amount, category (14 types), target date, description; "Add Funds" flow; completion detection (auto-badge when current ≥ target).
- **Goal projections** (`/api/analytics/goal-projections`): months-to-goal at current monthly surplus, projected completion date, needed monthly savings to hit the target date, on-track/off-track status.

### 7.6 Debts (`/api/debts`)
- Debt name, type (9 types), total amount, remaining, interest rate, minimum payment, due date.
- Aggregates: total debt, total original, paid-off amount, payoff percentage; debt-to-income ratio in stability analysis.

### 7.7 Investments (`/api/investments`)
- Name, type (Stocks, Mutual Funds, Fixed Deposit, Real Estate, Gold, Crypto, Bonds, PPF, NPS, Other), invested amount, current value, return rate, notes.

### 7.8 Dashboard (`/api/dashboard`)
- Monthly income/expense, total savings, total invested, **net worth** (= savings + investments − debt), savings rate.
- **Financial Health Score (0–100):** 30 pts savings rate (≥20% target), 20 pts goal completion, 20 pts active habits (≥3), 15 pts invested, 15 pts expense ratio discipline.
- 30-day daily balance trend, expense breakdown by category, active habits, overall goal progress, recent habits.
- 30-second response caching.

### 7.9 Analytics & Insights (`/api/analytics`)
- **KPIs:** habit completion rate (actual vs expected), goal completion rate, monthly cashflow, investment total, transaction volumes.
- **Monthly activity:** 12-month income/expense/savings series.
- **Spending insights:** anomaly detection (category spending >150% of 3-month average, with high/medium severity), spending trend vs prior quarter, top 3 categories with % of total, expense ratio, and rule-based recommendations (spending warnings, savings-rate nudges, concentration alerts).
- **Wealth projections:** net worth, monthly savings, average return rate, and conservative/current/aggressive scenarios compounded monthly over 1/3/5/10/20 years (future value with annuity + current portfolio growth).
- **Stability:** emergency-fund months (target 6, adequacy rating), debt-to-income (low ≤20 / moderate ≤40 / high), habit strength, income diversity (low/medium/high).

### 7.10 Admin Platform (`/api/admin`, `/api/analytics/admin/kpis`)
- Platform KPIs: total users, monthly/weekly active users, engagement rate, total habits & completions, goal progress, total expense/income volumes, transaction counts.
- User management: list/search/pagination, per-user stats, delete with cascade cleanup of all user data.

### 7.11 UI/UX Highlights
- **Spendee-inspired design:** violet→magenta gradients, colored category icon chips, deep-navy dark mode, soft rounded cards, glowing CTAs.
- **Animations:** scroll reveals with staggered delays, count-up numbers, animated chart transitions, page transitions, floating decorations, hover micro-interactions, shimmer progress bars — all disabled under `prefers-reduced-motion`.
- **Custom dropdowns:** a `Select` component replaces native `<select>`s everywhere with app-styled panels (icon chips, check marks, rotate chevrons, outside-click/Escape close).
- **Navigation:** sticky glassmorphism navbar with core tabs + "More" dropdown containing all tabs (incl. Settings/Admin); mobile hamburger menu.
- **Professional identity:** custom gradient "W" logo (favicon + navbar), no emoji icons, Plus Jakarta Sans typography.

---

## 8. Database Design (MongoDB Collections)

| Collection | Key Fields | Indexes |
|---|---|---|
| `users` | name, email (unique), password (bcrypt, salt 12), role, profile {occupation, monthlyIncome, bio, avatar}, refreshToken (SHA-256), loginAttempts, lockUntil, lastActive, createdAt | lastActive −1, role 1, createdAt −1 |
| `expenses` | user, title, amount (min 0), category (enum), date, description, isRecurring | user+date, user+category |
| `incomes` | user, source, amount, category (enum), date, description | user+date, user+category |
| `budgets` | user, category, monthlyLimit (min 1), month, year | user+month+year, user+category |
| `habits` | user, name, description, frequency (enum), type (enum), streak, longestStreak, totalCompletions, isActive, history [{date, completed}] | user, user+isActive |
| `savingsgoals` | user, title, description, targetAmount, currentAmount, category (enum), targetDate, isCompleted | user |
| `debts` | user, name, type (enum), totalAmount, remainingAmount, interestRate, minimumPayment, dueDate, isPaidOff | user |
| `investments` | user, name, type (enum), amount, currentValue, returnRate, date, notes | user, user+type |

All monetary values are stored as **numbers** and formatted as ₹ on the client (`formatCurrency`).

---

## 9. API Endpoint Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | — | Health check incl. Mongo connection state |
| POST | `/api/auth/register` | rate-limited | Create account, set cookies |
| POST | `/api/auth/login` | rate-limited | Login, lockout handling |
| POST | `/api/auth/refresh` | — | Rotate refresh token → new access token |
| POST | `/api/auth/logout` | user | Invalidate refresh token, clear cookies |
| GET | `/api/auth/me` | user | Current user profile |
| PUT | `/api/auth/profile` | user | Update occupation/income/bio |
| PUT | `/api/auth/password` | user | Change password |
| GET/POST | `/api/income` | user | List/create incomes (paginated) |
| PUT/DELETE | `/api/income/:id` | user | Update/delete income |
| GET/POST | `/api/expenses` | user | List/create expenses (paginated) |
| PUT/DELETE | `/api/expenses/:id` | user | Update/delete expense |
| GET/POST | `/api/budgets` | user | List/create budgets (per month/year) |
| PUT/DELETE | `/api/budgets/:id` | user | Update/delete budget |
| GET/POST | `/api/habits` | user | List/create habits (paginated) |
| PUT/DELETE | `/api/habits/:id` | user | Update/pause / delete habit |
| POST | `/api/habits/:id/complete` | user | Mark completed (streak engine) |
| GET | `/api/habits/stats` | user | Habit statistics |
| GET/POST | `/api/savings` | user | List/create savings goals |
| PUT/DELETE | `/api/savings/:id` | user | Update (incl. add funds) / delete |
| GET/POST | `/api/investments` | user | List/create investments |
| PUT/DELETE | `/api/investments/:id` | user | Update/delete investment |
| GET/POST | `/api/debts` | user | List/create debts |
| PUT/DELETE | `/api/debts/:id` | user | Update/delete debt |
| GET | `/api/dashboard` | user | Dashboard aggregates + Health Score (cached 30 s) |
| GET | `/api/analytics/kpis` | user | Personal KPIs (cached 60 s) |
| GET | `/api/analytics/monthly-activity` | user | 12-month series (cached 60 s) |
| GET | `/api/analytics/spending-insights` | user | Anomalies & recommendations (cached 120 s) |
| GET | `/api/analytics/goal-projections` | user | Goal timelines (cached 60 s) |
| GET | `/api/analytics/wealth-projections` | user | Net worth scenarios (cached 120 s) |
| GET | `/api/analytics/stability` | user | Stability indicators (cached 120 s) |
| GET | `/api/analytics/admin/kpis` | admin | Platform KPIs (cached 120 s) |
| GET | `/api/admin/users` | admin | List/search users with per-user stats |
| DELETE | `/api/admin/users/:id` | admin | Delete user + cascade cleanup |

---

## 10. Security

- **Passwords:** bcryptjs with salt rounds 12; hashed at save time via pre-save hook.
- **JWT:** 15-minute access token signed with `JWT_SECRET`; refresh tokens are 40-byte random values stored as SHA-256 hashes, rotated on every refresh.
- **Cookies:** httpOnly, `secure` in production, `sameSite` strict (dev) / none (production).
- **Brute-force protection:** login/register rate limiter (10/15 min) + account lockout after 5 failures (30 min, with remaining-time messaging).
- **Global rate limit:** 100 requests/15 min per IP on `/api/`.
- **Header hardening:** Helmet defaults; CORS origin allowlist (falls back to open only in production if `CLIENT_URL` unset, with a startup warning).
- **Input validation:** express-validator on all auth/creation routes; body size limited to 10 kb.
- **Authorization:** `auth` middleware on all data routes; `admin` middleware gates admin endpoints; every query scoped to `req.userId` (multi-tenant isolation).
- **Secrets:** `.env` git-ignored; `.env.example` documents required vars; server refuses to start without `MONGODB_URI`/`JWT_SECRET`.

---

## 11. Performance & Optimization

- **Code splitting:** 10 lazy-loaded page chunks → small initial bundle (~178 kB main).
- **Response caching:** per-user LRU cache with TTLs (30–120 s) on the most expensive aggregations; cache invalidated on relevant writes.
- **Lean queries:** `.lean()` everywhere for read paths; `Promise.all` for parallel aggregation.
- **Pagination** on list endpoints (limit ≤100) with total/page metadata.
- **Compression middleware** (gzip) and **HTTP/2-ready** static hosting on Vercel.
- **DB indexes** on all hot query paths (user-scoped + date/category/status).
- **Frontend:** memoized computed values, truncated long text, responsive grid layouts to avoid layout shift.

---

## 12. Testing & Quality

- **Unit tests (Jest + Supertest):** `server/tests/calculations.test.js` covers savings-rate math, health-score scoring (boundaries), goal progress, category aggregation, and daily balance mapping. `npm test` runs with coverage; `test:calc` runs the calculations suite.
- **CI / pre-commit:** Husky + lint-staged run the test suite on staged server files before every commit; git history shows CI pipeline setup (Vercel previews).
- **E2E scaffold:** Cypress configured (`cypress.config.js`, spec scaffolding) in the client.
- **ESLint** configured for the server.
- **Verification standard:** every feature change ships with a successful production build (`vite build`) and a passing test run.

---

## 13. Development Timeline

| Date | Milestone |
|---|---|
| Jul 23 | First commit; login/register flow with React Router future flags |
| Jul 23 | Complete redesign: landing page, dark/light mode, professional styling |
| Jul 24 | Analytics, budgets, debts, insights pages; auth security, caching, mobile-responsive design |
| Jul 24 | 34 security/quality/UX fixes; 10 realistic seed users; pagination; code splitting; accessibility |
| Jul 24 | Admin panel with full data tracking + delete cascade cleanup |
| Jul 27 | Professional UI styling; Jest tests; async handler; logger; CI; E2E; pre-commit hooks |
| Jul 27 | Clickable profile in navbar; profile card; profile editing in settings |
| Jul 29 | Production deployment: Atlas DNS fix, ₹ currency across app, graph accuracy fixes, Vercel SPA config |
| Jul 29–30 | Cross-origin auth fixes (sameSite=none), CORS hardening, Render config |
| Aug 5 | RevealObserver fix (MutationObserver); profile hero redesign; dashboard layout rebalance |
| Aug 6 | Habit tracker UX overhaul; navbar "More" dropdown; app-styled custom dropdowns; expanded category enums (20 expense / 12 income); mobile fixes; Savings card layout |

---

## 14. Deployment

| Component | Platform | Notes |
|---|---|---|
| Frontend | **Vercel** | `vercel.json` SPA rewrite → `index.html`; production API base URL injected; CI previews per commit |
| Backend | **Render** | `PORT`, `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL` env vars; `trust proxy` set; graceful shutdown on SIGTERM |
| Database | **MongoDB Atlas** | SRV connection; seed script blocks production execution; DNS workaround (Google DNS) for Node SRV resolution |

**Environment variables (`server/.env`):** `PORT`, `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV`, `CLIENT_URL`.

---

## 15. Future Scope

1. **Bank & payment integrations** (Plaid/Razorpay-style) for automatic transaction import.
2. **Multi-currency support** with live FX rates.
3. **Notifications** (email/push) for habit reminders, budget breaches, and due bills.
4. **Saving AI recommendations** — category-level optimization and spending guardrails.
5. **Mobile apps** (React Native re-use of the API).
6. **CSV/PDF export** and tax-relevant reports.
7. **Social/family goal sharing** and collaborative budgets.
8. **Progressive Web App** (offline cache, installable).

---

## 16. Conclusion

WealthFlow delivers a complete, production-grade personal finance platform that goes beyond tracking: it builds habits, scores financial health, detects anomalies, and projects wealth across multiple scenarios. With a modern Spendee-inspired interface, secure and scalable Node/Mongo backend, tested calculation engines, and full admin oversight, the application is ready for real users and architected for clear next steps — integrations, automation, and mobile.

---

## Appendix A — Project Structure

```
wealthflow/
├── client/                  # React SPA (Vite)
│   ├── public/              # favicon.svg (gradient W logo)
│   ├── src/
│   │   ├── components/      # Logo, Navbar, Select, CountUp, RevealObserver, PrivateRoute
│   │   ├── context/         # AuthContext, ThemeContext
│   │   ├── pages/           # Landing, Login, Register, Dashboard, ExpenseTracker,
│   │   │                    # Budgets, HabitTracker, SavingsGoals, Debts,
│   │   │                    # WealthAnalytics, Insights, Settings, AdminPanel
│   │   ├── utils/           # categoryMeta, formatCurrency
│   │   ├── App.jsx          # Routes + lazy loading + layout
│   │   └── index.css        # Design system + animations
│   ├── cypress/             # E2E specs
│   ├── tailwind.config.js   # Brand palette + keyframes
│   └── vercel.json          # SPA rewrites
├── server/                  # Express API
│   ├── config/db.js         # MongoDB connection
│   ├── middleware/          # auth, admin, errorHandler
│   ├── models/              # User, Expense, Income, Budget, Habit,
│   │                        # SavingsGoal, Debt, Investment
│   ├── routes/              # auth, income, expense, budget, habit, savings,
│   │                        # investment, debt, dashboard, analytics, admin, user
│   ├── tests/               # Jest unit tests
│   ├── utils/               # calculations, cache, logger, asyncHandler, AppError
│   ├── seed.js              # Demo data generator
│   └── server.js            # App entry, middleware pipeline
└── shared/constants.js      # Category/type enums shared by client & server
```

## Appendix B — Quick Start

```bash
# 1. Install all dependencies
npm run install:all

# 2. Configure server/.env (see server/.env.example)
#    MONGODB_URI, JWT_SECRET, CLIENT_URL

# 3. Seed demo data (development only)
npm run seed

# 4. Run development (server :5000, client :5173)
npm run dev

# 5. Tests & build
npm test
npm run build
```
