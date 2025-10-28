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
      email: 'admin@niexperiences.co.uk',
      passwordHash: await bcrypt.hash('admin123', 10),
      role: 'admin',
      status: 'active',
    });
    console.log('  ✓ The Big Boss created (admin@niexperiences.co.uk / admin123)');

    // Vendor Users
    const vendorDavy = await User.create({
      firstName: 'Davy',
      lastName: 'McWilliams',
      email: 'davy@niexperiences.co.uk',
      passwordHash: await bcrypt.hash('vendor123', 10),
      role: 'vendor',
      status: 'active',
    });
    console.log('  ✓ Yer man Davy created (davy@niexperiences.co.uk / vendor123)');

    const vendorSiobhan = await User.create({
      firstName: 'Siobhan',
      lastName: 'O\'Neill',
      email: 'siobhan@niexperiences.co.uk',
      passwordHash: await bcrypt.hash('vendor123', 10),
      role: 'vendor',
      status: 'active',
    });
    console.log('  ✓ Yer wan Siobhan created (siobhan@niexperiences.co.uk / vendor123)');

    // Pending Vendor (for testing approval flow)
    const pendingVendorCiaran = await User.create({
      firstName: 'Ciaran',
      lastName: 'Murphy',
      email: 'ciaran@niexperiences.co.uk',
      passwordHash: await bcrypt.hash('vendor123', 10),
      role: 'vendor',
      status: 'pending_vendor',
    });
    console.log('  ✓ Wee Ciaran (waiting) created (ciaran@niexperiences.co.uk / vendor123)');

    // Customer Users
    const customerMary = await User.create({
      firstName: 'Mary',
      lastName: 'Magee',
      email: 'mary@niexperiences.co.uk',
      passwordHash: await bcrypt.hash('customer123', 10),
      role: 'customer',
      status: 'active',
    });
    console.log('  ✓ Our Mary created (mary@niexperiences.co.uk / customer123)');

    const customerPaddy = await User.create({
      firstName: 'Paddy',
      lastName: 'Johnston',
      email: 'paddy@niexperiences.co.uk',
      passwordHash: await bcrypt.hash('customer123', 10),
      role: 'customer',
      status: 'active',
    });
    console.log('  ✓ Our Paddy created (paddy@niexperiences.co.uk / customer123)');

    const customerShauna = await User.create({
      firstName: 'Shauna',
      lastName: 'Kelly',
      email: 'shauna@niexperiences.co.uk',
      passwordHash: await bcrypt.hash('customer123', 10),
      role: 'customer',
      status: 'active',
    });
    console.log('  ✓ Our Shauna created (shauna@niexperiences.co.uk / customer123)');

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

await Review.create({
      rating: 3,
      comment: 'It was alright, I suppose. The stones are strange, but sweet sufferin\' cats, the buses! Ye could hardly move for folk takin\' selfies. Our guide was sound, but it was just a bit of a geg. Glad I seen it, but wouldn\'t be rushin\' back.',
      customerId: customerPaddy.id,
      experienceId: exp1.id,
    });

    await Review.create({
      rating: 5,
      comment: 'Absolutely massive. The way they\'ve done it is pure genius. Loved the wee ride thingy inside. Felt dead sorry for them all by the end. A class day out, highly recommend.',
      customerId: customerShauna.id,
      experienceId: exp2.id,
    });

    await Review.create({
      rating: 2,
      comment: 'Ach, I dunno. It\'s dear enough for what it is. It\'s a big fancy building, aye, but I was bored halfways round. Too much readin\'. Just wanted to see the necklace from the film, but it wasn\'t even there. Bit of a let-down.',
      customerId: customerMary.id,
      experienceId: exp2.id,
    });

    await Review.create({
      rating: 5,
      comment: 'Broke the back of it! What a hike. Our guide knew the mountains like the back of his hand. Was absolutely gutthered by the end, but the views from the top... wise up. Stickin\' out.',
      customerId: customerPaddy.id,
      experienceId: exp3.id,
    });

    await Review.create({
      rating: 3,
      comment: 'Look, if you\'re into all that dragons stuff, it\'s probably class. But I haven\'t a baldy. The hedges are just trees, like. The guide was a laugh, telling us all the gossip, but it was lost on me. My fella loved it, though.',
      customerId: customerMary.id,
      experienceId: exp4.id,
    });

    await Review.create({
      rating: 2,
      comment: 'Are ye havin\' a laugh? Paid all that money to walk 20 feet across a wee bridge. The cliffs are lovely, right enough, but the bridge itself is a total rip-off. Save yer money and walk along the coast. It\'s the same view. Pure balls.',
      customerId: customerPaddy.id,
      experienceId: exp5.id,
    });

    await Review.create({
      rating: 5,
      comment: 'Now you\'re talkin\'! Had a brilliant wee tour. The smell alone is worth the money. Our guide was great craic and the samples at the end... let\'s just say I was feelin\' no pain. Bought a bottle for my da.',
      customerId: customerMary.id,
      experienceId: exp6.id,
    });

    await Review.create({
      rating: 5,
      comment: 'Powerful. Really powerful. Our driver knew everything, wasn\'t just readin\' from a script. Makes ye think, so it does. You can\'t come to Belfast and not do this. Proper eye-opener.',
      customerId: customerPaddy.id,
      experienceId: exp7.id,
    });

    await Review.create({
      rating: 5,
      comment: 'It was so good, I caught myself on! Loved every minute. Seeing the mural was class and the guide had us in stitches. Felt like I was one of the gang. Derry is a wee gem of a city.',
      customerId: customerShauna.id,
      experienceId: exp8.id,
    });

    await Review.create({
      rating: 3,
      comment: 'It\'s just a market, like. Had a wee bap which was grand, but it was fairly bunged. A lot of the stalls are just selling the same oul\' nick-nacks. It\'s handy for a wander if it\'s lashing, but don\'t go out of your way.',
      customerId: customerMary.id,
      experienceId: exp9.id,
    });

    await Review.create({
      rating: 3,
      comment: 'Jesus, Mary and Joseph, it was baltic. Fair play to the guide, he was dead on, and seeing the seals was great. But my hands were numb after 10 minutes. I was foundered. Probably class in the summer, but I was too cold to enjoy it.',
      customerId: customerPaddy.id,
      experienceId: exp10.id,
    });

    await Review.create({
      rating: 1,
      comment: 'Absolute disaster. The guide was half-cut, I\'m sure of it. Lost half the group after the first pub. The second one was full of stags and hens, pure bedlam. Didn\'t even get the free pint. Waste of money, wound up gettin\' a taxi home. Fumin\'.',
      customerId: customerMary.id,
      experienceId: exp11.id,
    });

    await Review.create({
      rating: 5,
      comment: 'Deadly. It\'s a long oul\' slog up that boardwalk but holy moly, the view. Worth every single step. Was wrecked after, but buzzing. Our guide was a wee dote, kept the spirits up. Go on, get it booked!',
      customerId: customerShauna.id,
      experienceId: exp12.id,
    });

    await Review.create({
      rating: 3,
      comment: 'It\'s a grand wee walk, like. The history is interesting, but the guide was a bit dry. Felt a bit like a history lesson at school. The views of the Bogside are good from the top, mind you. Passed an hour.',
      customerId: customerPaddy.id,
      experienceId: exp13.id,
    });

    await Review.create({
      rating: 4,
      comment: 'Wasn\'t sure what to expect but it was actually brilliant. Our guide was from here and told us loads. The murals are unbelievable. Fair play to them. Glad we did it.',
      customerId: customerMary.id,
      experienceId: exp7.id,
    });

await Review.create({
      rating: 2,
      comment: 'Jesus, it was lashing. Pure hosin\' it down. Ye couldn\'t see yer hand in front o\' yer face. The stones were dead slippy and my good trainers are banjaxed. The guide was sound, but ye can\'t help the weather. Just a bit of a damp squib, so it was.',
      customerId: customerShauna.id,
      experienceId: exp1.id,
    });

    await Review.create({
      rating: 5,
      comment: 'Honestly, pure magic. The building itself is somethin\' else. It\'s dead sad, like, but they\'ve done it proper class. The wee ride was brilliant, showing the shipyard. Took my da, he loved it. 10/10.',
      customerId: customerPaddy.id,
      experienceId: exp2.id,
    });

    await Review.create({
      rating: 3,
      comment: 'Here\'s me thinkin\' it\'d be a wee dander. Sweet suffering saints, I was wrecked. Our guide was away like a fiddler\'s elbow, left half of us trailin\' behind. The views were grand, right enough, but my legs were in bits. Not for the faint-hearted.',
      customerId: customerShauna.id,
      experienceId: exp3.id,
    });

    await Review.create({
      rating: 5,
      comment: 'Right, I\'m a total nerd for this stuff, and it was the business. Got to wear a cloak and hold a sword, felt like Jon Snow. The guide was pure gas, had all the stories. Seeing the Dark Hedges was unreal. What a day, so it was.',
      customerId: customerMary.id,
      experienceId: exp4.id,
    });

    await Review.create({
      rating: 4,
      comment: 'My legs were like jelly. Pure brickin\' it. But I says to myself, "Catch yerself on!" and just went for it. The wee island is lovely and the view back is unreal. Bit of a queue, but worth the wait. Grand.',
      customerId: customerShauna.id,
      experienceId: exp5.id,
    });

    await Review.create({
      rating: 2,
      comment: 'Ach, it was just a walk round a factory, like. Smelled nice, but I\'m not a massive whiskey drinker. I was the designated driver, so I got a wee bottle of water while everyone else was gettin\' blocked. Bit of a rip-off if you\'re not drinkin\'.',
      customerId: customerShauna.id,
      experienceId: exp6.id,
    });

    await Review.create({
      rating: 5,
      comment: 'Our driver Barry was an absolute gent. What that man doesn\'t know isn\'t worth knowing. You see the murals and it really hits home. So much history. Honestly, stop readin\' this and just book it. Deadly.',
      customerId: customerMary.id,
      experienceId: exp7.id,
    });

    await Review.create({
      rating: 3,
      comment: 'It was grand. The guide was nice and we saw the mural, which was class for a photo. But a lot of it was just walkin\' about. I thought we\'d get a free cream horn or somethin\'. It was... fine.',
      customerId: customerPaddy.id,
      experienceId: exp8.id,
    });

    await Review.create({
      rating: 5,
      comment: 'What a buzz! The place was jumpin\'. Had a Belfast Bap that was bigger than my head, and it was lovely. Good wee band playin\' in the corner. Bought some wee buns for later. Class mornin\' out.',
      customerId: customerShauna.id,
      experienceId: exp9.id,
    });

    await Review.create({
      rating: 1,
      comment: 'Foundered. Absolutely foundered. Couldn\'t feel my fingers after ten minutes. The guide was trying his best but I was too busy grievin\' about the cold. Saw one seal for about two seconds. Waste of a day, so it was.',
      customerId: customerMary.id,
      experienceId: exp10.id,
    });

    await Review.create({
      rating: 3,
      comment: 'It was... a pub crawl. The guide was sound, but the first pub was empty and the last one was that bunged ye couldn\'t get to the bar. The free shot was like paint stripper. Head\'s thumpin\' this mornin\'.',
      customerId: customerPaddy.id,
      experienceId: exp11.id,
    });

    await Review.create({
      rating: 3,
      comment: 'It\'s just a big wooden staircase, like. Goes on for miles. My knees were banjaxed. Got to the top and it was pure fog. Couldn\'t see a thing. Just my luck. Glad I did it to say I did, but I wouldn\'t be rushin\' back.',
      customerId: customerPaddy.id,
      experienceId: exp12.id,
    });

    await Review.create({
      rating: 5,
      comment: 'Class. You can see the whole city. Our guide was a dote, really knew his stuff. Felt dead safe and it\'s mad to think how old the walls are. 10/10.',
      customerId: customerMary.id,
      experienceId: exp13.id,
    });

    await Review.create({
      rating: 4,
      comment: 'Aye, it\'s thick wi\' tourists, but ye have to see it, don\'t ye? The stones are mad. Our guide was great craic, tellin\' us all about Finn McCool. Good dander, but wear comfy shoes.',
      customerId: customerMary.id,
      experienceId: exp1.id,
    });

    await Review.create({
      rating: 1,
      comment: 'Pure shite. The guide didn\'t shut up for a solid hour. Just wanted to see the yoke from the film. Turns out it\'s not even here. And the price of the gift shop? Wind yer neck in. Pure balls.',
      customerId: customerShauna.id,
      experienceId: exp2.id,
    });

await Review.create({
      rating: 5,
      comment: 'Yeeeoooo! What a spot. Our guide told us all about Finn McCool batterin\' yon Scottish fella. Pure dead brilliant. The stones are mad lookin\'. Took about 50 photos. Class.',
      customerId: customerPaddy.id,
      experienceId: exp1.id,
    });

    await Review.create({
      rating: 3,
      comment: 'Ach, it was grand. The buildin\' is massive, right enough. But it was that dear to get in, and then ye have to pay a fortune for a wee sandwich. It\'s good, like, but bleedin\' pricey.',
      customerId: customerMary.id,
      experienceId: exp2.id,
    });

    await Review.create({
      rating: 1,
      comment: 'Never again. It was hosin\' it down, the wind was fit to cut ye in two, and I near broke my neck on a slippy rock. Seen nothin\' but fog. The guide was sound, but sweet divine, I was foundered. Home for a hot whiskey.',
      customerId: customerShauna.id,
      experienceId: exp3.id,
    });

    await Review.create({
      rating: 5,
      comment: 'Right, I\'m a pure fanatic, so this was the business. Got a photo on the throne, so I did! Our guide, wee Ciaran, was an absolute geg. Knew all the gossip. Worth every penny. Deadly.',
      customerId: customerShauna.id,
      experienceId: exp4.id,
    });

    await Review.create({
      rating: 5,
      comment: 'My heart was in my mouth! Pure brickin\' it, but what a buzz! The views are stickin\' out. The fella running it was a good laugh too. "Away on wi\' ye!" he says. Class.',
      customerId: customerPaddy.id,
      experienceId: exp5.id,
    });

    await Review.create({
      rating: 4,
      comment: 'That\'s the good stuff. Lovely wee tour, smells amazing in there. The guide was dead nice. The samples at the end were lovely, had a wee buzz on. Bought a bottle for my brother\'s Christmas.',
      customerId: customerMary.id,
      experienceId: exp6.id,
    });

    await Review.create({
      rating: 5,
      comment: 'You can\'t come to Belfast and not do this. End of. Our driver, Liam, lived through it all. Honest, raw, and makes ye think. The murals are unbelievable. Absolutely essential.',
      customerId: customerPaddy.id,
      experienceId: exp7.id,
    });

    await Review.create({
      rating: 4,
      comment: 'It was a grand wee tour. The guide was a laugh and seeing the mural was great. Just felt a wee bit short, like. Could have done with more. Still, good craic!',
      customerId: customerMary.id,
      experienceId: exp8.id,
    });

    await Review.create({
      rating: 2,
      comment: 'It\'s just a big shed full of oul\' tat. My missus dragged me along. The food bit was alright, got a sausage roll, but the rest was just pure meh. Wouldn\'t be rushin\' back.',
      customerId: customerPaddy.id,
      experienceId: exp9.id,
    });

    await Review.create({
      rating: 5,
      comment: 'Magic! The water was pure flat calm and the sun was splittin\' the stones. Saw loads of seals just chillin\' on the rocks. Our guide was a wee dote. 10/10, what a day!',
      customerId: customerShauna.id,
      experienceId: exp10.id,
    });

    await Review.create({
      rating: 5,
      comment: 'Absolute scenes. Our guide was a total headcase, in a good way! Took us to some proper wee gems. The craic was 90 from start to finish. Woke up this mornin\' feelin\' like I was hit by a bus, but worth it. Yeeeeooo!',
      customerId: customerMary.id,
      experienceId: exp11.id,
    });

    await Review.create({
      rating: 4,
      comment: 'My legs are banjaxed. Absolutely banjaxed. It just keeps goin\' up! But sweet Jesus, when ye get to the top... the view is unreal. Took my breath away. Well, what was left of it!',
      customerId: customerShauna.id,
      experienceId: exp12.id,
    });

    await Review.create({
      rating: 3,
      comment: 'Aye, it\'s a wall, alright. Grand walk, like. The guide knew his history, but my head was away with the fairies half the time. Good view, but it\'s just a dander round the town.',
      customerId: customerPaddy.id,
      experienceId: exp13.id,
    });

    await Review.create({
      rating: 1,
      comment: 'What a load of balls. It\'s just a pile of rocks. Paid all that money to see rocks. And the crowds! Ye couldn\'t swing a cat. I was pure scunnered. Avoid.',
      customerId: customerMary.id,
      experienceId: exp1.id,
    });

    await Review.create({
      rating: 4,
      comment: 'Really, really interesting. The guide was sound, but he was a wee bit quiet, had to strain to hear him. But the murals and the stories... powerful stuff. A must-do.',
      customerId: customerShauna.id,
      experienceId: exp7.id,
    });

    // === REVIEWS END ===


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
    console.log('  Email: admin@niexperiences.co.uk');
    console.log('  Password: admin123');
    console.log('');
    console.log('Vendors (The ones doing the work):');
    console.log('  Email: davy@niexperiences.co.uk');
    console.log('  Password: vendor123');
    console.log('  Email: siobhan@niexperiences.co.uk');
    console.log('  Password: vendor123');
    console.log('  Email: ciaran@niexperiences.co.uk (Still waitin\', bless him)');
    console.log('  Password: vendor123');
    console.log('');
    console.log('Customers (The Punters):');
    console.log('  Email: mary@niexperiences.co.uk');
    console.log('  Password: customer123');
    console.log('  Email: paddy@niexperiences.co.uk');
    console.log('  Password: customer123');
    console.log('  Email: shauna@niexperiences.co.uk');
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