const bcrypt = require('bcryptjs');
const { query, transaction } = require('../../database/connection');
const { generateAuthTokens, verifyRefreshToken, revokeRefreshToken, generateRandomToken } = require('../../services/token.service');
const { generateOtp, verifyOtp } = require('../../services/otp.service');
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendOtpEmail,
  sendSupplierApplicationReceivedEmail,
  sendAdminSupplierApplicationEmail
} = require('../../services/email.service');
const { validateSupplierRegistration, persistSupplierApplication } = require('./supplierRegistration');
const { recordActivityLog } = require('../../middleware/audit.middleware');
const config = require('../../config');

/**
 * Helper to fetch user permissions
 */
const getUserPermissions = async (roleId) => {
  const rows = await query(
    `SELECT p.slug
     FROM permissions p
     JOIN role_permissions rp ON p.id = rp.permission_id
     WHERE rp.role_id = ?`,
    [roleId]
  );
  return rows.map(r => r.slug);
};

// =================================================================
// CUSTOMER AUTHENTICATION
// =================================================================

/**
 * Customer Signup
 * POST /api/v1/auth/customer/signup
 * Note: Customer account is created as 'pending_verification'.
 * Admin NEVER approves customers. Customer gets activated directly via valid mobile & email OTP!
 */
const customerSignup = async (req, res, next) => {
  try {
    const {
      first_name,
      last_name,
      email,
      password,
      phone,
      account_type = 'individual',
      customer_segment = 'retail'
    } = req.body;

    // Check if email already exists
    const existingEmail = await query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingEmail.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    // Check if phone number already exists
    if (phone) {
      const existingPhone = await query('SELECT id FROM users WHERE phone = ?', [phone]);
      if (existingPhone.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'An account with this mobile number already exists.'
        });
      }
    }

    // Get customer role ID
    const roleRows = await query('SELECT id FROM roles WHERE slug = "customer"');
    if (roleRows.length === 0) {
      return res.status(500).json({ success: false, message: 'Customer role configuration missing' });
    }
    const customerRoleId = roleRows[0].id;

    // Hash password
    const salt = await bcrypt.genSalt(config.security.bcryptSaltRounds);
    const passwordHash = await bcrypt.hash(password, salt);

    // Prepare pending registration data - User is NOT inserted into database until valid OTP is entered!
    const registrationData = {
      role: 'customer',
      customerRoleId,
      first_name,
      last_name,
      email: email.trim().toLowerCase(),
      passwordHash,
      phone: phone ? phone.trim() : null,
      account_type: account_type || 'individual',
      customer_segment: customer_segment || 'retail'
    };

    // Generate single 6-digit OTP for both Mobile & Email with registration metadata
    const otpResult = await generateOtp({
      userId: null,
      email: registrationData.email,
      phone: registrationData.phone,
      purpose: 'customer_signup',
      metadata: registrationData
    });
    const commonOtp = otpResult.code;

    // Send via Email as well (same code)
    await sendOtpEmail({
      user: { id: null, email: registrationData.email, first_name, last_name },
      code: commonOtp,
      purpose: 'Customer Account Verification'
    });

    await recordActivityLog({
      userId: null,
      action: 'CUSTOMER_SIGNUP',
      entityType: 'otps',
      entityId: otpResult.otpId,
      description: `Customer signed up (pending OTP verification, user not yet inserted): ${email}`,
      req
    });

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully! The same 6-digit verification code has been dispatched to both your Mobile Number and Email Address. Please enter the OTP to complete registration.',
      data: {
        first_name,
        last_name,
        email: registrationData.email,
        phone: registrationData.phone,
        account_type: registrationData.account_type,
        customer_segment: registrationData.customer_segment,
        role: 'customer',
        status: 'pending_verification',
        demo_otp: commonOtp,
        verification: {
          otpCode: commonOtp // Same code for both mobile and email
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Customer OTP Verification (Single OTP for both Mobile & Email)
 * POST /api/v1/auth/customer/verify-otp
 * Admin verification is NOT required: valid OTP immediately activates account.
 */
const customerVerifyOtp = async (req, res, next) => {
  try {
    const { email, phone, code, otp, mobile_otp, email_otp } = req.body;
    const otpCode = code || otp || mobile_otp || email_otp;

    if (!email && !phone) {
      return res.status(400).json({ success: false, message: 'Customer email or phone number is required' });
    }

    if (!otpCode) {
      return res.status(400).json({ success: false, message: 'Please enter the 6-digit verification OTP' });
    }

    const cleanEmail = email ? email.toString().trim().toLowerCase() : null;
    const cleanPhone = phone ? phone.toString().trim() : null;

    // 1. Verify OTP - check customer_signup purpose first, then customer_verification
    let verifyResult = await verifyOtp({
      email: cleanEmail,
      phone: cleanPhone,
      code: otpCode.toString().trim(),
      purpose: 'customer_signup'
    });

    if (!verifyResult.success) {
      if (verifyResult.isBlocked) {
        return res.status(429).json({
          success: false,
          is_blocked: true,
          message: verifyResult.message
        });
      }
      verifyResult = await verifyOtp({
        email: cleanEmail,
        phone: cleanPhone,
        code: otpCode.toString().trim(),
        purpose: 'customer_verification'
      });
    }

    if (!verifyResult.success) {
      return res.status(verifyResult.isBlocked ? 429 : 400).json({
        success: false,
        is_blocked: !!verifyResult.isBlocked,
        message: verifyResult.message
      });
    }

    let user;

    // 2. If OTP has pending registration metadata, insert into users table NOW!
    if (verifyResult.otpRecord && verifyResult.otpRecord.metadata) {
      const payload = verifyResult.otpRecord.metadata;
      
      // Check if user was already inserted
      const existing = await query('SELECT id FROM users WHERE email = ?', [payload.email]);
      if (existing.length === 0) {
        const insertRes = await query(
          `INSERT INTO users (role_id, first_name, last_name, email, password_hash, phone, account_type, customer_segment, status, email_verified_at, phone_verified_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())`,
          [
            payload.customerRoleId,
            payload.first_name,
            payload.last_name,
            payload.email,
            payload.passwordHash,
            payload.phone,
            payload.account_type || 'individual',
            payload.customer_segment || 'retail'
          ]
        );
        const newUserId = insertRes.insertId;
        const fetched = await query(
          `SELECT u.id, u.role_id, u.first_name, u.last_name, u.email, u.phone, 
                  u.account_type, u.customer_segment, u.status,
                  u.email_verified_at, u.phone_verified_at,
                  r.slug AS role_slug, r.name AS role_name
           FROM users u
           JOIN roles r ON u.role_id = r.id
           WHERE u.id = ?`,
          [newUserId]
        );
        user = fetched[0];
      } else {
        await query(
          `UPDATE users SET status = 'active', email_verified_at = NOW(), phone_verified_at = NOW() WHERE id = ?`,
          [existing[0].id]
        );
        const fetched = await query(
          `SELECT u.id, u.role_id, u.first_name, u.last_name, u.email, u.phone, 
                  u.account_type, u.customer_segment, u.status,
                  u.email_verified_at, u.phone_verified_at,
                  r.slug AS role_slug, r.name AS role_name
           FROM users u
           JOIN roles r ON u.role_id = r.id
           WHERE u.id = ?`,
          [existing[0].id]
        );
        user = fetched[0];
      }
    } else {
      // Legacy user already in table: update verified timestamps
      const users = await query(
        `SELECT u.id, u.role_id, u.first_name, u.last_name, u.email, u.phone, 
                u.account_type, u.customer_segment, u.status,
                u.email_verified_at, u.phone_verified_at,
                r.slug AS role_slug, r.name AS role_name
         FROM users u
         JOIN roles r ON u.role_id = r.id
         WHERE (u.email = ? OR u.phone = ?)`,
        [cleanEmail || '', cleanPhone || '']
      );

      if (users.length === 0) {
        return res.status(404).json({ success: false, message: 'Account not found. Please register again.' });
      }

      user = users[0];
      await query(
        `UPDATE users SET status = 'active', phone_verified_at = NOW(), email_verified_at = NOW() WHERE id = ?`,
        [user.id]
      );
      user.status = 'active';
      user.phone_verified_at = new Date();
      user.email_verified_at = new Date();
    }

    const tokens = await generateAuthTokens(user);
    const permissions = await getUserPermissions(user.role_id);

    await recordActivityLog({
      userId: user.id,
      action: 'CUSTOMER_OTP_VERIFIED_ACTIVATED',
      entityType: 'users',
      entityId: user.id,
      description: `Customer verified OTP and created/activated account: ${user.email}`,
      req
    });

    return res.status(200).json({
      success: true,
      is_fully_verified: true,
      message: 'OTP verified successfully! Your account is created, active, and logged in.',
      data: {
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          phone: user.phone,
          account_type: user.account_type,
          customer_segment: user.customer_segment,
          role: user.role_slug,
          email_verified: true,
          phone_verified: true,
          status: 'active',
          permissions
        },
        tokens
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Customer Resend OTP
 * POST /api/v1/auth/customer/resend-otp
 */
const customerResendOtp = async (req, res, next) => {
  try {
    const { email, phone } = req.body;

    if (!email && !phone) {
      return res.status(400).json({ success: false, message: 'Email or mobile number is required' });
    }

    const cleanEmail = email ? email.toString().trim().toLowerCase() : null;
    const cleanPhone = phone ? phone.toString().trim() : null;

    // Check if user is already in database
    const users = await query(
      `SELECT u.id, u.email, u.phone, u.status, u.first_name, u.last_name, r.slug AS role_slug
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE (u.email = ? OR u.phone = ?)`,
      [cleanEmail || '', cleanPhone || '']
    );

    if (users.length > 0) {
      const user = users[0];
      if (user.status === 'active' && user.email_verified_at) {
        return res.status(400).json({ success: false, message: 'Your account is already active and verified.' });
      }

      const otpRes = await generateOtp({
        userId: user.id,
        email: user.email,
        phone: user.phone,
        purpose: 'customer_verification'
      });

      await sendOtpEmail({
        user: { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name },
        code: otpRes.code,
        purpose: 'Customer Account Verification'
      });

      return res.status(200).json({
        success: true,
        message: 'A new 6-digit verification code has been dispatched.',
        data: { otpCode: otpRes.code }
      });
    }

    // If user is not yet in table, check pending OTP metadata
    const pendingRows = await query(
      `SELECT metadata FROM otps 
       WHERE (email = ? OR phone = ?) AND purpose = 'customer_signup' 
       ORDER BY id DESC LIMIT 1`,
      [cleanEmail || '', cleanPhone || '']
    );

    if (pendingRows.length === 0 || !pendingRows[0].metadata) {
      return res.status(404).json({ success: false, message: 'No pending registration found. Please register.' });
    }

    let meta = pendingRows[0].metadata;
    if (typeof meta === 'string') {
      try { meta = JSON.parse(meta); } catch (_) {}
    }

    const otpRes = await generateOtp({
      userId: null,
      email: meta.email,
      phone: meta.phone,
      purpose: 'customer_signup',
      metadata: meta
    });

    await sendOtpEmail({
      user: { id: null, email: meta.email, first_name: meta.first_name, last_name: meta.last_name },
      code: otpRes.code,
      purpose: 'Customer Account Verification'
    });

    return res.status(200).json({
      success: true,
      message: 'A new 6-digit verification code has been dispatched to both your Mobile Number and Email Address.',
      data: { otpCode: otpRes.code }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Customer Login
 * POST /api/v1/auth/customer/login
 */
const customerLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const users = await query(
      `SELECT u.id, u.role_id, u.first_name, u.last_name, u.email, u.phone, 
              u.password_hash, u.account_type, u.customer_segment, u.status,
              u.email_verified_at, u.phone_verified_at,
              r.slug AS role_slug, r.name AS role_name
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.email = ?`,
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = users[0];

    // Verify role is customer
    if (user.role_slug !== 'customer') {
      return res.status(403).json({
        success: false,
        message: 'Please use the appropriate login portal for your account role'
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account is suspended. Please contact customer support.'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Require at least one contact method (email or phone) to be verified before login
    const emailVerified = Boolean(user.email_verified_at);
    const phoneVerified = Boolean(user.phone_verified_at);

    if (!emailVerified && !phoneVerified) {
      return res.status(403).json({
        success: false,
        requires_verification: true,
        email: user.email,
        phone: user.phone,
        email_verified: emailVerified,
        phone_verified: phoneVerified,
        message: 'Your account is pending verification. At least one contact method (email or phone) must be verified before login. Please complete OTP verification.'
      });
    }

    const tokens = await generateAuthTokens(user);
    const permissions = await getUserPermissions(user.role_id);

    await recordActivityLog({
      userId: user.id,
      action: 'CUSTOMER_LOGIN',
      entityType: 'users',
      entityId: user.id,
      description: `Customer logged in: ${user.email}`,
      req
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          phone: user.phone,
          account_type: user.account_type,
          customer_segment: user.customer_segment,
          role: user.role_slug,
          email_verified: true,
          phone_verified: true,
          status: user.status,
          permissions
        },
        tokens
      }
    });
  } catch (error) {
    next(error);
  }
};

// =================================================================
// SUPPLIER AUTHENTICATION & ONBOARDING
// =================================================================

/**
 * Supplier Signup
 * POST /api/v1/auth/supplier/signup
 */
const supplierSignup = async (req, res, next) => {
  try {
    const check = validateSupplierRegistration(req.body);
    if (!check.ok) {
      return res.status(422).json({
        success: false,
        message: check.message,
        errors: check.errors
      });
    }

    const input = check.data;
    const existing = await query('SELECT id FROM users WHERE email = ?', [input.email]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Sign in or use a different email.'
      });
    }

    const roleRows = await query('SELECT id FROM roles WHERE slug = "supplier"');
    if (roleRows.length === 0) {
      return res.status(500).json({ success: false, message: 'Supplier role configuration missing.' });
    }

    const salt = await bcrypt.genSalt(config.security.bcryptSaltRounds);
    const passwordHash = await bcrypt.hash(input.password, salt);
    const { password, ...safeInput } = input;
    const registrationData = {
      ...safeInput,
      role: 'supplier',
      supplierRoleId: roleRows[0].id,
      passwordHash
    };

    const otpResult = await generateOtp({
      userId: null,
      email: registrationData.email,
      phone: registrationData.phone,
      purpose: 'supplier_signup',
      metadata: registrationData,
      user: {
        email: registrationData.email,
        first_name: registrationData.first_name,
        last_name: registrationData.last_name
      }
    });

    await recordActivityLog({
      userId: null,
      action: 'SUPPLIER_SIGNUP_OTP_DISPATCHED',
      entityType: 'otps',
      entityId: otpResult.otpId,
      description: `Supplier registration initiated (${registrationData.account_type}): ${registrationData.company_name} (${registrationData.email})`,
      req
    });

    return res.status(201).json({
      success: true,
      message: `A verification code has been sent to ${registrationData.email} and ${registrationData.phone}. It is valid for ${config.sms.otpExpiryMinutes} minutes.`,
      data: {
        account_type: registrationData.account_type,
        company_name: registrationData.company_name,
        email: registrationData.email,
        phone: registrationData.phone,
        status: 'pending_verification',
        expires_in_minutes: config.sms.otpExpiryMinutes
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Supplier OTP Verification
 * POST /api/v1/auth/supplier/verify-otp
 * User and Supplier records are INSERTED into database only upon entering valid OTP!
 */
const supplierVerifyOtp = async (req, res, next) => {
  try {
    const { email, phone, code } = req.body;

    if (!email && !phone) {
      return res.status(400).json({ success: false, message: 'Please provide email or phone number' });
    }

    if (!code) {
      return res.status(400).json({ success: false, message: 'Please enter the 6-digit verification OTP' });
    }

    const cleanEmail = email ? email.toString().trim().toLowerCase() : null;
    const cleanPhone = phone ? phone.toString().trim() : null;

    // 1. Verify OTP - check supplier_signup first, then supplier_verification
    let verifyResult = await verifyOtp({
      email: cleanEmail,
      phone: cleanPhone,
      code: code.toString().trim(),
      purpose: 'supplier_signup'
    });

    if (!verifyResult.success) {
      if (verifyResult.isBlocked) {
        return res.status(429).json({
          success: false,
          is_blocked: true,
          message: verifyResult.message
        });
      }
      verifyResult = await verifyOtp({
        email: cleanEmail,
        phone: cleanPhone,
        code: code.toString().trim(),
        purpose: 'supplier_verification'
      });
    }

    if (!verifyResult.success) {
      return res.status(verifyResult.isBlocked ? 429 : 400).json({
        success: false,
        is_blocked: !!verifyResult.isBlocked,
        message: verifyResult.message
      });
    }

    let userId;
    let supplierId;
    let application = null;
    let emailSent = false;
    let adminNotified = false;

    const readMetadata = (record) => {
      if (!record) return null;
      let payload = record.metadata;
      if (typeof payload === 'string') {
        try { payload = JSON.parse(payload); } catch { payload = null; }
      }
      return payload;
    };

    const notifyRegistration = async (created) => {
      const accountTypeLabel = created.accountType === 'individual' ? 'Individual Person' : 'Registered Corporate Entity';
      try {
        const supplierMail = await sendSupplierApplicationReceivedEmail({
          user: {
            id: created.userId,
            email: created.email,
            first_name: created.firstName,
            last_name: created.lastName
          },
          reference: created.reference,
          submittedAt: created.submittedAt,
          accountTypeLabel
        });
        emailSent = Boolean(supplierMail?.success);
      } catch (err) {
        console.error('[Supplier Registration] Applicant email failed:', err.message);
      }

      try {
        const adminUsers = await query(
          `SELECT u.id, u.email, u.first_name FROM users u
           JOIN roles r ON u.role_id = r.id
           WHERE r.slug IN ('admin', 'site_admin') AND u.status = 'active'`
        );
        const reviewUrl = `${config.app.frontendUrl}/admin/suppliers/${created.supplierId}`;
        for (const admin of adminUsers) {
          await query(
            `INSERT INTO notifications (user_id, title, message, type, status, metadata)
             VALUES (?, ?, ?, 'system', 'sent', ?)`,
            [
              admin.id,
              'New Supplier Registration',
              `${created.supplierName} is waiting for verification.`,
              JSON.stringify({
                kind: 'supplier',
                supplierId: created.supplierId,
                reference: created.reference,
                href: `/admin/suppliers/${created.supplierId}`
              })
            ]
          );
          const adminMail = await sendAdminSupplierApplicationEmail({
            admin,
            application: created,
            reviewUrl
          });
          if (adminMail?.success) adminNotified = true;
        }
        if (adminUsers.length > 0) adminNotified = true;
      } catch (err) {
        console.error('[Supplier Registration] Admin notification failed:', err.message);
      }
    };

    // Account and supplier records are created only after a valid OTP.
    if (verifyResult.otpRecord && verifyResult.otpRecord.metadata) {
      const payload = readMetadata(verifyResult.otpRecord);

      if (!payload?.email || !payload?.passwordHash) {
        return res.status(400).json({
          success: false,
          message: 'This verification code has no registration details. Please submit the application again.'
        });
      }

      const existing = await query('SELECT id FROM users WHERE email = ?', [payload.email]);
      if (existing.length === 0) {
        try {
          application = await persistSupplierApplication(payload);
        } catch (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
              success: false,
              message: 'An account with this email address already exists.'
            });
          }
          throw err;
        }
        userId = application.userId;
        supplierId = application.supplierId;
        await notifyRegistration(application);
      } else {
        userId = existing[0].id;
        const suppRows = await query('SELECT id, application_reference, status, created_at, company_name, account_type FROM suppliers WHERE user_id = ?', [userId]);
        supplierId = suppRows[0]?.id;
        await query(
          `UPDATE users SET status = 'active', email_verified_at = NOW(), phone_verified_at = NOW() WHERE id = ?`,
          [userId]
        );
        if (suppRows[0]) {
          application = {
            userId,
            supplierId,
            reference: suppRows[0].application_reference || `SUP-${new Date().getFullYear()}-${String(supplierId).padStart(6, '0')}`,
            submittedAt: suppRows[0].created_at || new Date().toISOString(),
            status: suppRows[0].status || 'pending',
            email: payload.email,
            firstName: payload.first_name,
            lastName: payload.last_name,
            accountType: suppRows[0].account_type || payload.account_type
          };
        }
      }
    } else {
      // Legacy user already in database: update verified timestamps
      let users = [];
      if (cleanEmail) {
        users = await query(
          `SELECT u.id, u.email, u.phone, s.id AS supplier_id 
           FROM users u 
           JOIN suppliers s ON u.id = s.user_id 
           WHERE u.email = ?`,
          [cleanEmail]
        );
      }
      if (users.length === 0 && cleanPhone) {
        users = await query(
          `SELECT u.id, u.email, u.phone, s.id AS supplier_id 
           FROM users u 
           JOIN suppliers s ON u.id = s.user_id 
           WHERE u.phone = ? 
           ORDER BY u.id DESC LIMIT 1`,
          [cleanPhone]
        );
      }

      if (users.length === 0) {
        return res.status(404).json({ success: false, message: 'Supplier account not found. Please register.' });
      }

      const user = users[0];
      userId = user.id;
      supplierId = user.supplier_id;

      await query(
        `UPDATE users SET phone_verified_at = NOW(), email_verified_at = NOW(), status = 'active' WHERE id = ?`,
        [userId]
      );
      await query(
        `UPDATE supplier_verifications SET status = 'verified', verified_at = NOW() WHERE supplier_id = ?`,
        [supplierId]
      );
      await query(
        `UPDATE suppliers SET status = 'under_review' WHERE id = ? AND status = 'pending_verification'`,
        [supplierId]
      );
    }

    await recordActivityLog({
      userId,
      action: 'SUPPLIER_OTP_VERIFIED',
      entityType: 'suppliers',
      entityId: supplierId,
      description: 'Supplier OTP verified. Application submitted with pending approval status.',
      req
    });

    const userRows = await query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.account_type, u.customer_segment,
              u.status, u.role_id, r.slug AS role_slug
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = ?`,
      [userId]
    );
    const sessionUser = userRows[0];
    const tokens = sessionUser ? await generateAuthTokens(sessionUser) : null;
    const permissions = sessionUser ? await getUserPermissions(sessionUser.role_id) : [];
    const reference = application?.reference || (supplierId ? `SUP-${new Date().getFullYear()}-${String(supplierId).padStart(6, '0')}` : null);

    return res.status(200).json({
      success: true,
      message: 'Application submitted successfully. Your supplier account is pending approval.',
      data: {
        application_reference: reference,
        status: 'pending',
        submitted_at: application?.submittedAt || new Date().toISOString(),
        email_sent: emailSent,
        admin_notified: adminNotified,
        account_type: application?.accountType || null,
        user: sessionUser ? {
          id: sessionUser.id,
          first_name: sessionUser.first_name,
          last_name: sessionUser.last_name,
          email: sessionUser.email,
          phone: sessionUser.phone,
          account_type: application?.accountType || sessionUser.account_type,
          customer_segment: sessionUser.customer_segment,
          role: sessionUser.role_slug,
          status: 'active',
          supplier_status: 'pending',
          permissions
        } : null,
        tokens
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Resend OTP
 * POST /api/v1/auth/supplier/resend-otp
 */
const supplierResendOtp = async (req, res, next) => {
  try {
    const { email, phone } = req.body;

    if (!email && !phone) {
      return res.status(400).json({ success: false, message: 'Please provide email or phone' });
    }

    const cleanEmail = email ? email.toString().trim().toLowerCase() : null;
    const cleanPhone = phone ? phone.toString().trim() : null;

    // Check if user is already in users table
    const users = await query(
      `SELECT id, email, phone, first_name, last_name FROM users WHERE (email = ? OR phone = ?)`,
      [cleanEmail || '', cleanPhone || '']
    );

    if (users.length > 0) {
      const user = users[0];
      await generateOtp({
        userId: user.id,
        email: user.email,
        phone: user.phone,
        purpose: 'supplier_verification',
        user
      });

      return res.status(200).json({
        success: true,
        message: `A new verification code has been sent to your email and mobile number. It is valid for ${config.sms.otpExpiryMinutes} minutes.`
      });
    }

    // If user is not yet in users table, lookup pending registration from otps table
    const pendingRows = await query(
      `SELECT metadata FROM otps 
       WHERE (email = ? OR phone = ?) AND purpose = 'supplier_signup' 
       ORDER BY id DESC LIMIT 1`,
      [cleanEmail || '', cleanPhone || '']
    );

    if (pendingRows.length === 0 || !pendingRows[0].metadata) {
      return res.status(404).json({ success: false, message: 'No pending supplier registration found. Please register.' });
    }

    let meta = pendingRows[0].metadata;
    if (typeof meta === 'string') {
      try { meta = JSON.parse(meta); } catch (_) {}
    }

    await generateOtp({
      userId: null,
      email: meta.email,
      phone: meta.phone,
      purpose: 'supplier_signup',
      metadata: meta,
      user: {
        email: meta.email,
        first_name: meta.first_name,
        last_name: meta.last_name
      }
    });

    return res.status(200).json({
      success: true,
      message: `A new verification code has been sent to your email and mobile number. It is valid for ${config.sms.otpExpiryMinutes} minutes.`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Supplier Email Verification
 * POST /api/v1/auth/supplier/verify-email
 */
const supplierVerifyEmail = async (req, res, next) => {
  try {
    const { token, email } = req.body;

    const verifications = await query(
      `SELECT sv.*, s.user_id 
       FROM supplier_verifications sv
       JOIN suppliers s ON sv.supplier_id = s.id
       JOIN users u ON s.user_id = u.id
       WHERE sv.verification_type = 'email' 
         AND sv.token_or_otp = ? 
         AND u.email = ?
         AND sv.status = 'pending'`,
      [token, email]
    );

    if (verifications.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or already used email verification link'
      });
    }

    const record = verifications[0];
    if (new Date(record.expires_at) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Email verification link has expired'
      });
    }

    // Mark as verified
    await query(`UPDATE supplier_verifications SET status = 'verified', verified_at = NOW() WHERE id = ?`, [record.id]);
    await query(`UPDATE users SET email_verified_at = NOW() WHERE id = ?`, [record.user_id]);

    // Check if both phone and email are verified
    const userRows = await query(`SELECT email_verified_at, phone_verified_at FROM users WHERE id = ?`, [record.user_id]);
    if (userRows[0].email_verified_at && userRows[0].phone_verified_at) {
      await query(
        `UPDATE suppliers SET status = 'under_review' WHERE id = ? AND status = 'pending_verification'`,
        [record.supplier_id]
      );
      await query(`UPDATE users SET status = 'active' WHERE id = ?`, [record.user_id]);
    }

    await recordActivityLog({
      userId: record.user_id,
      action: 'SUPPLIER_EMAIL_VERIFIED',
      entityType: 'suppliers',
      entityId: record.supplier_id,
      description: `Supplier email verified: ${email}`,
      req
    });

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now log into your supplier dashboard.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Supplier Login
 * POST /api/v1/auth/supplier/login
 */
const supplierLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const users = await query(
      `SELECT u.id, u.role_id, u.first_name, u.last_name, u.email, u.phone, 
              u.password_hash, u.account_type, u.customer_segment, u.status AS user_status,
              u.email_verified_at, u.phone_verified_at,
              r.slug AS role_slug, r.name AS role_name,
              s.id AS supplier_id, s.company_name, s.status AS supplier_status
       FROM users u
       JOIN roles r ON u.role_id = r.id
       LEFT JOIN suppliers s ON u.id = s.user_id
       WHERE u.email = ?`,
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = users[0];

    if (user.role_slug !== 'supplier') {
      return res.status(403).json({
        success: false,
        message: 'Account is not registered as a supplier. Please use the customer or admin login.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Require at least one contact method (email or phone) to be verified before login
    const isEmailVerified = Boolean(user.email_verified_at);
    const isPhoneVerified = Boolean(user.phone_verified_at);

    if (!isEmailVerified && !isPhoneVerified) {
      return res.status(403).json({
        success: false,
        requires_verification: true,
        email: user.email,
        phone: user.phone,
        message: 'Your account is pending verification. At least one contact method (email or phone) must be verified before login.'
      });
    }

    const tokens = await generateAuthTokens(user);
    const permissions = await getUserPermissions(user.role_id);

    await recordActivityLog({
      userId: user.id,
      action: 'SUPPLIER_LOGIN',
      entityType: 'suppliers',
      entityId: user.supplier_id,
      description: `Supplier logged in: ${user.company_name} (${user.email})`,
      req
    });

    return res.status(200).json({
      success: true,
      message: 'Supplier login successful',
      data: {
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          phone: user.phone,
          account_type: user.account_type,
          role: user.role_slug,
          email_verified: Boolean(user.email_verified_at),
          phone_verified: Boolean(user.phone_verified_at),
          supplier: {
            id: user.supplier_id,
            company_name: user.company_name,
            status: user.supplier_status
          },
          permissions
        },
        tokens
      }
    });
  } catch (error) {
    next(error);
  }
};

// =================================================================
// ADMIN AUTHENTICATION (Site Admin, Site Accountant, Finance)
// =================================================================

/**
 * Admin Login
 * POST /api/v1/auth/admin/login
 */
const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const users = await query(
      `SELECT u.id, u.role_id, u.first_name, u.last_name, u.email, u.phone, 
              u.password_hash, u.status,
              r.slug AS role_slug, r.name AS role_name
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.email = ?`,
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    const user = users[0];

    const adminRoles = ['site_admin', 'accountant', 'site_accountant', 'finance'];
    if (!adminRoles.includes(user.role_slug)) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: User does not have administrative privileges.'
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: `Your administrative account is ${user.status}. Contact the system administrator.`
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    const tokens = await generateAuthTokens(user);
    const permissions = await getUserPermissions(user.role_id);

    await recordActivityLog({
      userId: user.id,
      action: 'ADMIN_LOGIN',
      entityType: 'users',
      entityId: user.id,
      description: `Admin logged in: ${user.email} with role [${user.role_slug}]`,
      req
    });

    return res.status(200).json({
      success: true,
      message: `Welcome, ${user.first_name}. Logged in as ${user.role_name}.`,
      data: {
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          role: user.role_slug,
          role_name: user.role_name,
          permissions
        },
        tokens
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin Register / Onboarding
 * POST /api/v1/auth/admin/register
 */
const adminRegister = async (req, res, next) => {
  try {
    const {
      first_name,
      last_name,
      email,
      password,
      role_slug = 'site_admin',
      phone
    } = req.body;

    const existing = await query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An administrator account with this email address already exists.'
      });
    }

    const allowedRoles = ['site_admin', 'accountant', 'site_accountant', 'finance'];
    const selectedRoleSlug = allowedRoles.includes(role_slug) ? role_slug : 'site_admin';

    const roleRows = await query('SELECT id, name, slug FROM roles WHERE slug = ?', [selectedRoleSlug]);
    if (roleRows.length === 0) {
      return res.status(500).json({ success: false, message: `Administrative role "${selectedRoleSlug}" not found` });
    }
    const adminRole = roleRows[0];

    const salt = await bcrypt.genSalt(config.security.bcryptSaltRounds);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await query(
      `INSERT INTO users (role_id, first_name, last_name, email, password_hash, phone, account_type, status, email_verified_at, phone_verified_at)
       VALUES (?, ?, ?, ?, ?, ?, 'individual', 'active', NOW(), NOW())`,
      [adminRole.id, first_name, last_name, email, passwordHash, phone || null]
    );

    const userId = result.insertId;

    const userPayload = {
      id: userId,
      first_name,
      last_name,
      email,
      phone,
      role: selectedRoleSlug,
      role_id: adminRole.id,
      status: 'active'
    };

    const tokens = await generateAuthTokens(userPayload);
    const permissions = await getUserPermissions(adminRole.id);

    await recordActivityLog({
      userId,
      action: 'ADMIN_REGISTER',
      entityType: 'users',
      entityId: userId,
      description: `New administrator registered: ${email} (${adminRole.name})`,
      req
    });

    return res.status(201).json({
      success: true,
      message: `Administrator account created successfully with role ${adminRole.name}.`,
      data: {
        user: {
          id: userId,
          first_name,
          last_name,
          email,
          phone,
          role: selectedRoleSlug,
          role_name: adminRole.name,
          status: 'active',
          permissions
        },
        tokens
      }
    });
  } catch (error) {
    next(error);
  }
};

// =================================================================
// FORGOT & RESET PASSWORD
// =================================================================

/**
 * Forgot Password
 * POST /api/v1/auth/forgot-password
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const users = await query('SELECT id, first_name, last_name, email FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      // Return 200 to prevent user enumeration
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been dispatched.'
      });
    }

    const user = users[0];
    const resetToken = generateRandomToken(32);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Invalidate existing reset tokens for this email
    await query(`UPDATE password_resets SET is_used = TRUE WHERE email = ?`, [email]);

    // Save reset token
    await query(
      `INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)`,
      [email, resetToken, expiresAt]
    );

    await sendPasswordResetEmail({ user, resetToken });

    await recordActivityLog({
      userId: user.id,
      action: 'FORGOT_PASSWORD_REQUESTED',
      entityType: 'users',
      entityId: user.id,
      description: `Password reset requested for: ${email}`,
      req
    });

    return res.status(200).json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been dispatched.',
      data: {
        resetToken // Provided for easy development / API testing
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset Password
 * POST /api/v1/auth/reset-password
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    const rows = await query(
      `SELECT * FROM password_resets 
       WHERE token = ? AND is_used = FALSE AND expires_at > NOW() 
       ORDER BY id DESC LIMIT 1`,
      [token]
    );

    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token'
      });
    }

    const resetRecord = rows[0];

    const users = await query('SELECT id FROM users WHERE email = ?', [resetRecord.email]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(password, salt);

    // Update password and invalidate token
    await query('UPDATE users SET password_hash = ? WHERE email = ?', [newPasswordHash, resetRecord.email]);
    await query('UPDATE password_resets SET is_used = TRUE WHERE id = ?', [resetRecord.id]);

    await recordActivityLog({
      userId: users[0].id,
      action: 'PASSWORD_RESET_COMPLETED',
      entityType: 'users',
      entityId: users[0].id,
      description: `Password reset successfully for: ${resetRecord.email}`,
      req
    });

    return res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now login with your new password.'
    });
  } catch (error) {
    next(error);
  }
};

// =================================================================
// REFRESH TOKEN, LOGOUT & ME
// =================================================================

/**
 * Refresh Access Token
 * POST /api/v1/auth/refresh-token
 */
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;

    const { decoded, record } = await verifyRefreshToken(token);

    const users = await query(
      `SELECT u.id, u.role_id, u.first_name, u.last_name, u.email, u.phone, 
              u.account_type, u.customer_segment, u.status,
              r.slug AS role_slug, r.name AS role_name
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = ?`,
      [decoded.sub || decoded.id]
    );

    if (users.length === 0 || users[0].status === 'suspended') {
      return res.status(401).json({ success: false, message: 'User invalid or suspended' });
    }

    // Revoke old refresh token (token rotation)
    await revokeRefreshToken(token);

    // Generate new tokens
    const newTokens = await generateAuthTokens(users[0]);

    return res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: newTokens
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Failed to refresh token',
      error: error.message
    });
  }
};

/**
 * Logout
 * POST /api/v1/auth/logout
 */
const logout = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (token) {
      await revokeRefreshToken(token);
    }

    if (req.user) {
      await recordActivityLog({
        userId: req.user.id,
        action: 'LOGOUT',
        entityType: 'users',
        entityId: req.user.id,
        description: `User logged out: ${req.user.email}`,
        req
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Current Authenticated User & Permissions
 * GET /api/v1/auth/me
 */
const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      user: {
        id: req.user.id,
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        email: req.user.email,
        phone: req.user.phone,
        account_type: req.user.account_type,
        customer_segment: req.user.customer_segment,
        role: req.user.role_slug,
        role_name: req.user.role_name,
        permissions: req.user.permissions,
        supplier: req.user.supplier || null
      }
    }
  });
};

/**
 * Unified Login (Supports Site Admin, Accountant, Supplier, Customer automatically with dynamic role redirection)
 * POST /api/v1/auth/login
 */
const unifiedLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email address and password are required'
      });
    }

    const cleanEmail = email.toString().trim().toLowerCase();

    const users = await query(
      `SELECT u.id, u.role_id, u.first_name, u.last_name, u.email, u.phone, 
              u.password_hash, u.account_type, u.customer_segment, u.status AS user_status,
              u.email_verified_at, u.phone_verified_at,
              r.slug AS role_slug, r.name AS role_name,
              s.id AS supplier_id, s.company_name, s.status AS supplier_status
       FROM users u
       JOIN roles r ON u.role_id = r.id
       LEFT JOIN suppliers s ON u.id = s.user_id
       WHERE LOWER(u.email) = ? OR u.phone = ?`,
      [cleanEmail, cleanEmail]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = users[0];

    if (user.user_status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account is suspended. Please contact platform support.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Role-based target destination
    let redirectTo = '/customer/profile';
    if (['site_admin', 'admin'].includes(user.role_slug)) {
      redirectTo = '/admin/dashboard';
    } else if (['accountant', 'site_accountant', 'finance'].includes(user.role_slug)) {
      redirectTo = '/admin/dashboard';
    } else if (user.role_slug === 'supplier') {
      redirectTo = '/supplier/dashboard';
    } else {
      redirectTo = '/customer/profile';
    }

    const tokens = await generateAuthTokens(user);
    const permissions = await getUserPermissions(user.role_id);

    await recordActivityLog({
      userId: user.id,
      action: 'USER_LOGIN',
      entityType: 'users',
      entityId: user.id,
      description: `User authenticated via Unified Login: ${user.email} [${user.role_slug}]`,
      req
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          phone: user.phone,
          account_type: user.account_type,
          role: user.role_slug,
          role_name: user.role_name,
          email_verified: Boolean(user.email_verified_at),
          phone_verified: Boolean(user.phone_verified_at),
          supplier: user.supplier_id ? {
            id: user.supplier_id,
            company_name: user.company_name,
            status: user.supplier_status
          } : null,
          permissions
        },
        tokens,
        role: user.role_slug,
        redirectTo
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  customerSignup,
  customerVerifyOtp,
  customerResendOtp,
  customerLogin,
  supplierSignup,
  supplierVerifyOtp,
  supplierResendOtp,
  supplierVerifyEmail,
  supplierLogin,
  adminLogin,
  adminRegister,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout,
  getMe,
  unifiedLogin
};
