const express = require('express');
const router = express.Router();
const { authenticate, requirePermission } = require('../../middleware/auth.middleware');
const { query } = require('../../database/connection');

router.use(authenticate);

// Financial / Accounting Summary
router.get('/financial', requirePermission('report.financial'), async (req, res, next) => {
  try {
    const summary = await query(`
      SELECT 
        COUNT(DISTINCT b.id) AS total_bookings,
        COALESCE(SUM(b.total_amount), 0) AS gross_booking_value,
        COALESCE(SUM(p.amount), 0) AS total_payments_received
      FROM bookings b
      LEFT JOIN payments p ON b.id = p.booking_id AND p.status = 'captured'
    `);

    res.status(200).json({ success: true, data: summary[0] });
  } catch (error) {
    next(error);
  }
});

// Activity Performance
router.get('/activities', requirePermission('report.activity'), async (req, res, next) => {
  try {
    const activityStats = await query(`
      SELECT a.id, a.title, a.category, a.city,
             COUNT(bi.id) AS total_orders,
             COALESCE(SUM(bi.total_price), 0) AS total_sales
      FROM activities a
      LEFT JOIN booking_items bi ON a.id = bi.activity_id
      GROUP BY a.id
      ORDER BY total_sales DESC
      LIMIT 20
    `);

    res.status(200).json({ success: true, data: activityStats });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
