# WealthFlow — Project Feedback Video Script

**Goal:** Record a screen demo (with narration) that walks through the entire application.
**Total target duration:** ~8–10 minutes
**Tip:** Record screen at 1920x1080, browser at fullscreen, use the dark theme for a premium look (toggle in navbar).

---

## 1. Opening Speech (~45 seconds)

> "Hello everyone! Welcome to WealthFlow — a full-stack personal finance manager that helps you track your money, build better habits, and plan your financial future.
>
> WealthFlow is built with a **React** front end styled with **Tailwind CSS**, and a **Node.js + Express** backend powered by **MongoDB**. It features secure JWT authentication, role-based access for admin and regular users, and a clean, responsive interface that works beautifully on mobile and desktop alike.
>
> Let me walk you through everything WealthFlow can do — starting with the dashboard."

---

## 2. Feature Walkthrough (Tab by Tab)

### 2.1 Landing Page + Login (~45 seconds)
- Show the landing page: hero section, feature highlights.
- Demo **Register**: note the live password-strength checker (must contain uppercase, lowercase, number, 8+ chars).
- Demo **Login** using demo credentials: `admin@wealthflow.com / Admin@123` (or `ravi@wealthflow.com / User@123`).
- Mention: dark/light theme toggle, session stays active with secure token refresh.

### 2.2 Dashboard (~1 minute)
- Narrate: "The dashboard gives you the complete financial picture at a glance."
- Show: total income, total expenses, net savings cards with animated counters, category-wise expense breakdown chart, recent transactions list, and quick links to every module.
- Mention: all numbers update live as you add data anywhere in the app.

### 2.3 Expenses (~1 minute)
- "Track every rupee that goes out — and every rupee that comes in."
- Expenses tab: add an expense (title, amount, category, date, description), show it appear in the list with category filter and search.
- Edit an existing expense — amounts update correctly.
- Income tab: add income (source, amount, category), show the totals card update.
- Delete a record; note the dashboard totals change instantly.

### 2.4 Budgets (~45 seconds)
- "Set a monthly budget per category to keep your spending in check."
- Create a budget (category, monthly limit, month/year), show the progress bar with percentage used.
- Edit the limit — the progress indicator recalculates immediately.

### 2.5 Habits (~45 seconds)
- "Wealth isn't just about tracking — it's about behavior."
- Add a financial habit (e.g., "No impulse shopping", type: Saving/Spending, frequency: Daily/Weekly, custom days).
- Show the streak counter, completion toggle, and weekly progress.
- Pause a habit and reactivate it.

### 2.6 Savings (~1 minute)
- "Set goals and watch them grow."
- Create a savings goal (title, target amount, target date, category).
- Add current amount via **Update Progress** — the completion percentage bar animates and the goal auto-marks as completed when reached.
- Show how goals feed into dashboard net savings.

### 2.7 Debts (~45 seconds)
- "Never lose track of what you owe."
- Add a debt (credit card / loan / mortgage / personal), amount, interest rate, minimum payment.
- Make a payment — remaining balance drops, status shows Paying Off/Paid.
- Show the total outstanding debt summary.

### 2.8 Wealth / Analytics (~1 minute)
- "See your complete wealth picture and monthly trends."
- Charts: income vs expenses vs net savings over time, category-wise expense breakdown.
- Show the mobile-friendly responsive behavior (resize the window — charts adapt).

### 2.9 Insights (~1 minute)
- "WealthFlow analyzes your data and tells you what's working — and what's not."
- Show automated recommendations: emergency fund adequacy (months of expenses), spending alerts, and personalized money-saving suggestions generated from your actual data.

### 2.10 Admin Panel (if demoing admin account) (~45 seconds)
- "As an admin, you get full visibility and control."
- User management: view all users, roles (admin/user), account status, delete users, export user data.

### 2.11 Settings (~30 seconds)
- "Manage your profile."
- Update name, email, password, and profile preferences.

---

## 3. Closing Statement (~45 seconds)

> "And that's WealthFlow — from tracking daily expenses to building life-changing habits, setting savings goals, paying down debt, and getting intelligent insights, it's a complete personal finance companion.
>
> The project is fully open source, tested with a unit test suite on the backend plus end-to-end Cypress tests, and includes role-based security and robust data export. Thank you for watching — we'd love your feedback!"

---

## 4. Production Notes
- **Timing:** Keep each section tight; if the video runs long, cut 2.5/2.6 or 2.10.
- **Credentials used:** `admin@wealthflow.com / Admin@123` (Admin demo) and `ravi@wealthflow.com / User@123` (User demo).
- **Ordering:** Follow the navbar order so viewers can navigate along with you.
- **Audio:** Narrate clearly, pause 1–2s after each action so viewers can read the screen.
- **Post-editing:** Add captions for accessibility; trim dead air between actions.
