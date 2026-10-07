const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { validate } = require('../../middleware/validation.middleware');
const { authenticate } = require('../../middleware/auth.middleware');
const { otpRateLimiter, authRateLimiter } = require('../../middleware/rateLimiter');
const {
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
} = require('./auth.validator');

// -------------------------------------------------------------
// Customer Authentication & OTP Verification
// -------------------------------------------------------------
router.post('/customer/signup', otpRateLimiter, customerSignupRules, validate, authController.customerSignup);
router.post('/customer/verify-otp', customerVerifyOtpRules, validate, authController.customerVerifyOtp);
router.post('/customer/resend-otp', otpRateLimiter, customerResendOtpRules, validate, authController.customerResendOtp);
router.post('/customer/login', authRateLimiter, customerLoginRules, validate, authController.customerLogin);

// -------------------------------------------------------------
// Supplier Authentication & Verification
// -------------------------------------------------------------
router.post('/supplier/signup', otpRateLimiter, supplierSignupRules, validate, authController.supplierSignup);
router.post('/supplier/verify-otp', supplierVerifyOtpRules, validate, authController.supplierVerifyOtp);
router.post('/supplier/resend-otp', otpRateLimiter, authController.supplierResendOtp);
router.post('/supplier/verify-email', supplierVerifyEmailRules, validate, authController.supplierVerifyEmail);
router.post('/supplier/login', authRateLimiter, customerLoginRules, validate, authController.supplierLogin);

// -------------------------------------------------------------
// Admin Authentication (Site Admin, Accountant, Finance)
// Public registration disabled - admin roles can only be assigned by existing site_admin
// -------------------------------------------------------------
router.post('/admin/login', adminLoginRules, validate, authController.adminLogin);
router.post('/admin/register', (req, res) => {
  return res.status(403).json({
    success: false,
    message: 'Public administrator registration is disabled. Administrator roles can only be granted by an existing Site Administrator.'
  });
});

// -------------------------------------------------------------
// Password Management
// -------------------------------------------------------------
router.post('/forgot-password', forgotPasswordRules, validate, authController.forgotPassword);
router.post('/reset-password', resetPasswordRules, validate, authController.resetPassword);

// -------------------------------------------------------------
// Token Management & Session
// -------------------------------------------------------------
router.post('/refresh-token', refreshTokenRules, validate, authController.refreshToken);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.getMe);

module.exports = router;
