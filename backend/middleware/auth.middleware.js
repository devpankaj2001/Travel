const { verifyAccessToken } = require('../services/token.service');
const { query } = require('../database/connection');

/**
 * Authenticate incoming request via Bearer JWT token
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token missing or invalid format'
      });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
        error: err.message
      });
    }

    // Retrieve user and their role
    const users = await query(
      `SELECT u.id, u.role_id, u.first_name, u.last_name, u.email, u.phone, 
              u.account_type, u.customer_segment, u.status, u.email_verified_at, u.phone_verified_at,
              r.slug AS role_slug, r.name AS role_name
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = ?`,
      [decoded.sub || decoded.id]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User associated with this token no longer exists'
      });
    }

    const user = users[0];

    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact support.'
      });
    }

    // Retrieve database-driven permissions for this user's role
    const permissions = await query(
      `SELECT p.slug
       FROM permissions p
       JOIN role_permissions rp ON p.id = rp.permission_id
       WHERE rp.role_id = ?`,
      [user.role_id]
    );

    user.permissions = permissions.map(p => p.slug);

    // If user is a supplier, attach supplier record details
    if (user.role_slug === 'supplier') {
      const suppliers = await query(
        `SELECT id AS supplier_id, company_name, trade_license_no, tax_id, status AS supplier_status
         FROM suppliers WHERE user_id = ?`,
        [user.id]
      );
      if (suppliers.length > 0) {
        user.supplier = suppliers[0];
      }
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('[Auth Middleware Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication'
    });
  }
};

/**
 * Middleware to restrict access to specific roles
 * Example: requireRole('site_admin', 'finance')
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const userRole = req.user.role_slug;

    // Normalize aliases: 'admin' matches 'site_admin', 'finance'/'site_accountant' matches 'accountant'
    const normalizedAllowed = roles.flatMap(r => {
      if (r === 'admin' || r === 'site_admin') return ['admin', 'site_admin'];
      if (r === 'accountant' || r === 'finance' || r === 'site_accountant') return ['accountant', 'finance', 'site_accountant'];
      return [r];
    });

    if (!normalizedAllowed.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access requires one of [${roles.join(', ')}] role`
      });
    }

    next();
  };
};

/**
 * Middleware to enforce database-driven permissions
 * Example: requirePermission('supplier.approve')
 */
const requirePermission = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Super/Site Admin gets automatic bypass
    if (req.user.role_slug === 'site_admin') {
      return next();
    }

    const userPermissions = req.user.permissions || [];
    const hasPermission = requiredPermissions.some(perm => userPermissions.includes(perm));

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Missing required permission [${requiredPermissions.join(' or ')}]`,
        requiredPermissions
      });
    }

    next();
  };
};

/**
 * Middleware to ensure supplier has an approved status and has signed the legal E-Sign agreement
 */
const requireSupplierApproved = async (req, res, next) => {
  if (req.user.role_slug !== 'supplier') {
    return next();
  }

  if (!req.user.supplier || req.user.supplier.supplier_status !== 'approved') {
    return res.status(403).json({
      success: false,
      message: 'Supplier account is pending review or not approved yet. Activity publishing is disabled.',
      status: req.user.supplier ? req.user.supplier.supplier_status : 'not_found'
    });
  }

  try {
    const esign = await query(
      'SELECT id, signed_status FROM esign_documents WHERE supplier_id = ? AND signed_status = "signed" LIMIT 1',
      [req.user.supplier.supplier_id]
    );

    if (esign.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Supplier has not completed and signed the legal supplier agreement (E-Sign required).',
        status: 'esign_required'
      });
    }

    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Middleware to protect customer resources against IDOR attacks
 */
const requireSelfOrAdmin = (idParam = 'id') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    if (req.user.role_slug === 'site_admin' || req.user.role_slug === 'admin') {
      return next();
    }
    const requestedId = req.params[idParam];
    if (requestedId && String(req.user.id) !== String(requestedId)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only access your own profile or records.'
      });
    }
    next();
  };
};

module.exports = {
  authenticate,
  requireRole,
  requirePermission,
  requireSupplierApproved,
  requireSelfOrAdmin
};
