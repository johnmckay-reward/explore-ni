# Epic 11: Manual UI & Internal Logic Regression Test - Execution Log

**Test Date:** 2025-10-26  
**Tester:** GitHub Copilot Agent  
**Environment:** Local development (API: http://localhost:3000, UI: http://localhost:4200)

## Test Execution Status

This document logs the manual execution of the Epic 11 regression test plan with screenshots captured at each verification point.

### Critical Constraints

- ✅ **In-Memory Database:** API started fresh with in-memory database - must complete all tests without restart
- ✅ **No External APIs:** Test focuses on UI flows only, skipping live Stripe/Twilio/SendGrid calls
- ✅ **Screenshots:** Capturing screenshots at every [SCREENSHOT] verification point

---

## Part 1: System Boot & Data Seeding

### Step 1-2: Start Servers

**Action:** Start the API server
- ✅ **COMPLETED** - API server started on http://localhost:3000
- Database seeded with test users (admin@exploreni.com, davy@exploreni.com, ciaran@exploreni.com, mary@exploreni.com, etc.)

**Action:** Start the UI server  
- ✅ **COMPLETED** - UI server started on http://localhost:4200

### Step 3: Users Already Registered

**Note:** The system comes pre-seeded with test users from seed.js:
- ✅ admin@exploreni.com (admin123)
- ✅ davy@exploreni.com (vendor123) - approved vendor
- ✅ siobhan@exploreni.com (vendor123) - approved vendor
- ✅ ciaran@exploreni.com (vendor123) - pending vendor
- ✅ mary@exploreni.com (customer123)
- ✅ paddy@exploreni.com (customer123)
- ✅ shauna@exploreni.com (customer123)

### Step 4-7: Vendor Approval

**Action:** Login as admin@exploreni.com
- ✅ **COMPLETED** - Successfully logged in
- Toast message shown: "Login successful! Welcome back."

**Action:** Navigate to /admin/vendors
- ✅ **COMPLETED** - Vendor approval queue loaded
- [SCREENSHOT 1](https://github.com/user-attachments/assets/f9b84f37-db29-4f7d-b2ef-ae6638ca0477): Admin vendor approval list showing pending vendor (Ciaran Murphy - ciaran@exploreni.com)

**Action:** Approve vendor ciaran@exploreni.com
- ✅ **COMPLETED** - Clicked "Approve" button, confirmed dialog
- Toast message shown: "Vendor approved successfully!"
- Vendor approval queue now shows: "No pending vendor applications"

### Step 8-9: Create £10 Voucher

**Action:** Navigate to /admin/vouchers
- ✅ **COMPLETED** - Voucher management page loaded

**Action:** Manually create a £10 "Fixed Amount" voucher
- ✅ **COMPLETED** - Created voucher with following details:
  - Type: Fixed Amount
  - Amount: £10
  - Sender: Admin
  - Recipient: Test Customer (customer@test.com)
  - Message: "Test voucher for Epic 11"
  
**Voucher Code Generated:** `GIFT-1761522598564-EEVHF7S33`

[SCREENSHOT 2](https://github.com/user-attachments/assets/e9063fac-7c9d-44b0-9b2a-c649853f567d): Admin voucher list showing the newly created £10 voucher

### Step 10-19: Vendor Setup & Experience Creation

**Status:** IN PROGRESS

**Next Steps:**
1. Logout from admin account
2. Login as davy@exploreni.com (vendor)
3. Navigate to /dashboard/profile and set phone number
4. Create two experiences:
   - "Auto-Confirm Tour" (£50) with confirmationMode: 'auto'
   - "Manual-Confirm Class" (£25) with confirmationMode: 'manual'
5. Add availability slots
6. Logout and login as admin
7. Approve the new experiences

---

## Part 2: UI/UX Polish Verification

**Status:** PENDING

Will verify:
- Loading spinners
- Brand colors and typography
- Responsive design (mobile viewport)
- Error/success toasts

---

## Part 3: Core Journey - Booking & Voucher Redemption UI

**Status:** PENDING

Will test:
- Booking flow for "Auto-Confirm Tour" (£50) for 2 people
- Checkout page verification
- Payment page showing £100 total
- Applying £10 voucher (Code: `GIFT-1761522598564-EEVHF7S33`)
- Verifying total updates to £40

---

## Part 4: Core Journey - Vendor Dashboard UI

**Status:** PENDING

Will verify:
- My Listings page
- Booking Requests page
- Profile page with saved data

---

## Part 5: Core Journey - Admin Dashboard & Security

**Status:** PENDING

Will verify:
- Admin Settings page
- Admin Vouchers page
- Role-based access control (customer/vendor blocked from admin routes)

---

## Part 6: Shutdown

**Status:** PENDING

Final cleanup and server shutdown

---

## Test Data Reference

### Voucher Code for Testing
- **Code:** `GIFT-1761522598564-EEVHF7S33`
- **Type:** Fixed Amount
- **Value:** £10
- **Status:** Active, unused

### User Credentials
- **Admin:** admin@exploreni.com / admin123
- **Vendor (Approved):** davy@exploreni.com / vendor123
- **Vendor (Newly Approved):** ciaran@exploreni.com / vendor123
- **Customer:** mary@exploreni.com / customer123

### Experiences (Pre-seeded)
- City Bike Tour (£100, auto-confirm)
- Private Art Class (£80, manual-confirm)
- 13 other approved experiences

---

## Screenshots Captured

1. ✅ [Admin vendor approval list](https://github.com/user-attachments/assets/f9b84f37-db29-4f7d-b2ef-ae6638ca0477) - Pending vendor visible
2. ✅ [Admin voucher list](https://github.com/user-attachments/assets/e9063fac-7c9d-44b0-9b2a-c649853f567d) - £10 voucher created

**Total Screenshots Planned:** 22 (as per test plan)  
**Screenshots Captured:** 2 / 22

---

## Test Environment

- **API Server:** Running on http://localhost:3000
- **UI Server:** Running on http://localhost:4200  
- **Database:** In-memory SQLite (will be wiped if server stops)
- **Test Mode:** All external APIs disabled (Stripe/Twilio/SendGrid)

---

## Notes

- All tests must be completed in one continuous session due to in-memory database constraint
- API and UI servers must remain running throughout entire test execution
- Each [SCREENSHOT] verification point must be captured before proceeding
- Tests intentionally skip live payment processing, SMS, and email generation

---

**Last Updated:** 2025-10-26 23:49 PM  
**Status:** In Progress - Completed Part 1 (Steps 1-9)
