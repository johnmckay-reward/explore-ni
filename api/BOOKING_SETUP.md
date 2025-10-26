# Booking & Payment System - Setup Guide

This guide explains how to set up and use the booking and payment system for Explore NI.

## Overview

The booking and payment system allows customers to book experiences and pay for them using Stripe. It includes:

- **Booking Creation**: Create bookings with customer details
- **Payment Processing**: Stripe payment integration
- **Email Notifications**: Automated emails for confirmations and receipts
- **Webhook Handling**: Automatic processing of payment events

## Environment Setup

### 1. Install Dependencies

Dependencies are already installed if you ran `npm install`, but you need:
- `dotenv` - Environment variable management
- `stripe` - Stripe payment processing
- `@sendgrid/mail` - Email service
- `@paypal/checkout-server-sdk` - PayPal integration (optional)

### 2. Configure Environment Variables

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Edit the `.env` file and add your API keys:

```bash
# Stripe API Keys (Get from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# SendGrid API Key (Get from https://app.sendgrid.com/settings/api_keys)
SENDGRID_API_KEY=SG.your_sendgrid_api_key_here

# PayPal API Keys (Optional - Get from https://developer.paypal.com/)
PAYPAL_CLIENT_ID=your_paypal_client_id_here
PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here

# Base URLs
API_BASE_URL=http://localhost:3000
UI_BASE_URL=http://localhost:4200

# Application Port
PORT=3000
```

### 3. Configure Stripe Webhooks

1. Go to https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. Set the endpoint URL: `http://your-domain.com/api/webhooks/stripe`
4. Select events to listen to: `payment_intent.succeeded`
5. Copy the webhook signing secret to your `.env` file as `STRIPE_WEBHOOK_SECRET`

For local testing, use the Stripe CLI:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### 4. Configure SendGrid

1. Create a SendGrid account at https://sendgrid.com/
2. Create an API key in Settings > API Keys
3. Verify your sender email address
4. Update the sender email in `/api/services/email.service.js` (line 24, 61, 116)

## API Endpoints

### Create Booking

**POST** `/api/bookings`

Creates a new booking (first step of checkout).

**Request Body:**
```json
{
  "experienceId": 1,
  "availabilityId": 1,
  "quantity": 2,
  "customerDetails": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Response:**
```json
{
  "message": "Booking created successfully",
  "bookingId": 1,
  "totalPrice": 90.00
}
```

### Get Booking Details

**GET** `/api/bookings/:id`

Retrieves booking details including experience and availability information.

**Response:**
```json
{
  "id": 1,
  "experienceId": 1,
  "availabilityId": 1,
  "quantity": 2,
  "bookingDate": "2024-01-15",
  "totalPrice": 90.00,
  "status": "pending",
  "paymentStatus": "pending",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "experience": {
    "id": 1,
    "title": "Experience Title",
    "description": "Description",
    "price": 45.00,
    "confirmationMode": "auto"
  },
  "availability": {
    "id": 1,
    "date": "2024-01-15",
    "startTime": "10:00:00",
    "endTime": "12:00:00"
  }
}
```

### Create Stripe Payment Intent

**POST** `/api/payments/stripe/create-intent`

Creates a Stripe PaymentIntent for processing payment.

**Request Body:**
```json
{
  "bookingId": 1
}
```

**Response:**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx"
}
```

### Stripe Webhook

**POST** `/api/webhooks/stripe`

Handles Stripe webhook events (called by Stripe, not the client).

This endpoint:
1. Verifies the webhook signature
2. Processes `payment_intent.succeeded` events
3. Updates booking status
4. Decrements availability slots
5. Sends email notifications

## Booking Flow

### Standard Flow (Auto-Confirmation)

1. **Customer selects experience** → Experience detail page
2. **Customer fills booking form** → Checkout page (`/checkout/:id`)
3. **System creates booking** → `POST /api/bookings`
4. **Customer enters payment** → Payment page (`/payment/:bookingId`)
5. **System creates PaymentIntent** → `POST /api/payments/stripe/create-intent`
6. **Customer completes payment** → Stripe processes payment
7. **Stripe sends webhook** → `POST /api/webhooks/stripe`
8. **System confirms booking** → Updates status to "confirmed"
9. **System sends emails** → Confirmation email to customer
10. **Customer sees success** → Success page (`/payment-success/:bookingId`)

### Manual Confirmation Flow

Same as above, but at step 8:
- Booking status remains "pending"
- System sends notification to vendor instead
- Vendor must manually confirm the booking

## Commission System

The platform charges a 15% commission on all bookings:

- `commissionRate`: 0.15 (15%)
- `commissionAmount`: Calculated as `totalPrice * commissionRate`
- Both values are stored in the booking record

Example:
- Experience price: £45 per person
- Quantity: 2 people
- Total price: £90
- Commission (15%): £13.50
- Vendor receives: £76.50

## Testing

### Test Cards

Use these Stripe test cards:

**Successful payment:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits

**Payment fails:**
- Card: `4000 0000 0000 0002`

**Authentication required:**
- Card: `4000 0025 0000 3155`

### Testing the Webhook

1. Start the API server: `npm start`
2. In another terminal, run: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
3. Make a test payment
4. Check the webhook logs to see the event processing

### Manual Webhook Testing

Send a test webhook event:

```bash
stripe trigger payment_intent.succeeded
```

## Error Handling

### Booking Creation Errors

- **400**: Missing required fields
- **404**: Experience or availability not found
- **400**: Not enough slots available

### Payment Intent Errors

- **400**: Missing bookingId
- **404**: Booking not found
- **400**: Booking already paid
- **503**: Stripe not configured

### Webhook Errors

- **400**: Invalid signature
- **404**: Booking not found
- **500**: Processing error

## Security Considerations

1. **API Keys**: Never commit `.env` file to source control
2. **Webhook Signature**: Always verify Stripe webhook signatures in production
3. **HTTPS**: Use HTTPS in production for webhook endpoints
4. **Error Messages**: Don't expose sensitive information in error messages
5. **Rate Limiting**: Consider adding rate limiting to prevent abuse

## Troubleshooting

### Stripe not configured

**Error:** `"Stripe is not configured. Please set STRIPE_SECRET_KEY."`

**Solution:** Add your Stripe secret key to the `.env` file.

### Webhook signature verification failed

**Error:** `"Webhook signature verification failed"`

**Solutions:**
1. Check that `STRIPE_WEBHOOK_SECRET` is set correctly
2. Verify the endpoint URL in Stripe dashboard matches your API
3. Use Stripe CLI for local testing

### Emails not sending

**Error:** `"SendGrid API key not configured"`

**Solutions:**
1. Add `SENDGRID_API_KEY` to `.env` file
2. Verify sender email in SendGrid
3. Check SendGrid dashboard for email delivery status

### Authorization header missing

**Error:** `"Authorization header missing"` on booking/payment endpoints

**Solution:** This is a route ordering issue. Ensure booking and payment routes are mounted BEFORE the availability routes in `index.js`.

## Production Checklist

Before deploying to production:

- [ ] Set all environment variables in production environment
- [ ] Configure Stripe webhook with production URL
- [ ] Update Stripe publishable key in UI payment page
- [ ] Verify SendGrid sender email
- [ ] Test full booking flow with real payment
- [ ] Set up monitoring and logging
- [ ] Enable HTTPS
- [ ] Set up database backups
- [ ] Configure error alerting

## Support

For issues or questions:
1. Check the error logs in the console
2. Review Stripe dashboard for payment issues
3. Check SendGrid dashboard for email delivery
4. Refer to the API documentation above
