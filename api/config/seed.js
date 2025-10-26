const bcrypt = require('bcrypt');
const { User, Experience, Category, Review, Availability } = require('../models');

/**
 * Seed the database with development data
 * This creates users, categories, experiences, reviews, and availability slots
 */
async function seedDatabase() {
  console.log('🌱 Right, let\'s get this wee database seeded. Strap in, it\'s gonna be pure class.\n');

  try {
    // ==========================================
    // 1. Create Users (different account types)
    // ==========================================
    console.log('Creating the head the balls (users)...');
    
    // Admin User
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@exploreni.com',
      passwordHash: await bcrypt.hash('admin123', 10),
      role: 'admin',
      status: 'active',
    });
    console.log('  ✓ The Big Boss created (admin@exploreni.com / admin123)');

    // Vendor Users
    const vendorDavy = await User.create({
      firstName: 'Davy',
      lastName: 'McWilliams',
      email: 'davy@exploreni.com',
      passwordHash: await bcrypt.hash('vendor123', 10),
      role: 'vendor',
      status: 'active',
    });
    console.log('  ✓ Yer man Davy created (davy@exploreni.com / vendor123)');

    const vendorSiobhan = await User.create({
      firstName: 'Siobhan',
      lastName: 'O\'Neill',
      email: 'siobhan@exploreni.com',
      passwordHash: await bcrypt.hash('vendor123', 10),
      role: 'vendor',
      status: 'active',
    });
    console.log('  ✓ Yer wan Siobhan created (siobhan@exploreni.com / vendor123)');

    // Pending Vendor (for testing approval flow)
    const pendingVendorCiaran = await User.create({
      firstName: 'Ciaran',
      lastName: 'Murphy',
      email: 'ciaran@exploreni.com',
      passwordHash: await bcrypt.hash('vendor123', 10),
      role: 'vendor',
      status: 'pending_vendor',
    });
    console.log('  ✓ Wee Ciaran (waiting) created (ciaran@exploreni.com / vendor123)');

    // Customer Users
    const customerMary = await User.create({
      firstName: 'Mary',
      lastName: 'Magee',
      email: 'mary@exploreni.com',
      passwordHash: await bcrypt.hash('customer123', 10),
      role: 'customer',
      status: 'active',
    });
    console.log('  ✓ Our Mary created (mary@exploreni.com / customer123)');

    const customerPaddy = await User.create({
      firstName: 'Paddy',
      lastName: 'Johnston',
      email: 'paddy@exploreni.com',
      passwordHash: await bcrypt.hash('customer123', 10),
      role: 'customer',
      status: 'active',
    });
    console.log('  ✓ Our Paddy created (paddy@exploreni.com / customer123)');

    const customerShauna = await User.create({
      firstName: 'Shauna',
      lastName: 'Kelly',
      email: 'shauna@exploreni.com',
      passwordHash: await bcrypt.hash('customer123', 10),
      role: 'customer',
      status: 'active',
    });
    console.log('  ✓ Our Shauna created (shauna@exploreni.com / customer123)');

    console.log(`  ✓ That's ${await User.count()} eejits in the system now.`);

    // ==========================================
    // 2. Create Categories
    // ==========================================
    console.log('\nCreating the wee buckets to put things in (categories)...');
    
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

    console.log(`  ✓ ${await Category.count()} buckets sorted.`);

    // ==========================================
    // 3. Create Experiences (with different statuses)
    // ==========================================
    console.log('\nRight, let\'s make some actual craic (experiences)...');

    // --- Approved Experiences ---

    const exp1 = await Experience.create({
      title: "Giant's Causeway Tour",
      description: "Explore the stunning UNESCO World Heritage site. Our guide, who's a pure fount, will give you the proper yarn about the giant Finn McCool. Includes transport, a guided walk, and plenty of time for a wee selfie. It's deadly.",
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
      description: "Discover the story of the Titanic in the shipyard where she was built. Interactive galleries bring the ship's story to life. It's massive, so it is! You won't know yerself. Includes admission to all galleries and the SS Nomadic.",
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
      description: "Guided hike through the beautiful Mourne Mountains, where 'the Mountains of Mourne sweep down to the sea'. Suitable for most fitness levels with breathtaking views. Includes professional guide and a packed lunch (with a proper cheese & onion crisp sarnie, obviously).",
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
      description: "Visit iconic filming locations from the hit HBO series. See Winterfell (Castle Ward), the Dark Hedges (King's Road), and Ballintoy Harbour (Iron Islands). Our guide has all the behind-the-scenes yarn and knows which ones were wile articles.",
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
      description: "Cross the famous rope bridge suspended 30 meters above the rocks. Experience stunning coastal scenery and try not to brick yourself. It's a quare height, mind. Weather-dependent activity, so check the forecast!",
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
      description: "Sample premium Irish whiskeys at the historic Bushmills Distillery. Includes tasting of 4 different whiskeys and a tour. Must be 18+. Have the craic, but mind your head the next day, ye buck cat!",
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
      description: "Wile popular, so it is! See the famous Derry Girls mural, walk the walls like Erin and the gang, and see where they filmed the 'Rock the Boat' scene. Pure class! (Cream horn not included, wise up).",
      location: 'Derry/Londonderry',
      duration: 120,
      price: 22.00,
      capacity: 15,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/07/Derry_Girls_Mural_-_geograph.org.uk_-_7105686.jpg',
      vendorId: vendorSiobhan.id,
      status: 'approved',
    });
    await exp8.setCategories([catTour, catCulture]);

    const exp9 = await Experience.create({
      title: "St. George's Market - A Wee Taste of Belfast",
      description: "Fill your boots at the award-winning St. George's Market. We'll try a bit of everything, from a proper Belfast Bap to fresh seafood and local artisan cheese. Come hungry, ye header!",
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
      description: "Get out on the lough! A guided paddle around Strangford, one of Europe's largest tidal loughs. See the seals (they're just chillin', so they are) and explore wee islands. No experience needed, our guides are dead on and won't let ye drown.",
      location: 'Strangford, County Down',
      duration: 180,
      price: 50.00,
      capacity: 8,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Strangford_Lough_from_Portaferry%2C_looking_towards_the_narrows.JPG/500px-Strangford_Lough_from_Portaferry%2C_looking_towards_the_narrows.JPG',
      vendorId: vendorSiobhan.id,
      status: 'approved',
    });
    await exp10.setCategories([catAdventure, catOutdoor]);

    // === NEW EXPERIENCES START ===

    const exp11 = await Experience.create({
      title: "Belfast Cathedral Quarter Pub Crawl",
      description: "Get steeped! We'll take ye round the best pubs in the Cathedral Quarter. Proper trad music in some, pure atmosphere in others. First pint of harp's on us. Don't be actin' the mick! 18+ only, obviously.",
      location: 'Cathedral Quarter, Belfast',
      duration: 180,
      price: 25.00,
      capacity: 12,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/County_Antrim_-_Commercial_Court_-_20240917144731.jpg/500px-County_Antrim_-_Commercial_Court_-_20240917144731.jpg',
      vendorId: vendorDavy.id,
      status: 'approved',
    });
    await exp11.setCategories([catFood, catCulture, catTour]);

    const exp12 = await Experience.create({
      title: "Cuilcagh Boardwalk Trail (Stairway to Heaven)",
      description: "It's a quare clatter of steps, mind, but the view from the top is pure magic. Proper Instagram stuff. We'll guide ye up the boardwalk in the Fermanagh lakelands. Wear decent skechers, it's a dander and a half.",
      location: 'Cuilcagh Mountain, County Fermanagh',
      duration: 240,
      price: 30.00,
      capacity: 10,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Cuilcagh%2C_Fermanagh_-_33673326901.jpg/500px-Cuilcagh%2C_Fermanagh_-_33673326901.jpg',
      vendorId: vendorSiobhan.id,
      status: 'approved',
    });
    await exp12.setCategories([catAdventure, catOutdoor, catTour]);

    const exp13 = await Experience.create({
      title: "The Famous Derry Walls History Tour",
      description: "Walk the complete 17th-century walls of Derry/Londonderry. Our guide knows all the history, from the Siege to the Troubles and beyond. It's the only completely walled city left in Ireland. Dead interesting, so it is.",
      location: 'Derry/Londonderry',
      duration: 90,
      price: 15.00,
      capacity: 20,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/County_Londonderry_-_Derry_Walls_-_Bishop%27s_Gate_20230303_inner_side.jpg/2560px-County_Londonderry_-_Derry_Walls_-_Bishop%27s_Gate_20230303_inner_side.jpg',
      vendorId: vendorSiobhan.id,
      status: 'approved',
    });
    await exp13.setCategories([catHistory, catTour, catCulture]);
    
    // === NEW EXPERIENCES END ===


    // --- Pending Experience (for testing approval flow) ---
    const pendingExp = await Experience.create({
      title: 'Ulster Folk Museum Trip',
      description: 'A step back in time. See how people lived in Ulster over 100 years ago. Walk through old villages, farms, and see craftspeople at work. Great day out. Good for what ails ye.',
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
      description: 'This experience was rejected for testing purposes. Not enough craic. Was pure pants.',
      location: 'Test Location',
      duration: 60,
      price: 10.00,
      capacity: 5,
      vendorId: vendorSiobhan.id,
      status: 'rejected',
    });

    console.log(`  ✓ ${await Experience.count()} things to do created (13 approved, 1 pending, 1 pure rubbish)`);

    // ==========================================
    // 4. Create Reviews
    // ==========================================
    console.log('\nCreating what the punters reckon (reviews)...');

    await Review.create({
      rating: 5,
      comment: 'Pure class! Our guide Davy was dead on, knew his stuff. The Causeway itself is unreal. Stickin\' out. Highly recommend, so I would.',
      customerId: customerMary.id,
      experienceId: exp1.id,
    });

    await Review.create({
      rating: 4,
      comment: 'The Titanic building is massive! Really well done. Was a wee bit thick wi\' folk, but the tour was grand. Worth a look.',
      customerId: customerPaddy.id,
      experienceId: exp2.id,
    });

    await Review.create({
      rating: 5,
      comment: 'What a day! The Mournes are just gorgeous. Our guide was great craic and made sure everyone was safe. Was wrecked after, but in a good way! My legs were banjaxed.',
      customerId: customerMary.id,
      experienceId: exp3.id,
    });

    await Review.create({
      rating: 5,
      comment: 'The craic was 90! Being a massive GoT fan, this was the business. Seeing Winterfell and the Dark Hedges was unreal. Our guide, a total gas man, had all the behind-the-scenes yarn.',
      customerId: customerPaddy.id,
      experienceId: exp4.id,
    });

    await Review.create({
      rating: 4,
      comment: 'NGL, I was bricking it on that bridge! But it was grand. The views are something else. Glad I did it, catch yerself on if you\'re scared!',
      customerId: customerMary.id,
      experienceId: exp5.id,
    });

    await Review.create({
      rating: 5,
      comment: 'Top notch. Got to sample some lovely whiskey and the tour was dead interesting. Had a good wee buzz on after! Slept like a log.',
      customerId: customerPaddy.id,
      experienceId: exp6.id,
    });

    await Review.create({
      rating: 4,
      comment: 'Class. The stones are mad looking. Learned all about Finn McCool, the absolute unit. Good wee trip.',
      customerId: customerShauna.id,
      experienceId: exp1.id,
    });

    // Reviews for exp 7-10
    await Review.create({
      rating: 5,
      comment: 'Our driver, \'Wee Stevie\', was an absolute legend. Told us his own stories. You see it on the news, but this is the real deal. A must-do in Belfast, nae doubt.',
      customerId: customerShauna.id,
      experienceId: exp7.id,
    });
    
    await Review.create({
      rating: 5,
      comment: 'Ach, it was hilarious! Our guide was a proper Derry girl herself. Loved the mural and just walking about the city. It\'s a cracker! Go on, ye will!',
      customerId: customerMary.id,
      experienceId: exp8.id,
    });
    
    await Review.create({
      rating: 4,
      comment: 'Brought my ma. We had a great feed. The Belfast Bap was the size of my head! Great atmosphere, loads of wee stalls. Lovely morning out.',
      customerId: customerPaddy.id,
      experienceId: exp9.id,
    });
    
    await Review.create({
      rating: 5,
      comment: 'Magic. Saw about 20 seals just chilling. Our guide was sound. The water was baltic but they give you all the gear. 10/10, would do it again.',
      customerId: customerShauna.id,
      experienceId: exp10.id,
    });

    // === NEW REVIEWS START ===

    await Review.create({
      rating: 5,
      comment: "What a night! Davy was pure craic. Took us to pubs I'd never have found. The Duke of York was bunged but the atmosphere was class. Woke up with a head on me like a bag of spanners, but worth it.",
      customerId: customerPaddy.id,
      experienceId: exp11.id,
    });
    
    await Review.create({
      rating: 4,
      comment: "Good wee tour. The guide was sound. Got a bit loud in the last pub, couldn't hear myself think! But the free pint was lovely.",
      customerId: customerShauna.id,
      experienceId: exp11.id,
    });
    
    await Review.create({
      rating: 5,
      comment: "Absolutely bucketing it down when we started but cleared up at the top. Siobhan was a star, kept us all going. My legs were in bits, but the view... unreal. It's called the Stairway to Heaven for a reason. Deadly.",
      customerId: customerMary.id,
      experienceId: exp12.id,
    });
    
    await Review.create({
      rating: 5,
      comment: "Did this after the Derry Girls tour. Really interesting. You learn so much just walking about. Our guide was a fount of knowledge. Would recommend, 100%.",
      customerId: customerShauna.id,
      experienceId: exp13.id,
    });

    // === NEW REVIEWS END ===


    console.log(`  ✓ ${await Review.count()} reviews left. Mostly good, aye.`);

    // ==========================================
    // 5. Create Availability Slots
    // ==========================================
    console.log('\nSorting out when ye can actually go (availability)...');

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

    // === NEW AVAILABILITY START ===

    // Availability for Pub Crawl (exp11) - Evenings
    await Availability.create({
      date: nextFriday.toISOString().split('T')[0],
      startTime: '19:00:00',
      endTime: '22:00:00',
      availableSlots: 12,
      experienceId: exp11.id,
    });

    // Availability for Cuilcagh (exp12)
    await Availability.create({
      date: nextWeek.toISOString().split('T')[0],
      startTime: '10:00:00',
      endTime: '14:00:00',
      availableSlots: 10,
      experienceId: exp12.id,
    });

    // Availability for Derry Walls (exp13) - multiple
    await Availability.bulkCreate([
      {
        date: nextWeek2.toISOString().split('T')[0],
        startTime: '11:00:00',
        endTime: '12:30:00',
        availableSlots: 20,
        experienceId: exp13.id,
      },
      {
        date: nextWeek2.toISOString().split('T')[0],
        startTime: '14:00:00',
        endTime: '15:30:00',
        availableSlots: 20,
        experienceId: exp13.id,
      },
    ]);

    // === NEW AVAILABILITY END ===


    console.log(`  ✓ ${await Availability.count()} slots created. Get 'er booked!`);

    // ==========================================
    // Summary
    // ==========================================
    console.log('\n✅ Sorted! All done. Database is seeded and the craic is 90.\n');
    console.log('='.repeat(50));
    console.log('Test Credentials (Don\'t be tellin\' everyone):');
    console.log('='.repeat(50));
    console.log('Admin (The Big Cheese):');
    console.log('  Email: admin@exploreni.com');
    console.log('  Password: admin123');
    console.log('');
    console.log('Vendors (The ones doing the work):');
    console.log('  Email: davy@exploreni.com');
    console.log('  Password: vendor123');
    console.log('  Email: siobhan@exploreni.com');
    console.log('  Password: vendor123');
    console.log('  Email: ciaran@exploreni.com (Still waitin\', bless him)');
    console.log('  Password: vendor123');
    console.log('');
    console.log('Customers (The Punters):');
    console.log('  Email: mary@exploreni.com');
    console.log('  Password: customer123');
    console.log('  Email: paddy@exploreni.com');
    console.log('  Password: customer123');
    console.log('  Email: shauna@exploreni.com');
    console.log('  Password: customer123');
    console.log('='.repeat(50));
    console.log('\nData Summary (The short version):');
    console.log(`  - ${await User.count()} Users (1 boss, 3 workers, 3 punters)`);
    console.log(`  - ${await Category.count()} Buckets (Categories)`);
    console.log(`  - ${await Experience.count()} Experiences (13 class, 1 waitin', 1 pants)`);
    console.log(`  - ${await Review.count()} Yarns (Reviews)`);
    console.log(`  - ${await Availability.count()} Slots (Get booked!)`);
    console.log('='.repeat(50));
    console.log('\nRight, away ye go and test it. G\'luck!');

  } catch (error) {
    console.error('❌ Ach, away and shite! It\'s banjaxed. Error:', error);
    throw error;
  }
}

module.exports = { seedDatabase };