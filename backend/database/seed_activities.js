const { query, pool } = require('./connection');
const bcrypt = require('bcryptjs');

const seedActivitiesAndLocations = async () => {
  try {
    console.log('[Seed] Seeding locations, categories, and rich activities...');

    // 1. Ensure a demo supplier exists
    const [supplierRole] = await query('SELECT id FROM roles WHERE slug = "supplier"');
    const roleId = supplierRole ? supplierRole.id : 3;

    let [user] = await query('SELECT id FROM users WHERE email = ?', ['partner@travelplatform.com']);
    let userId;
    if (!user) {
      const hash = await bcrypt.hash('Partner@123', 10);
      const res = await query(
        `INSERT INTO users (role_id, first_name, last_name, email, password_hash, phone, account_type, customer_segment, status, email_verified_at)
         VALUES (?, 'Global', 'Adventures', 'partner@travelplatform.com', ?, '+919876500001', 'organization', 'retail', 'active', NOW())`,
        [roleId, hash]
      );
      userId = res.insertId;
    } else {
      userId = user.id;
    }

    let [supp] = await query('SELECT id FROM suppliers WHERE user_id = ?', [userId]);
    let supplierId;
    if (!supp) {
      const res = await query(
        `INSERT INTO suppliers (user_id, company_name, trade_license_no, tax_id, contact_person, business_address, city, country, status)
         VALUES (?, 'Global Travel & Tours Pvt Ltd', 'TL-EXP-2026', 'GST99112233', 'Alex Morgan', 'City Center Hub', 'Paris', 'France', 'approved')`,
        [userId]
      );
      supplierId = res.insertId;
    } else {
      supplierId = supp.id;
    }

    // 2. Destinations
    const destinations = [
      { name: 'Paris', slug: 'paris', country: 'France', image_url: '/assets/images/dest_dubai.jpg', display_order: 1 },
      { name: 'Dubai', slug: 'dubai', country: 'United Arab Emirates', image_url: '/assets/images/dest_dubai.jpg', display_order: 2 },
      { name: 'Goa', slug: 'goa', country: 'India', image_url: '/assets/images/dest_goa.jpg', display_order: 3 },
      { name: 'Jaipur', slug: 'jaipur', country: 'India', image_url: '/assets/images/dest_jaipur.jpg', display_order: 4 },
      { name: 'Manali', slug: 'manali', country: 'India', image_url: '/assets/images/dest_manali.jpg', display_order: 5 },
      { name: 'Rishikesh', slug: 'rishikesh', country: 'India', image_url: '/assets/images/dest_rishikesh.jpg', display_order: 6 },
      { name: 'Bali', slug: 'bali', country: 'Indonesia', image_url: '/assets/images/dest_thailand.jpg', display_order: 7 },
      { name: 'Udaipur', slug: 'udaipur', country: 'India', image_url: '/assets/images/dest_udaipur.jpg', display_order: 8 },
      { name: 'Jaisalmer', slug: 'jaisalmer', country: 'India', image_url: '/assets/images/dest_jaisalmer.jpg', display_order: 9 },
      { name: 'Thailand', slug: 'thailand', country: 'Thailand', image_url: '/assets/images/dest_thailand.jpg', display_order: 10 }
    ];

    for (const d of destinations) {
      await query(
        `INSERT INTO destinations (name, slug, country, image_url, display_order)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name), country = VALUES(country), image_url = VALUES(image_url), display_order = VALUES(display_order)`,
        [d.name, d.slug, d.country, d.image_url, d.display_order]
      );
    }
    console.log('[Seed] Destinations seeded.');

    // 3. Categories
    const categories = [
      { name: 'Sightseeing & City Tours', slug: 'sightseeing', icon_name: 'Camera', image_url: '/assets/images/categories/cat_sightseeing.jpg', display_order: 1 },
      { name: 'Adventure & Theme Parks', slug: 'adventure', icon_name: 'Zap', image_url: '/assets/images/categories/cat_adventure.jpg', display_order: 2 },
      { name: 'Water Sports & Cruises', slug: 'water-sports', icon_name: 'Anchor', image_url: '/assets/images/categories/cat_water_sports.jpg', display_order: 3 },
      { name: 'Desert Safari', slug: 'desert-safari', icon_name: 'Compass', image_url: '/assets/images/categories/cat_desert.jpg', display_order: 4 },
      { name: 'Cultural & Heritage', slug: 'cultural', icon_name: 'Landmark', image_url: '/assets/images/categories/cat_cultural.jpg', display_order: 5 },
      { name: 'Luxury & VIP', slug: 'luxury-vip', icon_name: 'Crown', image_url: '/assets/images/col_luxury.jpg', display_order: 6 },
      { name: 'Wildlife & Nature', slug: 'wildlife', icon_name: 'Trees', image_url: '/assets/images/categories/cat_wildlife.jpg', display_order: 7 },
      { name: 'Food & Dining', slug: 'food-dining', icon_name: 'Utensils', image_url: '/assets/images/categories/cat_food.jpg', display_order: 8 }
    ];

    for (const c of categories) {
      await query(
        `INSERT INTO categories (name, slug, icon_name, image_url, display_order)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name), icon_name = VALUES(icon_name), image_url = VALUES(image_url)`,
        [c.name, c.slug, c.icon_name, c.image_url, c.display_order]
      );
    }
    console.log('[Seed] Categories seeded.');

    // 4. Sample Activities for MakeMyTrip experience
    const activitiesData = [
      // Paris Activities (matches MakeMyTrip Paris Tours)
      {
        title: 'Eiffel Tower Summit Access & 1-Hour Seine River Cruise',
        slug: 'eiffel-tower-summit-access-seine-cruise',
        category: 'sightseeing',
        city: 'Paris',
        country: 'France',
        location: 'Champ de Mars, 5 Av. Anatole France, 75007 Paris',
        duration_minutes: 180,
        description: 'Skip the standard ticketing lines and ascend to the top floor summit of Paris iconic Eiffel Tower. Followed by a scenic 1-hour cruise gliding through the historic River Seine passing the Notre Dame, Louvre Museum, and Pont Alexandre III.',
        image: '/assets/images/categories/cat_sightseeing.jpg',
        price: 3899.00,
        original_price: 5200.00
      },
      {
        title: 'Louvre Museum Guided Masterpieces Tour with Reserved Entry',
        slug: 'louvre-museum-guided-tour-reserved-entry',
        category: 'cultural',
        city: 'Paris',
        country: 'France',
        location: 'Rue de Rivoli, 75001 Paris',
        duration_minutes: 150,
        description: 'Bypass the immense entrance lines with priority tickets and explore the Mona Lisa, Venus de Milo, and Winged Victory with an expert art historian guide.',
        image: '/assets/images/categories/cat_cultural.jpg',
        price: 4499.00,
        original_price: 5800.00
      },
      {
        title: 'Disneyland® Paris 1-Day 1-Park or 2-Parks Ticket',
        slug: 'disneyland-paris-1-day-ticket',
        category: 'adventure',
        city: 'Paris',
        country: 'France',
        location: 'Bd de Parc, 77700 Coupvray, France',
        duration_minutes: 480,
        description: 'Experience magical fairy tales and adrenaline-pumping rollercoasters at Disneyland® Park and Walt Disney Studios® Park.',
        image: '/assets/images/categories/cat_adventure.jpg',
        price: 6999.00,
        original_price: 8500.00
      },
      {
        title: 'Palace of Versailles Guided Tour with Gardens & Fountains',
        slug: 'palace-of-versailles-guided-tour',
        category: 'cultural',
        city: 'Paris',
        country: 'France',
        location: 'Place d\'Armes, 78000 Versailles',
        duration_minutes: 240,
        description: 'Step into French royalty with an all-access tour through the Hall of Mirrors, King\'s Grand Apartments, and the sprawling landscaped musical gardens.',
        image: '/assets/images/col_luxury.jpg',
        price: 5200.00,
        original_price: 6500.00
      },
      {
        title: 'Montmartre Gourmet Food Tasting & Walking Tour',
        slug: 'montmartre-gourmet-food-tasting-tour',
        category: 'food-dining',
        city: 'Paris',
        country: 'France',
        location: 'Place des Abbesses, Montmartre, Paris',
        duration_minutes: 180,
        description: 'Sample artisan cheeses, freshly baked baguettes, cured meats, macarons, and fine French wine in the bohemian artists quarter of Montmartre.',
        image: '/assets/images/categories/cat_food.jpg',
        price: 3600.00,
        original_price: 4500.00
      },

      // Dubai Activities
      {
        title: 'Dubai Red Dunes Desert Safari with BBQ Dinner & Quad Bike',
        slug: 'dubai-red-dunes-desert-safari-bbq-quad',
        category: 'desert-safari',
        city: 'Dubai',
        country: 'United Arab Emirates',
        location: 'Lahbab Desert, Dubai',
        duration_minutes: 360,
        description: 'High-octane dune bashing in luxury 4x4 Land Cruisers, sandboarding, camel rides, 30-minute quad biking, live belly dancing, Tanoura show, and a 5-star international buffet dinner.',
        image: '/assets/images/exp_camel_safari.jpg',
        price: 2499.00,
        original_price: 3800.00
      },
      {
        title: 'Burj Khalifa At the Top (Level 124 & 125) Observation Deck',
        slug: 'burj-khalifa-at-the-top-level-124-125',
        category: 'sightseeing',
        city: 'Dubai',
        country: 'United Arab Emirates',
        location: '1 Sheikh Mohammed bin Rashid Blvd, Downtown Dubai',
        duration_minutes: 90,
        description: 'Ride the world fastest double-deck elevators to levels 124 and 125 for breathtaking 360-degree panoramic vistas of the Arabian Gulf and Dubai glittering skyline.',
        image: '/assets/images/dest_dubai.jpg',
        price: 3650.00,
        original_price: 4200.00
      },
      {
        title: 'Dubai Marina Luxury Yacht Cruise with Live BBQ & Music',
        slug: 'dubai-marina-luxury-yacht-cruise-bbq',
        category: 'water-sports',
        city: 'Dubai',
        country: 'United Arab Emirates',
        location: 'Dubai Marina Yacht Club, Pier 7',
        duration_minutes: 120,
        description: 'Cruise past Bluewaters Island, Ain Dubai, and JBR aboard a sleek 50-foot luxury yacht with fresh BBQ, refreshing beverages, and sunbathing decks.',
        image: '/assets/images/categories/cat_water_sports.jpg',
        price: 2899.00,
        original_price: 3999.00
      },

      // Goa Activities
      {
        title: 'Goa Grand Island Scuba Diving & 5 Water Sports Combo',
        slug: 'goa-grand-island-scuba-diving-water-sports-combo',
        category: 'water-sports',
        city: 'Goa',
        country: 'India',
        location: 'Grand Island / Calangute Beach, North Goa',
        duration_minutes: 360,
        description: 'Dive into crystal-clear waters with PADI certified dive instructors, followed by Parasailing, Jet Ski ride, Banana ride, Bumper ride, and Speedboat thrill ride.',
        image: '/assets/images/exp_parasailing.jpg',
        price: 1999.00,
        original_price: 3500.00
      },
      {
        title: 'Dudhsagar Waterfalls Trek & Spice Plantation Safari',
        slug: 'dudhsagar-waterfalls-trek-spice-plantation',
        category: 'adventure',
        city: 'Goa',
        country: 'India',
        location: 'Mollem National Park, South Goa',
        duration_minutes: 420,
        description: 'Jeep safari through Bhagwan Mahavir Wildlife Sanctuary to India fifth-tallest waterfall, natural pool swimming with lifejackets, and authentic Goan buffet lunch at a heritage spice farm.',
        image: '/assets/images/dest_goa.jpg',
        price: 1799.00,
        original_price: 2400.00
      },

      // Jaipur Activities
      {
        title: 'Royal Jaipur Heritage Hot Air Balloon Flight at Sunrise',
        slug: 'royal-jaipur-heritage-hot-air-balloon-flight',
        category: 'adventure',
        city: 'Jaipur',
        country: 'India',
        location: 'Amber Fort Area, Jaipur',
        duration_minutes: 180,
        description: 'Float serenely over Rajput palaces, centuries-old forts, and the Aravalli hills during golden sunrise with certified commercial balloon pilots and champagne toast.',
        image: '/assets/images/categories/cat_air.jpg',
        price: 8500.00,
        original_price: 12000.00
      },
      {
        title: 'Jaipur Forts & Palaces Private Day Tour with Guide',
        slug: 'jaipur-forts-palaces-private-day-tour',
        category: 'cultural',
        city: 'Jaipur',
        country: 'India',
        location: 'Hawa Mahal, City Palace, Amber Fort, Jaipur',
        duration_minutes: 360,
        description: 'Comprehensive guided day tour of Amber Fort, Hawa Mahal, Jal Mahal, City Palace, and Jantar Mantar in an air-conditioned private sedan.',
        image: '/assets/images/dest_jaipur.jpg',
        price: 1899.00,
        original_price: 2600.00
      },

      // Manali Activities
      {
        title: 'Solang Valley Paragliding, Zorbing & ATV Quad Bike Adventure',
        slug: 'solang-valley-paragliding-zorbing-atv-adventure',
        category: 'adventure',
        city: 'Manali',
        country: 'India',
        location: 'Solang Valley, Manali, Himachal Pradesh',
        duration_minutes: 240,
        description: 'High-flying tandem paragliding overlooking snow-capped Himalayan peaks, giant zorbing ball downhill, and rough terrain ATV quad biking.',
        image: '/assets/images/exp_atv_biking.jpg',
        price: 2799.00,
        original_price: 3900.00
      },

      // Rishikesh Activities
      {
        title: 'Rishikesh 16km White Water River Rafting & Cliff Jumping',
        slug: 'rishikesh-16km-river-rafting-cliff-jumping',
        category: 'adventure',
        city: 'Rishikesh',
        country: 'India',
        location: 'Shivpuri to NIM Beach, Rishikesh',
        duration_minutes: 180,
        description: 'Navigate thrilling Grade III and IV rapids like Roller Coaster, Golf Course, and Club House along the holy Ganges river with safety kayakers and cliff jumping.',
        image: '/assets/images/dest_rishikesh.jpg',
        price: 999.00,
        original_price: 1600.00
      },

      // Bali Activities
      {
        title: 'Bali Mount Batur Sunrise Volcano Trek with Natural Hot Springs',
        slug: 'bali-mount-batur-sunrise-trek-hot-springs',
        category: 'adventure',
        city: 'Bali',
        country: 'Indonesia',
        location: 'Kintamani, Mount Batur, Bali',
        duration_minutes: 420,
        description: 'Hike to the summit of active Mount Batur volcano for an unforgettable sunrise above the clouds, followed by hot volcanic steam cooked breakfast and soaking in lakeside thermal hot springs.',
        image: '/assets/images/col_adventure.jpg',
        price: 3499.00,
        original_price: 4900.00
      }
    ];

    for (const a of activitiesData) {
      const existing = await query('SELECT id FROM activities WHERE slug = ?', [a.slug]);
      let activityId;

      if (existing.length === 0) {
        const res = await query(
          `INSERT INTO activities (supplier_id, title, slug, category, city, country, location, duration_minutes, description, booking_channel, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'web', 'active')`,
          [supplierId, a.title, a.slug, a.category, a.city, a.country, a.location, a.duration_minutes, a.description]
        );
        activityId = res.insertId;
      } else {
        activityId = existing[0].id;
        await query(
          `UPDATE activities 
           SET title = ?, category = ?, city = ?, country = ?, location = ?, duration_minutes = ?, description = ?, status = 'active'
           WHERE id = ?`,
          [a.title, a.category, a.city, a.country, a.location, a.duration_minutes, a.description, activityId]
        );
      }

      // Media
      await query('DELETE FROM activity_media WHERE activity_id = ?', [activityId]);
      await query(
        `INSERT INTO activity_media (activity_id, media_type, url, is_primary, display_order)
         VALUES (?, 'image', ?, 1, 0)`,
        [activityId, a.image]
      );

      // Pricing
      await query('DELETE FROM activity_pricing WHERE activity_id = ?', [activityId]);
      await query(
        `INSERT INTO activity_pricing (activity_id, tier_name, price, currency, customer_segment)
         VALUES (?, 'adult', ?, 'INR', 'retail')`,
        [activityId, a.price]
      );

      // Slots
      await query('DELETE FROM activity_slots WHERE activity_id = ?', [activityId]);
      await query(
        `INSERT INTO activity_slots (activity_id, start_time, end_time, days_of_week, max_capacity, is_active)
         VALUES 
          (?, '09:00:00', '12:00:00', '1,2,3,4,5,6,7', 30, 1),
          (?, '14:00:00', '17:00:00', '1,2,3,4,5,6,7', 30, 1)`,
        [activityId, activityId]
      );
    }

    console.log(`[Seed] Seeded ${activitiesData.length} rich activities successfully!`);
  } catch (err) {
    console.error('[Seed Error]:', err);
  } finally {
    await pool.end();
  }
};

seedActivitiesAndLocations();
