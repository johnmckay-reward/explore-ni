# Gift Voucher System - Testing Guide

This document provides step-by-step instructions for manually testing the gift voucher system implementation.

## Prerequisites

1. Start the API server:
   ```bash
   cd api
   npm install
   node index.js
   ```

2. Start the UI development server:
   ```bash
   cd ui
   npm install
   npm start
   ```

3. Ensure you have test Stripe credentials configured in `api/.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

## Test Scenarios

### 1. Purchase Fixed Amount Gift Voucher

**Steps:**
1. Navigate to `http://localhost:4200/gift-vouchers`
2. Select a predefined amount (£25, £50, or £100) OR enter a custom amount
3. Fill in the form:
   - Your Name: "John Smith"
   - Recipient Name: "Jane Doe"
   - Recipient Email: "jane@example.com"
   - Message: "Happy Birthday!"
4. Click "Continue to Payment"
5. Enter Stripe test card: `4242 4242 4242 4242`
6. Complete the payment

**Expected Results:**
- Payment successful
- Voucher created in database with unique code
- Email sent to recipient with PDF attachment (check SendGrid logs)
- Voucher is enabled and has correct balance

**API Verification:**
```bash
# Check voucher was created
curl http://localhost:3000/api/vouchers/admin/vouchers \
  -H "Authorization: Bearer <admin_token>"
```

---

### 2. Gift an Experience

**Steps:**
1. Navigate to `http://localhost:4200/experiences`
2. Click on any experience
3. Click "Gift This Experience" button
4. Fill in the form:
   - Your Name: "Sarah Johnson"
   - Recipient Name: "Mike Brown"
   - Recipient Email: "mike@example.com"
   - Message: "Enjoy this amazing experience!"
5. Click "Continue to Payment"
6. Enter Stripe test card details
7. Complete the payment

**Expected Results:**
- Payment successful for experience price
- Voucher created with type='experience'
- Voucher linked to specific experienceId
- Email sent to recipient with experience details
- PDF shows "1x [Experience Name]"

---

### 3. Redeem Voucher at Checkout

**Steps:**
1. Create a booking for an experience (navigate to experience → select date/time → checkout)
2. On the payment page, locate "Have a Gift Voucher?" section
3. Enter a valid voucher code (from test scenario 1 or 2)
4. Click "Apply"

**Expected Results - Full Payment:**
- If voucher covers full amount:
  - Total price updates to £0.00
  - Payment form is hidden
  - Success message shows "Booking Paid with Voucher"
  - Booking status is 'succeeded'

**Expected Results - Partial Payment:**
- If voucher covers partial amount:
  - Total price reduced by voucher value
  - Remaining balance shown
  - Payment form still visible with updated amount
  - Can complete payment for remaining balance

**API Verification:**
```bash
# Test voucher application
curl -X POST http://localhost:3000/api/vouchers/apply \
  -H "Content-Type: application/json" \
  -d '{
    "code": "GIFT-xxxx-xxxx",
    "bookingId": 1
  }'
```

---

### 4. Admin Voucher Management

**Steps:**
1. Login as admin (admin@niexperiences.co.uk / admin123)
2. Navigate to `http://localhost:4200/admin/vouchers`
3. View the vouchers list

**Create Voucher Manually:**
1. Click "Create Voucher"
2. Fill in the form:
   - Type: "Fixed Amount"
   - Amount: 75
   - Sender Name: "Admin"
   - Recipient Name: "Test User"
   - Recipient Email: "test@example.com"
   - Message: "Test voucher"
   - Expiry Date: (future date)
3. Click "Create"

**Expected Results:**
- New voucher appears in table
- Code is auto-generated (GIFT-xxxx-xxxx format)
- Status shows "Active"
- All details are correct

**Edit Voucher:**
1. Click "Edit" on any voucher
2. Update:
   - Current Balance: change value
   - Expiry Date: set new date
   - Enabled: toggle on/off
3. Click "Save Changes"

**Expected Results:**
- Voucher updates successfully
- Changes reflected in table
- Status updates if disabled

---

### 5. Edge Cases & Validation

**Test Invalid Voucher Code:**
1. Go to payment page with a booking
2. Enter invalid code: "INVALID-CODE"
3. Click "Apply"
- **Expected:** Error message "Voucher not found"

**Test Expired Voucher:**
1. Admin creates voucher with past expiry date
2. Try to redeem at checkout
- **Expected:** Error message "Voucher has expired"

**Test Disabled Voucher:**
1. Admin disables a voucher
2. Try to redeem at checkout
- **Expected:** Error message "Voucher is not enabled or has been fully used"

**Test Experience Voucher Mismatch:**
1. Create experience voucher for Experience A
2. Try to book Experience B
3. Apply the voucher
- **Expected:** Error message "Voucher not valid for this experience"

---

## API Endpoints to Test

### Public Endpoints

**Purchase Fixed Amount Voucher:**
```bash
curl -X POST http://localhost:3000/api/vouchers/purchase-fixed \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50,
    "senderName": "John Smith",
    "recipientName": "Jane Doe",
    "recipientEmail": "jane@example.com",
    "message": "Happy Birthday!"
  }'
```

**Purchase Experience Voucher:**
```bash
curl -X POST http://localhost:3000/api/vouchers/purchase-experience \
  -H "Content-Type: application/json" \
  -d '{
    "experienceId": 1,
    "senderName": "Sarah Johnson",
    "recipientName": "Mike Brown",
    "recipientEmail": "mike@example.com",
    "message": "Enjoy!"
  }'
```

**Apply Voucher:**
```bash
curl -X POST http://localhost:3000/api/vouchers/apply \
  -H "Content-Type: application/json" \
  -d '{
    "code": "GIFT-xxxx-xxxx",
    "bookingId": 1
  }'
```

### Admin Endpoints

**Get All Vouchers:**
```bash
curl http://localhost:3000/api/vouchers/admin/vouchers?page=1&limit=10 \
  -H "Authorization: Bearer <admin_token>"
```

**Create Voucher:**
```bash
curl -X POST http://localhost:3000/api/vouchers/admin/vouchers \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "fixed_amount",
    "amount": 75,
    "senderName": "Admin",
    "recipientName": "Test User",
    "recipientEmail": "test@example.com"
  }'
```

**Update Voucher:**
```bash
curl -X PUT http://localhost:3000/api/vouchers/admin/vouchers/1 \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "currentBalance": 25,
    "isEnabled": true
  }'
```

---

## Database Verification

Check vouchers in database:
```bash
# Access SQLite database
sqlite3 api/database.sqlite

# Query vouchers
SELECT id, code, type, initialValue, currentBalance, isEnabled, recipientEmail 
FROM Vouchers;

# Check specific voucher
SELECT * FROM Vouchers WHERE code = 'GIFT-xxxx-xxxx';
```

---

## Stripe Webhook Testing

To test webhook locally, use Stripe CLI:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test webhook
stripe trigger payment_intent.succeeded
```

---

## Success Criteria

✓ Users can purchase fixed amount vouchers
✓ Users can purchase experience-specific vouchers  
✓ Recipients receive email with PDF attachment
✓ PDF contains voucher code, value, and message
✓ Vouchers can be redeemed at checkout
✓ Partial redemption works correctly for fixed amount vouchers
✓ Experience vouchers validate correct experience
✓ Admins can view all vouchers
✓ Admins can manually create vouchers
✓ Admins can edit voucher balance and status
✓ Expired/disabled vouchers cannot be used
✓ Invalid voucher codes show appropriate errors
✓ Payment updates correctly when voucher is applied
✓ Webhook creates voucher after successful payment

---

## Known Limitations

1. **Font Loading:** UI build shows warnings about Google Fonts (expected in sandboxed environment)
2. **Email Sending:** Requires valid SendGrid API key in production
3. **Stripe Keys:** Test mode only - update for production use
4. **Rate Limiting:** Not implemented on public endpoints (consider for production)

---

## Troubleshooting

**Voucher email not sending:**
- Check SENDGRID_API_KEY is set in .env
- Verify from email is verified in SendGrid
- Check server logs for errors

**Payment not completing:**
- Verify Stripe keys are correct
- Check webhook endpoint is accessible
- Review Stripe dashboard for payment status

**Voucher not applying:**
- Verify voucher code is correct
- Check voucher is enabled in database
- Ensure expiry date is in future
- Confirm experience match (for experience vouchers)
