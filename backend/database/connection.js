const mysql = require('mysql2/promise');
const config = require('../config');

const dbConfig = {
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.name,
  waitForConnections: true,
  connectionLimit: config.db.connectionLimit,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  dateStrings: true,
  ...(config.db.ssl ? { ssl: config.db.ssl } : {})
};

const pool = mysql.createPool(dbConfig);

/**
 * Execute a query with parameters
 */
const query = async (sql, params = []) => {
  try {
    const [results] = await pool.query(sql, params);
    return results;
  } catch (error) {
    if (!config.app.isProduction) {
      console.error('Database Query Error:', error.message, '\nSQL:', sql);
    } else {
      console.error('Database Query Error:', error.message);
    }
    throw error;
  }
};

/**
 * Execute a transaction with automatic rollback
 */
const transaction = async (callback) => {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  try {
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Test database connectivity
 */
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log(`[DB] Connected to MySQL database "${config.db.name}" at ${config.db.host}:${config.db.port}`);
    connection.release();
    return true;
  } catch (error) {
    console.error(`[DB Error] Failed to connect to MySQL database "${config.db.name}":`, error.message);
    return false;
  }
};

module.exports = {
  pool,
  query,
  transaction,
  testConnection,
  dbConfig
};
