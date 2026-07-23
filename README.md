# WealthFlow

Financial Habit Builder & Wealth Growth Tracker

A full-stack MERN application for tracking personal finances, building savings habits, and monitoring wealth growth.

## Features

- **Income & Expense Tracking** — Log and categorize all transactions
- **Habit Tracker** — Build financial habits with streaks and completion history
- **Savings Goals** — Set targets, track progress, add funds
- **Investment Portfolio** — Track investments and their current value
- **Wealth Analytics** — Charts for income vs expenses, net worth trend, expense breakdown, and portfolio allocation
- **Admin Panel** — Platform-wide analytics and user management

## Tech Stack

- **Frontend:** React 18, React Router 6, Chart.js, Tailwind CSS, Vite
- **Backend:** Express.js, Mongoose, JWT, bcryptjs
- **Database:** MongoDB

## Getting Started

```bash
# Install dependencies
npm run install:all

# Set up environment variables in server/.env
# MONGODB_URI=mongodb://localhost:27017/wealthflow
# JWT_SECRET=your_secret_key

# Seed sample data (optional)
npm run seed

# Start development
npm run dev
```

Server runs on `http://localhost:5000`, client on `http://localhost:5173`.
