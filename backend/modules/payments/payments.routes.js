const express = require('express');
const router = express.Router();
const { authenticate, requirePermission } = require('../../middleware/auth.middleware');
const { query } = require('../../database/connection');

router.use(authenticate);

// List payments (Finance, Site Accountant, Site Admin)
router.get('/', requirePermission('payment.view'), async (req, res, next) => {
  try {
    const { status, limit = 50 } = req.query;
    const conditions = ['1=1'];
    const params = [];

    if (status) {
      conditions.push('p.status = ?');
      params.push(status);
    }

    const payments = await query(
      `SELECT p.*, b.booking_reference, u.email AS customer_email
       FROM payments p
       JOIN bookings b ON p.booking_id = b.id
       JOIN users u ON b.user_id = u.id
       WHERE ${conditions.join(' AND ')}
       ORDER BY p.id DESC
       LIMIT ?`,
      [...params, parseInt(limit, 10)]
    );

    res.status(200).json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
