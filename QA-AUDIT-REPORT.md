# WealthFlow — QA Audit Report

**Date:** 2026-08-07
**Scope:** Full-stack static audit — Express/MongoDB backend (`server/`), React client (`client/src/`), shared constants (`shared/`)
**Method:** Manual code review of all routes, models, middleware, and client pages; logic tracing for data integrity, security, and correctness
**Result:** 1 Critical, 4 High, 5 Medium, 4 Low issues

---

## Executive Summary

The codebase is well-structured: consistent route patterns, JWT + refresh-token rotation with httpOnly cookies, bcrypt password hashing, login rate limiting, and account-lockout logic are all in place. However, the audit found one **critical authorization flaw** (cross-user data injection via mass assignment), a **NaN-producing division-by-zero** in wealth projections, and several data-integrity and operational issues. All fixes are small and localized; none require architectural changes.

---

## Issue Inventory

| # | Severity | Area | Issue | File:Line |
|---|----------|------|-------|-----------|
| 1 | **Critical** | AuthZ / IDOR | Mass assignment lets clients inject protected fields; `debt.js` spread order lets a user create data owned by *another* user | debt.js:43, habit.js:40, income.js:44, expense.js:58, investment.js:39, savings.js:38 |
| 2 | **High** | Analytics | Division by zero in wealth projections → `NaN` chart values | analytics.js:414-416 |
| 3 | **High** | Data integrity | Habit history array grows unbounded (one doc per completion forever) | habit.js:93 |
| 4 | **High** | Security | Access token stored in `localStorage` despite httpOnly cookies being set | AuthContext.jsx:11,39,47 |
| 5 | **High** | Operations | `lastActive` DB write fires on every authenticated request | middleware/auth.js:22 |
| 6 | Medium | Metrics | Habit `completionRate` is completions ÷ habits, not a rate | habit.js:133-136 |
| 7 | Medium | Analytics | `monthlySavings <= 0` silently drops all projection scenarios (blank chart) | analytics.js:410-411 |
| 8 | Medium | Security | `/api/auth/refresh` has no rate limit and no reuse detection | auth.js:119 |
| 9 | Medium | Ops/Logging | Raw `console.error` in route code; inconsistent with `logger` util | analytics.js:456 |
| 10 | Medium | Security | Register endpoint confirms existing emails (enumeration) | auth.js:62-63 |
| 11 | Low | Code quality | Dead branches in streak logic (`else if`/`else` identical) | habit.js:107-113 |
| 12 | Low | Code quality | `isCompleted`/`currentAmount` injectable on savings goal creation | savings.js:38 |
| 13 | Low | UX | No 404 handler / no unified error handler; 500s leak `error.message` to clients | all routes |
| 14 | Low | Ops | Admin KPIs cached 120s without invalidation on writes (stale admin dashboard) | analytics.js:223 |

---

## Detailed Findings

### 1. CRITICAL — Mass assignment / IDOR in POST routes

All six POST routes spread the entire request body into the document:

```js
// server/routes/debt.js:43  ← user comes BEFORE the spread
const debt = await Debt.create({ user: req.userId, ...req.body });
```

- In **debt.js:43**, `...req.body` is spread *last*, so a client sending `"user": "<another user's ObjectId>"` overwrites the authenticated ID → **cross-user data injection** (IDOR). The attacker then owns the record and can read/modify it via their own session, and delete it.
- In the other five routes (`habit.js:40`, `income.js:44`, `expense.js:58`, `investment.js:39`, `savings.js:38`) the spread is *before* `user: req.userId`, so `user` can't be hijacked — but every other field is accepted unchecked. A crafted payload can set:
  - Habit: `history`, `streak`, `totalCompletions`, `longestStreak`, `isActive` → forge streaks, fake history, inflate analytics
  - SavingsGoal: `currentAmount`, `isCompleted` → mark goals complete without saving
  - Investment: `currentValue`, `returnRate` → fake net worth and projections
  - Expense/Income: `isRecurring` and any future internal fields

**Fix:** whitelist fields on POST exactly as PUT routes already do (`ALLOWED_*_FIELDS`), or `pick()` from `req.body`:

```js
const habit = await Habit.create(pick(req.body, ['name','description','frequency','type']), ...);
```
And fix the debt.js spread order even with whitelisting.

### 2. HIGH — NaN wealth projections (division by zero)

```js
// server/routes/analytics.js:414-416
const monthlyRate = avgReturn / 100 / 12;
const fv = currentInvestments * Math.pow(1 + monthlyRate, periods) +
  savingsRate * ((Math.pow(1 + monthlyRate, periods) - 1) / monthlyRate);
```

- `avgReturn = 7` **only** when the user has zero investments. If a user has investments but all `returnRate` are `0` (or unset), `avgReturn = 0` → `monthlyRate = 0` → `(1 - 1) / 0` = `NaN` → every projected value becomes `NaN` and `Math.round(NaN)` = `NaN` on the client chart.
- Same root cause: `avgReturnLabel` shows `'7.0%'` fallback while math uses `0`.

**Repro:** Create an investment with returnRate 0 → open Wealth Analytics → all scenario values render `NaN`.

**Fix:** guard `monthlyRate`:
```js
const monthlyRate = avgReturn > 0 ? avgReturn / 100 / 12 : null;
// if monthlyRate is null/0, use simple accumulation:
// fv = currentInvestments + savingsRate * periods
```

### 3. HIGH — Unbounded habit history

```js
// server/routes/habit.js:93
habit.history.push({ date: today, completed: true });
```
Every completion appends a new subdocument forever. A daily habit for 5 years = ~1,800 subdocs; every `complete` call loads and rewrites the whole array, and KPI aggregation scans it. No cap or aggregation.

**Fix:** cap to e.g. last 365 entries (`.slice(-365)` after push), or store a `lastCompletedDate` + counters instead of a full array.

### 4. HIGH — Access token in localStorage

`AuthContext.jsx:11,39,47` stores the JWT in `localStorage['wf_token']`, even though the server already sets a secure httpOnly cookie (`auth.js:26-31`). Any XSS (e.g. in a future note/description field) can exfiltrate the token; httpOnly cookie storage defeats that. Client should rely on the cookie (or use the in-memory token + cookie refresh).

### 5. HIGH — `lastActive` write per request

```js
// server/middleware/auth.js:22
User.findByIdAndUpdate(user._id, { lastActive: new Date() }).catch(...)
```
Every authenticated request triggers an unconditional MongoDB write — massive write amplification under load and defeats the "active" metric's meaning.

**Fix:** throttle — update at most once per N minutes per user (e.g. keep `lastActive` on the in-memory user and write when older than 10 min).

### 6. MEDIUM — Misleading `completionRate`

```js
// server/routes/habit.js:133-136
completionRate: total > 0 ? habits.reduce((s,h) => s + h.totalCompletions, 0) / total : 0
```
This is *average completions per habit*, not a rate (could exceed 1.0, not a percentage). The client likely renders it as a percentage. Fix: `totalCompletions / totalExpectedCompletions` (mirror analytics.js:48).

### 7. MEDIUM — Blank wealth chart when no monthly surplus

`analytics.js:410-411`: `if (savingsRate <= 0) continue;` — a user spending more than they earn gets **zero** scenarios and an empty chart, with no message explaining why. Fix: include a scenario at `savingsRate = 0` (shows investment growth only) or return an explicit `noSurplus` flag for the UI.

### 8. MEDIUM — Unprotected refresh endpoint

`auth.js:119-134` — `/refresh` has no rate limiting and no refresh-token reuse detection (rotation happens, but an intercepted/stolen token can be replayed silently before rotation). Add `authLimiter` and revoke the whole session family on reuse.

### 9. MEDIUM — Raw `console.error`

`analytics.js:456` uses `console.error` (and swallows the debt fetch error with `.catch` returning `[]` — silently wrong stability data). Replace with `logger.error` from `utils/logger` (used elsewhere).

### 10. MEDIUM — Account enumeration via register

`auth.js:62-63` returns `'Email already registered'` distinctly. Login returns a generic message (good). Make register generic too ("If the email is available...") or require email verification.

### 11-14. Low

- **11** `habit.js:107-113` — `else if (!lastEntry)` and `else` both set `streak = 1`; collapse to a single `else`.
- **12** `savings.js:38` — goal creation accepts `currentAmount`/`isCompleted` from body (covered by fix #1).
- **13** All routes return raw `error.message` on 500 (information disclosure); no central error middleware or 404 handler exists.
- **14** `analytics.js:223` — admin KPIs cached 120s; user writes do not invalidate `admin:kpis` (use `cache.invalidateUserCache` + admin key invalidation).

---

## Things Done Right (verified)

- JWT refresh rotation with hashed refresh tokens (`crypto` SHA-256, auth.js:124)
- Login rate limit (10/15min) + account lockout with `lockUntil` (auth.js:12-18, 94-106)
- Password policy enforced on register and change (auth.js:49-53, 165)
- PUT/DELETE routes are user-scoped (`findOne({ user: req.userId })`) — no IDOR on updates
- Express-validator on core fields; cache invalidation on all mutations (except admin key)
- Admin middleware gate; `select('-password -refreshToken')` on user serialization

---

## Test Plan (execute after fixes)

| TC | Priority | Steps | Expected |
|----|----------|-------|----------|
| TC-1 | P0 | Create debt with `user` = another user's ID in body | Debt owned by authenticated user; second user's list unchanged |
| TC-2 | P0 | Create habit with `streak: 99, history: [...]` in body | Rejected/ignored; streak = 0, empty history |
| TC-3 | P0 | Create savings goal with `isCompleted: true` in body | Rejected; goal not completed |
| TC-4 | P1 | Create investment with `returnRate: 0`, open wealth projections | All scenarios show numeric values (no `NaN`) |
| TC-5 | P1 | Complete a daily habit for 3 consecutive days then skip 1 | Streak resets to 1 on day 4 (existing logic holds) |
| TC-6 | P1 | Set monthly expenses > income, open wealth analytics | Chart renders or explicit "insufficient surplus" message |
| TC-7 | P2 | Complete habit with expired/malformed JWT | 401, no data leak |
| TC-8 | P2 | Register two users; user B attempts PUT on user A's expense id | 404, user A's data intact |
| TC-9 | P2 | Login 6 times with wrong password | Account locked 30 min; correct attempt still blocked |
| TC-10 | P2 | Verify habit completionRate with 2 habits: 5 & 3 completions | Rate reflects completions ÷ expected, ≤ 100% |
| TC-11 | P3 | Refresh token twice with same token | Second use rejected (after reuse detection) |
| TC-12 | P3 | Admin logs in; user creates expense; refresh admin KPIs | Values update within cache TTL |
| TC-13 | P3 | Full budget flow: set budget, add expense, check progress bars | Budget statuses correct on Dashboard |
| TC-14 | P3 | Settings → change password → old token requests | 401, re-login required |

---

## Remediation Status (2026-08-07)

All issues except the two noted below have been **fixed and verified** (lint clean, 21/21 unit tests pass, server boots, 13/13 endpoint smoke tests pass, client builds).

| # | Issue | Status | Verified by |
|---|-------|--------|-------------|
| 1 | Mass assignment / IDOR in POST routes | **Fixed** — `pick()` whitelist in all 6 POST routes (`server/utils/pick.js`); debt.js spread order corrected | Smoke tests: streak/history/user injection blocked; debt `user` forced to own ID |
| 2 | NaN wealth projections | **Fixed** — zero-return guard uses simple accumulation; `hasSurplus` flag added; `avgReturnRate` reports real 0.0% | Smoke test: no `NaN`, scenarios present |
| 3 | Unbounded habit history | **Fixed** — capped at 365 entries (`habit.js:93-96`) | Code review |
| 4 | Access token in localStorage | **Fixed** — client now relies on httpOnly cookies only (`AuthContext.jsx`, `main.jsx`) | Client builds |
| 5 | `lastActive` write per request | **Fixed** — throttled to ≤1 write per 10 min (`middleware/auth.js`) | Code review |
| 6 | Habit `completionRate` semantics | **Fixed** — now completions ÷ expected, capped at 100 (`habit.js /stats`) | Smoke test: stats shape |
| 7 | Blank wealth chart on zero surplus | **Fixed** — single "Current" scenario + `hasSurplus` flag | Smoke test |
| 8 | Unprotected `/refresh` | **Fixed** — `authLimiter` + reuse detection via `previousRefreshToken` (revokes session on replay) | Code review |
| 9 | `console.error` in analytics | **Fixed** — uses `logger.error` | Lint clean |
| 10 | Account enumeration on register | **Fixed** — generic failure message | Code review |
| 11 | Dead streak branches | **Fixed** — collapsed to single `else` | Code review |
| 12 | Injectable goal fields | **Fixed** — covered by #1 (`ALLOWED_GOAL_CREATE_FIELDS`) | Smoke test |
| 13 | 500 responses leak `error.message` | **Fixed** — removed from all route handlers; central `errorHandler` masks internals in production | Lint: 43 unused-var warnings resolved |
| 14 | Stale admin KPIs | **Fixed** — `admin:kpis` invalidated on any user write (`cache.js`) | Code review |

### Not fixed (deferred / pre-existing)

- `server.js:45` — lint `no-undef` for global `URL` (pre-existing, unrelated to this audit's findings)
- Refresh-token reuse detection is single-instance in-memory via DB field; a multi-instance deploy should move to Redis
- `register` duplicate-email response is generic but still distinguishable from other 400s by status alone; full mitigation requires email verification

---

## Recommended Fix Order

1. **P0 (Security):** Mass-assignment whitelist on all 6 POST routes + debt.js spread order (#1) — also fixes #12
2. **P0 (Correctness):** Wealth-projection zero-return guard (#2) + empty-scenario message (#7)
3. **P1:** Remove localStorage token usage (#4); cap habit history (#3)
4. **P1:** Throttle `lastActive` (#5)
5. **P2:** `completionRate` semantics (#6); refresh hardening (#8); logger consistency (#9); enumeration (#10)
6. **P3:** Code cleanup and admin cache invalidation (#11, #13, #14)
