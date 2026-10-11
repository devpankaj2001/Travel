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

// Catalog Browsing & Activity Association (Section 12 & 13)
router.get('/catalog', suppliersController.getCatalogActivities);
router.post('/catalog/associate', suppliersController.associateActivity);

// Supplier Activities & Creation (Section 14 & 15)
router.get('/my-activities', suppliersController.getMyActivities);
router.post('/activities', suppliersController.createSupplierActivity);

// Custom Taxonomy & Commission (Section 3.3 & 18)
router.post('/custom-subcategory', suppliersController.submitCustomSubcategory);
router.put('/commission', suppliersController.updateSupplierCommission);

module.exports = router;
