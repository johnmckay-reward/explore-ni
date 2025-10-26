# QA Test Execution Guide

This guide provides step-by-step instructions for executing the comprehensive QA test suite for Epic 9.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Running Manual Tests](#running-manual-tests)
4. [Running Automated E2E Tests](#running-automated-e2e-tests)
5. [Test Results & Reporting](#test-results--reporting)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Software Requirements

- **Node.js** v18 or higher
- **npm** v9 or higher
- **Chrome Browser** (for Cypress)
- **Git**

### Access Requirements

- GitHub repository access
- Test Stripe account (Test Mode)
- Test Twilio account (optional, for SMS tests)
- Test SendGrid account (optional, for email tests)

---

## Environment Setup

### 1. Clone and Install

```bash
# Clone repository
git clone <repository-url>
cd explore-ni

# Install API dependencies
cd api
npm install

# Install UI dependencies
cd ../ui
npm install
```

### 2. Configure API Environment

```bash
# Copy environment template
cd api
cp .env.example .env

# Edit .env file with required settings
nano .env
```

Required `.env` variables:
```env
# Database (SQLite for testing)
DATABASE_URL=sqlite:./database.sqlite

# Encryption (generate using: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
SETTINGS_ENCRYPTION_SECRET=your-32-byte-hex-string

# Server
PORT=3000
JWT_SECRET=your-jwt-secret
```

### 3. Seed QA Test Data

```bash
# From api directory
cd api

# Run QA-specific seed script
node config/seed-qa.js
```

This creates:
- 7 test user accounts (admin, vendors, customers)
- 3 test experiences (auto-confirm, manual-confirm, pending)
- Availability slots for next 7 days
- Test vouchers
- Hotel partner for landing page tests

### 4. Configure API Keys via Admin UI

**Important:** API keys are now stored in encrypted database, not in `.env`

```bash
# Start API server
cd api
npm start
```

In another terminal:
```bash
# Start UI development server
cd ui
npm start
```

Then:
1. Navigate to `http://localhost:4200/login`
2. Login as admin: `admin@exploreni.com` / `admin123`
3. Go to `/admin/settings`
4. Configure all API keys:
   - **STRIPE_SECRET_KEY**: `sk_test_...` (from Stripe Test Mode)
   - **STRIPE_WEBHOOK_SECRET**: `whsec_...` (from Stripe Webhooks)
   - **TWILIO_ACCOUNT_SID**: Your Twilio SID
   - **TWILIO_AUTH_TOKEN**: Your Twilio token
   - **TWILIO_PHONE_NUMBER**: E.164 format (e.g., `+447700900000`)
   - **SENDGRID_API_KEY**: `SG.` (from SendGrid)
   - **PAYPAL_CLIENT_ID**: Optional
   - **PAYPAL_CLIENT_SECRET**: Optional

---

## Running Manual Tests

### Overview

Manual tests are documented in `QA_TEST_PLAN.md` and organized by user flow.

### Test Execution Process

1. **Open QA Test Plan:**
   ```bash
   open QA_TEST_PLAN.md
   ```

2. **Execute tests in order:**
   - Start with **Admin Flow Tests** (ADMIN-001 to ADMIN-005)
   - Then **Vendor Flow Tests** (VENDOR-001 to VENDOR-006)
   - Then **Customer & Public Flow Tests** (PUBLIC-001 to CUSTOMER-002)
   - Then **Core E2E Tests** (E2E-001 to E2E-005)
   - Finally **Non-Functional Tests** (NONFUNC-001 to SECURITY-001)

3. **Mark results in test plan:**
   - Update status for each test: `[x] PASS` or `[x] FAIL`
   - Document any issues in "Known Issues" section

4. **Take screenshots of critical flows:**
   - Booking confirmation pages
   - Payment success screens
   - Error messages
   - Admin approval workflows

### Example: Running ADMIN-001 (Admin Login)

```
Test ID: ADMIN-001
Priority: Critical

Steps:
1. Navigate to http://localhost:4200/login
2. Enter email: admin@exploreni.com
3. Enter password: admin123
4. Click "Login"

Expected Results:
✓ Login successful
✓ Redirected to admin dashboard or homepage
✓ User menu shows admin role

Status: [x] PASS [ ] FAIL
```

---

## Running Automated E2E Tests

### Install Cypress (if not already installed)

```bash
cd ui

# Install Cypress
npm install cypress --save-dev

# Or if already in package.json
npm install
```

### Run Cypress Interactive Mode

**Recommended for development and debugging:**

```bash
cd ui
npm run cypress:open
```

This opens Cypress Test Runner where you can:
- Select individual test files
- Watch tests run in real browser
- See detailed step-by-step execution
- Debug failures interactively

### Run Cypress Headless Mode

**Recommended for CI/CD and full test suite:**

```bash
cd ui
npm run cypress:run
```

This runs all tests headlessly and generates:
- Video recordings (in `ui/cypress/videos/`)
- Screenshots of failures (in `ui/cypress/screenshots/`)
- Console output with results

### Run Specific Test Suite

```bash
# Run only admin flow tests
npx cypress run --spec "cypress/e2e/admin-flow.cy.js"

# Run only vendor flow tests
npx cypress run --spec "cypress/e2e/vendor-flow.cy.js"

# Run only customer/public tests
npx cypress run --spec "cypress/e2e/customer-public-flow.cy.js"

# Run only core E2E tests
npx cypress run --spec "cypress/e2e/core-e2e-flows.cy.js"

# Run only security tests
npx cypress run --spec "cypress/e2e/nonfunctional-security.cy.js"
```

### Test Files Overview

| File | Test Suites | Description |
|------|-------------|-------------|
| `admin-flow.cy.js` | 5 | Admin login, approvals, settings, vouchers |
| `vendor-flow.cy.js` | 6 | Vendor login, CRUD, availability, profile |
| `customer-public-flow.cy.js` | 5 | Public browsing, registration, login |
| `core-e2e-flows.cy.js` | 5 | Bookings, payments, vouchers E2E |
| `nonfunctional-security.cy.js` | 4 | Responsive, errors, security |
| `checkout-flow.cy.js` | 1 | Original happy path test |

**Total:** 26 test suites, 100+ individual tests

---

## Test Results & Reporting

### Interpreting Cypress Results

**Console Output:**
```
  Admin Flow - E2E Tests
    ADMIN-001: Admin Login
      ✓ should allow admin to login successfully (1234ms)
      ✓ should reject login with incorrect password (567ms)
    ADMIN-002: Vendor Approval
      ✓ should display pending vendors in admin panel (890ms)
```

**Summary:**
```
  (Results)
  ┌────────────────────────────────────────────────────┐
  │ Tests:        26                                    │
  │ Passing:      24                                    │
  │ Failing:      2                                     │
  │ Duration:     2:34                                  │
  └────────────────────────────────────────────────────┘
```

### Video Recordings

- Location: `ui/cypress/videos/`
- Each test file gets its own video
- Useful for debugging failures

### Screenshots

- Location: `ui/cypress/screenshots/`
- Automatically captured on test failure
- Shows exact state when test failed

### Test Report Document

After completing all tests, update `QA_TEST_PLAN.md`:

```markdown
### Test Results Summary

- **Total Tests:** 24
- **Passed:** 22 / 24
- **Failed:** 2 / 24
- **Pass Rate:** 91.7%

### Known Issues

| ID | Description | Severity | Status |
|----|-------------|----------|--------|
| QA-001 | Voucher code not applying on first click | Medium | Open |
| QA-002 | Mobile menu not closing after navigation | Low | Open |
```

---

## Troubleshooting

### Common Issues

#### 1. Tests failing with "Network Error"

**Cause:** API server not running

**Solution:**
```bash
# Ensure API is running
cd api
npm start

# Should see: "Server running on http://localhost:3000"
```

#### 2. Cypress can't find elements

**Cause:** Selectors don't match actual DOM

**Solution:**
- Use Cypress interactive mode to inspect elements
- Update selectors to match actual HTML
- Add `data-testid` attributes to UI components

#### 3. Stripe payment tests failing

**Cause:** Stripe Elements not loading or test mode not configured

**Solution:**
- Check Stripe API key is configured in admin settings
- Ensure using test mode key: `sk_test_...`
- Verify Stripe Elements iframe is present
- May need to increase timeout for iframe to load

#### 4. Database errors

**Cause:** Database in inconsistent state

**Solution:**
```bash
# Delete and re-seed database
cd api
rm database.sqlite
node config/seed-qa.js
```

#### 5. Port already in use

**Cause:** Previous server instance still running

**Solution:**
```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or for port 4200
lsof -ti:4200 | xargs kill -9
```

#### 6. Cypress installation fails

**Cause:** Network restrictions or missing dependencies

**Solution:**
```bash
# Try manual installation
npx cypress install --force

# Or use Cypress binary cache
CYPRESS_INSTALL_BINARY=~/cypress.zip npm install cypress
```

### Getting Help

1. **Check Logs:**
   - API logs: `api/logs/combined.log`
   - Browser console (F12)
   - Cypress console output

2. **Review Documentation:**
   - `QA_TEST_PLAN.md` - Test scenarios
   - `RUNBOOK.md` - Operational procedures
   - `README_EPIC6.md` - Manual confirmation flow
   - `README_EPIC7.md` - Voucher system

3. **Contact Support:**
   - Create GitHub issue with:
     - Test that failed
     - Expected vs actual behavior
     - Screenshots/videos
     - Logs

---

## Test Execution Checklist

### Pre-Test Setup
- [ ] API server running on port 3000
- [ ] UI server running on port 4200
- [ ] Database seeded with QA test data
- [ ] API keys configured in admin settings
- [ ] Browser cleared of cookies/cache

### During Testing
- [ ] Execute tests in documented order
- [ ] Mark pass/fail status in test plan
- [ ] Document issues with screenshots
- [ ] Note any unexpected behavior

### Post-Testing
- [ ] Review test results summary
- [ ] Generate test report
- [ ] Archive screenshots/videos
- [ ] Update known issues list
- [ ] Sign off on test completion

---

## Next Steps

After successful test execution:

1. **Review Results** with team
2. **Fix Critical Issues** (P0, P1)
3. **Re-test** failed scenarios
4. **Get Sign-Off** from stakeholders
5. **Prepare for Launch** 🚀

---

*Last Updated: 2025-10-26*
