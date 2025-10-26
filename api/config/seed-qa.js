/**
 * QA Test Data Seed Script
 * 
 * This script creates comprehensive test data for QA testing.
 * It extends the base seed script with additional test scenarios.
 * 
 * Usage:
 *   node api/config/seed-qa.js
 * 
 * Creates:
 * - All standard seed data (from seed.js)
 * - Additional test experiences for specific scenarios
 * - Test vouchers
 * - Test bookings in various states
 * - Hotel partner for landing page testing
 */

const bcrypt = require('bcrypt');
const { 
  User, 
  Experience, 
  Category, 
  Availability, 
  Booking,
  Voucher,
  HotelPartner,
  sequelize 
} = require('../models');

async function seedQAData() {
  console.log('🧪 QA Test Data Seeding - Comprehensive Test Environment Setup\n');
  
  try {
    // Sync database
    await sequelize.sync({ force: false });
    console.log('✓ Database synced\n');

    // ==========================================
    // 1. Create Test Users (if not exists)
    // ==========================================
    console.log('Creating test users...');
    
    const [admin] = await User.findOrCreate({
      where: { email: 'admin@exploreni.com' },
      defaults: {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@exploreni.com',
        passwordHash: await bcrypt.hash('admin123', 10),
        role: 'admin',
        status: 'active',
      }
    });
    console.log('  ✓ Admin user ready');

    const [vendorDavy] = await User.findOrCreate({
      where: { email: 'davy@exploreni.com' },
      defaults: {
        firstName: 'Davy',
        lastName: 'McWilliams',
        email: 'davy@exploreni.com',
        passwordHash: await bcrypt.hash('vendor123', 10),
        role: 'vendor',
        status: 'active',
        phoneNumber: '+447700900001',
        notificationPreference: 'both'
      }
    });
    console.log('  ✓ Vendor Davy ready');

    const [vendorSiobhan] = await User.findOrCreate({
      where: { email: 'siobhan@exploreni.com' },
      defaults: {
        firstName: 'Siobhan',
        lastName: 'O\'Neill',
        email: 'siobhan@exploreni.com',
        passwordHash: await bcrypt.hash('vendor123', 10),
        role: 'vendor',
        status: 'active',
        phoneNumber: '+447700900002',
        notificationPreference: 'email'
      }
    });
    console.log('  ✓ Vendor Siobhan ready');

    const [pendingVendor] = await User.findOrCreate({
      where: { email: 'ciaran@exploreni.com' },
      defaults: {
        firstName: 'Ciaran',
        lastName: 'Murphy',
        email: 'ciaran@exploreni.com',
        passwordHash: await bcrypt.hash('vendor123', 10),
        role: 'vendor',
        status: 'pending_vendor'
      }
    });
    console.log('  ✓ Pending Vendor Ciaran ready');

    const [customerMary] = await User.findOrCreate({
      where: { email: 'mary@exploreni.com' },
      defaults: {
        firstName: 'Mary',
        lastName: 'Magee',
        email: 'mary@exploreni.com',
        passwordHash: await bcrypt.hash('customer123', 10),
        role: 'customer',
        status: 'active'
      }
    });
    console.log('  ✓ Customer Mary ready');

    const [customerPaddy] = await User.findOrCreate({
      where: { email: 'paddy@exploreni.com' },
      defaults: {
        firstName: 'Paddy',
        lastName: 'Johnston',
        email: 'paddy@exploreni.com',
        passwordHash: await bcrypt.hash('customer123', 10),
        role: 'customer',
        status: 'active'
      }
    });
    console.log('  ✓ Customer Paddy ready');

    const [customerShauna] = await User.findOrCreate({
      where: { email: 'shauna@exploreni.com' },
      defaults: {
        firstName: 'Shauna',
        lastName: 'Kelly',
        email: 'shauna@exploreni.com',
        passwordHash: await bcrypt.hash('customer123', 10),
        role: 'customer',
        status: 'active'
      }
    });
    console.log('  ✓ Customer Shauna ready\n');

    // ==========================================
    // 2. Create Categories
    // ==========================================
    console.log('Creating categories...');
    
    const [catTours] = await Category.findOrCreate({
      where: { slug: 'tours' },
      defaults: { name: 'Tours', slug: 'tours' }
    });
    
    const [catActivities] = await Category.findOrCreate({
      where: { slug: 'activities' },
      defaults: { name: 'Activities', slug: 'activities' }
    });
    
    const [catFood] = await Category.findOrCreate({
      where: { slug: 'food-drink' },
      defaults: { name: 'Food & Drink', slug: 'food-drink' }
    });
    
    console.log('  ✓ Categories ready\n');

    // ==========================================
    // 3. Create Test Experiences
    // ==========================================
    console.log('Creating test experiences...');

    // Auto-Confirm Experience
    const [expBikeTour] = await Experience.findOrCreate({
      where: { title: 'City Bike Tour' },
      defaults: {
        title: 'City Bike Tour',
        description: 'Explore Belfast on two wheels. Auto-confirm booking for QA testing.',
        location: 'Belfast',
        price: 100,
        duration: 180,
        maxGroupSize: 15,
        confirmationMode: 'auto',
        status: 'approved',
        vendorId: vendorDavy.id
      }
    });
    await expBikeTour.addCategory(catTours);
    console.log('  ✓ City Bike Tour (auto-confirm) created');

    // Manual-Confirm Experience
    const [expArtClass] = await Experience.findOrCreate({
      where: { title: 'Private Art Class' },
      defaults: {
        title: 'Private Art Class',
        description: 'Intimate art workshop with local artist. Manual confirmation for QA testing.',
        location: 'Belfast',
        price: 80,
        duration: 120,
        maxGroupSize: 8,
        confirmationMode: 'manual',
        timeoutBehavior: 'auto-decline',
        status: 'approved',
        vendorId: vendorDavy.id
      }
    });
    await expArtClass.addCategory(catActivities);
    console.log('  ✓ Private Art Class (manual-confirm) created');

    // Pending Experience (for approval testing)
    const [expPending] = await Experience.findOrCreate({
      where: { title: 'Pending Test Experience' },
      defaults: {
        title: 'Pending Test Experience',
        description: 'This experience is pending approval for QA testing.',
        location: 'Belfast',
        price: 60,
        duration: 90,
        maxGroupSize: 10,
        confirmationMode: 'auto',
        status: 'pending',
        vendorId: vendorDavy.id
      }
    });
    await expPending.addCategory(catFood);
    console.log('  ✓ Pending Test Experience created');

    // ==========================================
    // 4. Create Availability Slots
    // ==========================================
    console.log('Creating availability slots...');

    // Create slots for next 7 days
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      // City Bike Tour - multiple times per day
      await Availability.findOrCreate({
        where: {
          experienceId: expBikeTour.id,
          date: dateStr,
          time: '10:00'
        },
        defaults: {
          experienceId: expBikeTour.id,
          date: dateStr,
          time: '10:00',
          availableSlots: 15,
          totalSlots: 15
        }
      });

      await Availability.findOrCreate({
        where: {
          experienceId: expBikeTour.id,
          date: dateStr,
          time: '14:00'
        },
        defaults: {
          experienceId: expBikeTour.id,
          date: dateStr,
          time: '14:00',
          availableSlots: 15,
          totalSlots: 15
        }
      });

      // Private Art Class - once per day
      await Availability.findOrCreate({
        where: {
          experienceId: expArtClass.id,
          date: dateStr,
          time: '18:00'
        },
        defaults: {
          experienceId: expArtClass.id,
          date: dateStr,
          time: '18:00',
          availableSlots: 8,
          totalSlots: 8
        }
      });
    }
    console.log('  ✓ Availability slots created for next 7 days\n');

    // ==========================================
    // 5. Create Test Vouchers
    // ==========================================
    console.log('Creating test vouchers...');

    // Fixed amount voucher
    await Voucher.findOrCreate({
      where: { code: 'QA-TEST-50' },
      defaults: {
        code: 'QA-TEST-50',
        type: 'fixed_amount',
        originalBalance: 50,
        currentBalance: 50,
        isEnabled: true,
        senderName: 'QA Test',
        recipientName: 'Test User',
        recipientEmail: 'test@example.com',
        message: 'QA test voucher - £50'
      }
    });
    console.log('  ✓ Fixed amount voucher QA-TEST-50 created');

    // Experience-specific voucher
    await Voucher.findOrCreate({
      where: { code: 'QA-BIKE-TOUR' },
      defaults: {
        code: 'QA-BIKE-TOUR',
        type: 'experience',
        originalBalance: 100,
        currentBalance: 100,
        experienceId: expBikeTour.id,
        isEnabled: true,
        senderName: 'QA Test',
        recipientName: 'Test User',
        recipientEmail: 'test@example.com',
        message: 'QA test voucher - City Bike Tour'
      }
    });
    console.log('  ✓ Experience voucher QA-BIKE-TOUR created\n');

    // ==========================================
    // 6. Create Hotel Partner
    // ==========================================
    console.log('Creating hotel partner...');

    await HotelPartner.findOrCreate({
      where: { slug: 'test-hotel' },
      defaults: {
        name: 'Test Hotel Belfast',
        slug: 'test-hotel'
      }
    });
    console.log('  ✓ Hotel partner test-hotel created\n');

    // ==========================================
    // Summary
    // ==========================================
    console.log('✅ QA Test Data Seeding Complete!\n');
    console.log('═══════════════════════════════════════');
    console.log('Test Accounts:');
    console.log('  Admin:          admin@exploreni.com / admin123');
    console.log('  Vendor (Active): davy@exploreni.com / vendor123');
    console.log('  Vendor (Active): siobhan@exploreni.com / vendor123');
    console.log('  Vendor (Pending): ciaran@exploreni.com / vendor123');
    console.log('  Customer:       mary@exploreni.com / customer123');
    console.log('  Customer:       paddy@exploreni.com / customer123');
    console.log('  Customer:       shauna@exploreni.com / customer123');
    console.log('\nTest Experiences:');
    console.log('  - City Bike Tour (auto-confirm, £100)');
    console.log('  - Private Art Class (manual-confirm, £80)');
    console.log('  - Pending Test Experience (pending approval)');
    console.log('\nTest Vouchers:');
    console.log('  - QA-TEST-50 (£50 fixed amount)');
    console.log('  - QA-BIKE-TOUR (City Bike Tour)');
    console.log('\nHotel Partner:');
    console.log('  - test-hotel (Test Hotel Belfast)');
    console.log('  - URL: /partner/test-hotel');
    console.log('═══════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error seeding QA test data:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedQAData()
    .then(() => {
      console.log('✓ Seeding complete');
      process.exit(0);
    })
    .catch(error => {
      console.error('✗ Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedQAData;
