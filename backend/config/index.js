const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const isProduction = process.env.NODE_ENV === 'production';

// Strict validation for production deployment
if (isProduction) {
  const criticalVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
  const missing = criticalVars.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`[CRITICAL] Missing required production environment variables: ${missing.join(', ')}`);
  }

  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    throw new Error('[CRITICAL] JWT_SECRET must be at least 32 characters long in production');
  }
}

const config = {
  // Application
  app: {
    env: process.env.NODE_ENV || 'development',
    isProduction,
    port: parseInt(process.env.PORT || '5000', 10),
    name: process.env.APP_NAME || 'Enterprise Booking Platform',
    backendUrl: process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`,
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    allowedOrigins: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
      : ['http://localhost:3000', 'http://127.0.0.1:3000']
  },

  // Database (MySQL)
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'booking_platform',
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '20', 10),
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : false
  },

  // JWT & Authentication
  jwt: {
    secret: process.env.JWT_SECRET || 'booking_platform_default_jwt_secret_dev_key_2026',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'booking_platform_default_refresh_secret_dev_key_2026',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  },

  // Security & Rate Limiting
  security: {
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 mins
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '200', 10),
    authRateLimitMaxRequests: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS || '25', 10)
  },

  // File Uploads & Storage
  storage: {
    uploadDir: process.env.UPLOAD_DIR || path.resolve(__dirname, '../uploads'),
    maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10),
    allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || 'pdf,jpg,jpeg,png,webp,doc,docx').split(',').map(ext => ext.trim().toLowerCase()),
    storageType: process.env.STORAGE_TYPE || 'local'
  },

  // Email (SMTP)
  mail: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    fromName: process.env.SMTP_FROM_NAME || 'Booking Platform',
    fromEmail: process.env.SMTP_FROM_EMAIL || 'no-reply@bookingplatform.com',
    fallbackToLog: process.env.MAIL_FALLBACK_TO_LOG !== 'false'
  },

  // SMS & OTP
  sms: {
    provider: process.env.SMS_PROVIDER || 'mock',
    apiKey: process.env.SMS_API_KEY || '',
    apiSecret: process.env.SMS_API_SECRET || '',
    senderId: process.env.SMS_SENDER_ID || '',
    otpExpiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES || '10', 10),
    otpMaxAttempts: parseInt(process.env.OTP_MAX_ATTEMPTS || '5', 10)
  },

  // Business & Localization Defaults
  business: {
    defaultCurrency: process.env.DEFAULT_CURRENCY || 'INR',
    defaultCountry: process.env.DEFAULT_COUNTRY || 'India',
    defaultPaymentGateway: process.env.DEFAULT_PAYMENT_GATEWAY || 'razorpay'
  },

  // Seed configuration
  seed: {
    adminEmail: process.env.ADMIN_DEFAULT_EMAIL || 'admin@bookingplatform.com',
    adminPassword: process.env.ADMIN_DEFAULT_PASSWORD || 'Admin@Secure2026!',
    adminFirstName: process.env.ADMIN_DEFAULT_FIRSTNAME || 'Super',
    adminLastName: process.env.ADMIN_DEFAULT_LASTNAME || 'Admin',
    seedDemoData: process.env.SEED_DEMO_DATA !== 'false'
  }
};

module.exports = config;
