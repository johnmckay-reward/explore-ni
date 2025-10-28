# NI Experiences UI

Frontend application for the NI Experiences platform - a marketplace for Northern Ireland experiences.

## Tech Stack

- **Framework**: Angular 20
- **UI Components**: ng-bootstrap (Bootstrap 5)
- **Styling**: SCSS, Bootstrap 5
- **Icons**: Bootstrap Icons
- **HTTP Client**: Angular HttpClient
- **Routing**: Angular Router
- **Forms**: Reactive Forms
- **Payments**: Stripe.js (@stripe/stripe-js)
- **Calendar**: angular-calendar
- **Testing**: Jasmine, Karma, Cypress

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.7.

## Prerequisites

- Node.js (v18 or higher)
- npm
- Angular CLI: `npm install -g @angular/cli`

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   
   The API URL is configured in `src/environments/environment.ts`:
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:3000',
   };
   ```

## Development server

To start a local development server, run:

```bash
ng serve
```

Or use npm:

```bash
npm start
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Application Structure

### Pages

#### Public Pages
- **Home** (`/`) - Landing page with featured experiences
- **Experience List** (`/experiences`) - Browse all approved experiences
- **Experience Detail** (`/experience/:id`) - View experience details
- **Category View** (`/category/:slug`) - Filter experiences by category
- **Hotel Partner Landing** (`/partner/:slug`) - QR-code accessible hotel partner pages
- **Checkout** (`/checkout/:id`) - Booking details and customer information
- **Payment** (`/payment/:bookingId`) - Stripe payment processing
- **Payment Success** (`/payment-success/:bookingId`) - Booking confirmation

#### Gift Vouchers
- **Gift Vouchers** (`/gift-vouchers`) - Purchase gift vouchers
- **Gift Experience** (`/gift-experience/:id`) - Purchase experience-specific voucher

#### Authentication
- **Login** (`/login`) - User login
- **Register** (`/register`) - User registration
- **Apply Vendor** (`/apply-vendor`) - Vendor application form

#### Admin Pages (Admin Only)
- **Vendor Approval** (`/admin/vendors`) - Approve/reject vendor applications
- **Experience Approval** (`/admin/experiences`) - Approve/reject experiences
- **Voucher Management** (`/admin/vouchers`) - View all vouchers
- **Settings** (`/admin/settings`) - Configure API keys and secrets

#### Vendor Dashboard (Vendor Only)
- **My Listings** (`/dashboard/my-listings`) - Manage experiences
- **Experience Form** (`/dashboard/experience/new`) - Create new experience
- **Edit Experience** (`/dashboard/experience/edit/:id`) - Edit experience
- **Availability Manager** (`/dashboard/experience/:id/availability`) - Manage time slots
- **Booking Requests** (`/dashboard/requests`) - Review pending bookings
- **Vendor Profile** (`/dashboard/profile`) - Update vendor information

### Components

- **ExperienceCard** - Reusable experience display card
- **Navigation** - Main navigation header
- Additional shared components in `src/app/components/`

### Services

- **AuthService** - Authentication and JWT management
- **PublicExperienceService** - Fetch public experiences
- **VoucherService** - Voucher purchase and management
- Additional services in `src/app/services/`

### Guards

- **authGuard** - Requires authentication
- **adminGuard** - Requires admin role
- **vendorGuard** - Requires vendor role

## Building

To build the project run:

```bash
ng build
```

Or:

```bash
npm run build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

### Production Build

```bash
ng build --configuration production
```

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

Or:

```bash
npm test
```

## Running end-to-end tests

End-to-end tests are implemented using Cypress.

### Install Cypress (if not already installed)

```bash
npm install --save-dev cypress
```

### Open Cypress Test Runner

```bash
npx cypress open
```

### Run Cypress Tests Headlessly

```bash
npx cypress run
```

### E2E Test Coverage

- **Checkout Flow**: Complete booking journey from homepage to success page
- Additional tests can be added in `cypress/e2e/`

## Key Features

### For Customers
- Browse and search experiences
- Filter by category, location, price, rating
- Book experiences with date/time selection
- Secure payment via Stripe
- Purchase gift vouchers (fixed amount or experience-specific)
- Apply vouchers to bookings
- View booking confirmations

### For Vendors
- Create and manage experiences
- Set availability schedules
- Manual or automatic booking confirmation
- View booking requests
- Manage vendor profile

### For Admins
- Approve/reject vendor applications
- Approve/reject experience listings
- View all vouchers
- Configure API keys and secrets (Stripe, Twilio, SendGrid, PayPal)

### Hotel Partners
- QR-accessible landing pages
- Curated experience lists
- Mobile-optimized design

## Styling

The application uses:
- **Bootstrap 5** for layout and components
- **Bootstrap Icons** for iconography
- **SCSS** for custom styling
- **Poppins** font from Google Fonts

Global styles are in `src/styles.scss` and variables in `src/_variables.scss`.

## Environment Configuration

### Development
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
};
```

### Production
```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.niexperiences.co.uk', // Your production API URL
};
```

## Development Credentials

After API seeding, you can log in with:

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

### API Connection Issues
- Ensure the API is running on `http://localhost:3000`
- Check `environment.ts` for correct API URL
- Verify CORS is enabled in the API

### Build Errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Angular cache: `ng cache clean`

### Payment Testing
- Use Stripe test card: `4242 4242 4242 4242`
- Any future expiry date
- Any 3-digit CVC
- Any postal code

## Production Deployment

1. Build for production: `ng build --configuration production`
2. Deploy `dist/ui/` to your web server or CDN
3. Configure environment variables for production API URL
4. Set up SSL/TLS for HTTPS
5. Configure proper routing (handle client-side routes)

### Recommended Hosting
- Netlify
- Vercel
- AWS S3 + CloudFront
- Azure Static Web Apps
- Google Firebase Hosting

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## License

ISC

