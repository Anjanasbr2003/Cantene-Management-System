const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'orbit_canteen',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function checkDatabaseHealth() {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT 1 + 1 AS solution');
    const [tableRows] = await connection.query('SHOW TABLES;');
    connection.release();
    console.log(`✅ [MySQL DB] Successfully connected to "${process.env.DB_NAME || 'orbit_canteen'}" on ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    console.log(`✅ [MySQL DB] Active tables: ${tableRows.length} tables found`);
    return true;
  } catch (error) {
    console.error('❌ [MySQL DB] Connection Error:', error.message);
    return false;
  }
}

module.exports = {
  pool,
  query: (sql, params) => pool.execute(sql, params),
  checkDatabaseHealth
};
