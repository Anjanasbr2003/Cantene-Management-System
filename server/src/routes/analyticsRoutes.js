const express = require('express');
const router = express.Router();
const mockStore = require('../utils/mockStore');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

// Get Sales Dashboard Metrics (Admin)
router.get('/dashboard', verifyToken, authorizeRoles('admin'), (req, res) => {
  const completedOrders = mockStore.orders.filter(o => o.status === 'Completed' || o.status === 'Served/Completed' || o.status === 'Ready' || o.status === 'Preparing');
  
  const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalOrdersCount = mockStore.orders.length;
  const averageOrderValue = completedOrders.length > 0 ? (totalRevenue / completedOrders.length) : 0;
  
  const activeTablesCount = mockStore.tables.filter(t => t.status === 'Occupied').length;
  const pendingOrdersCount = mockStore.orders.filter(o => o.status === 'Received' || o.status === 'Preparing').length;

  // Sales Trends (Daily Breakdown Mock)
  const salesTrends = [
    { day: 'Mon', revenue: 420.5, orders: 28 },
    { day: 'Tue', revenue: 580.0, orders: 36 },
    { day: 'Wed', revenue: 710.2, orders: 44 },
    { day: 'Thu', revenue: 640.8, orders: 39 },
    { day: 'Fri', revenue: 990.0, orders: 62 },
    { day: 'Sat', revenue: 1240.5, orders: 85 },
    { day: 'Sun', revenue: totalRevenue > 0 ? Number((totalRevenue).toFixed(2)) : 880.0, orders: totalOrdersCount }
  ];

  // Top Selling Menu Items
  const itemCounts = {};
  mockStore.orders.forEach(ord => {
    ord.items.forEach(it => {
      itemCounts[it.name] = (itemCounts[it.name] || 0) + it.quantity;
    });
  });

  const topSellingItems = Object.keys(itemCounts)
    .map(name => ({ name, count: itemCounts[name] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Peak Ordering Hours Breakdown
  const peakHours = [
    { hour: '08:00 AM - 10:00 AM', orders: 18, label: 'Breakfast Rush' },
    { hour: '12:00 PM - 02:00 PM', orders: 48, label: 'Lunch Peak' },
    { hour: '03:00 PM - 05:00 PM', orders: 15, label: 'Coffee & Snacks' },
    { hour: '06:00 PM - 08:30 PM', orders: 35, label: 'Dinner Shift' }
  ];

  res.json({
    success: true,
    data: {
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalOrdersCount,
      averageOrderValue: Number(averageOrderValue.toFixed(2)),
      activeTablesCount,
      pendingOrdersCount,
      salesTrends,
      topSellingItems,
      peakHours
    }
  });
});

// Audit logs
router.get('/audit-logs', verifyToken, authorizeRoles('admin'), (req, res) => {
  res.json({ success: true, count: mockStore.auditLogs.length, data: mockStore.auditLogs });
});

module.exports = router;
