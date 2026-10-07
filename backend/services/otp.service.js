const { query } = require('../database/connection');
const config = require('../config');
const emailService = require('./email.service');

/**
 * Generate a single 6-digit numeric OTP and save to database
 * Dispatches the SAME OTP to both Email and Phone
 * Enforces rate limiting: Max 3 requests per 10 minutes per target
 */
const generateOtp = async ({ userId = null, email = null, phone = null, purpose = 'supplier_verification', user = null, metadata = null }) => {
  const rateConds = [];
  const rateParams = [];
  if (email) { rateConds.push('email = ?'); rateParams.push(email); }
  if (phone) { rateConds.push('phone = ?'); rateParams.push(phone); }

  if (rateConds.length > 0) {
    // 1. Check if account/target is currently blocked due to 5 wrong attempts
    const blockedRows = await query(
      `SELECT blocked_until FROM otps 
       WHERE (${rateConds.join(' OR ')}) 
         AND blocked_until > NOW() 
       ORDER BY id DESC LIMIT 1`,
      rateParams
    );

    if (blockedRows.length > 0 && new Date(blockedRows[0].blocked_until) > new Date()) {
      const remainingMinutes = Math.max(1, Math.ceil((new Date(blockedRows[0].blocked_until) - new Date()) / 60000));
      const err = new Error(`Account is temporarily blocked due to 5 wrong OTP attempts. Please try again after ${remainingMinutes} minute(s).`);
      err.statusCode = 429;
      throw err;
    }

    // Auto-unblock any past expired records
    await query(
      `UPDATE otps SET is_blocked = 0 
       WHERE (${rateConds.join(' OR ')}) 
         AND is_blocked = 1 
         AND blocked_until <= NOW()`,
      rateParams
    );

    // 2. Rate limiting check (TASK-S1-04): Max 3 requests per 10 minutes
    const recent = await query(
      `SELECT COUNT(*) AS count FROM otps 
       WHERE (${rateConds.join(' OR ')}) 
         AND purpose = ? 
         AND created_at >= NOW() - INTERVAL 10 MINUTE`,
      [...rateParams, purpose]
    );
    if (recent[0] && recent[0].count >= 3) {
      const err = new Error('Too many OTP requests. Maximum 3 requests allowed per 10 minutes.');
      err.statusCode = 429;
      throw err;
    }
  }

  // 3. Generate random 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // 4. Invalidate any active unused OTP for this target and purpose
  const invalidateConds = [];
  const invalidateParams = [];
  if (email) { invalidateConds.push('email = ?'); invalidateParams.push(email); }
  if (phone) { invalidateConds.push('phone = ?'); invalidateParams.push(phone); }
  if (invalidateConds.length > 0) {
    await query(
      `UPDATE otps SET is_used = TRUE 
       WHERE (${invalidateConds.join(' OR ')}) AND purpose = ? AND is_used = FALSE`,
      [...invalidateParams, purpose]
    );
  }

  const expiresAt = new Date(Date.now() + config.sms.otpExpiryMinutes * 60 * 1000);
  const metaString = metadata ? (typeof metadata === 'string' ? metadata : JSON.stringify(metadata)) : null;

  const result = await query(
    `INSERT INTO otps (user_id, phone, email, purpose, code, expires_at, metadata, attempts, failed_attempts, is_blocked)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, 0)`,
    [userId, phone, email, purpose, code, expiresAt, metaString]
  );

  // 5. Dispatch the EXACT SAME OTP to both phone (SMS) and email
  await sendOtpMessage({ phone, email, code, purpose, user });

  return {
    otpId: result.insertId,
    code,
    expiresAt,
    email,
    phone
  };
};

/**
 * Verify provided OTP code against email OR phone
 * Enforces: 5 wrong attempts -> 10-minute block on that email/account
 * Auto unblocks once 10 minutes have elapsed
 */
const verifyOtp = async ({ email = null, phone = null, code, purpose = 'supplier_verification' }) => {
  const queryConds = [];
  const queryParams = [];
  if (email) { queryConds.push('email = ?'); queryParams.push(email); }
  if (phone) { queryConds.push('phone = ?'); queryParams.push(phone); }

  if (queryConds.length === 0) {
    return { success: false, message: 'Please provide email or phone number to verify OTP.' };
  }

  // 1. Check if target (email or phone) is currently blocked due to 5 wrong attempts
  const blockedRows = await query(
    `SELECT id, email, phone, failed_attempts, is_blocked, blocked_until FROM otps 
     WHERE (${queryConds.join(' OR ')}) 
       AND blocked_until > NOW() 
     ORDER BY id DESC LIMIT 1`,
    queryParams
  );

  if (blockedRows.length > 0 && new Date(blockedRows[0].blocked_until) > new Date()) {
    const remainingMinutes = Math.max(1, Math.ceil((new Date(blockedRows[0].blocked_until) - new Date()) / 60000));
    return {
      success: false,
      isBlocked: true,
      message: `Account is temporarily blocked due to 5 wrong OTP attempts. Please try again after ${remainingMinutes} minute(s).`
    };
  }

  // Auto-unblock any past expired records
  await query(
    `UPDATE otps SET is_blocked = 0 
     WHERE (${queryConds.join(' OR ')}) 
       AND is_blocked = 1 
       AND blocked_until <= NOW()`,
    queryParams
  );

  let rows = [];
  if (email) {
    rows = await query(
      `SELECT * FROM otps 
       WHERE email = ? 
         AND purpose = ? 
         AND is_used = FALSE 
       ORDER BY id DESC LIMIT 1`,
      [email, purpose]
    );
  }

  if (rows.length === 0) {
    rows = await query(
      `SELECT * FROM otps 
       WHERE (${queryConds.join(' OR ')}) 
         AND purpose = ? 
         AND is_used = FALSE 
       ORDER BY id DESC LIMIT 1`,
      [...queryParams, purpose]
    );
  }

  if (rows.length === 0) {
    return { success: false, message: 'No active OTP found. Please request a new OTP.' };
  }

  const otpRecord = rows[0];

  // Check expiration
  if (new Date(otpRecord.expires_at) < new Date()) {
    await query(`UPDATE otps SET is_used = TRUE WHERE id = ?`, [otpRecord.id]);
    return { success: false, message: 'OTP has expired. Please request a new OTP.' };
  }

  // Check code match
  if (otpRecord.code !== code.toString().trim()) {
    const newFailedAttempts = (otpRecord.failed_attempts || otpRecord.attempts || 0) + 1;

    if (newFailedAttempts >= 5) {
      // 5 wrong attempts -> block account for 10 minutes
      await query(
        `UPDATE otps 
         SET failed_attempts = ?, 
             attempts = ?, 
             is_blocked = 1, 
             blocked_until = DATE_ADD(NOW(), INTERVAL 10 MINUTE), 
             is_used = TRUE 
         WHERE id = ?`,
        [newFailedAttempts, newFailedAttempts, otpRecord.id]
      );

      return {
        success: false,
        isBlocked: true,
        remainingAttempts: 0,
        message: 'Too many wrong OTP attempts (5/5). Your account is temporarily blocked for 10 minutes. Please try again after 10 minutes.'
      };
    } else {
      await query(
        `UPDATE otps 
         SET failed_attempts = ?, 
             attempts = ? 
         WHERE id = ?`,
        [newFailedAttempts, newFailedAttempts, otpRecord.id]
      );
      const remaining = 5 - newFailedAttempts;
      return {
        success: false,
        remainingAttempts: remaining,
        message: `Invalid OTP code. ${remaining} attempt(s) remaining before a 10-minute block.`
      };
    }
  }

  // Mark as verified & clear any block
  await query(
    `UPDATE otps 
     SET is_used = TRUE, 
         is_blocked = 0, 
         blocked_until = NULL 
     WHERE id = ?`,
    [otpRecord.id]
  );

  let parsedMetadata = otpRecord.metadata;
  if (typeof parsedMetadata === 'string') {
    try {
      parsedMetadata = JSON.parse(parsedMetadata);
    } catch (_) {}
  }
  otpRecord.metadata = parsedMetadata;

  return {
    success: true,
    message: 'OTP verified successfully.',
    otpRecord
  };
};

/**
 * Dispatch the same OTP to both Phone (SMS) and Email channels
 */
const sendOtpMessage = async ({ phone, email, code, purpose, user = null }) => {
  const { provider, senderId, apiKey, apiSecret } = config.sms;

  // 1. Dispatch SMS to phone (if provided)
  if (phone) {
    if (provider === 'mock' || !apiKey) {
      console.log(`\n================== [SMS OTP DISPATCH (PROVIDER: ${provider.toUpperCase()})] ==================`);
      console.log(`Sender ID: ${senderId}`);
      console.log(`Phone: ${phone}`);
      console.log(`Purpose: ${purpose}`);
      console.log(`Verification Code: [ ${code} ] (Expires in ${config.sms.otpExpiryMinutes} minutes)`);
      console.log(`=========================================================================\n`);
    } else if (provider === 'twilio') {
      // Live Twilio SMS
    } else if (provider === 'msg91') {
      // Live Msg91 SMS
    }
  }

  // 2. Dispatch Email with the EXACT SAME OTP (if email provided)
  if (email) {
    try {
      await emailService.sendOtpEmail({
        user: user || { first_name: 'Valued User', email },
        code,
        purpose: purpose === 'supplier_verification' ? 'Supplier' : (purpose === 'customer_verification' ? 'Customer' : 'Account')
      });
    } catch (emailErr) {
      console.error('[Email OTP Error]:', emailErr.message);
    }
  }

  return true;
};

module.exports = {
  generateOtp,
  verifyOtp,
  sendOtpMessage
};
