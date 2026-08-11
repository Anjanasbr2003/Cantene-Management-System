import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ConfigProvider, notification } from 'antd';
import io from 'socket.io-client';

import { appleTheme } from './theme/themeConfig';
import './i18n/i18n';
import NavHeader from './components/common/NavHeader';
import CartDrawer from './components/cart/CartDrawer';

import CustomerMenu from './pages/CustomerMenu';
import StaffDashboard from './pages/StaffDashboard';
import AdminDashboard from './pages/AdminDashboard';
import TableQRView from './pages/TableQRView';
import OrderTracking from './pages/OrderTracking';

import { upsertOrder } from './store/orderSlice';
import { updateTableStatusLocally } from './store/tableSlice';
import { playOrderChime } from './utils/audio';

export const AppContent = () => {
  const [cartOpen, setCartOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // Socket.IO Real-Time Client Hook
  useEffect(() => {
    const socket = io('http://localhost:5000', {
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('[Socket.IO Client] Connected to server:', socket.id);
      socket.emit('join_kds');
      if (user?.id) {
        socket.emit('join_customer', user.id);
      }
    });

    socket.on('new_order', (newOrder) => {
      dispatch(upsertOrder(newOrder));
      playOrderChime();
      notification.info({
        message: '🚨 New Kitchen Order Received!',
        description: `Order ${newOrder.id} for ${newOrder.customerName} (${newOrder.orderType})`,
        placement: 'bottomRight'
      });
    });

    socket.on('order_updated', (updatedOrder) => {
      dispatch(upsertOrder(updatedOrder));
      notification.success({
        message: `Order Status Updated: ${updatedOrder.id}`,
        description: `Status changed to "${updatedOrder.status}"`,
        placement: 'bottomRight'
      });
    });

    socket.on('table_status_changed', (table) => {
      dispatch(updateTableStatusLocally({ id: table.id, status: table.status }));
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch, user]);

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-base)' }}>
      <NavHeader onOpenCart={() => setCartOpen(true)} />
      
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/menu" replace />} />
          <Route path="/menu" element={<CustomerMenu />} />
          <Route path="/staff" element={<StaffDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/tables" element={<TableQRView />} />
          <Route path="/orders" element={<OrderTracking />} />
          <Route path="*" element={<Navigate to="/menu" replace />} />
        </Routes>
      </main>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
};

export const App = () => {
  return (
    <ConfigProvider theme={appleTheme}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;
