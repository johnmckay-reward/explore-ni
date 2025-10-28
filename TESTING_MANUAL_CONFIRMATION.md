# Epic 6: Manual Confirmation Flow - Testing Guide

This guide provides step-by-step instructions for testing the manual confirmation flow implementation.

## Prerequisites

1. Start the API server:
   ```bash
   cd api
   npm start
   ```

2. Start the UI development server (in a separate terminal):
   ```bash
   cd ui
   npm start
   ```

## Test Scenarios

### 1. Vendor Profile Settings

**Objective:** Verify vendors can update their notification preferences and phone number.

**Steps:**
1. Log in as a vendor:
   - Email: `davy@niexperiences.co.uk`
   - Password: `vendor123`

2. Navigate to **My Dashboard** → **Profile Settings** (or go directly to `/dashboard/profile`)

3. Update profile:
   - Enter phone number: `+447123456789`
   - Select notification preference: **Both Email and SMS**
   - Click **Save Changes**

4. Verify success message appears

5. Refresh page and verify values are persisted

**Expected Result:** Profile updates successfully and values are saved.

### 2. View Booking Requests

**Objective:** Verify vendors can view pending booking requests.

**Steps:**
1. Log in as vendor: `davy@niexperiences.co.uk` / `vendor123`

2. Navigate to **My Dashboard** → **Booking Requests** (or go to `/dashboard/requests`)

3. Verify the page displays:
   - "No pending booking requests" message (if no pending bookings exist)
   - OR a list of pending bookings with customer details

**Expected Result:** Page loads successfully and displays appropriate content.

### 3. Manual Confirmation Experience Setup

**Objective:** Set up an experience to require manual confirmation.

**API Test:**
```bash
# Login as vendor
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"davy@niexperiences.co.uk","password":"vendor123"}' | jq -r '.token')

# Get first experience ID
EXPERIENCE_ID=$(curl -s http://localhost:3000/api/experiences \
  -H "Authorization: Bearer $TOKEN" | jq -r '.experiences[0].id')

# Update experience to manual confirmation (requires database access)
# You can also do this through the Experience Form UI by adding a dropdown
```

**Database Update (for testing):**
```sql
UPDATE Experiences SET confirmationMode = 'manual', timeoutBehavior = 'auto-decline' WHERE id = 1;
```

### 4. Test Booking Creation with Manual Confirmation

**Objective:** Create a booking for a manual confirmation experience.

**Steps:**
1. Restart API (to apply database changes if you updated it manually)

2. Log out and log in as a customer:
   - Email: `mary@niexperiences.co.uk`
   - Password: `customer123`

3. Browse experiences and select one with `confirmationMode = 'manual'`

4. Complete booking and payment

5. Check vendor's email (console logs if SendGrid not configured)

6. Check vendor's SMS (console logs if Twilio not configured)

**Expected Result:** 
- Booking created with status 'pending'
- Vendor receives notification via configured preference

### 5. Test Confirm Booking Flow

**Objective:** Verify vendor can confirm a pending booking.

**Steps:**
1. Log in as vendor: `davy@niexperiences.co.uk` / `vendor123`

2. Navigate to **Booking Requests**

3. Click **Confirm** on a pending booking

4. Confirm the action in the confirmation dialog

5. Verify:
   - Success message appears
   - Booking removed from the list
   - Customer receives confirmation email (check console logs)

**API Test:**
```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"davy@niexperiences.co.uk","password":"vendor123"}' | jq -r '.token')

# Get pending bookings
curl -s http://localhost:3000/api/bookings/requests \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# Confirm booking (replace BOOKING_ID)
curl -s -X PUT http://localhost:3000/api/bookings/BOOKING_ID/confirm \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
```

**Expected Result:** Booking status changes to 'confirmed', customer notified.

### 6. Test Decline Booking Flow

**Objective:** Verify vendor can decline a booking with automatic refund.

**Steps:**
1. Log in as vendor: `davy@niexperiences.co.uk` / `vendor123`

2. Navigate to **Booking Requests**

3. Click **Decline** on a pending booking

4. Confirm the action (noting refund will be processed)

5. Verify:
   - Success message with refund confirmation
   - Booking removed from list
   - Customer receives decline email (check console logs)
   - Stripe refund created (check console logs or Stripe dashboard)
   - Availability slots restored

**API Test:**
```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"davy@niexperiences.co.uk","password":"vendor123"}' | jq -r '.token')

# Decline booking (replace BOOKING_ID)
curl -s -X PUT http://localhost:3000/api/bookings/BOOKING_ID/decline \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
```

**Expected Result:** 
- Booking status changes to 'declined'
- Refund processed via Stripe
- Availability slots restored
- Customer notified

### 7. Test Timeout Automation

**Objective:** Verify bookings are automatically processed after timeout.

**Setup:**
1. Create a booking for a manual confirmation experience
2. Let it sit for the timeout period (2 hours in business hours, 12 hours outside)

**OR use manual testing:**
```bash
# Manually trigger the timeout job
cd api
node -e "const {checkBookingTimeouts} = require('./jobs/bookingTimeouts'); checkBookingTimeouts();"
```

**Expected Behavior:**
- **auto-decline**: Booking declined, refund issued, slots restored
- **auto-confirm**: Booking confirmed if slots available
- **escalate**: Booking marked as escalated, admin notified

### 8. Test Notification Preferences

**Objective:** Verify different notification preferences work correctly.

**Test Cases:**

**Email Only:**
1. Set notification preference to "Email"
2. Create booking for manual experience
3. Verify only email sent (check logs)

**SMS Only:**
1. Set notification preference to "SMS"
2. Add phone number
3. Create booking
4. Verify only SMS sent (check logs)

**Both:**
1. Set preference to "Both"
2. Create booking
3. Verify both email and SMS sent

**None:**
1. Set preference to "None"
2. Create booking
3. Verify no notifications sent

## API Endpoints Reference

### User Profile
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update profile (phoneNumber, notificationPreference)

### Vendor Booking Management
- `GET /api/bookings/requests` - Get pending booking requests (vendor only)
- `PUT /api/bookings/:id/confirm` - Confirm a booking (vendor only)
- `PUT /api/bookings/:id/decline` - Decline and refund a booking (vendor only)

## Environment Variables

Add these to your `.env` file for full functionality:

```env
# SMS Service (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Email Service (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
```

## Troubleshooting

### No booking requests showing
- Verify experience has `confirmationMode = 'manual'`
- Verify booking has `status = 'pending'` and `paymentStatus = 'succeeded'`
- Check that booking belongs to vendor's experience

### Notifications not sent
- Check console logs for service messages
- Verify API keys are configured
- SMS requires valid phone number in E.164 format (+44...)

### Timeout job not running
- Check console on API startup for "Booking timeout job scheduled"
- Manually trigger: `node -e "const {checkBookingTimeouts} = require('./jobs/bookingTimeouts'); checkBookingTimeouts();"`

## Success Criteria

✅ Vendor can update phone number and notification preferences  
✅ Vendor receives notifications via configured method  
✅ Vendor can view pending booking requests  
✅ Vendor can confirm bookings (customer notified)  
✅ Vendor can decline bookings (customer notified, refunded, slots restored)  
✅ Timeout job automatically processes old bookings  
✅ Navigation links work in vendor dashboard  
