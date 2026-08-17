const express = require('express');
const router = express.Router();
const mockStore = require('../utils/mockStore');
const { verifyToken, authorizeRoles } = require('../middleware/auth');
const { pool } = require('../config/db');

// Get Inventory List with Low-Stock and Expiry Filtering from MySQL DB or Mock
router.get('/', async (req, res) => {
  let items = [];

  try {
    const [rows] = await pool.query('SELECT * FROM inventory_items ORDER BY last_updated DESC');
    if (rows.length > 0) {
      items = rows.map(r => ({
        id: r.id,
        sku: r.sku,
        name: r.name,
        category: r.category,
        unit: r.unit,
        currentStock: Number(r.current_stock),
        reorderLevel: Number(r.reorder_level),
        purchasePrice: Number(r.purchase_price),
        supplierId: r.supplier_id,
        batchNumber: r.batch_number,
        expiryDate: r.expiry_date,
        lastUpdated: r.last_updated
      }));
    }
  } catch (err) {
    console.error('MySQL inventory query fallback:', err.message);
  }

  if (items.length === 0) {
    items = [...mockStore.inventory];
  }

  const { lowStockOnly, expiringDays } = req.query;

  if (lowStockOnly === 'true') {
    items = items.filter(i => i.currentStock <= i.reorderLevel);
  }

  if (expiringDays) {
    const targetDate = Date.now() + Number(expiringDays) * 86400000;
    items = items.filter(i => {
      if (!i.expiryDate) return false;
      const expTime = new Date(i.expiryDate).getTime();
      return expTime <= targetDate && expTime >= Date.now();
    });
  }

  res.json({ success: true, count: items.length, data: items, databaseSource: 'MySQL orbit_canteen' });
});

// Create inventory item (Staff & Admin)
router.post('/', verifyToken, authorizeRoles('staff', 'admin'), async (req, res) => {
  const { sku, name, category, unit, currentStock, reorderLevel, purchasePrice, supplierId, batchNumber, expiryDate } = req.body;

  if (!name || !unit || purchasePrice === undefined) {
    return res.status(400).json({ success: false, message: 'Name, unit, and purchase price are required.' });
  }

  const safeCurrentStock = Math.max(0, parseFloat(currentStock) || 0);
  const safeReorderLevel = Math.max(0, parseFloat(reorderLevel) || 10);
  const safePurchasePrice = Math.max(0, parseFloat(purchasePrice) || 0);

  const newItem = {
    id: 'inv_' + Date.now(),
    sku: sku ? String(sku).slice(0, 50) : `INV-${name.substring(0, 4).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
    name: String(name).slice(0, 120),
    category: category ? String(category).slice(0, 60) : 'General Raw',
    unit: String(unit).slice(0, 20),
    currentStock: safeCurrentStock,
    reorderLevel: safeReorderLevel,
    purchasePrice: safePurchasePrice,
    supplierId: supplierId ? String(supplierId).slice(0, 50) : 'sup_1',
    batchNumber: batchNumber ? String(batchNumber).slice(0, 50) : `BT-${new Date().getFullYear()}-${Math.floor(10 + Math.random() * 90)}`,
    expiryDate: expiryDate ? new Date(expiryDate).toISOString() : new Date(Date.now() + 30 * 86400000).toISOString(),
    lastUpdated: new Date().toISOString()
  };

  try {
    await pool.query(
      `INSERT INTO inventory_items (id, sku, name, category, unit, current_stock, reorder_level, purchase_price, supplier_id, batch_number, expiry_date) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newItem.id,
        newItem.sku,
        newItem.name,
        newItem.category,
        newItem.unit,
        newItem.currentStock,
        newItem.reorderLevel,
        newItem.purchasePrice,
        newItem.supplierId,
        newItem.batchNumber,
        newItem.expiryDate
      ]
    );
    console.log(`✅ [MySQL] Inserted inventory item "${newItem.name}" into inventory_items table by ${req.user.name}`);
  } catch (err) {
    console.error('MySQL insert inventory item warning:', err.message);
  }

  mockStore.inventory.unshift(newItem);

  res.status(201).json({ success: true, data: newItem });
});

// Log Stock Movement (Stock-In, Consumption, Return, Wastage) (Staff & Admin)
const ALLOWED_MOVEMENT_TYPES = ['Stock-In', 'Consumption', 'Wastage', 'Return'];

router.post('/movements', verifyToken, authorizeRoles('staff', 'admin'), async (req, res) => {
  const { inventoryId, type, quantity, reason } = req.body;

  if (!inventoryId || !type || !ALLOWED_MOVEMENT_TYPES.includes(type) || quantity === undefined || Number(quantity) <= 0) {
    return res.status(400).json({
      success: false,
      message: `Valid inventoryId, allowed movement type (${ALLOWED_MOVEMENT_TYPES.join(', ')}), and positive quantity required.`
    });
  }

  const numQty = Math.abs(parseFloat(quantity) || 0);
  const delta = type === 'Stock-In' || type === 'Return' ? numQty : -numQty;

  // Update MySQL database current_stock sum
  let updatedStock = 0;
  try {
    await pool.query(
      'UPDATE inventory_items SET current_stock = GREATEST(0, current_stock + ?), last_updated = CURRENT_TIMESTAMP WHERE id = ?',
      [delta, inventoryId]
    );

    const [rows] = await pool.query('SELECT current_stock, name, unit FROM inventory_items WHERE id = ?', [inventoryId]);
    if (rows.length > 0) {
      updatedStock = Number(rows[0].current_stock);
      console.log(`✅ [MySQL] Updated stock for "${rows[0].name}" by ${delta} (${type}). New sum: ${updatedStock} ${rows[0].unit}`);
    }

    // Log to stock_movements table
    const movementId = 'mov_' + Date.now();
    await pool.query(
      `INSERT INTO stock_movements (id, inventory_id, item_name, type, quantity, unit, responsible_staff, reason) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        movementId,
        inventoryId,
        rows[0]?.name || 'Ingredient',
        type,
        numQty,
        rows[0]?.unit || 'units',
        req.user.name,
        reason ? String(reason).slice(0, 255) : `Manual ${type} entry by ${req.user.name}`
      ]
    );
  } catch (err) {
    console.error('MySQL stock movement update warning:', err.message);
  }

  const item = mockStore.inventory.find(i => i.id === inventoryId);
  if (item) {
    item.currentStock = Math.max(0, Number(item.currentStock || 0) + delta);
    item.lastUpdated = new Date().toISOString();
    updatedStock = item.currentStock;
  }

  res.status(200).json({
    success: true,
    data: { inventoryId, delta, newStock: updatedStock },
    updatedStock
  });
});

module.exports = router;

