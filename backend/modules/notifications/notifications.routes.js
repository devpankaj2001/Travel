const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth.middleware');
const { query } = require('../../database/connection');

router.use(authenticate);

// Get my notifications
router.get('/', async (req, res, next) => {
  try {
    const notifications = await query(
      `SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC LIMIT 50`,
      [req.user.id]
    );

    res.status(200).json({ success: true, count: notifications.length, data: notifications });
  } catch (error) {
    next(error);
  }
});

// Mark notification as read
router.put('/:id/read', async (req, res, next) => {
  try {
    await query(
      `UPDATE notifications SET status = 'read' WHERE id = ? AND user_id = ?`,
      [req.params.id, req.user.id]
    );

    res.status(200).json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
