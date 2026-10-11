const { query, transaction } = require('../../database/connection');
const { sendSupplierStatusEmail } = require('../../services/email.service');
const { recordActivityLog, recordAuditLog } = require('../../middleware/audit.middleware');

/**
 * List all roles with their assigned permissions
 * GET /api/v1/admin/roles
 */
const listRoles = async (req, res, next) => {
  try {
    const roles = await query('SELECT * FROM roles ORDER BY id ASC');

    for (const role of roles) {
      const perms = await query(
        `SELECT p.id, p.name, p.slug, p.module, p.description
         FROM permissions p
         JOIN role_permissions rp ON p.id = rp.permission_id
         WHERE rp.role_id = ?`,
        [role.id]
      );
      role.permissions = perms;
    }

    return res.status(200).json({
      success: true,
      data: roles
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List all system permissions
 * GET /api/v1/admin/permissions
 */
const listPermissions = async (req, res, next) => {
  try {
    const permissions = await query('SELECT * FROM permissions ORDER BY module ASC, name ASC');

    // Group by module
    const grouped = permissions.reduce((acc, p) => {
      acc[p.module] = acc[p.module] || [];
      acc[p.module].push(p);
      return acc;
    }, {});

    return res.status(200).json({
      success: true,
      data: {
        total: permissions.length,
        permissions,
        byModule: grouped
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List platform users with filter & search
 * GET /api/v1/admin/users
 */
const listUsers = async (req, res, next) => {
  try {
    const { role, status, account_type, customer_segment, search, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const conditions = ['1=1'];
    const params = [];

    if (role) {
      conditions.push('r.slug = ?');
      params.push(role);
    }
    if (status) {
      conditions.push('u.status = ?');
      params.push(status);
    }
    if (account_type) {
      conditions.push('u.account_type = ?');
      params.push(account_type);
    }
    if (customer_segment) {
      conditions.push('u.customer_segment = ?');
      params.push(customer_segment);
    }
    if (search) {
      conditions.push('(u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    const whereClause = conditions.join(' AND ');

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE ${whereClause}
    `;
    const countRows = await query(countQuery, params);
    const total = countRows[0].total;

    const usersQuery = `
      SELECT u.id, u.first_name, u.last_name, u.email, u.phone, 
             u.account_type, u.customer_segment, u.status,
             u.email_verified_at, u.phone_verified_at, u.created_at,
             r.name AS role_name, r.slug AS role_slug
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE ${whereClause}
      ORDER BY u.id DESC
      LIMIT ? OFFSET ?
    `;
    const users = await query(usersQuery, [...params, parseInt(limit, 10), parseInt(offset, 10)]);

    return res.status(200).json({
      success: true,
      data: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(total / parseInt(limit, 10)),
        users
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Assign role to a user
 * PUT /api/v1/admin/users/:id/role
 */
const assignUserRole = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    const { role_slug } = req.body;

    if (!role_slug) {
      return res.status(400).json({ success: false, message: 'role_slug is required' });
    }

    const roles = await query('SELECT id, name, slug FROM roles WHERE slug = ?', [role_slug]);
    if (roles.length === 0) {
      return res.status(404).json({ success: false, message: `Role "${role_slug}" does not exist` });
    }
    const newRole = roles[0];

    const users = await query('SELECT id, email FROM users WHERE id = ?', [targetUserId]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await query('UPDATE users SET role_id = ? WHERE id = ?', [newRole.id, targetUserId]);

    await recordActivityLog({
      userId: req.user.id,
      action: 'ASSIGN_ROLE',
      entityType: 'users',
      entityId: targetUserId,
      description: `Admin ${req.user.email} assigned role "${newRole.slug}" to user ${users[0].email}`,
      req
    });

    return res.status(200).json({
      success: true,
      message: `User role updated successfully to "${newRole.name}"`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List Suppliers (with status filter and e-sign summary)
 * GET /api/v1/admin/suppliers
 */
const listSuppliers = async (req, res, next) => {
  try {
    const { status, search } = req.query;

    const conditions = ['1=1'];
    const params = [];

    if (status) {
      conditions.push('s.status = ?');
      params.push(status);
    }
    if (search) {
      conditions.push('(s.company_name LIKE ? OR u.email LIKE ? OR s.contact_person LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    const sql = `
      SELECT s.*, 
             u.first_name, u.last_name, u.email, u.phone, 
             u.email_verified_at, u.phone_verified_at,
             admin_user.email AS approved_by_email
      FROM suppliers s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN users admin_user ON s.approved_by = admin_user.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY s.id DESC
    `;

    const suppliers = await query(sql, params);

    // Fetch documents and esign for each supplier
    for (const supp of suppliers) {
      const docs = await query('SELECT * FROM supplier_documents WHERE supplier_id = ? ORDER BY id DESC', [supp.id]);
      supp.documents = docs;

      const esign = await query(
        'SELECT id, document_title, signed_status, signer_name, signed_at, esign_reference FROM esign_documents WHERE supplier_id = ? ORDER BY id DESC LIMIT 1',
        [supp.id]
      );
      supp.esign = esign.length > 0 ? esign[0] : null;
    }

    return res.status(200).json({
      success: true,
      data: {
        total: suppliers.length,
        suppliers
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Supplier Details (Inspection for Admin)
 * GET /api/v1/admin/suppliers/:id
 */
const getSupplierDetail = async (req, res, next) => {
  try {
    const supplierId = req.params.id;
    const suppliers = await query(
      `SELECT s.*, 
              u.first_name, u.last_name, u.email, u.phone, 
              u.email_verified_at, u.phone_verified_at, u.status AS user_status,
              admin_user.email AS approved_by_email
       FROM suppliers s
       JOIN users u ON s.user_id = u.id
       LEFT JOIN users admin_user ON s.approved_by = admin_user.id
       WHERE s.id = ?`,
      [supplierId]
    );

    if (suppliers.length === 0) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    const supplier = suppliers[0];

    const docs = await query(
      `SELECT d.*, admin_u.email AS verified_by_email 
       FROM supplier_documents d
       LEFT JOIN users admin_u ON d.verified_by = admin_u.id
       WHERE d.supplier_id = ? ORDER BY d.id DESC`,
      [supplierId]
    );
    supplier.documents = docs;

    const esign = await query(
      `SELECT * FROM esign_documents WHERE supplier_id = ? ORDER BY id DESC LIMIT 1`,
      [supplierId]
    );
    supplier.esign = esign.length > 0 ? esign[0] : null;

    return res.status(200).json({
      success: true,
      data: supplier
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify Individual Supplier KYC Document (Approve or Reject with Reason)
 * PUT /api/v1/admin/suppliers/:id/documents/:docId/verify
 */
const verifySupplierDocument = async (req, res, next) => {
  try {
    const { id: supplierId, docId } = req.params;
    const { status, rejection_reason } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved, rejected, or pending' });
    }

    if (status === 'rejected' && (!rejection_reason || rejection_reason.trim() === '')) {
      return res.status(400).json({ success: false, message: 'A rejection reason is required when rejecting a document' });
    }

    const docs = await query('SELECT * FROM supplier_documents WHERE id = ? AND supplier_id = ?', [docId, supplierId]);
    if (docs.length === 0) {
      return res.status(404).json({ success: false, message: 'Document not found for this supplier' });
    }

    const doc = docs[0];

    await query(
      `UPDATE supplier_documents 
       SET status = ?, rejection_reason = ?, verified_at = NOW(), verified_by = ? 
       WHERE id = ?`,
      [status, status === 'rejected' ? rejection_reason : null, req.user.id, docId]
    );

    await recordAuditLog({
      actorId: req.user.id,
      entityType: 'supplier_documents',
      entityId: docId,
      action: 'VERIFY_SUPPLIER_DOCUMENT',
      oldValue: { status: doc.status, rejection_reason: doc.rejection_reason },
      newValue: { status, rejection_reason: status === 'rejected' ? rejection_reason : null },
      reason: rejection_reason || `Admin marked document as ${status}`,
      req
    });

    await recordActivityLog({
      userId: req.user.id,
      action: 'VERIFY_SUPPLIER_DOCUMENT',
      entityType: 'supplier_documents',
      entityId: docId,
      description: `Admin ${req.user.email} marked document "${doc.document_name}" as ${status}`,
      req
    });

    return res.status(200).json({
      success: true,
      message: `Document "${doc.document_name}" has been marked as ${status}`,
      data: {
        docId,
        status,
        rejection_reason: status === 'rejected' ? rejection_reason : null
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve Supplier Application
 * PUT /api/v1/admin/suppliers/:id/approve
 */
const approveSupplier = async (req, res, next) => {
  try {
    const supplierId = req.params.id;
    const { notes } = req.body;

    const suppliers = await query(
      `SELECT s.*, u.email, u.first_name, u.last_name 
       FROM suppliers s 
       JOIN users u ON s.user_id = u.id 
       WHERE s.id = ?`,
      [supplierId]
    );

    if (suppliers.length === 0) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    const supplier = suppliers[0];

    // REQUIREMENT 6.1: Enforce that E-Sign contract is signed before approval
    const esign = await query(
      `SELECT id, signed_status FROM esign_documents WHERE supplier_id = ? AND signed_status = 'signed'`,
      [supplierId]
    );

    if (esign.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot approve supplier: Legal supplier agreement (E-Sign) has not been signed by the supplier yet.'
      });
    }

    // Check KYC documents
    const docs = await query(`SELECT id, status FROM supplier_documents WHERE supplier_id = ?`, [supplierId]);
    if (docs.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot approve supplier: No KYC documents have been submitted.'
      });
    }

    const oldStatus = supplier.status;

    // Update supplier status and user status
    await query(
      `UPDATE suppliers 
       SET status = 'approved', approved_by = ?, approved_at = NOW(), approval_notes = ? 
       WHERE id = ?`,
      [req.user.id, notes || 'Approved by administrator', supplierId]
    );

    await query(`UPDATE users SET status = 'active' WHERE id = ?`, [supplier.user_id]);

    // Send email notification
    await sendSupplierStatusEmail({
      user: { id: supplier.user_id, email: supplier.email, first_name: supplier.first_name },
      status: 'approved',
      reason: notes || 'Your supplier application and KYC compliance have been approved. You may now publish activities.'
    });

    await recordAuditLog({
      actorId: req.user.id,
      entityType: 'suppliers',
      entityId: supplierId,
      action: 'APPROVE_SUPPLIER',
      oldValue: { status: oldStatus },
      newValue: { status: 'approved', notes },
      reason: notes || 'Supplier application approved after verification of documents and signed E-sign contract',
      req
    });

    await recordActivityLog({
      userId: req.user.id,
      action: 'APPROVE_SUPPLIER',
      entityType: 'suppliers',
      entityId: supplierId,
      description: `Admin ${req.user.email} approved supplier ${supplier.company_name}`,
      req
    });

    return res.status(200).json({
      success: true,
      message: `Supplier "${supplier.company_name}" has been approved successfully.`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject Supplier Application
 * PUT /api/v1/admin/suppliers/:id/reject
 */
const rejectSupplier = async (req, res, next) => {
  try {
    const supplierId = req.params.id;
    const { reason } = req.body;

    if (!reason || reason.trim() === '') {
      return res.status(400).json({ success: false, message: 'A rejection reason is required' });
    }

    const suppliers = await query(
      `SELECT s.*, u.email, u.first_name, u.last_name 
       FROM suppliers s 
       JOIN users u ON s.user_id = u.id 
       WHERE s.id = ?`,
      [supplierId]
    );

    if (suppliers.length === 0) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    const supplier = suppliers[0];
    const oldStatus = supplier.status;

    await query(
      `UPDATE suppliers 
       SET status = 'rejected', approved_by = ?, approval_notes = ? 
       WHERE id = ?`,
      [req.user.id, reason, supplierId]
    );

    // Send rejection email
    await sendSupplierStatusEmail({
      user: { id: supplier.user_id, email: supplier.email, first_name: supplier.first_name },
      status: 'rejected',
      reason
    });

    await recordAuditLog({
      actorId: req.user.id,
      entityType: 'suppliers',
      entityId: supplierId,
      action: 'REJECT_SUPPLIER',
      oldValue: { status: oldStatus },
      newValue: { status: 'rejected', reason },
      reason,
      req
    });

    await recordActivityLog({
      userId: req.user.id,
      action: 'REJECT_SUPPLIER',
      entityType: 'suppliers',
      entityId: supplierId,
      description: `Admin ${req.user.email} rejected supplier ${supplier.company_name}: ${reason}`,
      req
    });

    return res.status(200).json({
      success: true,
      message: `Supplier "${supplier.company_name}" application has been rejected.`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Supplier Lifecycle Status (Draft / Submitted / Under Verification / Suspended)
 * PUT /api/v1/admin/suppliers/:id/status
 */
const updateSupplierStatus = async (req, res, next) => {
  try {
    const supplierId = req.params.id;
    const { status, notes } = req.body;

    const validStatuses = ['draft', 'submitted', 'under_verification', 'under_review', 'approved', 'rejected', 'suspended'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    if (status === 'approved') {
      return approveSupplier(req, res, next);
    }
    if (status === 'rejected') {
      req.body.reason = notes;
      return rejectSupplier(req, res, next);
    }

    const suppliers = await query('SELECT * FROM suppliers WHERE id = ?', [supplierId]);
    if (suppliers.length === 0) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }
    const oldSupplier = suppliers[0];

    await query(
      `UPDATE suppliers SET status = ?, approval_notes = ? WHERE id = ?`,
      [status, notes || null, supplierId]
    );

    if (status === 'suspended') {
      await query(`UPDATE users SET status = 'suspended' WHERE id = ?`, [oldSupplier.user_id]);
    }

    await recordAuditLog({
      actorId: req.user.id,
      entityType: 'suppliers',
      entityId: supplierId,
      action: 'UPDATE_SUPPLIER_STATUS',
      oldValue: { status: oldSupplier.status },
      newValue: { status, notes },
      reason: notes || `Admin changed status to ${status}`,
      req
    });

    return res.status(200).json({
      success: true,
      message: `Supplier status changed to ${status}`,
      data: { status }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Revenue Report Overview
 * GET /api/v1/admin/reports/revenue
 */
const getRevenueReportOverview = async (req, res, next) => {
  try {
    const stats = await query(`
      SELECT 
        (SELECT COUNT(*) FROM bookings) AS total_bookings,
        (SELECT COUNT(*) FROM bookings WHERE status = 'confirmed') AS confirmed_bookings,
        (SELECT COALESCE(SUM(total_amount), 0) FROM bookings WHERE status IN ('confirmed', 'completed')) AS total_revenue,
        (SELECT COUNT(*) FROM payments WHERE status = 'captured') AS successful_payments,
        (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'captured') AS total_captured_amount,
        (SELECT COUNT(*) FROM suppliers WHERE status = 'approved') AS active_suppliers,
        (SELECT COUNT(*) FROM users WHERE role_id = (SELECT id FROM roles WHERE slug = 'customer')) AS total_customers
    `);

    return res.status(200).json({
      success: true,
      data: stats[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Activity Logs (Audit Trail)
 * GET /api/v1/admin/audit-logs
 */
const listAuditLogs = async (req, res, next) => {
  try {
    const { action, limit = 50 } = req.query;

    const conditions = ['1=1'];
    const params = [];

    if (action) {
      conditions.push('al.action = ?');
      params.push(action);
    }

    const logs = await query(
      `SELECT al.*, u.email AS user_email, u.first_name, u.last_name
       FROM activity_logs al
       LEFT JOIN users u ON al.user_id = u.id
       WHERE ${conditions.join(' AND ')}
       ORDER BY al.id DESC
       LIMIT ?`,
      [...params, parseInt(limit, 10)]
    );

    return res.status(200).json({
      success: true,
      data: {
        total: logs.length,
        logs
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listRoles,
  listPermissions,
  listUsers,
  assignUserRole,
  listSuppliers,
  getSupplierDetail,
  verifySupplierDocument,
  updateSupplierStatus,
  approveSupplier,
  rejectSupplier,
  getRevenueReportOverview,
  listAuditLogs
};
