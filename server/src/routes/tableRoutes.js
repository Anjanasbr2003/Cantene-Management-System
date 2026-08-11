const express = require('express');
const router = express.Router();
const mockStore = require('../utils/mockStore');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

// Get all tables
router.get('/', (req, res) => {
  res.json({ success: true, count: mockStore.tables.length, data: mockStore.tables });
});

// Update table session status (Vacant, Occupied, Reserved, Cleaning) (Staff & Admin)
router.patch('/:id/status', verifyToken, authorizeRoles('admin', 'staff'), (req, res) => {
  const { status } = req.body;
  const table = mockStore.tables.find(t => t.id === req.params.id || t.tableNumber === req.params.id);

  if (!table) {
    return res.status(404).json({ success: false, message: 'Table not found.' });
  }

  table.status = status;
  if (status === 'Vacant' || status === 'Cleaning') {
    table.activeOrderId = null;
  }

  mockStore.addAuditLog('TABLE_STATUS_UPDATED', `${req.user.name} (${req.user.role})`, `Table ${table.tableNumber} updated to ${status}`);

  const io = req.app.get('io');
  if (io) {
    io.emit('table_status_changed', table);
  }

  res.json({ success: true, data: table });
});

// Create/Register new table (Admin)
router.post('/', verifyToken, authorizeRoles('admin'), (req, res) => {
  const { tableNumber, capacity } = req.body;
  if (!tableNumber) {
    return res.status(400).json({ success: false, message: 'Table number is required.' });
  }

  const newTable = {
    id: 'tbl_' + Date.now(),
    tableNumber,
    capacity: Number(capacity) || 4,
    status: 'Vacant',
    activeOrderId: null,
    qrCodeUrl: tableNumber
  };

  mockStore.tables.push(newTable);
  res.status(201).json({ success: true, data: newTable });
});

module.exports = router;
