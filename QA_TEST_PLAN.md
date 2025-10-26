# QA Test Plan - Epic 9: Pre-Launch Verification

## Overview

This document provides a comprehensive QA test plan for the Explore NI MVP application. All features from Epics 1-8 must be tested and verified before launch.

**Testing Approach:**
- Manual testing for user flows and integrations
- Automated E2E tests for critical paths
- API testing for edge cases and error handling
- Security testing for access control

## Environment Setup

### Prerequisites

1. **Staging Environment:**
   - Database: Fresh instance with test data
   - API: Running on staging server
   - UI: Running on staging server
   - All third-party integrations configured (Stripe Test Mode, Twilio, SendGrid)

2. **Test Accounts:**
   - 1x Admin User: `admin@exploreni.com` / `admin123`
   - 2x Vendor Users:
     - Active: `davy@exploreni.com` / `vendor123`
     - Pending: `ciaran@exploreni.com` / `vendor123`
   - 3x Customer Users:
     - `mary@exploreni.com` / `customer123`
     - `paddy@exploreni.com` / `customer123`
     - `shauna@exploreni.com` / `customer123`

3. **Test Data:**
   - See `api/config/seed.js` for seeding development/staging database
   - Run: `npm start` in API directory (auto-seeds on first run)

### Setup Steps

1. **Load Settings Table:**
   ```bash
   cd api
   # Settings are auto-seeded on first start
   npm start
   ```

2. **Configure API Keys via Admin UI:**
   - Login as admin
   - Navigate to `/admin/settings`
   - Configure:
     - `STRIPE_SECRET_KEY` (Test Mode: `sk_test_...`)
     - `STRIPE_WEBHOOK_SECRET` (`whsec_...`)
     - `TWILIO_ACCOUNT_SID`
     - `TWILIO_AUTH_TOKEN`
     - `TWILIO_PHONE_NUMBER` (E.164 format)
     - `SENDGRID_API_KEY`

3. **Create Test Experiences:**
   - Login as `davy@exploreni.com`
   - Create auto-confirm experience: "City Bike Tour" (£100)
   - Create manual-confirm experience: "Private Art Class" (£80)
   - Add availability to both
   - Login as admin and approve both experiences

## Test Execution

### 1. Admin Flow Tests

#### 1.1 Admin Login ✅
**Test ID:** ADMIN-001
**Priority:** Critical

**Steps:**
1. Navigate to `/login`
2. Enter email: `admin@exploreni.com`
3. Enter password: `admin123`
4. Click "Login"

**Expected Results:**
- ✓ Login successful
- ✓ Redirected to admin dashboard or homepage
- ✓ User menu shows admin role

**Status:** [ ] PASS [ ] FAIL

---

#### 1.2 Vendor Approval ✅
**Test ID:** ADMIN-002
**Priority:** Critical

**Steps:**
1. Login as admin
2. Navigate to `/admin/vendors`
3. Verify pending vendor `ciaran@exploreni.com` appears in list
4. Click "Approve" button
5. Verify status changes to "Active"

**Expected Results:**
- ✓ Pending vendor visible in list
- ✓ Approval successful
- ✓ Status updates to "active"
- ✓ Vendor can now login and create experiences

**Status:** [ ] PASS [ ] FAIL

---

#### 1.3 Experience Approval ✅
**Test ID:** ADMIN-003
**Priority:** Critical

**Steps:**
1. As vendor, create a new experience "Pending Test Experience"
2. Submit for approval (status: pending)
3. Login as admin
4. Navigate to `/admin/experiences`
5. Verify "Pending Test Experience" appears with status "pending"
6. Click "Approve"
7. Verify status changes to "approved"
8. Visit public site and verify experience is visible

**Expected Results:**
- ✓ Pending experience visible in admin panel
- ✓ Approval successful
- ✓ Experience becomes publicly visible
- ✓ Status updates to "approved"

**Status:** [ ] PASS [ ] FAIL

---

#### 1.4 Settings Management (Hot Reload) ✅
**Test ID:** ADMIN-004
**Priority:** Critical

**Steps:**
1. Login as admin
2. Navigate to `/admin/settings`
3. Verify all setting keys are visible:
   - STRIPE_SECRET_KEY
   - STRIPE_WEBHOOK_SECRET
   - TWILIO_ACCOUNT_SID
   - TWILIO_AUTH_TOKEN
   - TWILIO_PHONE_NUMBER
   - SENDGRID_API_KEY
   - PAYPAL_CLIENT_ID
   - PAYPAL_CLIENT_SECRET
4. Update TWILIO_PHONE_NUMBER with a new valid test number
5. Click "Save"
6. **WITHOUT RESTARTING API:** Create a manual-confirm booking
7. Verify the new phone number receives SMS notification

**Expected Results:**
- ✓ All settings keys visible
- ✓ Update successful without restart
- ✓ New phone number used immediately
- ✓ No server restart required

**Status:** [ ] PASS [ ] FAIL

---

#### 1.5 Voucher Management ✅
**Test ID:** ADMIN-005
**Priority:** High

**Steps:**
1. Login as admin
2. Navigate to `/admin/vouchers`
3. Click "Create New Voucher"
4. Create £10 fixed amount voucher:
   - Type: Fixed Amount
   - Value: 10
   - Code: ADMIN-TEST-10
5. Verify voucher appears in list
6. As customer, attempt to use voucher code at checkout
7. Verify voucher applies correctly

**Expected Results:**
- ✓ Voucher creation successful
- ✓ Voucher appears in admin list
- ✓ Voucher code can be redeemed by customer
- ✓ Balance updates correctly after use

**Status:** [ ] PASS [ ] FAIL

---

### 2. Vendor Flow Tests

#### 2.1 Vendor Login ✅
**Test ID:** VENDOR-001
**Priority:** Critical

**Steps:**
1. Navigate to `/login`
2. Enter email: `davy@exploreni.com`
3. Enter password: `vendor123`
4. Click "Login"

**Expected Results:**
- ✓ Login successful
- ✓ Redirected to `/dashboard`
- ✓ Access to vendor features granted
- ✓ No access to admin routes (should be blocked)

**Status:** [ ] PASS [ ] FAIL

---

#### 2.2 Dashboard Access Control ✅
**Test ID:** VENDOR-002
**Priority:** Critical

**Steps:**
1. Login as vendor `davy@exploreni.com`
2. Verify access to `/dashboard` (should succeed)
3. Attempt to navigate to `/admin` (should fail/redirect)
4. Attempt to access `/admin/vendors` (should fail/redirect)

**Expected Results:**
- ✓ Vendor can access `/dashboard`
- ✓ Vendor is blocked from `/admin` routes
- ✓ Appropriate redirect/error message shown

**Status:** [ ] PASS [ ] FAIL

---

#### 2.3 Experience CRUD Operations ✅
**Test ID:** VENDOR-003
**Priority:** Critical

**Steps:**
1. Login as vendor
2. **Create:** Navigate to `/dashboard/experience/new`
   - Fill in all required fields
   - Add categories, images
   - Submit
3. **Read:** View experience list, click on created experience
4. **Edit:** Click "Edit", modify title, save
5. **Delete:** Click "Delete", confirm deletion

**Expected Results:**
- ✓ Create: Experience created with status "pending"
- ✓ Read: Experience details displayed correctly
- ✓ Update: Changes saved successfully
- ✓ Delete: Experience removed from database

**Status:** [ ] PASS [ ] FAIL

---

#### 2.4 Availability Management ✅
**Test ID:** VENDOR-004
**Priority:** Critical

**Steps:**
1. Login as vendor
2. Navigate to approved experience
3. Go to `/dashboard/experience/:id/availability`
4. **Add:** Create new time slot for future date
   - Set date, time, availableSlots
5. **Edit:** Modify availableSlots for existing slot
6. **Delete:** Remove a time slot

**Expected Results:**
- ✓ Add: New slot created successfully
- ✓ Edit: Slot quantity updated
- ✓ Delete: Slot removed from list
- ✓ Changes reflected on public booking page

**Status:** [ ] PASS [ ] FAIL

---

#### 2.5 Confirmation Mode Toggle ✅
**Test ID:** VENDOR-005
**Priority:** High

**Steps:**
1. Login as vendor
2. Edit "City Bike Tour" (auto-confirm)
3. Change confirmationMode to "Manual"
4. Save changes
5. Create a test booking as customer
6. Verify booking requires manual confirmation

**Expected Results:**
- ✓ Mode change saves successfully
- ✓ New bookings require manual confirmation
- ✓ Vendor receives notification of pending booking

**Status:** [ ] PASS [ ] FAIL

---

#### 2.6 Profile Settings ✅
**Test ID:** VENDOR-006
**Priority:** High

**Steps:**
1. Login as vendor
2. Navigate to `/dashboard/profile`
3. Add phone number: `+447700900123`
4. Set notification preference to "SMS"
5. Click "Save"
6. Refresh page and verify values persisted

**Expected Results:**
- ✓ Profile updates successfully
- ✓ Values persisted in database
- ✓ SMS notifications sent to new number

**Status:** [ ] PASS [ ] FAIL

---

### 3. Customer & Public Flow Tests

#### 3.1 Public Browsing ✅
**Test ID:** PUBLIC-001
**Priority:** Critical

**Steps:**
1. **Logged Out:** Open incognito/private browser
2. Navigate to homepage
3. Browse category pages
4. Click on an experience detail page
5. Verify only "approved" experiences are visible

**Expected Results:**
- ✓ Homepage loads successfully
- ✓ Categories browseable
- ✓ Experience details accessible
- ✓ Only approved experiences visible (no pending/draft)

**Status:** [ ] PASS [ ] FAIL

---

#### 3.2 Search & Filter ✅
**Test ID:** PUBLIC-002
**Priority:** High

**Steps:**
1. Navigate to `/experiences`
2. Apply price filter (e.g., £0-£50)
3. Verify results update
4. Apply location filter
5. Verify results update
6. Apply rating filter
7. Verify results update

**Expected Results:**
- ✓ Filters work independently
- ✓ Multiple filters work together
- ✓ Results update correctly
- ✓ No errors in console

**Status:** [ ] PASS [ ] FAIL

---

#### 3.3 Hotel Partner Landing Page ✅
**Test ID:** PUBLIC-003
**Priority:** Medium

**Steps:**
1. Create hotel partner in database:
   ```sql
   INSERT INTO HotelPartners (name, slug, createdAt, updatedAt) 
   VALUES ('Test Hotel', 'test-hotel', datetime('now'), datetime('now'));
   ```
2. Navigate to `/partner/test-hotel`
3. Verify page loads successfully
4. Verify hotel name displayed
5. Verify list of approved experiences shown

**Expected Results:**
- ✓ Page loads without errors
- ✓ Hotel name displayed in hero section
- ✓ Experiences list populated
- ✓ Mobile-responsive design

**Status:** [ ] PASS [ ] FAIL

---

#### 3.4 Customer Registration ✅
**Test ID:** CUSTOMER-001
**Priority:** Critical

**Steps:**
1. Navigate to `/register`
2. Fill in registration form:
   - First Name: "Test"
   - Last Name: "User"
   - Email: "testuser@example.com"
   - Password: "Test123!"
   - Role: "customer"
3. Submit form

**Expected Results:**
- ✓ Registration successful
- ✓ User created with role "customer"
- ✓ Redirected to login or dashboard
- ✓ Welcome email sent (if configured)

**Status:** [ ] PASS [ ] FAIL

---

#### 3.5 Customer Login/Logout ✅
**Test ID:** CUSTOMER-002
**Priority:** Critical

**Steps:**
1. Navigate to `/login`
2. Login with new customer credentials
3. Verify logged in state
4. Click "Logout"
5. Verify logged out state

**Expected Results:**
- ✓ Login successful
- ✓ User menu shows customer name
- ✓ Logout successful
- ✓ Redirected to homepage

**Status:** [ ] PASS [ ] FAIL

---

### 4. Core E2E Business Logic Tests

#### 4.1 E2E: Auto-Confirm Booking with Stripe ✅
**Test ID:** E2E-001
**Priority:** Critical

**Steps:**
1. Login as customer `mary@exploreni.com`
2. Navigate to "City Bike Tour" (auto-confirm experience)
3. Select available date/time, quantity: 2
4. Proceed to checkout
5. Fill in customer details
6. On payment page, use Stripe test card: `4242 4242 4242 4242`
7. Complete payment

**Expected Results:**
- ✓ Redirected to `/booking/success`
- ✓ Email: Customer receives "Booking Confirmed" email
- ✓ DB: Booking status = "confirmed", paymentStatus = "succeeded"
- ✓ DB: Availability.availableSlots reduced by 2
- ✓ No vendor notification (auto-confirm)

**Database Verification:**
```sql
-- Check booking
SELECT status, paymentStatus, quantity FROM Bookings 
WHERE userId = (SELECT id FROM Users WHERE email = 'mary@exploreni.com') 
ORDER BY createdAt DESC LIMIT 1;

-- Check availability
SELECT availableSlots FROM Availabilities WHERE id = <slot_id>;
```

**Status:** [ ] PASS [ ] FAIL

---

#### 4.2 E2E: Manual-Confirm Booking with SMS ✅
**Test ID:** E2E-002
**Priority:** Critical

**Steps:**
1. **Customer Side:**
   - Login as customer `paddy@exploreni.com`
   - Find "Private Art Class" (manual-confirm)
   - Select date/time, quantity: 1
   - Checkout and pay with Stripe test card
   
2. **Verify Notifications:**
   - Check vendor phone receives SMS (or check API logs)
   - Check customer email for "Booking Pending" message
   
3. **Vendor Side:**
   - Login as vendor `davy@exploreni.com`
   - Navigate to `/dashboard/requests`
   - Verify new booking request appears
   - Click "Confirm"
   
4. **Verify Confirmation:**
   - Customer receives "Booking Confirmed" email
   - Booking status updates to "confirmed"

**Expected Results:**
- ✓ Customer redirected to success with "Pending approval" message
- ✓ SMS sent to vendor phone number
- ✓ Email sent to customer (pending)
- ✓ Booking appears in vendor dashboard
- ✓ Vendor can confirm booking
- ✓ Confirmation email sent to customer
- ✓ DB: Booking status = "confirmed"

**Status:** [ ] PASS [ ] FAIL

---

#### 4.3 E2E: Manual-Confirm Decline with Refund ✅
**Test ID:** E2E-003
**Priority:** Critical

**Steps:**
1. Repeat booking steps from E2E-002 (create pending booking)
2. Login as vendor `davy@exploreni.com`
3. Navigate to `/dashboard/requests`
4. Find the new booking request
5. Click "Decline"
6. Confirm decline action

**Expected Results:**
- ✓ Request disappears from list
- ✓ Email: Customer receives "Booking Declined" email
- ✓ DB: Booking status = "declined"
- ✓ Stripe: Full refund processed (check Stripe test dashboard)
- ✓ DB: Availability.availableSlots restored (+1)

**Stripe Verification:**
- Login to Stripe Test Dashboard
- Navigate to Payments
- Find payment for this booking
- Verify refund issued for full amount

**Status:** [ ] PASS [ ] FAIL

---

#### 4.4 E2E: Fixed-Amount Voucher Flow ✅
**Test ID:** E2E-004
**Priority:** Critical

**Steps:**
1. **Purchase:**
   - Login as customer `mary@exploreni.com`
   - Navigate to `/gift-vouchers`
   - Purchase £50 voucher
   - Recipient: `paddy@exploreni.com`
   - Pay with Stripe test card
   
2. **Receive:**
   - Check email sent to `paddy@exploreni.com`
   - Verify PDF attached with unique code
   - Note the voucher code
   
3. **Redeem:**
   - Login as customer `paddy@exploreni.com`
   - Book experience costing £100
   - On payment page, enter £50 voucher code
   - Click "Apply"
   - Verify total updates to £50
   - Pay remaining £50 with Stripe test card
   - Complete booking

**Expected Results:**
- ✓ Purchase: Payment successful, voucher created
- ✓ Email: Recipient receives voucher with PDF
- ✓ PDF contains: code, value, sender message
- ✓ Redemption: Total reduces from £100 to £50
- ✓ Payment: Only £50 charged to card
- ✓ DB: Voucher.currentBalance = 0, isEnabled = false
- ✓ Booking successful

**Status:** [ ] PASS [ ] FAIL

---

#### 4.5 E2E: Experience Voucher (Gift & Redeem) ✅
**Test ID:** E2E-005
**Priority:** Critical

**Steps:**
1. **Purchase:**
   - Login as customer `mary@exploreni.com`
   - Navigate to "City Bike Tour" (£100)
   - Click "Gift this Experience"
   - Recipient: `shauna@exploreni.com`
   - Pay £100
   
2. **Receive:**
   - Check email to `shauna@exploreni.com`
   - Verify voucher for "1x City Bike Tour"
   - Note voucher code
   
3. **Test Wrong Experience:**
   - Login as `shauna@exploreni.com`
   - Book "Private Art Class" (wrong experience)
   - Enter voucher code at payment
   - **Verify error:** "Voucher not valid for this experience"
   
4. **Test Correct Experience:**
   - Book "City Bike Tour" (correct experience)
   - Enter voucher code at payment
   - Verify total = £0
   - Verify payment form hidden
   - Click "Complete Booking"

**Expected Results:**
- ✓ Purchase successful for £100
- ✓ Recipient receives experience-specific voucher
- ✓ Wrong experience: Error message shown
- ✓ Correct experience: Total = £0, no payment required
- ✓ Booking successful without card payment
- ✓ DB: Voucher isEnabled = false (used)

**Status:** [ ] PASS [ ] FAIL

---

### 5. Non-Functional & Security Tests

#### 5.1 Responsive Design ✅
**Test ID:** NONFUNC-001
**Priority:** High

**Steps:**
1. Open browser DevTools
2. Test at breakpoints:
   - Mobile: 375px width
   - Tablet: 768px width
   - Desktop: 1920px width
3. Navigate through:
   - Homepage
   - Experience detail page
   - Checkout flow
   - Admin dashboard
   - Vendor dashboard

**Expected Results:**
- ✓ Mobile: UI adapts, no horizontal scroll, touch-friendly
- ✓ Tablet: Layout optimized for medium screens
- ✓ Desktop: Full feature set visible
- ✓ No broken layouts or overlapping elements

**Status:** [ ] PASS [ ] FAIL

---

#### 5.2 API Error Handling ✅
**Test ID:** NONFUNC-002
**Priority:** High

**Steps:**
1. Use Postman/curl to test API:
   ```bash
   # Test overbooking
   curl -X POST http://localhost:3000/api/bookings \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <token>" \
     -d '{"experienceId": 1, "availabilityId": 1, "quantity": 999}'
   ```

**Expected Results:**
- ✓ Returns 400 Bad Request
- ✓ Error message: "Insufficient availability"
- ✓ No booking created in database

**Status:** [ ] PASS [ ] FAIL

---

#### 5.3 UI Error Handling ✅
**Test ID:** NONFUNC-003
**Priority:** High

**Steps:**
1. **Login Error:**
   - Attempt login with wrong password
   - Verify error message displayed
   
2. **Registration Error:**
   - Attempt registration with existing email
   - Verify error message displayed
   
3. **Form Validation:**
   - Submit forms with missing required fields
   - Verify validation errors shown

**Expected Results:**
- ✓ Clear error messages displayed
- ✓ Form validation prevents submission
- ✓ User-friendly error text
- ✓ No app crashes or console errors

**Status:** [ ] PASS [ ] FAIL

---

#### 5.4 Security & Access Control ✅
**Test ID:** SECURITY-001
**Priority:** Critical

**Steps:**
1. **Admin Route Protection:**
   - Login as customer
   - Attempt to visit `/admin`
   - Verify redirect/blocked
   
2. **Vendor Route Protection:**
   - Login as customer
   - Attempt to visit `/dashboard`
   - Verify redirect/blocked
   
3. **API Endpoint Protection:**
   - Use Postman with customer JWT
   - Attempt: `PUT /api/experiences/:id`
   - Verify 403 Forbidden
   
4. **Unauthorized Access:**
   - Remove JWT token
   - Attempt to access protected routes
   - Verify 401 Unauthorized

**Expected Results:**
- ✓ Customers blocked from `/admin`
- ✓ Customers blocked from `/dashboard`
- ✓ API returns 403 for unauthorized role
- ✓ API returns 401 for missing auth token

**Status:** [ ] PASS [ ] FAIL

---

## Test Results Summary

### Test Statistics
- **Total Tests:** 24
- **Passed:** ___ / 24
- **Failed:** ___ / 24
- **Blocked:** ___ / 24
- **Not Run:** ___ / 24

### Critical Path Tests
- [ ] Admin Login
- [ ] Vendor Login
- [ ] Customer Registration/Login
- [ ] Experience Browsing
- [ ] Auto-Confirm Booking
- [ ] Manual-Confirm Booking
- [ ] Voucher Purchase & Redemption
- [ ] Security & Access Control

### Known Issues
_(Document any issues found during testing)_

| ID | Description | Severity | Status |
|----|-------------|----------|--------|
| | | | |

---

## Sign-Off

**QA Lead:** _________________ **Date:** _________

**Product Owner:** _________________ **Date:** _________

**Tech Lead:** _________________ **Date:** _________

---

## Acceptance Criteria

- [x] All test cases documented
- [ ] All critical path tests pass
- [ ] All three main user flows functional (Admin, Vendor, Customer)
- [ ] All third-party integrations working (Stripe, Twilio, SendGrid)
- [ ] Core business logic 100% correct (payments, refunds, availability, vouchers)
- [ ] Application responsive across devices
- [ ] Common errors handled gracefully
- [ ] Security controls verified

**Status:** ⏳ IN PROGRESS

---

*Last Updated: 2025-10-26*
