const { body } = require('express-validator');

const customerSignupRules = [
  body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('first_name').trim().notEmpty().withMessage('First name is required'),
  body('last_name').trim().notEmpty().withMessage('Last name is required'),
  body('phone').trim().notEmpty().withMessage('Mobile number is required for OTP verification').isLength({ min: 8, max: 20 }).withMessage('Please enter a valid mobile number'),
  body('account_type').optional().isIn(['individual', 'organization']).withMessage('Account type must be individual or organization'),
  body('customer_segment').optional().isIn(['retail', 'agent', 'corporate']).withMessage('Customer segment must be retail, agent, or corporate')
];

const customerVerifyOtpRules = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail()
];

const customerResendOtpRules = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail()
];

const customerLoginRules = [
  body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
];

const supplierSignupRules = [
  body('company_name').trim().notEmpty().withMessage('Company / Business name is required'),
  body('first_name').optional().trim(),
  body('last_name').optional().trim(),
  body('owner_name').optional().trim(),
  body('contact_person').optional().trim(),
  body('email').isEmail().withMessage('Valid business email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('phone').notEmpty().withMessage('Phone number is required for OTP verification'),
  body('business_type').optional().trim(),
  body('website').optional().trim(),
  body('main_category').optional().trim(),
  body('sub_category').optional().trim(),
  body('services').optional(),
  body('description').optional().trim(),
  body('documents').optional().isArray(),
  body('trade_license_no').optional().trim(),
  body('tax_id').optional().trim(),
  body('city').optional().trim(),
  body('country').optional().trim()
];

const supplierVerifyOtpRules = [
  body('code').isLength({ min: 6, max: 6 }).withMessage('6-digit OTP code is required'),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().trim()
];

const supplierVerifyEmailRules = [
  body('token').notEmpty().withMessage('Verification token is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail()
];

const forgotPasswordRules = [
  body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail()
];

const resetPasswordRules = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
];

const adminLoginRules = [
  body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
];

const adminRegisterRules = [
  body('email').isEmail().withMessage('Please provide a valid administrative email address').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('first_name').trim().notEmpty().withMessage('First name is required'),
  body('last_name').trim().notEmpty().withMessage('Last name is required'),
  body('role_slug').optional().isIn(['site_admin', 'accountant', 'site_accountant', 'finance']).withMessage('Role must be site_admin, accountant, site_accountant, or finance'),
  body('phone').optional().trim()
];

const refreshTokenRules = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required')
];

module.exports = {
  customerSignupRules,
  customerVerifyOtpRules,
  customerResendOtpRules,
  customerLoginRules,
  supplierSignupRules,
  supplierVerifyOtpRules,
  supplierVerifyEmailRules,
  forgotPasswordRules,
  resetPasswordRules,
  adminLoginRules,
  adminRegisterRules,
  refreshTokenRules
};
