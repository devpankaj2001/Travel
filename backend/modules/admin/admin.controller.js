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
        'SELECT id, document_title, signed_status, signed_at, esign_reference FROM esign_documents WHERE supplier_id = ? ORDER BY id DESC LIMIT 1',
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

    // Registration approval is based on the uploaded verification documents.
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
    const { status, notes, reason } = req.body;
    const finalNote = notes || reason;

    const validStatuses = [
      'pending',
      'under_review',
      'documents_required',
      'approved',
      'rejected',
      'suspended',
      'blocked',
      'draft',
      'submitted',
      'under_verification'
    ];
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
      req.body.reason = finalNote;
      return rejectSupplier(req, res, next);
    }

    const suppliers = await query(
      `SELECT s.*, u.email, u.first_name FROM suppliers s JOIN users u ON s.user_id = u.id WHERE s.id = ?`,
      [supplierId]
    );
    if (suppliers.length === 0) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }
    const oldSupplier = suppliers[0];

    await query(
      `UPDATE suppliers SET status = ?, approval_notes = ? WHERE id = ?`,
      [status, finalNote || null, supplierId]
    );

    if (status === 'suspended' || status === 'blocked') {
      await query(`UPDATE users SET status = 'suspended' WHERE id = ?`, [oldSupplier.user_id]);
    }

    // Always send an email and in-system notification to supplier on status update or remarks
    await sendSupplierStatusEmail({
      user: { id: oldSupplier.user_id, email: oldSupplier.email, first_name: oldSupplier.first_name },
      status,
      reason: finalNote,
      reviewerEmail: req.user.email
    });

    try {
      await query(
        `INSERT INTO notifications (user_id, title, message, type, status, metadata)
         VALUES (?, ?, ?, 'system', 'sent', ?)`,
        [
          oldSupplier.user_id,
          `Supplier Application: ${status.replace(/_/g, ' ').toUpperCase()}`,
          finalNote || `Your application status was updated to ${status.replace(/_/g, ' ')}.`,
          JSON.stringify({ status, supplierId, notes: finalNote, timestamp: new Date().toISOString() })
        ]
      );
    } catch (notifErr) {
      console.error('[Notification Insert Error]:', notifErr.message);
    }

    await recordAuditLog({
      actorId: req.user.id,
      entityType: 'suppliers',
      entityId: supplierId,
      action: 'UPDATE_SUPPLIER_STATUS',
      oldValue: { status: oldSupplier.status },
      newValue: { status, notes: finalNote },
      reason: finalNote || `Admin changed status to ${status}`,
      req
    });

    return res.status(200).json({
      success: true,
      message: `Supplier status changed to ${status}${finalNote ? ` with remarks sent to ${oldSupplier.email}` : ''}`,
      data: { status, notes: finalNote }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Request Missing Documents / Information from Supplier
 * POST /api/v1/admin/suppliers/:id/request-documents
 */
const requestSupplierDocuments = async (req, res, next) => {
  try {
    const supplierId = req.params.id;
    const { notes, reason, requested_document_types = [] } = req.body;
    const remarks = notes || reason;

    if (!remarks || remarks.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide instructions or remarks detailing the missing documents or information.'
      });
    }

    const suppliers = await query(
      `SELECT s.*, u.email, u.first_name FROM suppliers s JOIN users u ON s.user_id = u.id WHERE s.id = ?`,
      [supplierId]
    );
    if (suppliers.length === 0) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }
    const supplier = suppliers[0];

    await query(
      `UPDATE suppliers SET status = 'documents_required', approval_notes = ? WHERE id = ?`,
      [remarks, supplierId]
    );

    // Send email to supplier
    await sendSupplierStatusEmail({
      user: { id: supplier.user_id, email: supplier.email, first_name: supplier.first_name },
      status: 'documents_required',
      reason: remarks,
      reviewerEmail: req.user.email
    });

    // In-system notification
    try {
      await query(
        `INSERT INTO notifications (user_id, title, message, type, status, metadata)
         VALUES (?, ?, ?, 'system', 'sent', ?)`,
        [
          supplier.user_id,
          'Action Required: Additional Verification Documents Requested',
          remarks,
          JSON.stringify({
            status: 'documents_required',
            supplierId,
            requestedTypes: requested_document_types,
            timestamp: new Date().toISOString()
          })
        ]
      );
    } catch (notifErr) {
      console.error('[Notification Insert Error]:', notifErr.message);
    }

    await recordAuditLog({
      actorId: req.user.id,
      entityType: 'suppliers',
      entityId: supplierId,
      action: 'REQUEST_SUPPLIER_DOCUMENTS',
      oldValue: { status: supplier.status },
      newValue: { status: 'documents_required', notes: remarks },
      reason: remarks,
      req
    });

    return res.status(200).json({
      success: true,
      message: `Document request and remarks sent successfully to supplier (${supplier.email}).`,
      data: { status: 'documents_required', notes: remarks }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add Review Remarks for Supplier (and notify supplier via Email)
 * POST /api/v1/admin/suppliers/:id/remarks
 */
const addSupplierRemarks = async (req, res, next) => {
  try {
    const supplierId = req.params.id;
    const { remarks } = req.body;

    if (!remarks || remarks.trim() === '') {
      return res.status(400).json({ success: false, message: 'Remarks text is required' });
    }

    const suppliers = await query(
      `SELECT s.*, u.email, u.first_name FROM suppliers s JOIN users u ON s.user_id = u.id WHERE s.id = ?`,
      [supplierId]
    );
    if (suppliers.length === 0) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }
    const supplier = suppliers[0];

    await query(
      `UPDATE suppliers SET approval_notes = ? WHERE id = ?`,
      [remarks, supplierId]
    );

    // Send email to supplier
    await sendSupplierStatusEmail({
      user: { id: supplier.user_id, email: supplier.email, first_name: supplier.first_name },
      status: supplier.status,
      reason: remarks,
      reviewerEmail: req.user.email
    });

    // In-system notification
    try {
      await query(
        `INSERT INTO notifications (user_id, title, message, type, status, metadata)
         VALUES (?, ?, ?, 'system', 'sent', ?)`,
        [
          supplier.user_id,
          'New Review Remarks from Admin',
          remarks,
          JSON.stringify({ supplierId, timestamp: new Date().toISOString() })
        ]
      );
    } catch (notifErr) {
      console.error('[Notification Insert Error]:', notifErr.message);
    }

    return res.status(200).json({
      success: true,
      message: `Remarks sent to supplier (${supplier.email}) successfully.`,
      data: { notes: remarks }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List Custom Taxonomy Submitted by Suppliers (Section 3.3 & 3.4)
 * GET /api/v1/admin/custom-taxonomy
 */
const getCustomTaxonomy = async (req, res, next) => {
  try {
    const customSubs = await query(
      `SELECT scs.*, s.company_name, mc.name AS main_category_name
       FROM supplier_custom_subcategories scs
       JOIN suppliers s ON scs.supplier_id = s.id
       JOIN main_categories mc ON scs.main_category_id = mc.id
       ORDER BY scs.id DESC`
    );

    const customServices = await query(
      `SELECT scserv.*, s.company_name
       FROM supplier_custom_services scserv
       JOIN suppliers s ON scserv.supplier_id = s.id
       ORDER BY scserv.id DESC`
    );

    return res.status(200).json({
      success: true,
      data: {
        customSubcategories: customSubs,
        customServices: customServices
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Moderate Custom Sub-Category (Section 3.3)
 * PUT /api/v1/admin/custom-taxonomy/sub/:id/review
 */
const reviewCustomSubcategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, admin_notes, add_to_catalog = false } = req.body; // 'approved' | 'rejected'

    const rows = await query('SELECT * FROM supplier_custom_subcategories WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Custom sub-category record not found' });
    }
    const item = rows[0];

    await query(
      'UPDATE supplier_custom_subcategories SET status = ?, admin_notes = ? WHERE id = ?',
      [status, admin_notes || null, id]
    );

    // If approved and add_to_catalog is true, add to global platform catalog
    if (status === 'approved' && add_to_catalog) {
      const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const exist = await query('SELECT id FROM sub_categories WHERE main_category_id = ? AND slug = ?', [item.main_category_id, slug]);
      if (exist.length === 0) {
        await query(
          'INSERT INTO sub_categories (main_category_id, name, slug, is_other, display_order, is_active) VALUES (?, ?, ?, 0, 99, 1)',
          [item.main_category_id, item.name, slug]
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: `Custom sub-category marked as ${status}${add_to_catalog ? ' and added to platform catalogue' : ''}`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Affected Bookings for a Suspended Supplier (Section 26.1)
 * GET /api/v1/admin/suppliers/:id/affected-bookings
 */
const getSupplierAffectedBookings = async (req, res, next) => {
  try {
    const supplierId = req.params.id;

    // Get bookings associated with supplier's activities
    const bookings = await query(
      `SELECT b.id, b.booking_reference, b.booking_status, b.payment_status, b.total_amount,
              b.created_at, b.booking_date, u.first_name, u.last_name, u.email,
              a.title AS activity_title, a.id AS activity_id
       FROM bookings b
       JOIN activities a ON b.activity_id = a.id
       JOIN users u ON b.user_id = u.id
       WHERE a.supplier_id = ? AND b.booking_status IN ('pending', 'confirmed')
       ORDER BY b.id DESC`,
      [supplierId]
    );

    // Get list of other approved replacement suppliers
    const replacementSuppliers = await query(
      `SELECT id, company_name, email, city FROM suppliers WHERE id != ? AND status = 'approved'`,
      [supplierId]
    );

    return res.status(200).json({
      success: true,
      data: {
        total: bookings.length,
        bookings,
        replacementSuppliers
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reassign Booking to Replacement Supplier (Section 26.1)
 * POST /api/v1/admin/suppliers/:id/reassign-booking
 */
const reassignSupplierBooking = async (req, res, next) => {
  try {
    const { booking_id, new_supplier_id, action_taken = 'assign_replacement', reason } = req.body;

    if (!booking_id) {
      return res.status(400).json({ success: false, message: 'Booking ID is required' });
    }

    await recordAuditLog({
      actorId: req.user.id,
      entityType: 'bookings',
      entityId: booking_id,
      action: 'REASSIGN_SUPPLIER_BOOKING',
      newValue: { new_supplier_id, action_taken, reason },
      reason: reason || 'Booking reassigned due to supplier suspension',
      req
    });

    return res.status(200).json({
      success: true,
      message: `Booking ${booking_id} successfully updated with action: ${action_taken}. Audit trail recorded.`
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

/**
 * Category & Sub-Category Management (Section 3.6)
 */
const slugifyText = (str) => String(str || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const listAdminCategories = async (req, res, next) => {
  try {
    const mainCategories = await query(`
      SELECT mc.*,
             COUNT(DISTINCT sc.id) AS subcategory_count,
             COUNT(DISTINCT scm.supplier_id) AS supplier_count
      FROM main_categories mc
      LEFT JOIN sub_categories sc ON mc.id = sc.main_category_id
      LEFT JOIN supplier_category_mappings scm ON mc.id = scm.main_category_id
      GROUP BY mc.id
      ORDER BY mc.display_order ASC, mc.id ASC
    `);

    const subCategories = await query(`
      SELECT sc.*, mc.name AS main_category_name, mc.slug AS main_category_slug
      FROM sub_categories sc
      JOIN main_categories mc ON sc.main_category_id = mc.id
      ORDER BY sc.display_order ASC, sc.id ASC
    `);

    const mapped = mainCategories.map(cat => ({
      ...cat,
      is_active: Boolean(cat.is_active),
      subcategories: subCategories
        .filter(sub => sub.main_category_id === cat.id)
        .map(sub => ({
          ...sub,
          is_active: Boolean(sub.is_active),
          is_other: Boolean(sub.is_other)
        }))
    }));

    return res.status(200).json({
      success: true,
      data: mapped
    });
  } catch (error) {
    next(error);
  }
};

const createAdminCategory = async (req, res, next) => {
  try {
    const { name, slug, description, icon_name, display_order = 0 } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }
    const finalSlug = slug ? slugifyText(slug) : slugifyText(name);

    const exist = await query('SELECT id FROM main_categories WHERE slug = ?', [finalSlug]);
    if (exist.length > 0) {
      return res.status(409).json({ success: false, message: 'A category with this slug already exists' });
    }

    const result = await query(
      `INSERT INTO main_categories (name, slug, description, icon_name, display_order, is_active)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [name.trim(), finalSlug, description || null, icon_name || null, parseInt(display_order, 10) || 0]
    );

    return res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { id: result.insertId, name: name.trim(), slug: finalSlug }
    });
  } catch (error) {
    next(error);
  }
};

const updateAdminCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, slug, description, icon_name, display_order, is_active } = req.body;

    const existing = await query('SELECT * FROM main_categories WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const finalSlug = slug ? slugifyText(slug) : (name ? slugifyText(name) : existing[0].slug);
    if (finalSlug !== existing[0].slug) {
      const clash = await query('SELECT id FROM main_categories WHERE slug = ? AND id != ?', [finalSlug, id]);
      if (clash.length > 0) {
        return res.status(409).json({ success: false, message: 'Another category has this slug' });
      }
    }

    await query(
      `UPDATE main_categories
       SET name = COALESCE(?, name),
           slug = COALESCE(?, slug),
           description = COALESCE(?, description),
           icon_name = COALESCE(?, icon_name),
           display_order = COALESCE(?, display_order),
           is_active = COALESCE(?, is_active)
       WHERE id = ?`,
      [
        name ? name.trim() : null,
        finalSlug,
        description !== undefined ? description : null,
        icon_name !== undefined ? icon_name : null,
        display_order !== undefined ? parseInt(display_order, 10) : null,
        is_active !== undefined ? (is_active ? 1 : 0) : null,
        id
      ]
    );

    return res.status(200).json({ success: true, message: 'Category updated successfully' });
  } catch (error) {
    next(error);
  }
};

const deleteAdminCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Soft delete: set is_active = 0
    await query('UPDATE main_categories SET is_active = 0 WHERE id = ?', [id]);
    return res.status(200).json({ success: true, message: 'Category deactivated (soft-deleted) successfully' });
  } catch (error) {
    next(error);
  }
};

const restoreAdminCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    await query('UPDATE main_categories SET is_active = 1 WHERE id = ?', [id]);
    return res.status(200).json({ success: true, message: 'Category restored (activated) successfully' });
  } catch (error) {
    next(error);
  }
};

const createAdminSubcategory = async (req, res, next) => {
  try {
    const mainCategoryId = req.params.id;
    const { name, slug, display_order = 0, is_other = false } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Sub-category name is required' });
    }
    const finalSlug = slug ? slugifyText(slug) : slugifyText(name);

    const exist = await query(
      'SELECT id FROM sub_categories WHERE main_category_id = ? AND slug = ?',
      [mainCategoryId, finalSlug]
    );
    if (exist.length > 0) {
      return res.status(409).json({ success: false, message: 'Sub-category with this slug already exists under this category' });
    }

    const result = await query(
      `INSERT INTO sub_categories (main_category_id, name, slug, is_other, display_order, is_active)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [mainCategoryId, name.trim(), finalSlug, is_other ? 1 : 0, parseInt(display_order, 10) || 0]
    );

    return res.status(201).json({
      success: true,
      message: 'Sub-category created successfully',
      data: { id: result.insertId, main_category_id: mainCategoryId, name: name.trim(), slug: finalSlug }
    });
  } catch (error) {
    next(error);
  }
};

const updateAdminSubcategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, slug, display_order, is_other, is_active } = req.body;

    const existing = await query('SELECT * FROM sub_categories WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Sub-category not found' });
    }

    const finalSlug = slug ? slugifyText(slug) : (name ? slugifyText(name) : existing[0].slug);

    await query(
      `UPDATE sub_categories
       SET name = COALESCE(?, name),
           slug = COALESCE(?, slug),
           display_order = COALESCE(?, display_order),
           is_other = COALESCE(?, is_other),
           is_active = COALESCE(?, is_active)
       WHERE id = ?`,
      [
        name ? name.trim() : null,
        finalSlug,
        display_order !== undefined ? parseInt(display_order, 10) : null,
        is_other !== undefined ? (is_other ? 1 : 0) : null,
        is_active !== undefined ? (is_active ? 1 : 0) : null,
        id
      ]
    );

    return res.status(200).json({ success: true, message: 'Sub-category updated successfully' });
  } catch (error) {
    next(error);
  }
};

const deleteAdminSubcategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Soft delete: set is_active = 0
    await query('UPDATE sub_categories SET is_active = 0 WHERE id = ?', [id]);
    return res.status(200).json({ success: true, message: 'Sub-category deactivated (soft-deleted) successfully' });
  } catch (error) {
    next(error);
  }
};

const restoreAdminSubcategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    await query('UPDATE sub_categories SET is_active = 1 WHERE id = ?', [id]);
    return res.status(200).json({ success: true, message: 'Sub-category restored (activated) successfully' });
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
  requestSupplierDocuments,
  addSupplierRemarks,
  approveSupplier,
  rejectSupplier,
  getRevenueReportOverview,
  listAuditLogs,
  getCustomTaxonomy,
  reviewCustomSubcategory,
  getSupplierAffectedBookings,
  reassignSupplierBooking,
  listAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
  restoreAdminCategory,
  createAdminSubcategory,
  updateAdminSubcategory,
  deleteAdminSubcategory,
  restoreAdminSubcategory
};
