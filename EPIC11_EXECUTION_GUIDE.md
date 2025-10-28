# Epic 11: Final UI & Internal Logic Regression Test - Execution Guide

This guide provides step-by-step instructions for executing the Epic 11 final regression test.

## Overview

Epic 11 is the final sign-off test for the MVP's internal systems and UI. It executes every critical user journey that does NOT require live third-party API calls. The test verifies:

- All UI flows up to the point of payment
- Internal logic and business rules
- Role-based security
- UI/UX polish (spinners, toasts, responsive design)
- Voucher redemption logic

## ⚠️ CRITICAL EXECUTION CONSTRAINTS

### In-Memory Database

The API's in-memory database will be wiped if the server stops. **This entire test plan MUST be executed as ONE SINGLE CONTINUOUS SCRIPT** from the moment the API server is started until the final step.

### No External APIs

This test plan intentionally skips steps that require live API keys:
- ❌ No live Stripe payment processing
- ❌ No SMS dispatch via Twilio
- ❌ No email generation via SendGrid

The test validates UI flows and internal logic only.

## Prerequisites

### Software Requirements

- **Node.js** v18 or higher
- **npm** v9 or higher
- **Chrome Browser** (for Cypress)

### Repository Setup

```bash
# Clone repository
git clone <repository-url>
cd niexperiences

# Install API dependencies
cd api
npm install

# Install UI dependencies
cd ../ui
npm install
```

## Test Execution Steps

### Step 1: Prepare Clean Environment

```bash
# Navigate to API directory
cd niexperiences/api

# Delete existing database (if any)
rm database.sqlite

# Ensure .env is configured
cp .env.example .env
nano .env
```

Required `.env` settings:
```env
DATABASE_URL=sqlite:./database.sqlite
PORT=3000
JWT_SECRET=your-jwt-secret-here
SETTINGS_ENCRYPTION_SECRET=generate-with-crypto-randomBytes-32
```

To generate `SETTINGS_ENCRYPTION_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 2: Start API Server

**⚠️ DO NOT STOP THE API SERVER UNTIL THE TEST COMPLETES**

```bash
# From api directory
npm start
```

The API will:
- Create database tables
- Seed default test data
- Start on `http://localhost:3000`

**Keep this terminal window open.** The API must remain running.

### Step 3: Start UI Server

**⚠️ DO NOT STOP THE UI SERVER UNTIL THE TEST COMPLETES**

Open a **NEW terminal window**:

```bash
# From niexperiences root directory
cd ui
npm start
```

The UI will start on `http://localhost:4200`

**Keep this terminal window open.** The UI must remain running.

### Step 4: Run Regression Test

Open a **THIRD terminal window**:

```bash
# From niexperiences root directory
cd ui

# Run Epic 11 regression test
npx cypress run --spec "cypress/e2e/epic11-final-regression.cy.js"
```

**Alternative: Run in interactive mode** (recommended for debugging):

```bash
npx cypress open
# Then select "epic11-final-regression.cy.js" from the test list
```

### Step 5: Monitor Test Execution

The test will execute all 6 parts sequentially:

1. ✅ **Part 1: System Boot & Data Seeding** (5 test cases)
   - Register/verify users
   - Approve vendors
   - Create vouchers
   - Set vendor profile
   - Create and approve experiences

2. ✅ **Part 2: UI/UX Polish Verification** (4 test cases)
   - Loading spinners
   - Brand colors
   - Responsive design
   - Error/success toasts

3. ✅ **Part 3: Booking & Voucher Redemption** (3 test cases)
   - Find and select experience
   - View checkout and payment pages
   - Apply voucher and verify price reduction

4. ✅ **Part 4: Vendor Dashboard UI** (3 test cases)
   - My Listings page
   - Booking Requests page
   - Profile page

5. ✅ **Part 5: Admin Dashboard & Security** (3 test cases)
   - Admin settings page
   - Admin vouchers page
   - Role-based access control (customer and vendor blocked from admin/dashboard)

6. ✅ **Part 6: Shutdown** (1 test case)
   - Final verification

**Total: 19 test cases**

### Step 6: Review Screenshots

All screenshots are saved in:

```
ui/cypress/screenshots/epic11-final-regression.cy.js/
```

Expected screenshots (22 total):

1. `01-admin-vendor-approval-list.png` - Admin vendor approval list showing pending vendor
2. `02-admin-voucher-list-with-new-voucher.png` - Admin voucher list showing newly created £10 voucher
3. `03-vendor-profile-with-phone.png` - Vendor profile page with phone number filled in
4. `04-vendor-my-listings.png` - Vendor "My Listings" page showing experiences
5. `05-admin-experience-approval-empty.png` - Admin experience approval list (empty after approving)
6. `06-experience-list-loading.png` - Loading spinner on experience list page
7. `07-experience-list-loaded-with-brand-colors.png` - Final loaded experience list showing brand colors
8. `08-mobile-view-experience-list.png` - Mobile view of experience list
9. `09-login-error-toast.png` - Login page with "Invalid credentials" error toast/alert
10. `10-login-success-toast.png` - Homepage/dashboard with "Login successful" success toast/alert
11. `11-checkout-page-customer-details.png` - Checkout page with customer details form
12. `12-payment-page-100-pounds.png` - Payment page showing total of £100
13. `13-payment-page-with-voucher-40-pounds.png` - Payment page with applied voucher showing £40
14. `14-vendor-my-listings-dashboard.png` - Vendor "My Listings" page
15. `15-vendor-booking-requests-empty.png` - Vendor "Booking Requests" page (empty)
16. `16-vendor-profile-with-saved-data.png` - Vendor "Profile" page showing saved data
17. `17-admin-settings-page.png` - Admin "Settings" page showing write-only fields
18. `18-admin-vouchers-page.png` - Admin "Vouchers" page showing created voucher
19. `19-customer-blocked-from-admin.png` - Customer redirected from /admin
20. `20-customer-blocked-from-dashboard.png` - Customer redirected from /dashboard
21. `21-vendor-blocked-from-admin.png` - Vendor redirected from /admin
22. `22-test-complete.png` - Test completion confirmation

### Step 7: Review Test Results

Cypress will output test results in the terminal:

```
  Epic 11: Final UI & Internal Logic Regression Test
    Part 1: System Boot & Data Seeding
      ✓ Step 1-3: Register 3 users (admin, vendor, customer)
      ✓ Step 4-7: Apply to become vendor and approve
      ✓ Step 8-9: Create and screenshot £10 voucher
      ✓ Step 10-13: Login as vendor and set phone number
      ✓ Step 14-16: Create two experiences and add availability
      ✓ Step 17-19: Login as admin and approve experiences
    Part 2: UI/UX Polish Verification
      ✓ Step 1-2: Loading spinner and brand colors
      ✓ Step 3: Responsive design - mobile viewport
      ✓ Step 4: Login error toast/alert
      ✓ Step 5: Login success toast/alert
    Part 3: Core Journey - Booking & Voucher Redemption UI
      ✓ Step 1-3: Find and select Auto-Confirm Tour
      ✓ Step 4-5: Fill details and verify payment page
      ✓ Step 6-9: Book for 1 person and apply voucher
    Part 4: Core Journey - Vendor Dashboard UI
      ✓ Step 1-2: Login as vendor, view My Listings
      ✓ Step 3: View Booking Requests page
      ✓ Step 4: View Profile page
    Part 5: Core Journey - Admin Dashboard & Security
      ✓ Step 1-2: Login as admin, view Settings
      ✓ Step 3: View Vouchers page
      ✓ Step 4-6: Customer cannot access admin/dashboard
      ✓ Step 7-8: Vendor cannot access admin
    Part 6: Shutdown
      ✓ Test execution complete

  19 passing (Xm Xs)
```

### Step 8: Stop Servers

**Only after the test completes successfully:**

```bash
# In API terminal: Press Ctrl+C
# In UI terminal: Press Ctrl+C
```

## Acceptance Criteria Verification

After test execution, verify:

- ✅ All 6 Parts of the test plan executed sequentially in a single session
- ✅ All 19 test cases passed
- ✅ 22 screenshots captured at every verification step
- ✅ UI/UX polish items (spinners, toasts, responsiveness) confirmed working
- ✅ All user-facing UI flows up to payment are functional
- ✅ Voucher redemption logic on UI (price reduction) is functional
- ✅ All Admin and Vendor dashboard pages are functional
- ✅ Role-based security (blocking access to /admin and /dashboard) is confirmed

## Troubleshooting

### Test Fails: "Timed out retrying"

**Cause:** API or UI server not running, or page elements changed.

**Solution:**
1. Verify API is running on port 3000
2. Verify UI is running on port 4200
3. Check terminal output for errors
4. Run test in interactive mode to debug: `npx cypress open`

### Test Fails: "Element not found"

**Cause:** Page structure changed, or test data not seeded properly.

**Solution:**
1. Delete database: `rm api/database.sqlite`
2. Restart API server (will re-seed data)
3. Re-run test

### Screenshots Missing

**Cause:** Cypress screenshot folder permissions or disk space.

**Solution:**
1. Check folder exists: `ls -la ui/cypress/screenshots/`
2. Check disk space: `df -h`
3. Run with `--quiet` flag removed for verbose output

### API Server Crashes During Test

**Cause:** Database corruption, out of memory, or uncaught exception.

**Solution:**
1. Check API logs for errors
2. Delete database and restart: `rm database.sqlite && npm start`
3. Increase Node memory if needed: `NODE_OPTIONS=--max-old-space-size=4096 npm start`

### Voucher Not Applied

**Cause:** Voucher code generation or application logic issue.

**Solution:**
1. Verify voucher was created in Part 1
2. Check API logs for voucher validation errors
3. Manually verify voucher exists via admin UI

## Known Limitations

### External Service Integration

This test **intentionally skips** the following:
- Live Stripe payment processing (test stops at payment page)
- SMS notifications via Twilio
- Email notifications via SendGrid

These are tested separately in Epic 9 E2E tests with test API keys.

### Browser Support

This test is designed for **Chrome/Chromium** browsers. Other browsers (Firefox, Safari) may work but are not officially supported.

### Test Data Dependencies

This test relies on default seed data from `api/config/seed.js`:
- Admin user: `admin@niexperiences.co.uk`
- Vendors: `davy@niexperiences.co.uk`, `ciaran@niexperiences.co.uk`
- Customers: `mary@niexperiences.co.uk`, `paddy@niexperiences.co.uk`, `shauna@niexperiences.co.uk`
- Experiences: `City Bike Tour`, `Private Art Class`

If seed data changes, test may need updates.

## Success Criteria

The test is successful when:

1. ✅ All 19 test cases pass
2. ✅ All 22 screenshots are captured and show expected UI states
3. ✅ No console errors or exceptions in API or UI logs
4. ✅ Test completes in under 10 minutes
5. ✅ All acceptance criteria from issue are met

## Next Steps

After successful test execution:

1. Review all 22 screenshots to confirm UI/UX quality
2. Document any visual issues or suggestions
3. Get stakeholder sign-off on screenshots
4. Update issue with test results and screenshots
5. Proceed to production deployment (Epic 12)

## Support

For questions or issues with this test:

- **Test Documentation:** This file (`EPIC11_EXECUTION_GUIDE.md`)
- **Test File:** `ui/cypress/e2e/epic11-final-regression.cy.js`
- **Issue:** Epic 11: Final UI & Internal Logic Regression Test (with Screenshots)

---

**Test Version:** 1.0  
**Last Updated:** 2025-10-26  
**Status:** ✅ Ready for Execution
