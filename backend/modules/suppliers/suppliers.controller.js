const { query } = require('../../database/connection');
const { recordActivityLog, recordAuditLog } = require('../../middleware/audit.middleware');

/**
 * Helper to generate default standard Master Services Agreement content
 */
const generateDefaultAgreementContent = (supplier) => {
  const companyName = supplier.company_name || '[Supplier Legal Entity Name]';
  const tradeLicense = supplier.trade_license_no || '[Trade License / Registration Number]';
  const taxId = supplier.tax_id || '[Tax / VAT / GST Identifier]';
  const address = supplier.business_address || '[Registered Business Address]';
  const city = supplier.city || 'Headquarters';
  const country = supplier.country || 'Global';

  return `MASTER SERVICES & SUPPLIER DISTRIBUTION AGREEMENT (v1.0)
========================================================================================

BETWEEN:
1. EXPEDITION GLOBAL PLATFORM PVT LTD ("Platform / Company"), and
2. ${companyName.toUpperCase()}, having registered office at ${address}, ${city}, ${country} (Registration / Trade License: ${tradeLicense}, Tax ID: ${taxId}) ("Supplier / Merchant Partner").

1. PURPOSE & APPOINTMENT
The Supplier hereby appoints the Platform as an authorized distributor and booking channel for its tours, activities, excursions, and travel experiences worldwide.

2. COMMERCIAL TERMS & COMMISSION
- Standard Platform Commission: 15.00% (fifteen percent) of the gross retail booking value.
- Settlement Cycle: Net payout within T+7 business days following verified tour completion or redemption.
- Remittance Currency & Account: Remittances shall be directed strictly to the verified bank account provided by the Supplier during compliance verification.

3. COMPLIANCE, QUALITY & SAFETY STANDARDS
- The Supplier covenants and warrants that all tour guides, equipment, vehicles, and facilities comply with all applicable local municipal, maritime, aviation, and safety regulations.
- The Supplier shall maintain valid commercial general liability insurance and active trade licenses throughout the duration of this Agreement.
- Valid KYC documents (Trade License, Tax Registration, Bank Verification) must remain up-to-date. Expired documents shall be renewed promptly.

4. CANCELLATIONS & REFUND POLICIES
- The Supplier agrees to strictly honor the cancellation windows and instant confirmation rules configured on published activity packages.
- Platform customer care is empowered to process refunds in accordance with published terms.

5. TERM, GOVERNING LAW & JURISDICTION
- This Agreement becomes effective upon digital E-Sign completion by an authorized signatory.
- This Agreement shall be governed by and construed in accordance with the laws of the platform jurisdiction, subject to exclusive court arbitration.

6. ELECTRONIC SIGNATURE CONSENT
By clicking "Sign and Accept Agreement" and submitting the digital signature, the authorized representative of ${companyName} confirms that:
(a) They possess the legal authority to bind the entity.
(b) This digital signature constitutes a legally valid, binding, and enforceable agreement under applicable electronic transaction laws.
========================================================================================`;
};

/**
 * Get Supplier Profile
 * GET /api/v1/suppliers/profile
 */
const getSupplierProfile = async (req, res, next) => {
  try {
    const suppliers = await query(
      `SELECT s.*, u.first_name, u.last_name, u.email, u.phone, u.status AS user_status,
              u.email_verified_at, u.phone_verified_at
       FROM suppliers s
       JOIN users u ON s.user_id = u.id
       WHERE s.user_id = ?`,
      [req.user.id]
    );

    if (suppliers.length === 0) {
      return res.status(404).json({ success: false, message: 'Supplier profile not found' });
    }

    const supplier = suppliers[0];

    // Fetch documents
    const documents = await query(
      `SELECT id, document_type, document_name, document_url, file_size, status, rejection_reason, 
              expiry_date, uploaded_at, verified_at 
       FROM supplier_documents WHERE supplier_id = ? ORDER BY id DESC`,
      [supplier.id]
    );

    // Fetch E-Sign agreement status
    const esign = await query(
      `SELECT id, document_title, agreement_version, signed_status, signer_name, signature_data,
              signed_at, ip_address, esign_reference, created_at
       FROM esign_documents WHERE supplier_id = ? ORDER BY id DESC LIMIT 1`,
      [supplier.id]
    );

    // Fetch verifications
    const verifications = await query(
      `SELECT id, verification_type, status, verified_at, created_at 
       FROM supplier_verifications WHERE supplier_id = ? ORDER BY id DESC`,
      [supplier.id]
    );

    supplier.documents = documents;
    supplier.esign = esign.length > 0 ? esign[0] : null;
    supplier.verifications = verifications;

    return res.status(200).json({
      success: true,
      data: supplier
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Supplier Profile
 * PUT /api/v1/suppliers/profile
 */
const updateSupplierProfile = async (req, res, next) => {
  try {
    const {
      company_name,
      contact_person,
      trade_license_no,
      tax_id,
      business_address,
      city,
      country,
      bank_name,
      bank_account_no,
      bank_iban
    } = req.body;

    const suppliers = await query('SELECT * FROM suppliers WHERE user_id = ?', [req.user.id]);
    if (suppliers.length === 0) {
      return res.status(404).json({ success: false, message: 'Supplier record not found' });
    }
    const currentSupplier = suppliers[0];
    const supplierId = currentSupplier.id;

    const fields = [];
    const values = [];

    if (company_name !== undefined) { fields.push('company_name = ?'); values.push(company_name); }
    if (contact_person !== undefined) { fields.push('contact_person = ?'); values.push(contact_person); }
    if (trade_license_no !== undefined) { fields.push('trade_license_no = ?'); values.push(trade_license_no); }
    if (tax_id !== undefined) { fields.push('tax_id = ?'); values.push(tax_id); }
    if (business_address !== undefined) { fields.push('business_address = ?'); values.push(business_address); }
    if (city !== undefined) { fields.push('city = ?'); values.push(city); }
    if (country !== undefined) { fields.push('country = ?'); values.push(country); }
    if (bank_name !== undefined) { fields.push('bank_name = ?'); values.push(bank_name); }
    if (bank_account_no !== undefined) { fields.push('bank_account_no = ?'); values.push(bank_account_no); }
    if (bank_iban !== undefined) { fields.push('bank_iban = ?'); values.push(bank_iban); }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields provided for update' });
    }

    values.push(supplierId);
    await query(`UPDATE suppliers SET ${fields.join(', ')} WHERE id = ?`, values);

    // Audit log
    await recordAuditLog({
      actorId: req.user.id,
      entityType: 'suppliers',
      entityId: supplierId,
      action: 'UPDATE_SUPPLIER_PROFILE',
      oldValue: {
        company_name: currentSupplier.company_name,
        contact_person: currentSupplier.contact_person,
        city: currentSupplier.city,
        trade_license_no: currentSupplier.trade_license_no,
        bank_name: currentSupplier.bank_name
      },
      newValue: req.body,
      reason: 'Supplier updated legal or banking settlement details',
      req
    });

    await recordActivityLog({
      userId: req.user.id,
      action: 'UPDATE_SUPPLIER_PROFILE',
      entityType: 'suppliers',
      entityId: supplierId,
      description: 'Supplier updated business and banking details',
      req
    });

    return res.status(200).json({
      success: true,
      message: 'Supplier profile updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Supplier Verification and Approval Status
 * GET /api/v1/suppliers/status
 */
const getSupplierStatus = async (req, res, next) => {
  try {
    const suppliers = await query(
      `SELECT s.id, s.company_name, s.status, s.approval_notes, s.approved_at,
              u.email_verified_at, u.phone_verified_at
       FROM suppliers s
       JOIN users u ON s.user_id = u.id
       WHERE s.user_id = ?`,
      [req.user.id]
    );

    if (suppliers.length === 0) {
      return res.status(404).json({ success: false, message: 'Supplier profile not found' });
    }

    const s = suppliers[0];

    // Documents summary
    const docs = await query(
      `SELECT status, COUNT(*) AS count FROM supplier_documents WHERE supplier_id = ? GROUP BY status`,
      [s.id]
    );
    const docSummary = { total: 0, pending: 0, approved: 0, rejected: 0 };
    docs.forEach(d => {
      docSummary[d.status] = Number(d.count);
      docSummary.total += Number(d.count);
    });

    // E-sign check
    const esign = await query(
      `SELECT id, signed_status, signer_name, signed_at, esign_reference FROM esign_documents WHERE supplier_id = ? ORDER BY id DESC LIMIT 1`,
      [s.id]
    );
    const isEsignSigned = esign.length > 0 && esign[0].signed_status === 'signed';

    const canPublishActivities = s.status === 'approved' && isEsignSigned;

    return res.status(200).json({
      success: true,
      data: {
        supplierId: s.id,
        companyName: s.company_name,
        status: s.status,
        approval_notes: s.approval_notes,
        approved_at: s.approved_at,
        isEmailVerified: Boolean(s.email_verified_at),
        isPhoneVerified: Boolean(s.phone_verified_at),
        documentsSummary: docSummary,
        esign: {
          isSigned: isEsignSigned,
          signedStatus: esign.length > 0 ? esign[0].signed_status : 'none',
          signerName: esign.length > 0 ? esign[0].signer_name : null,
          signedAt: esign.length > 0 ? esign[0].signed_at : null,
          reference: esign.length > 0 ? esign[0].esign_reference : null
        },
        canPublishActivities
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload Supplier Document(s) - Supports single or batch/multiple uploads
 * POST /api/v1/suppliers/documents
 */
const uploadDocument = async (req, res, next) => {
  try {
    const suppliers = await query('SELECT id, status FROM suppliers WHERE user_id = ?', [req.user.id]);
    if (suppliers.length === 0) {
      return res.status(404).json({ success: false, message: 'Supplier record not found' });
    }
    const supplierId = suppliers[0].id;
    const validTypes = ['trade_license', 'tax_certificate', 'id_proof', 'bank_statement', 'other'];

    let itemsToInsert = [];

    // Parse Document Classifications
    let typesInput = [];
    if (Array.isArray(req.body.document_types)) {
      typesInput = req.body.document_types;
    } else if (typeof req.body.document_types === 'string') {
      try {
        const parsed = JSON.parse(req.body.document_types);
        if (Array.isArray(parsed)) typesInput = parsed;
        else typesInput = req.body.document_types.split(',').map(s => s.trim()).filter(Boolean);
      } catch {
        typesInput = req.body.document_types.split(',').map(s => s.trim()).filter(Boolean);
      }
    } else if (req.body.document_type) {
      typesInput = [req.body.document_type];
    }
    if (typesInput.length === 0) {
      typesInput = ['trade_license'];
    }

    const baseName = req.body.document_name ? req.body.document_name.trim() : '';
    const formattedExpiry = req.body.expiry_date && req.body.expiry_date.trim() !== '' ? req.body.expiry_date : null;

    // Collect physical files uploaded via Multer
    let uploadedFiles = [];
    if (Array.isArray(req.files) && req.files.length > 0) {
      uploadedFiles = req.files;
    } else if (req.file) {
      uploadedFiles = [req.file];
    }

    if (uploadedFiles.length > 0) {
      // Priority 1: Physical File Uploads (Images, PDFs, Word docs)
      if (uploadedFiles.length === 1 && typesInput.length > 1) {
        for (const t of typesInput) {
          const validDType = validTypes.includes(t) ? t : 'other';
          const typeLabel = validDType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
          itemsToInsert.push({
            type: validDType,
            name: baseName ? `${baseName} (${typeLabel})` : uploadedFiles[0].originalname,
            url: `/uploads/documents/${uploadedFiles[0].filename}`,
            expiry: formattedExpiry,
            size: uploadedFiles[0].size || null
          });
        }
      } else {
        uploadedFiles.forEach((file, index) => {
          const dType = typesInput[index] || typesInput[0] || 'other';
          const validDType = validTypes.includes(dType) ? dType : 'other';
          itemsToInsert.push({
            type: validDType,
            name: baseName
              ? (uploadedFiles.length > 1 ? `${baseName} (#${index + 1})` : baseName)
              : file.originalname,
            url: `/uploads/documents/${file.filename}`,
            expiry: formattedExpiry,
            size: file.size || null
          });
        });
      }
    } else if (Array.isArray(req.body.documents) && req.body.documents.length > 0) {
      // Priority 2: Structured documents payload
      for (const item of req.body.documents) {
        if (!item.document_type || !item.document_url) continue;
        const dType = validTypes.includes(item.document_type) ? item.document_type : 'other';
        const dName = item.document_name || `${dType.replace('_', ' ')} Document`;
        const dExpiry = item.expiry_date && item.expiry_date.trim() !== '' ? item.expiry_date : null;
        itemsToInsert.push({
          type: dType,
          name: dName,
          url: item.document_url.trim(),
          expiry: dExpiry,
          size: item.file_size || null
        });
      }
    } else {
      // Priority 3: Fallback URL string or array
      let urlsInput = [];
      if (Array.isArray(req.body.document_urls)) {
        urlsInput = req.body.document_urls.map(u => String(u).trim()).filter(Boolean);
      } else if (typeof req.body.document_url === 'string') {
        urlsInput = req.body.document_url.split(/[\n,]+/).map(u => u.trim()).filter(Boolean);
      }

      if (urlsInput.length > 0) {
        urlsInput.forEach((url, index) => {
          const dType = typesInput[index] || typesInput[0] || 'other';
          const validDType = validTypes.includes(dType) ? dType : 'other';
          const typeLabel = validDType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
          itemsToInsert.push({
            type: validDType,
            name: baseName
              ? (urlsInput.length > 1 ? `${baseName} (#${index + 1})` : baseName)
              : `${typeLabel} File ${index + 1}`,
            url,
            expiry: formattedExpiry,
            size: null
          });
        });
      }
    }

    if (itemsToInsert.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please select and upload at least one document file (Image, PDF, DOC, or DOCX)'
      });
    }

    const insertedDocs = [];
    for (const item of itemsToInsert) {
      const result = await query(
        `INSERT INTO supplier_documents (supplier_id, document_type, document_name, document_url, file_size, expiry_date, status)
         VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
        [supplierId, item.type, item.name, item.url, item.size, item.expiry]
      );

      const docId = result.insertId;

      await recordAuditLog({
        actorId: req.user.id,
        entityType: 'supplier_documents',
        entityId: docId,
        action: 'UPLOAD_SUPPLIER_DOCUMENT',
        newValue: {
          document_id: docId,
          document_type: item.type,
          document_name: item.name,
          expiry_date: item.expiry
        },
        reason: `Uploaded ${item.type} document for KYC review`,
        req
      });

      insertedDocs.push({
        documentId: docId,
        document_name: item.name,
        document_type: item.type,
        document_url: item.url,
        expiry_date: item.expiry,
        status: 'pending'
      });
    }

    await recordActivityLog({
      userId: req.user.id,
      action: 'UPLOAD_SUPPLIER_DOCUMENT',
      entityType: 'supplier_documents',
      entityId: insertedDocs[0]?.documentId,
      description: `Uploaded ${insertedDocs.length} KYC document(s)`,
      req
    });

    if (suppliers[0].status === 'pending_verification') {
      await query("UPDATE suppliers SET status = 'under_review' WHERE id = ?", [supplierId]);
    }

    return res.status(201).json({
      success: true,
      message: `${insertedDocs.length} KYC document(s) uploaded successfully for compliance review`,
      data: insertedDocs.length === 1 ? insertedDocs[0] : insertedDocs,
      documents: insertedDocs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete / Remove Supplier Document
 * DELETE /api/v1/suppliers/documents/:id
 */
const deleteDocument = async (req, res, next) => {
  try {
    const suppliers = await query('SELECT id FROM suppliers WHERE user_id = ?', [req.user.id]);
    if (suppliers.length === 0) {
      return res.status(404).json({ success: false, message: 'Supplier record not found' });
    }
    const supplierId = suppliers[0].id;
    const documentId = req.params.id;

    const docs = await query('SELECT * FROM supplier_documents WHERE id = ? AND supplier_id = ?', [documentId, supplierId]);
    if (docs.length === 0) {
      return res.status(404).json({ success: false, message: 'Document not found or does not belong to your account' });
    }

    const doc = docs[0];

    // Delete record
    await query('DELETE FROM supplier_documents WHERE id = ? AND supplier_id = ?', [documentId, supplierId]);

    await recordAuditLog({
      actorId: req.user.id,
      entityType: 'supplier_documents',
      entityId: documentId,
      action: 'DELETE_SUPPLIER_DOCUMENT',
      oldValue: doc,
      reason: 'Supplier removed uploaded KYC document',
      req
    });

    return res.status(200).json({
      success: true,
      message: 'Document removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit Supplier Application for Verification
 * POST /api/v1/suppliers/submit-verification
 */
const submitForVerification = async (req, res, next) => {
  try {
    const suppliers = await query('SELECT * FROM suppliers WHERE user_id = ?', [req.user.id]);
    if (suppliers.length === 0) {
      return res.status(404).json({ success: false, message: 'Supplier profile not found' });
    }
    const supplier = suppliers[0];

    // Validate minimum required fields
    if (!supplier.company_name || !supplier.contact_person) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your company legal name and contact person before submitting for verification.'
      });
    }

    // Check if at least 1 document has been uploaded
    const docs = await query('SELECT id FROM supplier_documents WHERE supplier_id = ?', [supplier.id]);
    if (docs.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least one KYC document (Trade License / Tax / ID Proof) before submitting.'
      });
    }

    const oldStatus = supplier.status;
    const newStatus = 'under_verification';

    await query(
      `UPDATE suppliers SET status = ?, approval_notes = NULL WHERE id = ?`,
      [newStatus, supplier.id]
    );

    await recordAuditLog({
      actorId: req.user.id,
      entityType: 'suppliers',
      entityId: supplier.id,
      action: 'SUBMIT_KYC_VERIFICATION',
      oldValue: { status: oldStatus },
      newValue: { status: newStatus },
      reason: req.body.notes || 'Supplier submitted profile and KYC documentation for verification',
      req
    });

    await recordActivityLog({
      userId: req.user.id,
      action: 'SUBMIT_KYC_VERIFICATION',
      entityType: 'suppliers',
      entityId: supplier.id,
      description: `Supplier submitted KYC application for admin verification`,
      req
    });

    return res.status(200).json({
      success: true,
      message: 'Your application and KYC documents have been submitted for verification.',
      data: {
        status: newStatus
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get E-Sign Agreement
 * GET /api/v1/suppliers/esign
 */
const getEsignAgreement = async (req, res, next) => {
  try {
    const suppliers = await query('SELECT * FROM suppliers WHERE user_id = ?', [req.user.id]);
    if (suppliers.length === 0) {
      return res.status(404).json({ success: false, message: 'Supplier record not found' });
    }
    const supplier = suppliers[0];

    let esignDocs = await query(
      `SELECT * FROM esign_documents WHERE supplier_id = ? ORDER BY id DESC LIMIT 1`,
      [supplier.id]
    );

    let agreement;
    if (esignDocs.length === 0) {
      // Auto-generate standard contract
      const content = generateDefaultAgreementContent(supplier);
      const title = 'Supplier Master Services & Distribution Agreement';
      const version = 'v1.0';

      const result = await query(
        `INSERT INTO esign_documents (supplier_id, document_title, document_url, agreement_version, agreement_content, signed_status)
         VALUES (?, ?, ?, ?, ?, 'pending')`,
        [supplier.id, title, '/agreements/supplier-master-agreement-v1.pdf', version, content]
      );

      agreement = {
        id: result.insertId,
        supplier_id: supplier.id,
        document_title: title,
        agreement_version: version,
        agreement_content: content,
        signed_status: 'pending',
        signer_name: null,
        signature_data: null,
        signed_at: null,
        ip_address: null,
        esign_reference: null
      };
    } else {
      agreement = esignDocs[0];
    }

    return res.status(200).json({
      success: true,
      data: agreement
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Sign E-Sign Agreement
 * POST /api/v1/suppliers/esign/sign
 */
const signEsignAgreement = async (req, res, next) => {
  try {
    const { signer_name, signature_data, consent_accepted } = req.body;

    if (!signer_name || signer_name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Legal signer name is required to execute the agreement'
      });
    }

    if (!consent_accepted) {
      return res.status(400).json({
        success: false,
        message: 'You must check and confirm consent to be bound by the digital agreement'
      });
    }

    const suppliers = await query('SELECT * FROM suppliers WHERE user_id = ?', [req.user.id]);
    if (suppliers.length === 0) {
      return res.status(404).json({ success: false, message: 'Supplier record not found' });
    }
    const supplier = suppliers[0];

    // Find agreement or create if not present
    let esignDocs = await query(
      `SELECT id, signed_status FROM esign_documents WHERE supplier_id = ? ORDER BY id DESC LIMIT 1`,
      [supplier.id]
    );

    let agreementId;
    if (esignDocs.length === 0) {
      const content = generateDefaultAgreementContent(supplier);
      const resInsert = await query(
        `INSERT INTO esign_documents (supplier_id, document_title, document_url, agreement_version, agreement_content, signed_status)
         VALUES (?, 'Supplier Master Services & Distribution Agreement', '/agreements/supplier-master-agreement-v1.pdf', 'v1.0', ?, 'pending')`,
        [supplier.id, content]
      );
      agreementId = resInsert.insertId;
    } else {
      agreementId = esignDocs[0].id;
    }

    const ipAddress = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.ip || '127.0.0.1';
    const esignReference = `ESIGN-SUPP-${supplier.id}-${Date.now().toString(36).toUpperCase()}`;

    await query(
      `UPDATE esign_documents 
       SET signed_status = 'signed',
           signer_name = ?,
           signature_data = ?,
           signed_at = NOW(),
           ip_address = ?,
           esign_reference = ?
       WHERE id = ?`,
      [signer_name.trim(), signature_data || null, ipAddress, esignReference, agreementId]
    );

    // Audit log
    await recordAuditLog({
      actorId: req.user.id,
      entityType: 'esign_documents',
      entityId: agreementId,
      action: 'ESIGN_AGREEMENT_SIGNED',
      newValue: {
        signer_name: signer_name.trim(),
        ip_address: ipAddress,
        esign_reference: esignReference,
        signed_at: new Date().toISOString()
      },
      reason: 'Authorized representative digitally executed Master Services Agreement',
      req
    });

    await recordActivityLog({
      userId: req.user.id,
      action: 'ESIGN_AGREEMENT_SIGNED',
      entityType: 'esign_documents',
      entityId: agreementId,
      description: `Supplier executed E-Sign Agreement ref: ${esignReference}`,
      req
    });

    return res.status(200).json({
      success: true,
      message: 'Agreement digitally signed and executed successfully.',
      data: {
        agreementId,
        signed_status: 'signed',
        signer_name: signer_name.trim(),
        signed_at: new Date().toISOString(),
        esign_reference: esignReference,
        ip_address: ipAddress
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSupplierProfile,
  updateSupplierProfile,
  getSupplierStatus,
  uploadDocument,
  deleteDocument,
  submitForVerification,
  getEsignAgreement,
  signEsignAgreement
};
