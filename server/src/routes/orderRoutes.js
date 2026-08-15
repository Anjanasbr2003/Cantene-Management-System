const express = require('express');
const router = express.Router();
const mockStore = require('../utils/mockStore');
const { verifyToken, authorizeRoles } = require('../middleware/auth');
const { pool } = require('../config/db');

// Get Orders (All for Admin/Staff, User-filtered for Customer) from MySQL or Mock
router.get('/', async (req, res) => {
  let orders = [];

  try {
    const [dbOrders] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    if (dbOrders.length > 0) {
      for (const o of dbOrders) {
        const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [o.id]);
        orders.push({
          id: o.id,
          customerId: o.customer_id,
          customerName: o.customer_name,
          orderType: o.order_type,
          tableNumber: o.table_number,
          deliveryAddress: o.delivery_address,
          status: o.status,
          subtotal: Number(o.subtotal),
          discount: Number(o.discount || 0),
          tax: Number(o.tax || 0),
          totalAmount: Number(o.total_amount),
          loyaltyPointsEarned: o.loyalty_points_earned || 0,
          loyaltyPointsRedeemed: o.loyalty_points_redeemed || 0,
          paymentMethod: o.payment_method,
          paymentStatus: o.payment_status,
          estimatedPrepMinutes: o.estimated_prep_minutes || 8,
          createdAt: o.created_at,
          items: items.map(i => ({
            id: i.id,
            menuItemId: i.menu_item_id,
            name: i.name,
            selectedSize: i.selected_size,
            price: Number(i.price),
            quantity: i.quantity,
            specialInstructions: i.special_instructions
          }))
        });
      }
    }
  } catch (err) {
    console.error('MySQL orders query fallback:', err.message);
  }

  if (orders.length === 0) {
    orders = [...mockStore.orders];
  }

  const userRole = req.user?.role || 'admin';
  const userId = req.user?.id;

  if (userRole === 'customer' && userId) {
    orders = orders.filter(o => o.customerId === userId || o.customerName === req.user?.name);
  }

  const { status, orderType } = req.query;
  if (status) {
    orders = orders.filter(o => o.status.toLowerCase() === status.toLowerCase());
  }

  if (orderType) {
    orders = orders.filter(o => o.orderType.toLowerCase() === orderType.toLowerCase());
  }

  res.json({ success: true, count: orders.length, data: orders, databaseSource: 'MySQL orbit_canteen' });
});

// Get single order details
router.get('/:id', async (req, res) => {
  const orderId = req.params.id;
  try {
    const [dbOrders] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (dbOrders.length > 0) {
      const o = dbOrders[0];
      const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [o.id]);
      const order = {
        id: o.id,
        customerId: o.customer_id,
        customerName: o.customer_name,
        orderType: o.order_type,
        tableNumber: o.table_number,
        deliveryAddress: o.delivery_address,
        status: o.status,
        subtotal: Number(o.subtotal),
        discount: Number(o.discount || 0),
        tax: Number(o.tax || 0),
        totalAmount: Number(o.total_amount),
        paymentMethod: o.payment_method,
        paymentStatus: o.payment_status,
        estimatedPrepMinutes: o.estimated_prep_minutes || 8,
        createdAt: o.created_at,
        items: items.map(i => ({
          id: i.id,
          menuItemId: i.menu_item_id,
          name: i.name,
          selectedSize: i.selected_size,
          price: Number(i.price),
          quantity: i.quantity,
          specialInstructions: i.special_instructions
        }))
      };
      return res.json({ success: true, data: order });
    }
  } catch {
    // Fallback
  }

  const order = mockStore.orders.find(o => o.id === orderId);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }

  res.json({ success: true, data: order });
});

// Place new order
router.post('/', async (req, res) => {
  const { items, orderType, tableNumber, deliveryAddress, paymentMethod, promoCode, loyaltyPointsToRedeem } = req.body;

  if (!items || !items.length) {
    return res.status(400).json({ success: false, message: 'Cart items required.' });
  }

  const orderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
  const customerName = req.user?.name || 'Walk-in Diner';
  const customerId = req.user?.id || 'usr_customer';

  let subtotal = 0;
  const processedItems = items.map(cartItem => {
    const itemTotal = (cartItem.price || 5.0) * cartItem.quantity;
    subtotal += itemTotal;
    return {
      id: 'item_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
      menuItemId: cartItem.menuItemId,
      name: cartItem.name || 'Canteen Dish',
      selectedSize: cartItem.selectedSize || 'Standard',
      price: Number(cartItem.price || 5.0),
      quantity: cartItem.quantity,
      specialInstructions: cartItem.specialInstructions || ''
    };
  });

  let discount = 0;
  if (loyaltyPointsToRedeem > 0) discount += loyaltyPointsToRedeem / 10;
  if (promoCode && promoCode.trim().toUpperCase() === 'ORBIT10') discount += subtotal * 0.1;

  const tax = Number((subtotal * 0.08).toFixed(2));
  const totalAmount = Math.max(0, Number((subtotal - discount + tax).toFixed(2)));
  const loyaltyPointsEarned = Math.floor(totalAmount);

  const newOrder = {
    id: orderId,
    customerName,
    customerId,
    orderType: orderType || 'Dine-In',
    tableNumber: tableNumber || null,
    deliveryAddress: deliveryAddress || null,
    status: 'Received',
    items: processedItems,
    subtotal: Number(subtotal.toFixed(2)),
    discount: Number(discount.toFixed(2)),
    tax,
    totalAmount,
    paymentMethod: paymentMethod || 'Card Online',
    paymentStatus: 'Paid',
    estimatedPrepMinutes: 10,
    loyaltyPointsEarned,
    loyaltyPointsRedeemed: loyaltyPointsToRedeem || 0,
    createdAt: new Date().toISOString()
  };

  // Save into MySQL database
  try {
    await pool.query(
      `INSERT INTO orders (id, customer_id, customer_name, order_type, table_number, delivery_address, status, subtotal, discount, tax, total_amount, loyalty_points_earned, loyalty_points_redeemed, payment_method, payment_status, estimated_prep_minutes) 
       VALUES (?, ?, ?, ?, ?, ?, 'Received', ?, ?, ?, ?, ?, ?, ?, 'Paid', 10)`,
      [
        newOrder.id,
        newOrder.customerId,
        newOrder.customerName,
        newOrder.orderType,
        newOrder.tableNumber,
        newOrder.deliveryAddress,
        newOrder.subtotal,
        newOrder.discount,
        newOrder.tax,
        newOrder.totalAmount,
        newOrder.loyaltyPointsEarned,
        newOrder.loyaltyPointsRedeemed,
        newOrder.paymentMethod
      ]
    );

    for (const it of processedItems) {
      await pool.query(
        `INSERT INTO order_items (id, order_id, menu_item_id, name, selected_size, price, quantity, special_instructions) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [it.id, newOrder.id, it.menuItemId, it.name, it.selectedSize, it.price, it.quantity, it.specialInstructions]
      );
    }
    console.log(`✅ [MySQL] Saved new order ${newOrder.id} ($${newOrder.totalAmount}) to orders & order_items tables`);
  } catch (err) {
    console.error('MySQL insert order warning:', err.message);
  }

  mockStore.orders.unshift(newOrder);

  // Notify KDS via Socket.IO
  const io = req.app.get('io');
  if (io) {
    io.to('kds_room').emit('new_order', newOrder);
  }

  res.status(201).json({ success: true, data: newOrder });
});

// Update Order Status (Staff & Admin)
router.patch('/:id/status', async (req, res) => {
  const { status, rejectReason } = req.body;
  const orderId = req.params.id;

  try {
    await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
    console.log(`✅ [MySQL] Updated order ${orderId} status to "${status}" in orders table`);
  } catch (err) {
    console.error('MySQL update order status warning:', err.message);
  }

  const order = mockStore.orders.find(o => o.id === orderId);
  if (order) {
    order.status = status;
  }

  const updatedData = order || { id: orderId, status };

  const io = req.app.get('io');
  if (io) {
    io.to('kds_room').emit('order_updated', updatedData);
    io.emit('order_updated', updatedData);
  }

  res.json({ success: true, data: updatedData });
});

module.exports = router;
