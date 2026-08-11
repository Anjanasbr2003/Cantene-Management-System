const express = require('express');
const router = express.Router();
const mockStore = require('../utils/mockStore');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

// Get Orders (All for Admin/Staff, User-filtered for Customer)
router.get('/', verifyToken, (req, res) => {
  let orders = [...mockStore.orders];

  if (req.user.role === 'customer') {
    orders = orders.filter(o => o.customerId === req.user.id);
  }

  const { status, orderType } = req.query;
  if (status) {
    orders = orders.filter(o => o.status.toLowerCase() === status.toLowerCase());
  }

  if (orderType) {
    orders = orders.filter(o => o.orderType.toLowerCase() === orderType.toLowerCase());
  }

  res.json({ success: true, count: orders.length, data: orders });
});

// Get single order details
router.get('/:id', verifyToken, (req, res) => {
  const order = mockStore.orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }

  // Security check: customer can only view their own order
  if (req.user.role === 'customer' && order.customerId !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Forbidden.' });
  }

  res.json({ success: true, data: order });
});

// Place new order (Customer)
router.post('/', verifyToken, (req, res) => {
  const { items, orderType, tableNumber, deliveryAddress, paymentMethod, promoCode, loyaltyPointsToRedeem } = req.body;

  if (!items || !items.length) {
    return res.status(400).json({ success: false, message: 'Cart items required.' });
  }

  let subtotal = 0;
  const processedItems = items.map(cartItem => {
    const menuItem = mockStore.menuItems.find(m => m.id === cartItem.menuItemId);
    const basePrice = menuItem ? menuItem.price : cartItem.price || 5.0;
    
    // Size offset
    let sizeOffset = 0;
    if (menuItem && cartItem.selectedSize) {
      const sizeObj = menuItem.sizes.find(s => s.name === cartItem.selectedSize);
      if (sizeObj) sizeOffset = sizeObj.priceOffset;
    }

    // Add-on offset
    let addOnsPrice = 0;
    if (cartItem.selectedAddOns && cartItem.selectedAddOns.length) {
      addOnsPrice = cartItem.selectedAddOns.reduce((acc, a) => acc + (a.price || 0), 0);
    }

    // Happy Hour discount check
    let unitPrice = basePrice + sizeOffset + addOnsPrice;
    if (menuItem && menuItem.isHappyHourDiscount) {
      unitPrice = unitPrice * (1 - (menuItem.discountPercent / 100));
    }

    const itemTotal = unitPrice * cartItem.quantity;
    subtotal += itemTotal;

    return {
      menuItemId: cartItem.menuItemId,
      name: cartItem.name || (menuItem ? menuItem.name : 'Canteen Special'),
      selectedSize: cartItem.selectedSize || 'Standard',
      price: Number(unitPrice.toFixed(2)),
      quantity: Number(cartItem.quantity),
      selectedAddOns: cartItem.selectedAddOns || [],
      specialInstructions: cartItem.specialInstructions || ''
    };
  });

  // Calculate discount & loyalty points
  let discount = 0;
  let pointsRedeemed = Number(loyaltyPointsToRedeem) || 0;
  
  if (pointsRedeemed > 0) {
    const user = mockStore.users.find(u => u.id === req.user.id);
    if (user && user.loyaltyPoints >= pointsRedeemed) {
      discount = pointsRedeemed * 0.1; // 10 points = $1 discount
      user.loyaltyPoints -= pointsRedeemed;
    } else {
      pointsRedeemed = 0;
    }
  }

  if (promoCode === 'ORBIT10') {
    discount += subtotal * 0.1;
  }

  const tax = Number((subtotal * 0.08).toFixed(2)); // 8% Tax
  const totalAmount = Math.max(0, Number((subtotal - discount + tax).toFixed(2)));

  // Calculate earned loyalty points (1 point per $1 spent)
  const loyaltyEarned = Math.floor(totalAmount);
  const user = mockStore.users.find(u => u.id === req.user.id);
  if (user) {
    user.loyaltyPoints += loyaltyEarned;
  }

  const newOrder = {
    id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
    customerId: req.user.id,
    customerName: req.user.name,
    orderType: orderType || 'Dine-In',
    tableNumber: orderType === 'Dine-In' ? (tableNumber || 'T-01') : null,
    deliveryAddress: orderType === 'Delivery' ? deliveryAddress : null,
    status: 'Received',
    items: processedItems,
    subtotal: Number(subtotal.toFixed(2)),
    discount: Number(discount.toFixed(2)),
    tax,
    totalAmount,
    loyaltyPointsEarned: loyaltyEarned,
    loyaltyPointsRedeemed: pointsRedeemed,
    paymentMethod: paymentMethod || 'Card Online',
    paymentStatus: paymentMethod === 'Cash' ? 'Pending Cash' : 'Paid',
    estimatedPrepMinutes: 10 + processedItems.length * 2,
    createdAt: new Date().toISOString(),
    statusHistory: [
      { status: 'Received', timestamp: new Date().toISOString() }
    ]
  };

  mockStore.orders.unshift(newOrder);

  // Deplete stock automatically for linked items
  newOrder.items.forEach(item => {
    const menuItem = mockStore.menuItems.find(m => m.id === item.menuItemId);
    if (menuItem && menuItem.linkedInventoryIds) {
      menuItem.linkedInventoryIds.forEach(invId => {
        mockStore.logMovement({
          inventoryId: invId,
          type: 'Consumption',
          quantity: item.quantity,
          responsibleStaff: 'System Order Auto-Deplete',
          reason: `Consumption for Order ${newOrder.id}`
        });
      });
    }
  });

  // Socket.IO Emit to KDS kitchen room
  const io = req.app.get('io');
  if (io) {
    io.to('kds_room').emit('new_order', newOrder);
    io.to(`customer_${newOrder.customerId}`).emit('order_updated', newOrder);
  }

  res.status(201).json({ success: true, data: newOrder });
});

// Update Order Status (Staff & Admin)
router.patch('/:id/status', verifyToken, authorizeRoles('admin', 'staff'), (req, res) => {
  const { status, rejectReason } = req.body;
  const order = mockStore.orders.find(o => o.id === req.params.id);

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }

  const validStatuses = ['Received', 'Preparing', 'Ready', 'Served/Completed', 'Rejected', 'Cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid order status.' });
  }

  order.status = status;
  if (rejectReason) {
    order.rejectReason = rejectReason;
  }
  order.statusHistory.push({ status, timestamp: new Date().toISOString() });

  mockStore.addAuditLog('ORDER_STATUS_UPDATED', `${req.user.name} (${req.user.role})`, `Order ${order.id} status changed to "${status}"`);

  // Socket.IO Emit to customer and kitchen
  const io = req.app.get('io');
  if (io) {
    io.to('kds_room').emit('order_updated', order);
    io.to(`customer_${order.customerId}`).emit('order_updated', order);
  }

  res.json({ success: true, data: order });
});

// Cancel Order Request (Customer - permitted before "Preparing")
router.post('/:id/cancel', verifyToken, (req, res) => {
  const order = mockStore.orders.find(o => o.id === req.params.id);

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }

  if (order.customerId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Unauthorized cancellation.' });
  }

  if (order.status !== 'Received' && req.user.role !== 'admin') {
    return res.status(400).json({ success: false, message: 'Order cannot be cancelled after kitchen preparation has commenced.' });
  }

  order.status = 'Cancelled';
  order.statusHistory.push({ status: 'Cancelled', timestamp: new Date().toISOString() });

  // Refund simulation
  if (order.paymentStatus === 'Paid') {
    order.paymentStatus = 'Refunded';
  }

  const io = req.app.get('io');
  if (io) {
    io.to('kds_room').emit('order_updated', order);
    io.to(`customer_${order.customerId}`).emit('order_updated', order);
  }

  res.json({ success: true, message: 'Order successfully cancelled and refund initiated.', data: order });
});

module.exports = router;
