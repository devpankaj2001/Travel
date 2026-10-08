const express = require('express');
const router = express.Router();
const { authenticate, requireRole, requirePermission, requireSupplierApproved } = require('../../middleware/auth.middleware');
const { query } = require('../../database/connection');

// Categories listing from MySQL table
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await query(
      'SELECT id, name, slug, description, icon_name, image_url, display_order FROM categories WHERE is_active = TRUE ORDER BY display_order ASC, name ASC'
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

    res.status(200).json({
      success: true,
      count: enrichedCategories.length,
      data: enrichedCategories
    });
  } catch (error) {
    next(error);
  }
});

// Public listing
router.get('/', async (req, res, next) => {
  try {
    const { category, city, channel = 'web', limit = 20 } = req.query;
    const conditions = ['status = "active"'];
    const params = [];

    if (category) { conditions.push('category = ?'); params.push(category); }
    if (city) { conditions.push('city = ?'); params.push(city); }
    if (channel) { conditions.push('booking_channel = ?'); params.push(channel); }

    const activities = await query(
      `SELECT a.*, s.company_name 
       FROM activities a
       JOIN suppliers s ON a.supplier_id = s.id
       WHERE ${conditions.join(' AND ')}
       LIMIT ?`,
      [...params, parseInt(limit, 10)]
    );

    res.status(200).json({ success: true, count: activities.length, data: activities });
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
