const { rateLimit, ipKeyGenerator } = require('express-rate-limit');

/**
 * OTP Request Rate Limiter
 * Strict limit: Maximum 3 OTP requests per 1 minute per IP/Target (email or phone)
 */
const otpRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 3, // Maximum 3 requests per 1 minute
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit per target (email or phone) if provided, otherwise fallback to normalized client IP
    const target = (req.body && (req.body.email || req.body.phone))
      ? `${req.body.email || req.body.phone}`.toLowerCase().trim()
      : (typeof ipKeyGenerator === 'function' ? ipKeyGenerator(req.ip) : req.ip);
    return `otp:${target}`;
  },
  validate: { keyGeneratorIpFallback: false },
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message: 'Too many OTP requests. Maximum 3 requests allowed per 1 minute. Please wait 1 minute before requesting again.',
      retryAfterMinutes: 1
    });
  }
});

/**
 * OTP Verification Rate Limiter (Brute-force protection on verification code)
 * Limit: Maximum 5 verification attempts per 10 minutes per IP/Target
 */
const otpVerifyRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const target = (req.body && (req.body.email || req.body.phone))
      ? `${req.body.email || req.body.phone}`.toLowerCase().trim()
      : (typeof ipKeyGenerator === 'function' ? ipKeyGenerator(req.ip) : req.ip);
    return `otp-verify:${target}`;
  },
  validate: { keyGeneratorIpFallback: false },
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message: 'Too many wrong OTP verification attempts. Your account is temporarily rate-limited. Please wait 15 minutes before trying again.',
      retryAfterMinutes: 15
    });
  }
});

/**
 * Auth Login Rate Limiter
 * Limit: Maximum 10 login attempts per 15 minutes per IP
 */
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message: 'Too many login attempts. Please wait 15 minutes before trying again.'
    });
  }
});

module.exports = {
  otpRateLimiter,
  otpVerifyRateLimiter,
  authRateLimiter
};
