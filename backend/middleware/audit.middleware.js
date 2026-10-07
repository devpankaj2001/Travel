const { query } = require('../database/connection');

/**
 * Record an audit log into activity_logs table
 */
const recordActivityLog = async ({
  userId = null,
  action,
  entityType,
  entityId = null,
  description = null,
  req = null
}) => {
  try {
    const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.ip) : null;
    const userAgent = req ? req.headers['user-agent'] : null;

    await query(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, action, entityType, entityId, description, ipAddress, userAgent]
    );
  } catch (error) {
    console.error('[Activity Log Error]:', error.message);
  }
};

const recordAuditLog = async ({
  actorId = null,
  entityType,
  entityId = null,
  action,
  oldValue = null,
  newValue = null,
  reason = null,
  req = null
}) => {
  try {
    const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.ip) : null;
    await query(
      `INSERT INTO audit_logs (actor_id, entity_type, entity_id, action, old_value, new_value, reason, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        actorId,
        entityType,
        entityId,
        action,
        oldValue ? JSON.stringify(oldValue) : null,
        newValue ? JSON.stringify(newValue) : null,
        reason,
        ipAddress
      ]
    );
  } catch (error) {
    console.error('[Audit Log Error]:', error.message);
  }
};

module.exports = {
  recordActivityLog,
  recordAuditLog
};
