const express = require('express');
const router = express.Router();
const { authenticate, requireRole, requirePermission, requireSupplierApproved } = require('../../middleware/auth.middleware');
const { query } = require('../../database/connection');

// -------------------------------------------------------------
// 1. All Locations / Destinations Listing
// -------------------------------------------------------------
router.get('/locations', async (req, res, next) => {
  try {
    const locations = await query(
      `SELECT d.id, d.name, d.slug, d.country, d.image_url,
              COUNT(DISTINCT a.id) AS activity_count,
              COALESCE(MIN(ap.price), 999) AS min_price
       FROM destinations d
       LEFT JOIN activities a ON (LOWER(a.city) = LOWER(d.name) AND a.status = 'active')
       LEFT JOIN activity_pricing ap ON a.id = ap.activity_id
       WHERE d.is_active = 1
       GROUP BY d.id, d.name, d.slug, d.country, d.image_url, d.display_order
       ORDER BY d.display_order ASC, activity_count DESC`
    );

    res.status(200).json({ success: true, count: locations.length, data: locations });
  } catch (error) {
    next(error);
  }
});

// -------------------------------------------------------------
// 2. All Categories Listing (with Subcategories)
// -------------------------------------------------------------
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await query(
      `SELECT c.id, c.name, c.slug, c.icon_name, c.image_url,
              COUNT(DISTINCT a.id) AS activity_count
       FROM categories c
       LEFT JOIN activities a ON (LOWER(a.category) = LOWER(c.slug) OR LOWER(a.category) = LOWER(c.name)) AND a.status = 'active'
       WHERE c.is_active = 1
       GROUP BY c.id, c.name, c.slug, c.icon_name, c.image_url, c.display_order
       ORDER BY c.display_order ASC`
    );

    // Map common subcategories for standard rich onboarding selection
    const subcategoryMap = {
      'adventure-theme-parks': ['Trekking', 'Camping', 'Rock Climbing', 'Theme Parks', 'Ziplining', 'Bungee Jumping'],
      'water-sports': ['Scuba Diving', 'Jet Skiing', 'Kayaking', 'Parasailing', 'Speed Boating', 'Snorkeling'],
      'desert-safari': ['Dune Bashing', 'Camel Safari', 'Quad Biking', 'Desert Camping', 'Sand Boarding'],
      'city-tours': ['Guided Walking Tours', 'Hop-on Hop-off Bus', 'Monument Visits', 'Night Sightseeing', 'Museum Tours'],
      'luxury-vip': ['Helicopter Tours', 'Private Yacht Rental', 'VIP Chauffeur Experiences', 'Luxury Desert Glamping'],
      'cultural-heritage': ['Historical Walks', 'Heritage Village Tour', 'Cooking Classes', 'Temple & Shrine Visits'],
      'day-trips': ['Mountain Day Excursions', 'Island Hopping', 'Waterfall Trek', 'Countryside Tour'],
      'nature-wildlife': ['Jungle Safari', 'Bird Watching', 'Forest Exploration', 'Wildlife Sanctuary Tour']
    };

    const enrichedCategories = categories.map(cat => ({
      ...cat,
      subcategories: subcategoryMap[cat.slug] || ['Guided Tours', 'Day Trips', 'Special Experiences', 'Group Activities']
    }));

    res.status(200).json({ success: true, count: enrichedCategories.length, data: enrichedCategories });
  } catch (error) {
    next(error);
  }
});

// -------------------------------------------------------------
// 3. Public Activities Listing (Advanced Search & Filters)
// -------------------------------------------------------------
router.get('/', async (req, res, next) => {
  try {
    const {
      search,
      q,
      city,
      destination,
      category,
      minPrice,
      maxPrice,
      duration,
      sort = 'popularity',
      channel = 'web',
      limit = 50,
      page = 1
    } = req.query;

    const conditions = ['a.status = "active"'];
    const params = [];

    const searchQuery = search || q;
    if (searchQuery && searchQuery.trim()) {
      const term = `%${searchQuery.trim()}%`;
      conditions.push('(a.title LIKE ? OR a.description LIKE ? OR a.city LIKE ? OR a.location LIKE ? OR a.country LIKE ? OR a.category LIKE ?)');
      params.push(term, term, term, term, term, term);
    }

    const targetCity = city || destination;
    if (targetCity && targetCity.trim() && targetCity.toLowerCase() !== 'all') {
      conditions.push('LOWER(a.city) = LOWER(?)');
      params.push(targetCity.trim());
    }

    if (category && category.trim() && category.toLowerCase() !== 'all') {
      conditions.push('(LOWER(a.category) = LOWER(?) OR a.category LIKE ?)');
      params.push(category.trim(), `%${category.trim()}%`);
    }

    if (channel) {
      conditions.push('(a.booking_channel = ? OR a.booking_channel = "omnichannel" OR a.booking_channel = "web")');
      params.push(channel);
    }

    // Duration filter
    if (duration) {
      if (duration === 'under_2h' || duration === 'short') {
        conditions.push('a.duration_minutes <= 120');
      } else if (duration === '2h_4h' || duration === 'medium') {
        conditions.push('a.duration_minutes > 120 AND a.duration_minutes <= 240');
      } else if (duration === '4h_8h' || duration === 'long') {
        conditions.push('a.duration_minutes > 240 AND a.duration_minutes <= 480');
      } else if (duration === 'full_day' || duration === 'multi_day') {
        conditions.push('a.duration_minutes > 480');
      }
    }

    // Sort order
    let orderByClause = 'a.id DESC';
    if (sort === 'price_asc') {
      orderByClause = 'min_price ASC';
    } else if (sort === 'price_desc') {
      orderByClause = 'min_price DESC';
    } else if (sort === 'duration_asc' || sort === 'duration') {
      orderByClause = 'a.duration_minutes ASC';
    } else if (sort === 'duration_desc') {
      orderByClause = 'a.duration_minutes DESC';
    } else if (sort === 'rating') {
      orderByClause = 'a.id DESC';
    }

    const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);

    const sql = `
      SELECT a.*, 
             s.company_name,
             COALESCE(MIN(ap.price), 1499.00) AS min_price,
             COALESCE(MAX(ap.currency), 'INR') AS currency,
             COALESCE(
               (SELECT url FROM activity_media WHERE activity_id = a.id AND is_primary = 1 LIMIT 1),
               (SELECT url FROM activity_media WHERE activity_id = a.id LIMIT 1),
               '/assets/images/dest_dubai.jpg'
             ) AS primary_image
      FROM activities a
      LEFT JOIN suppliers s ON a.supplier_id = s.id
      LEFT JOIN activity_pricing ap ON a.id = ap.activity_id
      WHERE ${conditions.join(' AND ')}
      GROUP BY a.id
      ${minPrice ? `HAVING min_price >= ${parseFloat(minPrice)}` : ''}
      ${maxPrice ? `${minPrice ? 'AND' : 'HAVING'} min_price <= ${parseFloat(maxPrice)}` : ''}
      ORDER BY ${orderByClause}
      LIMIT ? OFFSET ?
    `;

    const activities = await query(sql, [...params, parseInt(limit, 10), offset]);

    // Enhance activities with formatted labels, ratings, and badges
    const enhanced = activities.map(act => {
      const originalPrice = Math.round(Number(act.min_price) * 1.3);
      const discountPercent = Math.round(((originalPrice - Number(act.min_price)) / originalPrice) * 100);
      const durationHours = Math.floor(act.duration_minutes / 60);
      const durationMins = act.duration_minutes % 60;
      let durationText = `${durationHours}h`;
      if (durationMins > 0) durationText += ` ${durationMins}m`;

      return {
        ...act,
        price: Number(act.min_price),
        original_price: originalPrice,
        discount_percent: discountPercent,
        duration_text: durationText,
        rating: 4.8,
        reviews_count: 320 + (act.id * 43) % 400,
        badges: [
          'Instant Confirmation',
          act.id % 2 === 0 ? 'Bestseller' : 'Top Rated',
          'Free Cancellation'
        ],
        highlights: [
          'Mobile Voucher Accepted',
          'Professional English-speaking Guide',
          'Skip-the-line Admission Access'
        ]
      };
    });

    res.status(200).json({
      success: true,
      count: enhanced.length,
      page: parseInt(page, 10),
      data: enhanced
    });
  } catch (error) {
    next(error);
  }
});

// Single activity
router.get('/:id', async (req, res, next) => {
  try {
    const activities = await query('SELECT * FROM activities WHERE id = ?', [req.params.id]);
    if (activities.length === 0) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }

    const activity = activities[0];
    const media = await query('SELECT * FROM activity_media WHERE activity_id = ? ORDER BY is_primary DESC', [activity.id]);
    const slots = await query('SELECT * FROM activity_slots WHERE activity_id = ? AND is_active = TRUE', [activity.id]);
    const pricing = await query('SELECT * FROM activity_pricing WHERE activity_id = ?', [activity.id]);

    activity.media = media;
    activity.slots = slots;
    activity.pricing = pricing;

    const primaryMedia = media.find(m => m.is_primary) || media[0];
    activity.primary_image = primaryMedia?.url || '/assets/images/dest_jaipur.jpg';

    // Curate rich secondary images based on destination so collage always has 5 valid photos
    const cityImagesMap = {
      jaipur: [
        '/assets/images/dest_jaipur.jpg',
        '/assets/images/categories/cat_cultural.jpg',
        '/assets/images/categories/cat_sightseeing.jpg',
        '/assets/images/exp_atv_biking.jpg',
        '/assets/images/col_luxury.jpg'
      ],
      dubai: [
        '/assets/images/dest_dubai.jpg',
        '/assets/images/exp_camel_safari.jpg',
        '/assets/images/exp_jeep_safari.jpg',
        '/assets/images/col_luxury.jpg',
        '/assets/images/categories/cat_sightseeing.jpg'
      ],
      goa: [
        '/assets/images/dest_goa.jpg',
        '/assets/images/exp_parasailing.jpg',
        '/assets/images/categories/cat_water_sports.jpg',
        '/assets/images/col_adventure.jpg',
        '/assets/images/categories/cat_sightseeing.jpg'
      ],
      manali: [
        '/assets/images/dest_manali.jpg',
        '/assets/images/exp_atv_biking.jpg',
        '/assets/images/categories/cat_adventure.jpg',
        '/assets/images/col_adventure.jpg'
      ],
      rishikesh: [
        '/assets/images/dest_rishikesh.jpg',
        '/assets/images/categories/cat_adventure.jpg',
        '/assets/images/categories/cat_spiritual.jpg',
        '/assets/images/col_adventure.jpg'
      ],
      paris: [
        '/assets/images/categories/cat_sightseeing.jpg',
        '/assets/images/categories/cat_cultural.jpg',
        '/assets/images/categories/cat_romantic.jpg',
        '/assets/images/categories/cat_food.jpg'
      ]
    };
    const cityKey = (activity.city || '').toLowerCase();
    const cityFallbacks = cityImagesMap[cityKey] || [
      '/assets/images/dest_jaipur.jpg',
      '/assets/images/categories/cat_cultural.jpg',
      '/assets/images/categories/cat_sightseeing.jpg',
      '/assets/images/exp_atv_biking.jpg',
      '/assets/images/col_luxury.jpg'
    ];

    const mediaUrls = media.map(m => m.url).filter(Boolean);
    const combinedSecondary = [...mediaUrls];
    for (const fb of cityFallbacks) {
      if (!combinedSecondary.includes(fb) && combinedSecondary.length < 5) {
        combinedSecondary.push(fb);
      }
    }
    activity.secondary_images = combinedSecondary;
    activity.price = pricing.length > 0 ? Number(pricing[0].price) : 1499;
    activity.original_price = Math.round(Number(activity.price) * 1.35);
    activity.discount_percent = 26;
    activity.rating = 4.8;
    activity.reviews_count = 520;
    activity.duration_text = `${Math.floor((activity.duration_minutes || 120) / 60)}h`;

    res.status(200).json({ success: true, data: activity });
  } catch (error) {
    next(error);
  }
});

/**
 * Create / Publish Activity Guard
 * Enforces Phase 1 requirement: Supplier cannot publish activities until approved and e-signed
 */
router.post('/', authenticate, requireRole('supplier', 'site_admin'), requireSupplierApproved, async (req, res, next) => {
  try {
    const {
      title,
      category,
      city,
      description,
      duration_minutes,
      booking_channel = 'omnichannel'
    } = req.body;

    if (!title || !category || !city) {
      return res.status(400).json({ success: false, message: 'title, category, and city are required' });
    }

    const supplierId = req.user.supplier ? req.user.supplier.supplier_id : req.body.supplier_id;
    if (!supplierId) {
      return res.status(400).json({ success: false, message: 'Supplier profile required' });
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now();

    const result = await query(
      `INSERT INTO activities (supplier_id, title, slug, category, city, description, duration_minutes, booking_channel, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft')`,
      [supplierId, title, slug, category, city, description || '', duration_minutes || 60, booking_channel]
    );

    return res.status(201).json({
      success: true,
      message: 'Activity created successfully as draft',
      data: {
        activityId: result.insertId,
        slug
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
