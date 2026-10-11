const express = require('express');
const router = express.Router();

const authRoutes = require('../modules/auth/auth.routes');
const usersRoutes = require('../modules/users/users.routes');
const suppliersRoutes = require('../modules/suppliers/suppliers.routes');
const adminRoutes = require('../modules/admin/admin.routes');
const activitiesRoutes = require('../modules/activities/activities.routes');
const bookingsRoutes = require('../modules/bookings/bookings.routes');
const paymentsRoutes = require('../modules/payments/payments.routes');
const notificationsRoutes = require('../modules/notifications/notifications.routes');
const reportsRoutes = require('../modules/reports/reports.routes');

const config = require('../config');

// API Health Check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: config.app.name,
    environment: config.app.env,
    version: '1.0.0'
  });
});

// Module Routes
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/suppliers', suppliersRoutes);
router.use('/admin', adminRoutes);
router.use('/activities', activitiesRoutes);
router.use('/bookings', bookingsRoutes);
router.use('/payments', paymentsRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/reports', reportsRoutes);

module.exports = router;
