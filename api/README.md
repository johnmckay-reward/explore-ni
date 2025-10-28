# NI Experiences API

Backend API for the NI Experiences platform - a marketplace for Northern Ireland experiences.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express 5
- **Database**: SQLite (in-memory for development)
- **ORM**: Sequelize
- **Authentication**: JWT
- **Payments**: Stripe
- **Email**: SendGrid
- **SMS**: Twilio
- **Scheduling**: node-cron
- **Logging**: Winston
- **Testing**: Jest

## Prerequisites

- Node.js (v18 or higher)
- npm

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

3. **Edit `.env` file:**
   - Set `SETTINGS_ENCRYPTION_SECRET` to a strong 32-byte random string
     ```bash
     # Generate a secure secret
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
   - All other API keys (Stripe, Twilio, SendGrid, PayPal) are now managed via the Admin Settings UI

## Running the Application

### Development Mode

```bash
npm start
```

The server will start on `http://localhost:3000` with hot-reloading enabled via nodemon.

### What Happens on Startup

1. **Database Initialization**: All tables are created (drops existing tables in dev mode)
2. **Settings Seed**: Creates entries for all required settings (Stripe, Twilio, etc.)
3. **Settings Load**: Loads encrypted settings from database into memory
4. **Data Seed**: Seeds test data (users, experiences, bookings, etc.)
5. **Cron Jobs**: Starts the booking timeout job (runs every 10 minutes)

## Running Tests

```bash
npm test
```

Tests are written using Jest and cover:
- Crypto service (encryption/decryption)
- Settings service (loading, updating, caching)
- Voucher redemption logic
- Booking timeout logic

## API Endpoints

### Public Endpoints

- `GET /api/public/categories` - Get all categories
- `GET /api/public/experiences` - Get all approved experiences (with filtering)
- `GET /api/public/experiences/:id` - Get single experience details
- `GET /api/public/partner/:slug/experiences` - Get experiences for hotel partner

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/request-vendor` - Request vendor approval

### User Routes (Authenticated)

- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile

### Admin Routes (Admin Only)

- `GET /api/admin/users` - List users (filterable by status)
- `PUT /api/admin/users/:id/approve` - Approve vendor application
- `PUT /api/admin/users/:id/reject` - Reject vendor application
- `GET /api/admin/experiences` - List experiences (filterable by status)
- `PUT /api/admin/experiences/:id/approve` - Approve experience
- `PUT /api/admin/experiences/:id/reject` - Reject experience
- `GET /api/admin/settings` - Get all settings (keys and descriptions only)
- `PUT /api/admin/settings` - Update a setting value

### Vendor Routes (Vendor Only)

- `POST /api/experiences` - Create new experience
- `PUT /api/experiences/:id` - Update experience
- `GET /api/experiences/vendor/mine` - Get vendor's experiences
- `POST /api/experiences/:id/availability` - Add availability slots
- `GET /api/bookings/vendor/requests` - Get pending booking requests
- `PUT /api/bookings/:id/confirm` - Confirm booking
- `PUT /api/bookings/:id/decline` - Decline booking

### Booking & Payment

- `POST /api/bookings` - Create new booking
- `GET /api/bookings/:id` - Get booking details
- `POST /api/payments/stripe/create-intent` - Create Stripe payment intent
- `POST /api/webhooks/stripe` - Stripe webhook handler (raw body required)

### Vouchers

- `POST /api/vouchers/purchase-fixed` - Purchase fixed-amount voucher
- `POST /api/vouchers/purchase-experience` - Purchase experience voucher
- `POST /api/vouchers/apply` - Apply voucher to booking
- `GET /api/admin/vouchers` - List all vouchers (admin only)

## Admin Settings Management

All third-party API keys are now managed through the database for security and flexibility.

### Configuring API Keys (Admin UI)

1. Log in as an admin user
2. Navigate to `/admin/settings`
3. Enter API keys for:
   - Stripe Secret Key
   - Stripe Webhook Secret
   - Twilio Account SID
   - Twilio Auth Token
   - Twilio Phone Number
   - SendGrid API Key
   - PayPal Client ID
   - PayPal Client Secret

### Security Notes

- All values are encrypted using AES-256-GCM before storage
- The `SETTINGS_ENCRYPTION_SECRET` must never be committed to git
- Settings values are never returned by the API (write-only)
- Changes to settings are immediate (no restart required)

## Database Models

- **User**: Users (customers, vendors, admins)
- **Experience**: Activities/experiences offered
- **Booking**: Customer bookings
- **Availability**: Time slots for experiences
- **Voucher**: Gift vouchers (fixed amount or experience-specific)
- **Review**: Customer reviews
- **Category**: Experience categories
- **Setting**: Encrypted configuration settings
- **HotelPartner**: Hotel partner integrations

## Cron Jobs

### Booking Timeout Job

Runs every 10 minutes to check for timed-out bookings.

**Timeout Thresholds:**
- Business hours (Mon-Fri, 9 AM - 5 PM): 2 hours
- Non-business hours: 12 hours

**Timeout Behaviors:**
- `auto-confirm`: Confirms booking if availability exists
- `auto-decline`: Declines booking and issues refund
- `escalate`: Marks booking for admin review

## Error Logging

All 5xx server errors are logged using Winston:
- **Console**: All log levels
- **File** (`logs/error.log`): Error level only
- **File** (`logs/combined.log`): All log levels

## Development Credentials

After seeding, you can log in with:

**Admin:**
- Email: `admin@niexperiences.co.uk`
- Password: `admin123`

**Vendor:**
- Email: `davy@niexperiences.co.uk`
- Password: `vendor123`

**Customer:**
- Email: `mary@niexperiences.co.uk`
- Password: `customer123`

## Troubleshooting

### Settings not loading
- Ensure `SETTINGS_ENCRYPTION_SECRET` is set in `.env`
- Check console logs for decryption errors
- Verify settings were seeded (`npm start` should seed automatically)

### Stripe errors
- Ensure Stripe keys are configured in Admin Settings
- Check webhook secret for webhook signature verification
- Use Stripe test mode keys for development

### Email/SMS not working
- Ensure API keys are configured in Admin Settings
- Check console logs for service errors
- Emails and SMS are skipped gracefully if not configured

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a persistent database (PostgreSQL recommended)
3. Configure `DATABASE_URL` environment variable
4. Set a strong `SETTINGS_ENCRYPTION_SECRET`
5. Configure all API keys via Admin Settings UI
6. Set up SSL/TLS for HTTPS
7. Configure proper CORS origins
8. Set up log rotation for Winston logs
9. Use a process manager (PM2 recommended)

## License

ISC
