# Explore NI - Operations Runbook

This runbook provides step-by-step instructions for common administrative and operational tasks.

## Table of Contents

1. [Initial Setup](#initial-setup)
2. [Admin Tasks](#admin-tasks)
3. [Vendor Management](#vendor-management)
4. [System Configuration](#system-configuration)
5. [QA Testing Procedures](#qa-testing-procedures)
6. [Monitoring & Troubleshooting](#monitoring--troubleshooting)
7. [Backup & Recovery](#backup--recovery)

---

## Initial Setup

### First-Time Application Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd explore-ni
   ```

2. **Set up the API:**
   ```bash
   cd api
   npm install
   cp .env.example .env
   ```

3. **Generate encryption secret:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   
   Copy the output and add it to `api/.env`:
   ```
   SETTINGS_ENCRYPTION_SECRET=<generated-secret>
   ```

4. **Start the API:**
   ```bash
   npm start
   ```
   
   The API will:
   - Create database tables
   - Seed settings
   - Load test data
   - Start on `http://localhost:3000`

5. **Set up the UI:**
   ```bash
   cd ../ui
   npm install
   npm start
   ```
   
   The UI will start on `http://localhost:4200`

6. **Log in as admin:**
   - Navigate to `http://localhost:4200/login`
   - Email: `admin@exploreni.com`
   - Password: `admin123`

7. **Configure API keys** (see [Updating API Keys](#updating-api-keys))

---

## Admin Tasks

### Updating API Keys

**Required for:** Payment processing, email delivery, SMS notifications

1. **Log in as admin**
   - URL: `/login`
   - Use admin credentials

2. **Navigate to Settings**
   - Click on your profile dropdown
   - Select "Admin Settings" or navigate to `/admin/settings`

3. **Update each API key:**
   - Enter the new value in the corresponding field
   - Click "Save" next to that field
   - Wait for confirmation message

4. **Verify changes:**
   - Test the affected functionality (e.g., send a test email, process a test payment)
   - Check API logs for any errors: `api/logs/error.log`

**Important Notes:**
- All values are encrypted before storage
- Never share these keys with anyone
- Changes take effect immediately (no restart needed)
- Keep backup copies of keys in a secure password manager

### Approving a Vendor Application

1. **Log in as admin**

2. **Navigate to Vendor Approvals**
   - URL: `/admin/vendors`
   - Or click "Admin" → "Vendors" in navigation

3. **Review pending vendors:**
   - Status filter: "Pending Vendor"
   - Review vendor information

4. **Approve or reject:**
   - Click "Approve" to grant vendor access
   - Click "Reject" to deny and revert to customer role

5. **Notification:**
   - Vendor receives email notification (if SendGrid is configured)
   - They can now log in and create experiences

### Approving an Experience Listing

1. **Log in as admin**

2. **Navigate to Experience Approvals**
   - URL: `/admin/experiences`
   - Or click "Admin" → "Experiences" in navigation

3. **Review pending experiences:**
   - Status filter: "Pending"
   - Check title, description, price, images, categories

4. **Approve or reject:**
   - Click "Approve" to make the experience publicly visible
   - Click "Reject" to send it back to the vendor

5. **Notification:**
   - Vendor receives notification
   - Approved experiences appear in public marketplace immediately

### Managing Vouchers

1. **Navigate to Voucher Management**
   - URL: `/admin/vouchers`

2. **View all vouchers:**
   - See purchase date, value, balance, status
   - Filter by enabled/disabled, type

3. **Disable a voucher** (if needed):
   - Contact technical support to manually disable
   - Update directly in database if necessary

---

## Vendor Management

### How Vendors Create Experiences

1. **Vendor logs in**
   - Must have approved vendor status

2. **Create new experience:**
   - Navigate to `/dashboard/experience/new`
   - Fill in required fields:
     - Title, description, location
     - Price, duration, capacity
     - Categories
     - Images (upload)

3. **Submit for approval:**
   - Experience status: "Pending"
   - Admin receives notification (if configured)

4. **Admin approval required:**
   - See [Approving an Experience](#approving-an-experience-listing)

5. **Add availability:**
   - After approval, vendor can add time slots
   - Navigate to experience → "Manage Availability"

### Vendor Booking Management

**Auto-Confirm Mode:**
- Bookings automatically confirmed after payment
- Customer receives immediate confirmation

**Manual Confirm Mode:**
- Vendor receives notification of new booking
- Vendor must confirm or decline within timeout window:
  - 2 hours during business hours (Mon-Fri, 9 AM - 5 PM)
  - 12 hours outside business hours

**Timeout Behaviors:**
- `auto-confirm`: Booking confirmed automatically if availability exists
- `auto-decline`: Booking declined, customer refunded
- `escalate`: Flagged for admin review

---

## System Configuration

### Stripe Configuration

1. **Create Stripe account:**
   - Sign up at stripe.com
   - Complete verification

2. **Get API keys:**
   - Navigate to Developers → API Keys
   - Copy "Secret key" (starts with `sk_test_` for test mode)

3. **Set up webhook:**
   - Navigate to Developers → Webhooks
   - Add endpoint: `https://your-domain.com/api/webhooks/stripe`
   - Select events:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
   - Copy "Signing secret" (starts with `whsec_`)

4. **Update in Admin Settings:**
   - `STRIPE_SECRET_KEY`: Your secret key
   - `STRIPE_WEBHOOK_SECRET`: Webhook signing secret

### SendGrid Configuration

1. **Create SendGrid account:**
   - Sign up at sendgrid.com
   - Verify email domain

2. **Create API key:**
   - Settings → API Keys
   - Create API Key with "Full Access"
   - Copy the key (starts with `SG.`)

3. **Verify sender:**
   - Settings → Sender Authentication
   - Verify single sender: `noreply@your-domain.com`

4. **Update in Admin Settings:**
   - `SENDGRID_API_KEY`: Your API key

### Twilio Configuration

1. **Create Twilio account:**
   - Sign up at twilio.com

2. **Get credentials:**
   - Console Dashboard
   - Copy Account SID and Auth Token

3. **Get phone number:**
   - Phone Numbers → Buy a Number
   - Choose number with SMS capability

4. **Update in Admin Settings:**
   - `TWILIO_ACCOUNT_SID`: Account SID
   - `TWILIO_AUTH_TOKEN`: Auth Token
   - `TWILIO_PHONE_NUMBER`: Phone number in E.164 format (e.g., `+447700900000`)

### PayPal Configuration

1. **Create PayPal business account:**
   - Sign up at paypal.com

2. **Create app:**
   - Developer Dashboard
   - My Apps & Credentials
   - Create App

3. **Get credentials:**
   - Copy Client ID
   - Show/Copy Secret

4. **Update in Admin Settings:**
   - `PAYPAL_CLIENT_ID`: Client ID
   - `PAYPAL_CLIENT_SECRET`: Secret

### Hotel Partner Setup

1. **Create hotel partner entry:**
   - Currently requires database access
   - SQL: 
     ```sql
     INSERT INTO HotelPartners (name, slug, createdAt, updatedAt) 
     VALUES ('The Grand Hotel', 'grand-hotel', datetime('now'), datetime('now'));
     ```

2. **Generate QR code:**
   - URL: `https://your-domain.com/partner/grand-hotel`
   - Use QR code generator tool
   - Print and place in hotel lobby

3. **Test landing page:**
   - Visit `/partner/grand-hotel`
   - Verify hotel name displays
   - Check experiences load correctly

---

## QA Testing Procedures

### Running Pre-Launch QA Tests

**Objective:** Execute comprehensive QA test suite before production deployment.

**When to run:**
- Before major releases
- After significant feature changes
- Before production deployment
- Quarterly for regression testing

**Procedure:**

1. **Prepare QA Environment:**
   ```bash
   # Ensure clean environment
   cd api
   rm database.sqlite  # Delete old database
   
   # Seed QA test data
   node config/seed-qa.js
   
   # Start API server
   npm start
   ```

2. **Configure API Keys:**
   - Login as admin: `admin@exploreni.com` / `admin123`
   - Navigate to `/admin/settings`
   - Configure all API keys with **TEST MODE** credentials:
     - Stripe (Test Mode: `sk_test_...`)
     - Twilio (Test account)
     - SendGrid (Test account)

3. **Run Manual Tests:**
   - Open `QA_TEST_PLAN.md`
   - Execute each test case in order
   - Mark results: `[x] PASS` or `[x] FAIL`
   - Document issues with screenshots

4. **Run Automated E2E Tests:**
   ```bash
   cd ui
   
   # Interactive mode (recommended for debugging)
   npm run cypress:open
   
   # Headless mode (for full suite)
   npm run cypress:run
   ```

5. **Review Results:**
   - Check test summary in `QA_TEST_PLAN.md`
   - Review Cypress videos: `ui/cypress/videos/`
   - Review failure screenshots: `ui/cypress/screenshots/`
   - Update "Known Issues" section

6. **Generate Test Report:**
   - Calculate pass rate
   - Document critical issues
   - Get stakeholder sign-off

**Success Criteria:**
- All critical path tests (P0) pass
- Pass rate ≥ 95%
- No P0 or P1 bugs remain unfixed
- Stakeholder approval obtained

### QA Test Accounts

**Admin:**
- Email: `admin@exploreni.com`
- Password: `admin123`

**Vendors:**
- Active: `davy@exploreni.com` / `vendor123`
- Active: `siobhan@exploreni.com` / `vendor123`
- Pending: `ciaran@exploreni.com` / `vendor123`

**Customers:**
- `mary@exploreni.com` / `customer123`
- `paddy@exploreni.com` / `customer123`
- `shauna@exploreni.com` / `customer123`

### QA Test Data

**Experiences:**
- City Bike Tour (auto-confirm, £100)
- Private Art Class (manual-confirm, £80)
- Pending Test Experience (pending approval)

**Vouchers:**
- `QA-TEST-50` (£50 fixed amount)
- `QA-BIKE-TOUR` (City Bike Tour experience)

**Hotel Partner:**
- Slug: `test-hotel`
- URL: `/partner/test-hotel`

### Resetting QA Environment

```bash
# From api directory
cd api

# Delete database
rm database.sqlite

# Re-seed with QA data
node config/seed-qa.js

# Restart server
npm start
```

---

## Monitoring & Troubleshooting

### Checking Logs

**Error logs:**
```bash
cd api
tail -f logs/error.log
```

**Combined logs:**
```bash
tail -f logs/combined.log
```

**Real-time monitoring:**
```bash
# API console (live)
npm start

# Look for:
# - [Email Service] messages
# - [SMS Service] messages
# - [Stripe Webhook] messages
# - [Timeout Job] messages
# - [Settings Service] messages
```

### Common Issues

#### Emails not sending
1. Check SendGrid API key is configured
2. Verify sender email is verified in SendGrid
3. Check logs: `grep "Email Service" logs/combined.log`
4. Test SendGrid API key via curl

#### SMS not sending
1. Check Twilio credentials are configured
2. Verify phone number format (E.164)
3. Check Twilio account balance
4. Check logs: `grep "SMS Service" logs/combined.log`

#### Payments failing
1. Verify Stripe is in test mode for testing
2. Check Stripe API key is configured
3. Verify webhook secret matches
4. Use test card: 4242 4242 4242 4242
5. Check Stripe dashboard for payment events

#### Settings not loading
1. Check `SETTINGS_ENCRYPTION_SECRET` is set in `.env`
2. Verify settings table is seeded
3. Check encryption/decryption logs
4. Restart application

### Testing Booking Timeout

```bash
# Manually trigger timeout check
node -e "
const { checkBookingTimeouts } = require('./api/jobs/bookingTimeouts');
checkBookingTimeouts().then(() => console.log('Done'));
"
```

---

## Backup & Recovery

### Database Backup

**SQLite (Development):**
```bash
# Backup
cp api/database.sqlite api/backups/database-$(date +%Y%m%d-%H%M%S).sqlite

# Restore
cp api/backups/database-20240115-120000.sqlite api/database.sqlite
```

**PostgreSQL (Production):**
```bash
# Backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d-%H%M%S).sql

# Restore
psql $DATABASE_URL < backup-20240115-120000.sql
```

### Settings Backup

**Export encrypted settings:**
```sql
SELECT key, value FROM Settings;
```

**Important:**
- Keep backup of `SETTINGS_ENCRYPTION_SECRET`
- Without it, encrypted settings cannot be decrypted
- Store securely in password manager or secrets vault

### Logs Backup

```bash
# Archive logs
tar -czf logs-backup-$(date +%Y%m%d).tar.gz api/logs/

# Keep for compliance/audit purposes
mv logs-backup-*.tar.gz /secure/archive/
```

---

## Support Contacts

- **Technical Issues**: tech-support@explore-ni.com
- **Admin Access**: admin@explore-ni.com
- **Vendor Support**: vendors@explore-ni.com

---

## Quick Reference

### Default Ports
- API: `http://localhost:3000`
- UI: `http://localhost:4200`

### Admin Credentials (Development)
- Email: `admin@exploreni.com`
- Password: `admin123`

### Test Payment Card
- Number: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any valid postal code

### Important Files
- API Config: `api/.env`
- API Logs: `api/logs/`
- UI Config: `ui/src/environments/environment.ts`

### Restart Commands
```bash
# API
cd api && npm start

# UI
cd ui && npm start
```

---

*Last Updated: 2024-01-15*
