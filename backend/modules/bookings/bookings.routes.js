const express = require('express');
const router = express.Router();
const { authenticate, requirePermission } = require('../../middleware/auth.middleware');
const { query } = require('../../database/connection');

router.use(authenticate);

// View user bookings
router.get('/', requirePermission('booking.view'), async (req, res, next) => {
  try {
    let sql = 'SELECT * FROM bookings';
    const params = [];

    // If customer, only show own bookings
    if (req.user.role_slug === 'customer') {
      sql += ' WHERE user_id = ?';
      params.push(req.user.id);
    }

    sql += ' ORDER BY id DESC LIMIT 50';

    const bookings = await query(sql, params);
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    next(error);
  }
});

// View single booking details
router.get('/:id', requirePermission('booking.view'), async (req, res, next) => {
  try {
    const rows = await query('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const booking = rows[0];
    if (req.user.role_slug === 'customer' && booking.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this booking' });
    }

    const items = await query('SELECT * FROM booking_items WHERE booking_id = ?', [booking.id]);
    booking.items = items;

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
