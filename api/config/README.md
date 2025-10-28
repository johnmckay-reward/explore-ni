# Database Seeding

This directory contains the seed data configuration for development purposes.

## Overview

The `seed.js` file populates the database with test data including:
- **Users**: Admin, Vendors (active and pending), and Customers
- **Categories**: Tours, Adventures, Food & Drink, Cultural, Outdoor
- **Experiences**: 8 experiences with different statuses (approved, pending, rejected)
- **Reviews**: Sample reviews from customers
- **Availability**: Time slots for booking experiences

## Usage

### Automatic Seeding (Default)

By default, the database is automatically seeded when the API server starts. The seed function is called in `api/index.js`:

```javascript
await seedDatabase();
```

### Disable Auto-Seeding

To disable automatic seeding, simply comment out or remove the line in `api/index.js`:

```javascript
// await seedDatabase();  // Comment this line to disable auto-seeding
```

### Manual Seeding

You can also manually seed the database by creating a script:

```javascript
const { sequelize } = require('./models');
const { seedDatabase } = require('./config/seed');

const runSeed = async () => {
  await sequelize.sync({ force: true });
  await seedDatabase();
  process.exit(0);
};

runSeed();
```

## Test Credentials

### Admin Account
- **Email**: admin@niexperiences.co.uk
- **Password**: admin123
- **Use for**: Approving vendors, managing experiences, accessing admin dashboard

### Vendor Accounts
- **Active Vendor 1**:
  - Email: john@niexperiences.co.uk
  - Password: vendor123
  
- **Active Vendor 2**:
  - Email: sarah@niexperiences.co.uk
  - Password: vendor123
  
- **Pending Vendor** (for testing approval flow):
  - Email: pending@niexperiences.co.uk
  - Password: vendor123

### Customer Accounts
- **Customer 1**:
  - Email: jane@niexperiences.co.uk
  - Password: customer123
  
- **Customer 2**:
  - Email: bob@niexperiences.co.uk
  - Password: customer123

## Data Summary

After seeding, the database contains:
- **6 Users**: 1 admin, 3 vendors (2 active, 1 pending), 2 customers
- **5 Categories**: Various experience types
- **8 Experiences**: 6 approved (visible to public), 1 pending, 1 rejected
- **7 Reviews**: Sample customer feedback with ratings
- **6 Availability Slots**: Time slots for bookings

## Customizing Seed Data

To customize the seed data, edit `/api/config/seed.js`:

1. **Add more users**: Create additional User records in the seed function
2. **Add categories**: Create new Category records
3. **Add experiences**: Create new Experience records and associate with categories
4. **Add reviews**: Create Review records linked to customers and experiences
5. **Add availability**: Create Availability records for bookings

## Notes

- The database uses `{ force: true }` in development, which **drops all tables** on startup
- All passwords are hashed using bcrypt
- Experience images use Unsplash URLs (placeholder images)
- Reviews include realistic ratings (4-5 stars)
- Availability slots are created for tomorrow and next week
