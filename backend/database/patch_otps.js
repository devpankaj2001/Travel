const { query, pool } = require('./connection');

const patchOtps = async () => {
  try {
    console.log('[Patch] Checking columns in otps table...');
    const existingCols = await query('SHOW COLUMNS FROM otps');
    const colNames = existingCols.map(c => c.Field);
    console.log('[Patch] Current columns:', colNames.join(', '));

    const alterClauses = [];

    if (!colNames.includes('failed_attempts')) {
      alterClauses.push('ADD COLUMN `failed_attempts` SMALLINT UNSIGNED NOT NULL DEFAULT 0 AFTER `attempts`');
    }
    if (!colNames.includes('is_blocked')) {
      alterClauses.push('ADD COLUMN `is_blocked` BOOLEAN NOT NULL DEFAULT FALSE AFTER `failed_attempts`');
    }
    if (!colNames.includes('blocked_until')) {
      alterClauses.push('ADD COLUMN `blocked_until` TIMESTAMP NULL DEFAULT NULL AFTER `is_blocked`');
    }
    if (!colNames.includes('metadata')) {
      alterClauses.push('ADD COLUMN `metadata` JSON NULL AFTER `blocked_until`');
    }

    if (alterClauses.length > 0) {
      console.log(`[Patch] Adding missing columns: ${alterClauses.length} clause(s)...`);
      await query(`ALTER TABLE \`otps\` ${alterClauses.join(', ')}`);
      console.log('[Patch] Columns successfully added!');
    } else {
      console.log('[Patch] All columns already exist.');
    }

    // Check index
    const [indexes] = await pool.query('SHOW INDEX FROM otps WHERE Key_name = "idx_otps_blocked"');
    if (indexes.length === 0) {
      console.log('[Patch] Adding index idx_otps_blocked...');
      await query('ALTER TABLE `otps` ADD INDEX `idx_otps_blocked` (`email`, `phone`, `blocked_until`)');
      console.log('[Patch] Index added!');
    }

    const updatedCols = await query('SHOW COLUMNS FROM otps');
    console.log('[Patch] Verified updated columns in otps:', updatedCols.map(c => c.Field).join(', '));
  } catch (error) {
    console.error('[Patch Error]:', error);
  } finally {
    await pool.end();
  }
};

patchOtps();
