const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { query } = require('../database/connection');
const config = require('../config');

/**
 * Generate Access Token and Refresh Token for a user
 */
const generateAuthTokens = async (user) => {
  const payload = {
    sub: user.id,
    id: user.id,
    email: user.email,
    role: user.role_slug || user.role,
    role_id: user.role_id,
    account_type: user.account_type,
    customer_segment: user.customer_segment
  };

  const accessToken = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
    jwtid: crypto.randomUUID()
  });

  const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
    jwtid: crypto.randomUUID()
  });

  // Calculate refresh token expiry (30 days from now or parsed)
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  // Store refresh token in database (using VARCHAR(500))
  await query(
    `INSERT INTO refresh_tokens (user_id, token, expires_at) 
     VALUES (?, ?, ?) 
     ON DUPLICATE KEY UPDATE expires_at = VALUES(expires_at), revoked = FALSE`,
    [user.id, refreshToken, expiresAt]
  );

  return {
    accessToken,
    refreshToken,
    expiresIn: config.jwt.expiresIn
  };
};

/**
 * Verify Access Token
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, config.jwt.secret);
};

/**
 * Verify Refresh Token
 */
const verifyRefreshToken = async (token) => {
  const decoded = jwt.verify(token, config.jwt.refreshSecret);
  const rows = await query(
    `SELECT * FROM refresh_tokens WHERE token = ? AND revoked = FALSE AND expires_at > NOW()`,
    [token]
  );

  if (rows.length === 0) {
    throw new Error('Refresh token is invalid, expired, or revoked');
  }

  return { decoded, record: rows[0] };
};

/**
 * Revoke a refresh token
 */
const revokeRefreshToken = async (token) => {
  await query(`UPDATE refresh_tokens SET revoked = TRUE WHERE token = ?`, [token]);
};

/**
 * Generate cryptographically secure random hex token (for email links, password reset)
 */
const generateRandomToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

module.exports = {
  generateAuthTokens,
  verifyAccessToken,
  verifyRefreshToken,
  revokeRefreshToken,
  generateRandomToken
};
