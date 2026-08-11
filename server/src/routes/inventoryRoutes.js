const express = require('express');
const router = express.Router();
const mockStore = require('../utils/mockStore');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

// Get Inventory List with Low-Stock and Expiry Filtering
router.get('/', verifyToken, authorizeRoles('admin', 'staff'), (req, res) => {
  const { lowStockOnly, expiringDays } = req.query;
  let items = [...mockStore.inventory];

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

  res.json({ success: true, count: items.length, data: items });
});

// Create inventory item (Admin only)
router.post('/', verifyToken, authorizeRoles('admin'), (req, res) => {
  const { sku, name, category, unit, currentStock, reorderLevel, purchasePrice, supplierId, batchNumber, expiryDate } = req.body;

  if (!name || !unit || purchasePrice === undefined) {
    return res.status(400).json({ success: false, message: 'Name, unit, and purchase price required.' });
  }

  const newItem = {
    id: 'inv_' + Date.now(),
    sku: sku || `INV-${name.substring(0, 4).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
    name,
    category: category || 'General Raw',
    unit,
    currentStock: Number(currentStock) || 0,
    reorderLevel: Number(reorderLevel) || 10,
    purchasePrice: Number(purchasePrice),
    supplierId: supplierId || 'sup_1',
    batchNumber: batchNumber || `BT-${new Date().getFullYear()}-${Math.floor(10 + Math.random() * 90)}`,
    expiryDate: expiryDate || new Date(Date.now() + 30 * 86400000).toISOString(),
    lastUpdated: new Date().toISOString()
  };

  mockStore.inventory.push(newItem);
  mockStore.addAuditLog('INVENTORY_ITEM_CREATED', `${req.user.name} (${req.user.role})`, `Added "${name}" to inventory`);

  res.status(201).json({ success: true, data: newItem });
});

// Update inventory item (Admin only)
router.put('/:id', verifyToken, authorizeRoles('admin'), (req, res) => {
  const item = mockStore.inventory.find(i => i.id === req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Inventory item not found.' });
  }

  Object.assign(item, req.body, { lastUpdated: new Date().toISOString() });
  mockStore.addAuditLog('INVENTORY_ITEM_UPDATED', `${req.user.name} (${req.user.role})`, `Updated inventory item "${item.name}"`);

  res.json({ success: true, data: item });
});

// Log Stock Movement (In, Return, Consumption, Wastage) (Admin & Staff)
router.post('/movements', verifyToken, authorizeRoles('admin', 'staff'), (req, res) => {
  const { inventoryId, type, quantity, reason, batchNumber } = req.body;

  const item = mockStore.inventory.find(i => i.id === inventoryId);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Inventory item not found.' });
  }

  if (!type || !quantity || Number(quantity) <= 0) {
    return res.status(400).json({ success: false, message: 'Valid movement type and quantity required.' });
  }

  const movement = mockStore.logMovement({
    inventoryId,
    itemName: item.name,
    type,
    quantity: Number(quantity),
    unit: item.unit,
    batchNumber: batchNumber || item.batchNumber,
    responsibleStaff: req.user.name,
    reason: reason || `Manual ${type} entry`
  });

  mockStore.addAuditLog(
    'STOCK_MOVEMENT_LOGGED',
    `${req.user.name} (${req.user.role})`,
    `Logged ${type} of ${quantity} ${item.unit} for "${item.name}"`
  );

  res.status(201).json({ success: true, data: movement, updatedStock: item.currentStock });
});

// Get Stock Movement Audit Logs
router.get('/movements', verifyToken, authorizeRoles('admin', 'staff'), (req, res) => {
  res.json({ success: true, count: mockStore.stockMovements.length, data: mockStore.stockMovements });
});

// Expiry Radar Widget (7 and 30 Days)
router.get('/expiry-radar', verifyToken, authorizeRoles('admin', 'staff'), (req, res) => {
  const now = Date.now();
  const day7 = now + 7 * 86400000;
  const day30 = now + 30 * 86400000;

  const expiringIn7 = mockStore.inventory.filter(i => {
    if (!i.expiryDate) return false;
    const t = new Date(i.expiryDate).getTime();
    return t >= now && t <= day7;
  });

  const expiringIn30 = mockStore.inventory.filter(i => {
    if (!i.expiryDate) return false;
    const t = new Date(i.expiryDate).getTime();
    return t >= now && t <= day30;
  });

  res.json({
    success: true,
    data: {
      expiring7DaysCount: expiringIn7.length,
      expiring30DaysCount: expiringIn30.length,
      expiring7DaysItems: expiringIn7,
      expiring30DaysItems: expiringIn30
    }
  });
});

// Generate Purchase Order from Low-Stock Screen (Admin)
router.post('/generate-po', verifyToken, authorizeRoles('admin'), (req, res) => {
  const lowStockItems = mockStore.inventory.filter(i => i.currentStock <= i.reorderLevel);

  const purchaseOrders = lowStockItems.map(item => {
    const supplier = mockStore.suppliers.find(s => s.id === item.supplierId) || mockStore.suppliers[0];
    const suggestedQuantity = Math.max(item.reorderLevel * 3, 20);
    return {
      poNumber: `PO-${Date.now().toString().slice(-6)}-${item.sku.slice(-2)}`,
      inventoryId: item.id,
      itemName: item.name,
      supplierName: supplier.name,
      supplierContact: supplier.contact,
      quantityRequested: suggestedQuantity,
      unit: item.unit,
      estimatedCost: (suggestedQuantity * item.purchasePrice).toFixed(2),
      status: 'Generated & Sent',
      createdAt: new Date().toISOString()
    };
  });

  mockStore.addAuditLog('PURCHASE_ORDER_GENERATED', `${req.user.name} (${req.user.role})`, `Generated ${purchaseOrders.length} purchase orders for low-stock items.`);

  res.json({ success: true, count: purchaseOrders.length, data: purchaseOrders });
});

// FIFO Inventory Valuation
router.get('/valuation', verifyToken, authorizeRoles('admin'), (req, res) => {
  let totalValue = 0;
  const categoryBreakdown = {};

  mockStore.inventory.forEach(item => {
    const itemVal = item.currentStock * item.purchasePrice;
    totalValue += itemVal;
    
    if (!categoryBreakdown[item.category]) {
      categoryBreakdown[item.category] = { stockCount: 0, totalValuation: 0 };
    }
    categoryBreakdown[item.category].stockCount += item.currentStock;
    categoryBreakdown[item.category].totalValuation += itemVal;
  });

  res.json({
    success: true,
    data: {
      fifoTotalValuation: totalValue.toFixed(2),
      totalUniqueItems: mockStore.inventory.length,
      categoryBreakdown
    }
  });
});

module.exports = router;
