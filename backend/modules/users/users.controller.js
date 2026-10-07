const bcrypt = require('bcryptjs');
const { query } = require('../../database/connection');
const { recordActivityLog } = require('../../middleware/audit.middleware');
const config = require('../../config');

/**
 * Get logged in user profile
 * GET /api/v1/users/profile
 */
const getProfile = async (req, res, next) => {
  try {
    const users = await query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.phone,
              u.account_type, u.customer_segment, u.status,
              u.avatar_url, u.email_verified_at, u.phone_verified_at,
              u.created_at, u.updated_at,
              r.name AS role_name, r.slug AS role_slug
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = users[0];

    // If user is supplier, include supplier details
    if (user.role_slug === 'supplier') {
      const suppliers = await query('SELECT * FROM suppliers WHERE user_id = ?', [user.id]);
      if (suppliers.length > 0) {
        user.supplier = suppliers[0];
      }
    }

    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 * PUT /api/v1/users/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { first_name, last_name, phone, avatar_url, account_type } = req.body;

    const fields = [];
    const values = [];

    if (first_name !== undefined) { fields.push('first_name = ?'); values.push(first_name); }
    if (last_name !== undefined) { fields.push('last_name = ?'); values.push(last_name); }
    if (phone !== undefined) { fields.push('phone = ?'); values.push(phone); }
    if (avatar_url !== undefined) { fields.push('avatar_url = ?'); values.push(avatar_url); }
    if (account_type !== undefined && ['individual', 'organization'].includes(account_type)) {
      fields.push('account_type = ?');
      values.push(account_type);
    }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields provided for update' });
    }

    values.push(req.user.id);
    await query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);

    await recordActivityLog({
      userId: req.user.id,
      action: 'UPDATE_PROFILE',
      entityType: 'users',
      entityId: req.user.id,
      description: 'User updated profile information',
      req
    });

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change user password
 * PUT /api/v1/users/change-password
 */
const changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ success: false, message: 'Current password and new password are required' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const rows = await query('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(current_password, rows[0].password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect current password' });
    }

    const salt = await bcrypt.genSalt(config.security.bcryptSaltRounds);
    const newHash = await bcrypt.hash(new_password, salt);

    await query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, req.user.id]);

    await recordActivityLog({
      userId: req.user.id,
      action: 'CHANGE_PASSWORD',
      entityType: 'users',
      entityId: req.user.id,
      description: 'User changed account password',
      req
    });

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword
};
