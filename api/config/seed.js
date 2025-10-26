const bcrypt = require('bcrypt');
const { User, Experience, Category, Review, Availability } = require('../models');

/**
 * Seed the database with development data
 * This creates users, categories, experiences, reviews, and availability slots
 */
async function seedDatabase() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // ==========================================
    // 1. Create Users (different account types)
    // ==========================================
    console.log('Creating users...');
    
    // Admin User
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@exploreni.com',
      passwordHash: await bcrypt.hash('admin123', 10),
      role: 'admin',
      status: 'active',
    });
    console.log('  ✓ Admin user created (admin@exploreni.com / admin123)');

    // Vendor Users
    const vendor1 = await User.create({
      firstName: 'John',
      lastName: 'Smith',
      email: 'john@exploreni.com',
      passwordHash: await bcrypt.hash('vendor123', 10),
      role: 'vendor',
      status: 'active',
    });
    console.log('  ✓ Vendor 1 created (john@exploreni.com / vendor123)');

    const vendor2 = await User.create({
      firstName: 'Sarah',
      lastName: 'Connor',
      email: 'sarah@exploreni.com',
      passwordHash: await bcrypt.hash('vendor123', 10),
      role: 'vendor',
      status: 'active',
    });
    console.log('  ✓ Vendor 2 created (sarah@exploreni.com / vendor123)');

    // Pending Vendor (for testing approval flow)
    const pendingVendor = await User.create({
      firstName: 'Pending',
      lastName: 'Vendor',
      email: 'pending@exploreni.com',
      passwordHash: await bcrypt.hash('vendor123', 10),
      role: 'vendor',
      status: 'pending_vendor',
    });
    console.log('  ✓ Pending vendor created (pending@exploreni.com / vendor123)');

    // Customer Users
    const customer1 = await User.create({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@exploreni.com',
      passwordHash: await bcrypt.hash('customer123', 10),
      role: 'customer',
      status: 'active',
    });
    console.log('  ✓ Customer 1 created (jane@exploreni.com / customer123)');

    const customer2 = await User.create({
      firstName: 'Bob',
      lastName: 'Wilson',
      email: 'bob@exploreni.com',
      passwordHash: await bcrypt.hash('customer123', 10),
      role: 'customer',
      status: 'active',
    });
    console.log('  ✓ Customer 2 created (bob@exploreni.com / customer123)');

    // ==========================================
    // 2. Create Categories
    // ==========================================
    console.log('\nCreating categories...');
    
    const tourCategory = await Category.create({
      name: 'Tours',
      slug: 'tours',
    });

    const adventureCategory = await Category.create({
      name: 'Adventures',
      slug: 'adventures',
    });

    const foodCategory = await Category.create({
      name: 'Food & Drink',
      slug: 'food-drink',
    });

    const cultureCategory = await Category.create({
      name: 'Cultural',
      slug: 'cultural',
    });

    const outdoorCategory = await Category.create({
      name: 'Outdoor',
      slug: 'outdoor',
    });
    console.log('  ✓ 5 categories created');

    // ==========================================
    // 3. Create Experiences (with different statuses)
    // ==========================================
    console.log('\nCreating experiences...');

    // Approved Experiences
    const exp1 = await Experience.create({
      title: "Giant's Causeway Tour",
      description: "Explore the stunning UNESCO World Heritage site with an expert guide. Learn about the unique hexagonal basalt columns formed by ancient volcanic activity and the legends of Finn McCool. This tour includes transportation, a guided walk, and plenty of photo opportunities.",
      location: 'Bushmills, County Antrim',
      duration: 180,
      price: 45.00,
      capacity: 15,
      imageUrl: 'https://images.unsplash.com/photo-1590004953392-5aba2e72269a?w=800',
      vendorId: vendor1.id,
      status: 'approved',
    });
    await exp1.setCategories([tourCategory, outdoorCategory]);

    const exp2 = await Experience.create({
      title: 'Belfast Titanic Experience',
      description: "Discover the story of the Titanic at the world's largest Titanic visitor experience. Interactive galleries bring the ship's story to life, from construction to maiden voyage to tragic sinking. Includes admission to all galleries and a guided tour.",
      location: 'Belfast, County Antrim',
      duration: 150,
      price: 25.00,
      capacity: 20,
      imageUrl: 'https://images.unsplash.com/photo-1555992336-fb0d29498b13?w=800',
      vendorId: vendor1.id,
      status: 'approved',
    });
    await exp2.setCategories([tourCategory, cultureCategory]);

    const exp3 = await Experience.create({
      title: 'Mourne Mountains Hiking',
      description: "Guided hiking tour through the beautiful Mourne Mountains, where 'the Mountains of Mourne sweep down to the sea'. Suitable for all fitness levels with breathtaking views. Includes professional guide, safety equipment, and a packed lunch.",
      location: 'Newcastle, County Down',
      duration: 240,
      price: 35.00,
      capacity: 10,
      imageUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800',
      vendorId: vendor2.id,
      status: 'approved',
    });
    await exp3.setCategories([adventureCategory, outdoorCategory]);

    const exp4 = await Experience.create({
      title: 'Game of Thrones Filming Locations',
      description: "Visit iconic filming locations from the hit HBO series. See Winterfell (Castle Ward), the Dark Hedges (King's Road), Ballintoy Harbour (Iron Islands), and more. Includes transportation, guide, and exclusive behind-the-scenes stories.",
      location: 'Various locations',
      duration: 360,
      price: 65.00,
      capacity: 12,
      imageUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=800',
      vendorId: vendor1.id,
      status: 'approved',
    });
    await exp4.setCategories([tourCategory, cultureCategory]);

    const exp5 = await Experience.create({
      title: 'Carrick-a-Rede Rope Bridge Adventure',
      description: "Cross the famous rope bridge suspended 30 meters above the rocks and Atlantic Ocean. Experience stunning coastal scenery and learn about salmon fishing history. Weather-dependent activity with safety briefing included.",
      location: 'Ballintoy, County Antrim',
      duration: 120,
      price: 30.00,
      capacity: 8,
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      vendorId: vendor2.id,
      status: 'approved',
    });
    await exp5.setCategories([adventureCategory, outdoorCategory]);

    const exp6 = await Experience.create({
      title: 'Irish Whiskey Tasting Experience',
      description: "Sample premium Irish whiskeys and learn about the distilling process at historic Bushmills Distillery. Includes tasting of 4 different whiskeys, tour of the distillery, and a souvenir glass. Must be 18+.",
      location: 'Bushmills, County Antrim',
      duration: 90,
      price: 40.00,
      capacity: 15,
      imageUrl: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=800',
      vendorId: vendor2.id,
      status: 'approved',
    });
    await exp6.setCategories([foodCategory, tourCategory]);

    // Pending Experience (for testing approval flow)
    const pendingExp = await Experience.create({
      title: 'Derry City Walls Tour',
      description: 'Walk the historic city walls and learn about Derry/Londonderry rich history.',
      location: 'Derry, County Londonderry',
      duration: 120,
      price: 20.00,
      capacity: 20,
      vendorId: vendor1.id,
      status: 'pending',
    });
    await pendingExp.setCategories([tourCategory]);

    // Rejected Experience (for testing)
    const rejectedExp = await Experience.create({
      title: 'Rejected Tour Example',
      description: 'This experience was rejected for testing purposes.',
      location: 'Test Location',
      duration: 60,
      price: 10.00,
      capacity: 5,
      vendorId: vendor2.id,
      status: 'rejected',
    });

    console.log('  ✓ 8 experiences created (6 approved, 1 pending, 1 rejected)');

    // ==========================================
    // 4. Create Reviews
    // ==========================================
    console.log('\nCreating reviews...');

    await Review.create({
      rating: 5,
      comment: 'Absolutely amazing tour! Our guide was knowledgeable and the scenery was breathtaking. Highly recommend!',
      customerId: customer1.id,
      experienceId: exp1.id,
    });

    await Review.create({
      rating: 4,
      comment: 'Great experience overall. The Titanic museum is very well done. Could use a bit more time in the galleries.',
      customerId: customer2.id,
      experienceId: exp2.id,
    });

    await Review.create({
      rating: 5,
      comment: 'Perfect day out! The views from the Mournes are incredible. Our guide was excellent and very safety-conscious.',
      customerId: customer1.id,
      experienceId: exp3.id,
    });

    await Review.create({
      rating: 5,
      comment: 'As a huge GoT fan, this was a dream come true! Visited all the iconic locations. Worth every penny!',
      customerId: customer2.id,
      experienceId: exp4.id,
    });

    await Review.create({
      rating: 4,
      comment: 'Thrilling experience! The rope bridge is scary but safe. Beautiful coastal views all around.',
      customerId: customer1.id,
      experienceId: exp5.id,
    });

    await Review.create({
      rating: 5,
      comment: 'Excellent whiskey selection and very informative tour. Great value for money!',
      customerId: customer2.id,
      experienceId: exp6.id,
    });

    await Review.create({
      rating: 4,
      comment: 'Really enjoyed this tour. The geological formations are fascinating!',
      customerId: customer2.id,
      experienceId: exp1.id,
    });

    console.log('  ✓ 7 reviews created');

    // ==========================================
    // 5. Create Availability Slots
    // ==========================================
    console.log('\nCreating availability slots...');

    // Helper to create dates
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    // Availability for Giant's Causeway Tour
    await Availability.create({
      date: tomorrow.toISOString().split('T')[0],
      startTime: '09:00:00',
      endTime: '12:00:00',
      availableSlots: 15,
      experienceId: exp1.id,
    });

    await Availability.create({
      date: tomorrow.toISOString().split('T')[0],
      startTime: '14:00:00',
      endTime: '17:00:00',
      availableSlots: 10,
      experienceId: exp1.id,
    });

    await Availability.create({
      date: nextWeek.toISOString().split('T')[0],
      startTime: '09:00:00',
      endTime: '12:00:00',
      availableSlots: 15,
      experienceId: exp1.id,
    });

    // Availability for other experiences
    await Availability.create({
      date: tomorrow.toISOString().split('T')[0],
      startTime: '10:00:00',
      endTime: '12:30:00',
      availableSlots: 20,
      experienceId: exp2.id,
    });

    await Availability.create({
      date: nextWeek.toISOString().split('T')[0],
      startTime: '08:00:00',
      endTime: '12:00:00',
      availableSlots: 10,
      experienceId: exp3.id,
    });

    await Availability.create({
      date: nextWeek.toISOString().split('T')[0],
      startTime: '09:00:00',
      endTime: '15:00:00',
      availableSlots: 12,
      experienceId: exp4.id,
    });

    console.log('  ✓ 6 availability slots created');

    // ==========================================
    // Summary
    // ==========================================
    console.log('\n✅ Database seeding completed successfully!\n');
    console.log('='.repeat(50));
    console.log('Test Credentials:');
    console.log('='.repeat(50));
    console.log('Admin:');
    console.log('  Email: admin@exploreni.com');
    console.log('  Password: admin123');
    console.log('');
    console.log('Vendors:');
    console.log('  Email: john@exploreni.com');
    console.log('  Password: vendor123');
    console.log('  Email: sarah@exploreni.com');
    console.log('  Password: vendor123');
    console.log('  Email: pending@exploreni.com (pending approval)');
    console.log('  Password: vendor123');
    console.log('');
    console.log('Customers:');
    console.log('  Email: jane@exploreni.com');
    console.log('  Password: customer123');
    console.log('  Email: bob@exploreni.com');
    console.log('  Password: customer123');
    console.log('='.repeat(50));
    console.log('\nData Summary:');
    console.log('  - 6 Users (1 admin, 3 vendors, 2 customers)');
    console.log('  - 5 Categories');
    console.log('  - 8 Experiences (6 approved, 1 pending, 1 rejected)');
    console.log('  - 7 Reviews');
    console.log('  - 6 Availability slots');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

module.exports = { seedDatabase };
