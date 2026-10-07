const rateLimit = require('express-rate-limit');

/**
 * OTP Request Rate Limiter (TASK-S1-04)
 * Strict limit: Maximum 3 OTP requests per 10 minutes per IP/Target (email or phone)
 */
const otpRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes window
  max: 3, // Limit each IP/identifier to 3 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit per target (email or phone) if provided, otherwise fallback to client IP
    const target = (req.body && (req.body.email || req.body.phone)) ? `${req.body.email || req.body.phone}`.toLowerCase().trim() : req.ip;
    return `otp:${target}`;
  },
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message: 'Too many OTP requests. Maximum 3 requests allowed per 10 minutes. Please try again later.',
      retryAfterMinutes: 10
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
  authRateLimiter
};
