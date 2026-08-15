const express = require('express');
const router = express.Router();
const mockStore = require('../utils/mockStore');
const { verifyToken, authorizeRoles } = require('../middleware/auth');
const { pool } = require('../config/db');

// Get all tables from MySQL DB or Mock
router.get('/', async (req, res) => {
  let tables = [];
  try {
    const [rows] = await pool.query('SELECT * FROM canteen_tables ORDER BY number ASC');
    if (rows.length > 0) {
      tables = rows.map(r => ({
        id: r.id,
        number: r.number || r.table_number,
        tableNumber: r.number || r.table_number,
        capacity: r.capacity,
        status: r.status,
        currentOrderId: r.current_order_id,
        qrCodeUrl: r.qr_code_url || `http://localhost:3000/menu?table=${r.number}`
      }));
    }
  } catch (err) {
    console.error('MySQL tables query fallback:', err.message);
  }

  if (tables.length === 0) {
    tables = mockStore.tables;
  }

  res.json({ success: true, count: tables.length, data: tables, databaseSource: 'MySQL orbit_canteen' });
});

// Update table session status (Vacant/Available, Occupied, Reserved, Cleaning)
router.patch('/:id/status', async (req, res) => {
  const { status } = req.body;
  const tableId = req.params.id;

  try {
    await pool.query('UPDATE canteen_tables SET status = ? WHERE id = ? OR number = ?', [status, tableId, tableId]);
    console.log(`✅ [MySQL] Updated canteen_tables ID/Number "${tableId}" to status "${status}"`);
  } catch (err) {
    console.error('MySQL table update warning:', err.message);
  }

  const table = mockStore.tables.find(t => t.id === tableId || t.tableNumber === tableId || t.number === tableId);
  if (table) {
    table.status = status;
  }

  const io = req.app.get('io');
  if (io) {
    io.emit('table_status_changed', { id: tableId, status });
  }

  res.json({ success: true, data: { id: tableId, status } });
});

module.exports = router;
