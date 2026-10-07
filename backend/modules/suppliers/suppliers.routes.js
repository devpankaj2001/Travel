const express = require('express');
const router = express.Router();
const suppliersController = require('./suppliers.controller');
const { authenticate, requireRole } = require('../../middleware/auth.middleware');
const upload = require('../../middleware/upload.middleware');

// All supplier endpoints require authentication as supplier or admin
router.use(authenticate);
router.use(requireRole('supplier', 'site_admin'));

router.get('/profile', suppliersController.getSupplierProfile);
router.put('/profile', suppliersController.updateSupplierProfile);
router.get('/status', suppliersController.getSupplierStatus);
router.post('/submit-verification', suppliersController.submitForVerification);

// Document Management (KYC / Legal)
router.post('/documents', upload.any(), suppliersController.uploadDocument);
router.delete('/documents/:id', suppliersController.deleteDocument);

// Digital E-Sign Contract
router.get('/esign', suppliersController.getEsignAgreement);
router.post('/esign/sign', suppliersController.signEsignAgreement);

module.exports = router;
