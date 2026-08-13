# WealthFlow - Comprehensive Test Plan

## Project Overview
**Application:** WealthFlow - Financial Habit Builder & Wealth Growth Tracker
**Version:** 1.0.0
**Test Plan Version:** 1.0
**Date:** 2026-08-13

---

## 1. Test Strategy

### 1.1 Testing Levels
- **Unit Tests** - Individual functions and modules (Jest)
- **Integration Tests** - API endpoints and database interactions (Jest + Supertest)
- **End-to-End Tests** - Full user workflows (Cypress)
- **Security Tests** - Authentication, authorization, input validation
- **Performance Tests** - Load testing, response times

### 1.2 Test Environment
- **Backend:** Node.js 20+, Express, MongoDB (Mongoose)
- **Frontend:** React 18, Vite, Tailwind CSS
- **Test Framework:** Jest (backend), Cypress (frontend E2E)
- **Coverage Target:** >80% for critical paths

### 1.3 Test Data Management
- Use separate test database (MongoDB)
- Seed data for consistent test runs
- Clean up after each test suite

---

## 2. Test Cases by Module

### 2.1 Authentication Module

| Test Case ID | Description | Priority | Type | Expected Result |
|--------------|-------------|----------|------|-----------------|
| AUTH-001 | Register with valid data | High | Unit/Integration | 201 Created, user created, tokens issued |
| AUTH-002 | Register with invalid email | High | Unit/Integration | 400 Bad Request, validation error |
| AUTH-003 | Register with weak password | High | Unit/Integration | 400 Bad Request, password requirements error |
| AUTH-004 | Register with duplicate email | High | Unit/Integration | 400/409, duplicate error |
| AUTH-005 | Login with valid credentials | High | Unit/Integration | 200 OK, tokens issued |
| AUTH-006 | Login with invalid email | High | Unit/Integration | 400 Bad Request |
| AUTH-007 | Login with wrong password | High | Unit/Integration | 400 Bad Request, attempt counter incremented |
| AUTH-008 | Login with locked account | High | Unit/Integration | 423 Locked, retry-after header |
| AUTH-009 | Refresh token valid | High | Unit/Integration | 200 OK, new tokens issued |
| AUTH-010 | Refresh token invalid/expired | High | Unit/Integration | 401 Unauthorized, logout triggered |
| AUTH-011 | Refresh token reuse detection | High | Unit/Integration | 401 Unauthorized, tokens revoked |
| AUTH-012 | Logout clears cookies | High | Unit/Integration | 200 OK, cookies cleared |
| AUTH-013 | GET /me with valid token | High | Unit/Integration | 200 OK, user data returned |
| AUTH-014 | GET /me without token | High | Unit/Integration | 401 Unauthorized |
| AUTH-015 | Password change with valid current password | Medium | Unit/Integration | 200 OK, tokens revoked |
| AUTH-016 | Password change with invalid current password | Medium | Unit/Integration | 400 Bad Request |
| AUTH-017 | Profile update with valid data | Medium | Unit/Integration | 200 OK, profile updated |
| AUTH-018 | Profile update with invalid currency | Medium | Unit/Integration | 400 Bad Request |

### 2.2 Expense Tracker Module

| Test Case ID | Description | Priority | Type | Expected Result |
|--------------|-------------|----------|------|-----------------|
| EXP-001 | Create expense with valid data | High | Unit/Integration | 201 Created, expense created |
| EXP-002 | Create expense with missing title | High | Unit/Integration | 400 Bad Request |
| EXP-003 | Create expense with invalid amount | High | Unit/Integration | 400 Bad Request |
| EXP-004 | Create expense with invalid category | High | Unit/Integration | 400 Bad Request |
| EXP-005 | List expenses with pagination | High | Unit/Integration | 200 OK, paginated results |
| EXP-006 | List expenses with date filter | Medium | Unit/Integration | 200 OK, filtered results |
| EXP-007 | List expenses with category filter | Medium | Unit/Integration | 200 OK, filtered results |
| EXP-008 | List expenses with search | Medium | Unit/Integration | 200 OK, search results |
| EXP-009 | Update expense | High | Unit/Integration | 200 OK, expense updated |
| EXP-010 | Update expense with invalid amount | High | Unit/Integration | 400 Bad Request |
| EXP-011 | Delete expense | High | Unit/Integration | 200 OK, expense deleted |
| EXP-012 | Delete non-existent expense | Medium | Unit/Integration | 404 Not Found |
| EXP-013 | Get expense summary | Medium | Unit/Integration | 200 OK, summary with totals by category |

### 2.3 Income Tracker Module

| Test Case ID | Description | Priority | Type | Expected Result |
|--------------|-------------|----------|------|-----------------|
| INC-001 | Create income with valid data | High | Unit/Integration | 201 Created, income created |
| INC-002 | Create income with missing source | High | Unit/Integration | 400 Bad Request |
| INC-003 | Create income with invalid amount | High | Unit/Integration | 400 Bad Request |
| INC-004 | Create income with invalid category | Medium | Unit/Integration | 400 Bad Request |
| INC-005 | List income with pagination | High | Unit/Integration | 200 OK, paginated results |
| INC-006 | List income with search | Medium | Unit/Integration | 200 OK, search results |
| INC-007 | Update income | High | Unit/Integration | 200 OK, income updated |
| INC-008 | Delete income | High | Unit/Integration | 200 OK, income deleted |

### 2.4 Habit Tracker Module

| Test Case ID | Description | Priority | Type | Expected Result |
|--------------|-------------|----------|------|-----------------|
| HAB-001 | Create habit with valid data | High | Unit/Integration | 201 Created, habit created |
| HAB-002 | Create habit with missing name | High | Unit/Integration | 400 Bad Request |
| HAB-003 | Create habit with invalid frequency | Medium | Unit/Integration | 400 Bad Request |
| HAB-004 | List habits | High | Unit/Integration | 200 OK, paginated results |
| HAB-005 | Update habit | High | Unit/Integration | 200 OK, habit updated |
| HAB-006 | Delete habit | High | Unit/Integration | 200 OK, habit deleted |
| HAB-007 | Complete habit for today | High | Unit/Integration | 200 OK, streak incremented |
| HAB-008 | Complete habit twice same day | High | Unit/Integration | 400 Bad Request, already completed |
| HAB-009 | Habit streak calculation (daily) | High | Unit/Integration | Correct streak count |
| HAB-010 | Habit streak calculation (weekly) | Medium | Unit/Integration | Correct streak count |
| HAB-011 | Habit streak calculation (monthly) | Medium | Unit/Integration | Correct streak count |
| HAB-012 | Get habit stats | Medium | Unit/Integration | 200 OK, stats returned |
| HAB-013 | Toggle habit active/inactive | Medium | Unit/Integration | 200 OK, status changed |

### 2.5 Savings Goals Module

| Test Case ID | Description | Priority | Type | Expected Result |
|--------------|-------------|----------|------|-----------------|
| SAV-001 | Create savings goal with valid data | High | Unit/Integration | 201 Created, goal created |
| SAV-002 | Create goal with missing title | High | Unit/Integration | 400 Bad Request |
| SAV-003 | Create goal with invalid target amount | High | Unit/Integration | 400 Bad Request |
| SAV-004 | List goals | High | Unit/Integration | 200 OK, paginated results |
| SAV-005 | Update goal | High | Unit/Integration | 200 OK, goal updated |
| SAV-006 | Update goal - mark as completed | Medium | Unit/Integration | isCompleted=true when current>=target |
| SAV-007 | Delete goal | High | Unit/Integration | 200 OK, goal deleted |
| SAV-008 | Add funds to goal | High | Unit/Integration | 200 OK, currentAmount increased |
| SAV-009 | Goal projections calculation | Medium | Unit/Integration | Correct months to goal |

### 2.6 Investment Module

| Test Case ID | Description | Priority | Type | Expected Result |
|--------------|-------------|----------|------|-----------------|
| INV-001 | Create investment with valid data | High | Unit/Integration | 201 Created, investment created |
| INV-002 | Create investment with missing name | High | Unit/Integration | 400 Bad Request |
| INV-003 | Create investment with invalid amount | High | Unit/Integration | 400 Bad Request |
| INV-004 | List investments | High | Unit/Integration | 200 OK, paginated results |
| INV-005 | Update investment | High | Unit/Integration | 200 OK, investment updated |
| INV-006 | Update investment with invalid return rate | Medium | Unit/Integration | 400 Bad Request |
| INV-007 | Delete investment | High | Unit/Integration | 200 OK, investment deleted |

### 2.7 Debt Module

| Test Case ID | Description | Priority | Type | Expected Result |
|--------------|-------------|----------|------|-----------------|
| DBT-001 | Create debt with valid data | High | Unit/Integration | 201 Created, debt created |
| DBT-002 | Create debt with missing name | High | Unit/Integration | 400 Bad Request |
| DBT-003 | Create debt with invalid amounts | High | Unit/Integration | 400 Bad Request |
| DBT-004 | List debts with summary | High | Unit/Integration | 200 OK, debts + totals |
| DBT-005 | Update debt | High | Unit/Integration | 200 OK, debt updated |
| DBT-006 | Delete debt | High | Unit/Integration | 200 OK, debt deleted |

### 2.8 Budget Module

| Test Case ID | Description | Priority | Type | Expected Result |
|--------------|-------------|----------|------|-----------------|
| BUD-001 | Create budget with valid data | High | Unit/Integration | 201 Created, budget created |
| BUD-002 | Create budget with missing category | High | Unit/Integration | 400 Bad Request |
| BUD-003 | Create budget with invalid limit | High | Unit/Integration | 400 Bad Request |
| BUD-004 | List budgets with spending | High | Unit/Integration | 200 OK, budgets + spent amounts |
| BUD-005 | Update budget | High | Unit/Integration | 200 OK, budget updated |
| BUD-006 | Delete budget | High | Unit/Integration | 200 OK, budget deleted |
| BUD-007 | Duplicate budget updates existing | Medium | Unit/Integration | 200 OK, existing updated |

### 2.9 Dashboard & Analytics Module

| Test Case ID | Description | Priority | Type | Expected Result |
|--------------|-------------|----------|------|-----------------|
| DASH-001 | Get dashboard data | High | Unit/Integration | 200 OK, all summary data |
| DASH-002 | Dashboard caching works | Medium | Unit/Integration | Cached response on second call |
| DASH-003 | Get KPIs | High | Unit/Integration | 200 OK, KPI data |
| DASH-004 | Get monthly activity | Medium | Unit/Integration | 200 OK, 12 months data |
| DASH-005 | Get spending insights | Medium | Unit/Integration | 200 OK, anomalies + recommendations |
| DASH-006 | Get goal projections | Medium | Unit/Integration | 200 OK, projections per goal |
| DASH-007 | Get wealth projections | Medium | Unit/Integration | 200 OK, scenarios |
| DASH-008 | Get financial stability | Medium | Unit/Integration | 200 OK, stability metrics |
| DASH-009 | Admin KPIs (admin only) | High | Unit/Integration | 200 OK (admin), 403 (user) |

### 2.10 User Module

| Test Case ID | Description | Priority | Type | Expected Result |
|--------------|-------------|----------|------|-----------------|
| USR-001 | Export user data | Medium | Unit/Integration | 200 OK, JSON with all data |
| USR-002 | Delete account | High | Unit/Integration | 200 OK, all data deleted |

### 2.11 Admin Module

| Test Case ID | Description | Priority | Type | Expected Result |
|--------------|-------------|----------|------|-----------------|
| ADM-001 | List users with stats (admin) | High | Unit/Integration | 200 OK, users with stats |
| ADM-002 | Delete user (admin) | High | Unit/Integration | 200 OK, user + data deleted |
| ADM-003 | Admin analytics (admin) | High | Unit/Integration | 200 OK, platform analytics |
| ADM-004 | Non-admin access denied | High | Unit/Integration | 403 Forbidden |

---

## 3. Frontend E2E Test Cases (Cypress)

### 3.1 Authentication Flows

| Test Case ID | Description | Priority | Steps |
|--------------|-------------|----------|-------|
| FE-AUTH-001 | User registration flow | High | Visit /register → Fill form → Submit → Redirected to dashboard |
| FE-AUTH-002 | User login flow | High | Visit /login → Fill form → Submit → Redirected to dashboard |
| FE-AUTH-003 | Login with invalid credentials | High | Visit /login → Fill invalid data → Submit → Error shown |
| FE-AUTH-004 | Logout flow | High | Login → Click logout → Redirected to landing |
| FE-AUTH-005 | Protected route redirect | High | Visit /dashboard without auth → Redirected to /login |
| FE-AUTH-006 | Token refresh on expiry | Medium | Login → Wait for token expiry → Make API call → Auto refresh |

### 3.2 Dashboard

| Test Case ID | Description | Priority | Steps |
|--------------|-------------|----------|-------|
| FE-DASH-001 | Dashboard loads with data | High | Login → Visit /dashboard → Stats cards visible |
| FE-DASH-002 | Charts render correctly | Medium | Login → Visit /dashboard → Charts visible |
| FE-DASH-003 | Navigation to other pages | High | Login → Click nav links → Correct pages load |

### 3.3 Expense Tracker

| Test Case ID | Description | Priority | Steps |
|--------------|-------------|----------|-------|
| FE-EXP-001 | Add expense | High | Visit /expenses → Click Add → Fill form → Submit → Expense in list |
| FE-EXP-002 | Edit expense | High | Visit /expenses → Click edit → Modify → Save → Updated in list |
| FE-EXP-003 | Delete expense | High | Visit /expenses → Click delete → Confirm → Removed from list |
| FE-EXP-004 | Filter expenses | Medium | Visit /expenses → Select category filter → List filtered |
| FE-EXP-005 | Search expenses | Medium | Visit /expenses → Type in search → List filtered |

### 3.4 Habit Tracker

| Test Case ID | Description | Priority | Steps |
|--------------|-------------|----------|-------|
| FE-HAB-001 | Create habit | High | Visit /habits → Click New Habit → Fill form → Submit → Habit in list |
| FE-HAB-002 | Complete habit | High | Visit /habits → Click Complete → Toast shown → Streak updated |
| FE-HAB-003 | Habit streak display | Medium | Visit /habits → Verify streak counter |
| FE-HAB-004 | Weekly/monthly habit | Medium | Create weekly habit → Verify frequency label |

### 3.5 Savings Goals

| Test Case ID | Description | Priority | Steps |
|--------------|-------------|----------|-------|
| FE-SAV-001 | Create savings goal | High | Visit /savings → Click New Goal → Fill form → Submit → Goal in list |
| FE-SAV-002 | Add funds to goal | High | Visit /savings → Click Add Funds → Enter amount → Submit → Progress updated |
| FE-SAV-003 | Goal progress bar | Medium | Visit /savings → Verify progress bar matches percentage |

### 3.6 Settings

| Test Case ID | Description | Priority | Steps |
|--------------|-------------|----------|-------|
| FE-SET-001 | Update profile | High | Visit /settings → Click Edit → Modify → Save → Changes reflected |
| FE-SET-002 | Change password | High | Visit /settings → Fill password form → Submit → Success message |
| FE-SET-003 | Export data | Medium | Visit /settings → Click Export → File downloaded |
| FE-SET-004 | Delete account | High | Visit /settings → Type DELETE → Click Delete → Account deleted |

---

## 4. Security Test Cases

| Test Case ID | Description | Priority | Type | Expected Result |
|--------------|-------------|----------|------|-----------------|
| SEC-001 | SQL/NoSQL injection prevention | Critical | Integration | Input sanitized, no injection |
| SEC-002 | XSS prevention in search | Critical | Integration | Script tags escaped |
| SEC-003 | CSRF protection | High | Integration | SameSite cookies, CSRF tokens |
| SEC-004 | Rate limiting on auth | High | Integration | 429 after threshold |
| SEC-005 | Rate limiting on API | High | Integration | 429 after threshold |
| SEC-006 | JWT token expiration | High | Unit | 15min access, 7d refresh |
| SEC-007 | Password hashing (bcrypt 12) | Critical | Unit | Hashed, not plaintext |
| SEC-008 | Refresh token rotation | High | Unit | New token on each refresh |
| SEC-009 | Refresh token reuse detection | High | Unit | Tokens revoked on reuse |
| SEC-010 | Secure cookies in production | High | Integration | Secure, HttpOnly, SameSite |
| SEC-011 | CORS configuration | High | Integration | Only allowed origins |
| SEC-012 | Helmet headers | Medium | Integration | CSP, X-Frame-Options, etc. |
| SEC-013 | Input validation on all endpoints | High | Integration | 400 for invalid input |
| SEC-014 | Admin authorization | Critical | Integration | 403 for non-admin |
| SEC-015 | Object ID validation | Medium | Integration | 400 for invalid IDs |

---

## 5. Performance Test Cases

| Test Case ID | Description | Priority | Target |
|--------------|-------------|----------|--------|
| PERF-001 | Dashboard load time | High | < 2s |
| PERF-002 | API response time (p95) | High | < 500ms |
| PERF-003 | Concurrent users (100) | Medium | No errors |
| PERF-004 | Database query optimization | Medium | < 100ms per query |
| PERF-005 | Frontend bundle size | Medium | < 300KB gzipped |

---

## 6. Accessibility Test Cases

| Test Case ID | Description | Priority | Standard |
|--------------|-------------|----------|----------|
| A11Y-001 | Keyboard navigation | High | WCAG 2.1 AA |
| A11Y-002 | Screen reader support | High | WCAG 2.1 AA |
| A11Y-003 | Color contrast | High | WCAG 2.1 AA |
| A11Y-004 | Focus indicators | High | WCAG 2.1 AA |
| A11Y-005 | Form labels | High | WCAG 2.1 AA |

---

## 7. Cross-Browser Test Cases

| Browser | Version | Priority |
|---------|---------|----------|
| Chrome | Latest 2 versions | High |
| Firefox | Latest 2 versions | High |
| Safari | Latest 2 versions | High |
| Edge | Latest 2 versions | Medium |

---

## 8. Mobile Responsiveness Test Cases

| Test Case ID | Description | Priority | Breakpoints |
|--------------|-------------|----------|-------------|
| MOB-001 | Dashboard layout | High | 320px, 768px, 1024px, 1440px |
| MOB-002 | Form usability | High | 320px, 768px |
| MOB-003 | Chart readability | Medium | 320px, 768px |
| MOB-004 | Navigation menu | High | 320px, 768px |

---

## 9. Test Execution Schedule

| Phase | Duration | Tests | Responsible |
|-------|----------|-------|-------------|
| Unit Tests | Continuous | All unit tests | Developers |
| Integration Tests | Per PR | All integration tests | CI/CD |
| E2E Tests | Per Release | Critical path E2E | QA |
| Security Tests | Per Release | All security tests | Security Team |
| Performance Tests | Monthly | All perf tests | DevOps |
| Accessibility Audit | Quarterly | All a11y tests | QA |

---

## 10. Defect Management

### 10.1 Severity Levels
- **Critical** - Security vulnerability, data loss, system crash
- **High** - Major feature broken, API error
- **Medium** - Minor feature issue, UI bug
- **Low** - Cosmetic issue, enhancement

### 10.2 Priority Levels
- **P0** - Fix immediately (blocking release)
- **P1** - Fix within 24 hours
- **P2** - Fix within 1 week
- **P3** - Fix in next sprint

### 10.3 Jira Ticket Template
```
Summary: [MODULE] Brief description
Description:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment
- Screenshots/Logs
Severity: [Critical/High/Medium/Low]
Priority: [P0/P1/P2/P3]
Labels: [module, test-type, sprint]
```

---

## 11. Test Reports

### 11.1 Metrics to Track
- Test coverage (target: >80%)
- Test pass rate (target: 100% for critical)
- Defect density
- Mean time to detect (MTTD)
- Mean time to resolve (MTTR)

### 11.2 Report Frequency
- **Daily:** CI/CD pipeline results
- **Per Sprint:** Test summary report
- **Per Release:** Full test report with metrics

---

## 12. Sign-off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| QA Lead | | | |
| Development Lead | | | |
| Product Owner | | | |
| Security Officer | | | |

---

*Document Version: 1.0 | Last Updated: 2026-08-13*