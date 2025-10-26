const bcrypt = require('bcrypt');
const { User, Experience, Category, Review, Availability } = require('../models');

/**
 * Seed the database with development data
 * This creates users, categories, experiences, reviews, and availability slots
 */
async function seedDatabase() {
  console.log('🌱 Starting database seeding... (Norn Irish Edition!)\n');

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
    const vendorDavy = await User.create({
      firstName: 'Davy',
      lastName: 'McWilliams',
      email: 'davy@exploreni.com',
      passwordHash: await bcrypt.hash('vendor123', 10),
      role: 'vendor',
      status: 'active',
    });
    console.log('  ✓ Vendor 1 created (davy@exploreni.com / vendor123)');

    const vendorSiobhan = await User.create({
      firstName: 'Siobhan',
      lastName: 'O\'Neill',
      email: 'siobhan@exploreni.com',
      passwordHash: await bcrypt.hash('vendor123', 10),
      role: 'vendor',
      status: 'active',
    });
    console.log('  ✓ Vendor 2 created (siobhan@exploreni.com / vendor123)');

    // Pending Vendor (for testing approval flow)
    const pendingVendorCiaran = await User.create({
      firstName: 'Ciaran',
      lastName: 'Murphy',
      email: 'ciaran@exploreni.com',
      passwordHash: await bcrypt.hash('vendor123', 10),
      role: 'vendor',
      status: 'pending_vendor',
    });
    console.log('  ✓ Pending vendor created (ciaran@exploreni.com / vendor123)');

    // Customer Users
    const customerMary = await User.create({
      firstName: 'Mary',
      lastName: 'Magee',
      email: 'mary@exploreni.com',
      passwordHash: await bcrypt.hash('customer123', 10),
      role: 'customer',
      status: 'active',
    });
    console.log('  ✓ Customer 1 created (mary@exploreni.com / customer123)');

    const customerPaddy = await User.create({
      firstName: 'Paddy',
      lastName: 'Johnston',
      email: 'paddy@exploreni.com',
      passwordHash: await bcrypt.hash('customer123', 10),
      role: 'customer',
      status: 'active',
    });
    console.log('  ✓ Customer 2 created (paddy@exploreni.com / customer123)');

    const customerShauna = await User.create({
      firstName: 'Shauna',
      lastName: 'Kelly',
      email: 'shauna@exploreni.com',
      passwordHash: await bcrypt.hash('customer123', 10),
      role: 'customer',
      status: 'active',
    });
    console.log('  ✓ Customer 3 created (shauna@exploreni.com / customer123)');

    console.log(`  ✓ ${await User.count()} users created in total`);

    // ==========================================
    // 2. Create Categories
    // ==========================================
    console.log('\nCreating categories...');
    
    const catTour = await Category.create({
      name: 'Tours',
      slug: 'tours',
    });

    const catAdventure = await Category.create({
      name: 'Adventures',
      slug: 'adventures',
    });

    const catFood = await Category.create({
      name: 'Food & Drink',
      slug: 'food-drink',
    });

    const catCulture = await Category.create({
      name: 'Cultural',
      slug: 'cultural',
    });

    const catOutdoor = await Category.create({
      name: 'Outdoor',
      slug: 'outdoor',
    });

    const catHistory = await Category.create({
        name: 'History & Heritage',
        slug: 'history-heritage',
    });

    console.log(`  ✓ ${await Category.count()} categories created`);

    // ==========================================
    // 3. Create Experiences (with different statuses)
    // ==========================================
    console.log('\nCreating experiences...');

    // --- Approved Experiences ---

    const exp1 = await Experience.create({
      title: "Giant's Causeway Tour",
      description: "Explore the stunning UNESCO World Heritage site. Our guide will give you the proper yarn about the giant Finn McCool. This tour includes transport, a guided walk, and plenty of time for a wee photo.",
      location: 'Bushmills, County Antrim',
      duration: 180,
      price: 45.00,
      capacity: 15,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c0/Causeway-code_poet-4.jpg',
      vendorId: vendorDavy.id,
      status: 'approved',
    });
    await exp1.setCategories([catTour, catOutdoor, catHistory]);

    const exp2 = await Experience.create({
      title: 'Belfast Titanic Experience',
      description: "Discover the story of the Titanic in the shipyard where she was built. Interactive galleries bring the ship's story to life. It's massive, so it is! Includes admission to all galleries and the SS Nomadic.",
      location: 'Titanic Quarter, Belfast',
      duration: 150,
      price: 25.00,
      capacity: 20,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c0/Titanic_Belfast_HDR.jpg',
      vendorId: vendorDavy.id,
      status: 'approved',
    });
    await exp2.setCategories([catTour, catCulture, catHistory]);

    const exp3 = await Experience.create({
      title: 'Mourne Mountains Hiking',
      description: "Guided hike through the beautiful Mourne Mountains, where 'the Mountains of Mourne sweep down to the sea'. Suitable for most fitness levels with breathtaking views. Includes professional guide and a packed lunch (with Tayto crisps, obviously).",
      location: 'Newcastle, County Down',
      duration: 240,
      price: 35.00,
      capacity: 10,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Mourne_Mountains_0004.jpg/2560px-Mourne_Mountains_0004.jpg',
      vendorId: vendorSiobhan.id,
      status: 'approved',
    });
    await exp3.setCategories([catAdventure, catOutdoor]);

    const exp4 = await Experience.create({
      title: 'Game of Thrones Filming Locations',
      description: "Visit iconic filming locations from the hit HBO series. See Winterfell (Castle Ward), the Dark Hedges (King's Road), and Ballintoy Harbour (Iron Islands). Our guide has all the behind-the-scenes yarn.",
      location: 'Various locations, Antrim & Down',
      duration: 360,
      price: 65.00,
      capacity: 12,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Dark_Hedges_near_Armoy%2C_Co_Antrim_%28cropped%29.jpg/960px-Dark_Hedges_near_Armoy%2C_Co_Antrim_%28cropped%29.jpg',
      vendorId: vendorDavy.id,
      status: 'approved',
    });
    await exp4.setCategories([catTour, catCulture]);

    const exp5 = await Experience.create({
      title: 'Carrick-a-Rede Rope Bridge Adventure',
      description: "Cross the famous rope bridge suspended 30 meters above the rocks. Experience stunning coastal scenery and try not to brick yourself. Weather-dependent activity, so check the forecast!",
      location: 'Ballintoy, County Antrim',
      duration: 120,
      price: 30.00,
      capacity: 8,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Carrick_a_rede_rope.jpg',
      vendorId: vendorSiobhan.id,
      status: 'approved',
    });
    await exp5.setCategories([catAdventure, catOutdoor]);

    const exp6 = await Experience.create({
      title: 'Irish Whiskey Tasting Experience',
      description: "Sample premium Irish whiskeys at the historic Bushmills Distillery. Includes tasting of 4 different whiskeys and a tour. Must be 18+. Have the craic, but mind your head the next day!",
      location: 'Bushmills, County Antrim',
      duration: 90,
      price: 40.00,
      capacity: 15,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/GoodIrishWhiskeys.jpg/2560px-GoodIrishWhiskeys.jpg',
      vendorId: vendorSiobhan.id,
      status: 'approved',
    });
    await exp6.setCategories([catFood, catTour]);

    const exp7 = await Experience.create({
      title: "Belfast's Famous Black Cab Tour",
      description: "Hop in an iconic black taxi for a proper yarn about Belfast's troubled past and vibrant present. Our drivers, who were there, will show you the Peace Wall and the famous political murals. It's a real eye-opener, so it is.",
      location: 'Belfast (Falls & Shankill Roads)',
      duration: 90,
      price: 40.00,
      capacity: 5,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/f/fd/Innishargie.jpg',
      vendorId: vendorDavy.id,
      status: 'approved',
    });
    await exp7.setCategories([catTour, catHistory, catCulture]);

    const exp8 = await Experience.create({
      title: "Derry Girls 'Catch Yerself On' Tour",
      description: "Wile popular, so it is! See the famous Derry Girls mural, walk the walls like Erin and the gang, and see where they filmed the 'Rock the Boat' scene. Pure class! (Cream horn not included).",
      location: 'Derry/Londonderry',
      duration: 120,
      price: 22.00,
      capacity: 15,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/07/Derry_Girls_Mural_-_geograph.org.uk_-_7105686.jpg', // Using a generic Derry pic
      vendorId: vendorSiobhan.id,
      status: 'approved',
    });
    await exp8.setCategories([catTour, catCulture]);

    const exp9 = await Experience.create({
      title: "St. George's Market - A Wee Taste of Belfast",
      description: "Fill your boots at the award-winning St. George's Market. We'll try a bit of everything, from a proper Belfast Bap to fresh seafood and local artisan cheese. Come hungry!",
      location: 'St. George\'s Market, Belfast',
      duration: 120,
      price: 30.00,
      capacity: 10,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/St_Georges_Market%2C_Belfast%2C_July_2010_%2802%29.JPG/500px-St_Georges_Market%2C_Belfast%2C_July_2010_%2802%29.JPG',
      vendorId: vendorDavy.id,
      status: 'approved',
    });
    await exp9.setCategories([catFood, catCulture]);

    const exp10 = await Experience.create({
      title: "Strangford Lough Sea Kayaking Adventure",
      description: "Get out on the lough! A guided paddle around Strangford, one of Europe's largest tidal loughs. See the seals at Angus Rock and explore wee islands. No experience needed, our guides are dead on.",
      location: 'Strangford, County Down',
      duration: 180,
      price: 50.00,
      capacity: 8,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Strangford_Lough_from_Portaferry%2C_looking_towards_the_narrows.JPG/500px-Strangford_Lough_from_Portaferry%2C_looking_towards_the_narrows.JPG',
      vendorId: vendorSiobhan.id,
      status: 'approved',
    });
    await exp10.setCategories([catAdventure, catOutdoor]);

    // --- Pending Experience (for testing approval flow) ---
    const pendingExp = await Experience.create({
      title: 'Ulster Folk Museum Trip',
      description: 'A step back in time. See how people lived in Ulster over 100 years ago. Walk through old villages, farms, and see craftspeople at work. Great day out.',
      location: 'Cultra, County Down',
      duration: 180,
      price: 20.00,
      capacity: 20,
      vendorId: pendingVendorCiaran.id,
      status: 'pending',
    });
    await pendingExp.setCategories([catTour, catHistory, catCulture]);

    // --- Rejected Experience (for testing) ---
    const rejectedExp = await Experience.create({
      title: 'Rejected Tour Example',
      description: 'This experience was rejected for testing purposes. Not enough craic.',
      location: 'Test Location',
      duration: 60,
      price: 10.00,
      capacity: 5,
      vendorId: vendorSiobhan.id,
      status: 'rejected',
    });

    console.log(`  ✓ ${await Experience.count()} experiences created (10 approved, 1 pending, 1 rejected)`);

    // ==========================================
    // 4. Create Reviews
    // ==========================================
    console.log('\nCreating reviews...');

    await Review.create({
      rating: 5,
      comment: 'Pure class! Our guide Davy was dead on, knew his stuff. The Causeway itself is unreal. Highly recommend, so I would.',
      customerId: customerMary.id,
      experienceId: exp1.id,
    });

    await Review.create({
      rating: 4,
      comment: 'The Titanic building is massive! Really well done. Was a wee bit crowded, but the tour was grand. Worth a look.',
      customerId: customerPaddy.id,
      experienceId: exp2.id,
    });

    await Review.create({
      rating: 5,
      comment: 'What a day! The Mournes are just gorgeous. Our guide was great craic and made sure everyone was safe. Was wrecked after, but in a good way!',
      customerId: customerMary.id,
      experienceId: exp3.id,
    });

    await Review.create({
      rating: 5,
      comment: 'The craic was 90! Being a massive GoT fan, this was the business. Seeing Winterfell and the Dark Hedges was unreal. Our guide had all the behind-the-scenes yarn.',
      customerId: customerPaddy.id,
      experienceId: exp4.id,
    });

    await Review.create({
      rating: 4,
      comment: 'NGL, I was bricking it on that bridge! But it was grand. The views are something else. Glad I did it!',
      customerId: customerMary.id,
      experienceId: exp5.id,
    });

    await Review.create({
      rating: 5,
      comment: 'Top notch. Got to sample some lovely whiskey and the tour was dead interesting. Had a good wee buzz on after!',
      customerId: customerPaddy.id,
      experienceId: exp6.id,
    });

    await Review.create({
      rating: 4,
      comment: 'Class. The stones are mad looking. Learned all about Finn McCool. Good wee trip.',
      customerId: customerShauna.id,
      experienceId: exp1.id,
    });

    // Reviews for new experiences
    await Review.create({
      rating: 5,
      comment: 'Our driver, \'Wee Stevie\', was an absolute legend. Told us his own stories. You see it on the news, but this is the real deal. A must-do in Belfast.',
      customerId: customerShauna.id,
      experienceId: exp7.id,
    });
    
    await Review.create({
      rating: 5,
      comment: 'Ach, it was hilarious! Our guide was a proper Derry girl herself. Loved the mural and just walking about the city. It\'s a cracker!',
      customerId: customerMary.id,
      experienceId: exp8.id,
    });
    
    await Review.create({
      rating: 4,
      comment: 'Brought my ma. We had a great feed. The Belfast Bap was massive! Great atmosphere, loads of wee stalls. Lovely morning out.',
      customerId: customerPaddy.id,
      experienceId: exp9.id,
    });
    
    await Review.create({
      rating: 5,
      comment: 'Magic. Saw about 20 seals just chilling. Our guide was sound. The water was baltic but they give you all the gear. 10/10.',
      customerId: customerShauna.id,
      experienceId: exp10.id,
    });


    console.log(`  ✓ ${await Review.count()} reviews created`);

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
    const nextWeek2 = new Date(today);
    nextWeek2.setDate(nextWeek2.getDate() + 8);
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    // Availability for Giant's Causeway Tour (exp1)
    await Availability.bulkCreate([
      {
        date: tomorrow.toISOString().split('T')[0],
        startTime: '09:00:00',
        endTime: '12:00:00',
        availableSlots: 15,
        experienceId: exp1.id,
      },
      {
        date: tomorrow.toISOString().split('T')[0],
        startTime: '14:00:00',
        endTime: '17:00:00',
        availableSlots: 10,
        experienceId: exp1.id,
      },
      {
        date: nextWeek.toISOString().split('T')[0],
        startTime: '09:00:00',
        endTime: '12:00:00',
        availableSlots: 15,
        experienceId: exp1.id,
      },
    ]);

    // Availability for Titanic (exp2)
    await Availability.bulkCreate([
      {
        date: tomorrow.toISOString().split('T')[0],
        startTime: '10:00:00',
        endTime: '12:30:00',
        availableSlots: 20,
        experienceId: exp2.id,
      },
      {
        date: nextWeek.toISOString().split('T')[0],
        startTime: '11:00:00',
        endTime: '13:30:00',
        availableSlots: 20,
        experienceId: exp2.id,
      },
    ]);

    // Availability for Mournes (exp3)
    await Availability.create({
      date: nextWeek.toISOString().split('T')[0],
      startTime: '08:00:00',
      endTime: '12:00:00',
      availableSlots: 10,
      experienceId: exp3.id,
    });

    // Availability for GoT (exp4)
    await Availability.create({
      date: nextWeek.toISOString().split('T')[0],
      startTime: '09:00:00',
      endTime: '15:00:00',
      availableSlots: 12,
      experienceId: exp4.id,
    });

    // Availability for Black Cab (exp7)
    await Availability.bulkCreate([
        {
          date: tomorrow.toISOString().split('T')[0],
          startTime: '10:00:00',
          endTime: '11:30:00',
          availableSlots: 5,
          experienceId: exp7.id,
        },
        {
          date: tomorrow.toISOString().split('T')[0],
          startTime: '12:00:00',
          endTime: '13:30:00',
          availableSlots: 5,
          experienceId: exp7.id,
        },
    ]);

    // Availability for Derry Girls (exp8)
    await Availability.create({
        date: nextWeek2.toISOString().split('T')[0],
        startTime: '14:00:00',
        endTime: '16:00:00',
        availableSlots: 15,
        experienceId: exp8.id,
    });

    // Availability for St George's (exp9) - Only Fri/Sat/Sun
    const nextFriday = new Date(today);
    nextFriday.setDate(nextFriday.getDate() + (5 + 7 - nextFriday.getDay()) % 7);
    await Availability.create({
        date: nextFriday.toISOString().split('T')[0],
        startTime: '10:00:00',
        endTime: '12:00:00',
        availableSlots: 10,
        experienceId: exp9.id,
    });
    
    // Availability for Kayaking (exp10)
    await Availability.create({
        date: nextWeek2.toISOString().split('T')[0],
        startTime: '13:00:00',
        endTime: '16:00:00',
        availableSlots: 8,
        experienceId: exp10.id,
    });


    console.log(`  ✓ ${await Availability.count()} availability slots created`);

    // ==========================================
    // Summary
    // ==========================================
    console.log('\n✅ Database seeding completed successfully! The craic was 90.\n');
    console.log('='.repeat(50));
    console.log('Test Credentials:');
    console.log('='.repeat(50));
    console.log('Admin:');
    console.log('  Email: admin@exploreni.com');
    console.log('  Password: admin123');
    console.log('');
    console.log('Vendors:');
    console.log('  Email: davy@exploreni.com');
    console.log('  Password: vendor123');
    console.log('  Email: siobhan@exploreni.com');
    console.log('  Password: vendor123');
    console.log('  Email: ciaran@exploreni.com (pending approval)');
    console.log('  Password: vendor123');
    console.log('');
    console.log('Customers:');
    console.log('  Email: mary@exploreni.com');
    console.log('  Password: customer123');
    console.log('  Email: paddy@exploreni.com');
    console.log('  Password: customer123');
    console.log('  Email: shauna@exploreni.com');
    console.log('  Password: customer123');
    console.log('='.repeat(50));
    console.log('\nData Summary:');
    console.log(`  - ${await User.count()} Users (1 admin, 3 vendors, 3 customers)`);
    console.log(`  - ${await Category.count()} Categories`);
    console.log(`  - ${await Experience.count()} Experiences (10 approved, 1 pending, 1 rejected)`);
    console.log(`  - ${await Review.count()} Reviews`);
    console.log(`  - ${await Availability.count()} Availability slots`);
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Error seeding database (Ach, away and shite!):', error);
    throw error;
  }
}

module.exports = { seedDatabase };