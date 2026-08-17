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
    
    // Auto-update seed user password hashes to valid bcrypt hash for orbitcanteen2026
    const VALID_HASH = '$2a$10$DqxgVAupYb/eHn6iU19MtOmz0r/3TXroh/uVQKuCY2LwnnxbFcrOW';
    try {
      await connection.query(
        'UPDATE users SET password_hash = ? WHERE LOWER(email) IN (?, ?, ?, ?, ?, ?)',
        [VALID_HASH, 'admin@orbitcanteen.io', 'staff@orbitcanteen.io', 'customer@orbitcanteen.io', 'admin@antigravity.io', 'staff@antigravity.io', 'customer@antigravity.io']
      );
    } catch {
      // Ignore if table not yet populated
    }

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
