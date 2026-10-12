const express = require('express');
const router = express.Router();
const adminController = require('./admin.controller');
const { authenticate, requireRole, requirePermission } = require('../../middleware/auth.middleware');

// Protect all admin endpoints
router.use(authenticate);
router.use(requireRole('site_admin', 'accountant', 'site_accountant', 'finance'));

// RBAC Roles & Permissions
router.get('/roles', requirePermission('role.view'), adminController.listRoles);
router.get('/permissions', requirePermission('role.view'), adminController.listPermissions);

// User Management
router.get('/users', requirePermission('user.view'), adminController.listUsers);
router.put('/users/:id/role', requirePermission('role.assign'), adminController.assignUserRole);

// Supplier Approvals & Document Verification (Site Admin)
router.get('/suppliers', requirePermission('supplier.view'), adminController.listSuppliers);
router.get('/suppliers/:id', requirePermission('supplier.view'), adminController.getSupplierDetail);
router.put('/suppliers/:id/status', requirePermission('supplier.approve'), adminController.updateSupplierStatus);
router.post('/suppliers/:id/request-documents', requirePermission('supplier.approve'), adminController.requestSupplierDocuments);
router.post('/suppliers/:id/remarks', requirePermission('supplier.approve'), adminController.addSupplierRemarks);
router.put('/suppliers/:id/approve', requirePermission('supplier.approve'), adminController.approveSupplier);
router.put('/suppliers/:id/reject', requirePermission('supplier.reject'), adminController.rejectSupplier);
router.put('/suppliers/:id/documents/:docId/verify', requirePermission('supplier.approve'), adminController.verifySupplierDocument);

// Reports (Accountant, Finance, Admin)
router.get('/reports/revenue', requirePermission('report.revenue'), adminController.getRevenueReportOverview);

// Custom Taxonomy Review (Section 3.3 & 3.4)
router.get('/custom-taxonomy', requireRole('site_admin'), adminController.getCustomTaxonomy);
router.put('/custom-taxonomy/sub/:id/review', requireRole('site_admin'), adminController.reviewCustomSubcategory);

// Supplier Suspension & Booking Reassignment (Section 26.1)
router.get('/suppliers/:id/affected-bookings', requireRole('site_admin'), adminController.getSupplierAffectedBookings);
router.post('/suppliers/:id/reassign-booking', requireRole('site_admin'), adminController.reassignSupplierBooking);

// Category & Sub-Category Hierarchy Management (Section 3.6)
router.get('/categories', requireRole('site_admin'), adminController.listAdminCategories);
router.post('/categories', requireRole('site_admin'), adminController.createAdminCategory);
router.put('/categories/:id', requireRole('site_admin'), adminController.updateAdminCategory);
router.delete('/categories/:id', requireRole('site_admin'), adminController.deleteAdminCategory);
router.put('/categories/:id/restore', requireRole('site_admin'), adminController.restoreAdminCategory);

router.post('/categories/:id/subcategories', requireRole('site_admin'), adminController.createAdminSubcategory);
router.put('/subcategories/:id', requireRole('site_admin'), adminController.updateAdminSubcategory);
router.delete('/subcategories/:id', requireRole('site_admin'), adminController.deleteAdminSubcategory);
router.put('/subcategories/:id/restore', requireRole('site_admin'), adminController.restoreAdminSubcategory);

module.exports = router;
