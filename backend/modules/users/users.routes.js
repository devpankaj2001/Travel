const express = require('express');
const router = express.Router();
const usersController = require('./users.controller');
const { authenticate } = require('../../middleware/auth.middleware');

router.use(authenticate);

router.get('/profile', usersController.getProfile);
router.put('/profile', usersController.updateProfile);
router.put('/change-password', usersController.changePassword);

module.exports = router;
