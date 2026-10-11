const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const config = require('../config');

const runMigration = async () => {
  const { host, port, user, password, name: database, ssl } = config.db;

  console.log(`[Migration] Connecting to MySQL server at ${host}:${port}...`);
  
  // Connect without DB first to ensure DB exists (skip in strict cloud environments where DB is pre-provisioned)
  try {
    const serverConn = await mysql.createConnection({
      host,
      port,
      user,
      password,
      ...(ssl ? { ssl } : {})
    });
    await serverConn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log(`[Migration] Database "${database}" verified/created successfully.`);
    await serverConn.end();
  } catch (dbCreateErr) {
    console.warn(`[Migration Notice] Could not create database directly (may already exist or insufficient permissions): ${dbCreateErr.message}`);
  }

  // Connect to the specific database
  const connection = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
    multipleStatements: true,
    ...(ssl ? { ssl } : {})
  });

  try {
    console.log(`[Migration] Reading schema.sql...`);
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log(`[Migration] Executing schema migrations on database "${database}"...`);
    await connection.query(schemaSql);
    console.log(`[Migration] All tables migrated successfully!`);

    // Verify created tables
    const [tables] = await connection.query('SHOW TABLES');
    const tableNames = tables.map(row => Object.values(row)[0]);
    console.log(`[Migration] Verified ${tableNames.length} tables in "${database}":`, tableNames.join(', '));
  } catch (error) {
    console.error(`[Migration Error] Failed to run migrations:`, error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
};

runMigration();
