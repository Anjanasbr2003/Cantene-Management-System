import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ConfigProvider, notification } from 'antd';
import io from 'socket.io-client';

import { darkTheme, lightTheme } from './theme/themeConfig';
import './i18n/i18n';
import NavHeader from './components/common/NavHeader';
import AppleFooter from './components/common/AppleFooter';
import CartDrawer from './components/cart/CartDrawer';
import ScrollToTop from './components/common/ScrollToTop';

import CustomerMenu from './pages/CustomerMenu';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StaffDashboard from './pages/StaffDashboard';
import AdminDashboard from './pages/AdminDashboard';
import TableQRView from './pages/TableQRView';
import OrderTracking from './pages/OrderTracking';

import { upsertOrder } from './store/orderSlice';
import { updateTableStatusLocally } from './store/tableSlice';
import { playOrderChime } from './utils/audio';

// Protected Route Component for Role Management
const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If not authorized for this specific portal, navigate to login or menu with message
    return (
      <div className="product-tile-parchment" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 540 }}>
          <span className="chip chip-rose" style={{ marginBottom: 16 }}>Access Restricted</span>
          <h2 className="display-md" style={{ color: 'var(--color-ink)', marginBottom: 12 }}>
            Elevated Role Credentials Required
          </h2>
          <p style={{ color: 'var(--color-ink-muted-80)', marginBottom: 24, fontSize: 17 }}>
            This portal is restricted to <strong>{allowedRoles.join(' / ').toUpperCase()}</strong> accounts. You are currently authenticated as <strong>{user.name} ({user.role})</strong>.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <a href="/login" className="button-primary">
              Switch Role Credentials
            </a>
            <a href="/menu" className="button-secondary-pill">
              Return to Diner Menu
            </a>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

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
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-canvas)' }}>
      <NavHeader onOpenCart={() => setCartOpen(true)} />
      
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/menu" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/menu" element={<CustomerMenu />} />
          <Route 
            path="/staff" 
            element={
              <RoleProtectedRoute allowedRoles={['staff', 'admin']}>
                <StaffDashboard />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <RoleProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </RoleProtectedRoute>
            } 
          />
          <Route path="/tables" element={<TableQRView />} />
          <Route path="/orders" element={<OrderTracking />} />
          <Route path="*" element={<Navigate to="/menu" replace />} />
        </Routes>
      </main>

      <AppleFooter />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
};

export const App = () => {
  const themeMode = useSelector((state) => state.theme?.mode || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
  }, [themeMode]);

  return (
    <ConfigProvider theme={themeMode === 'dark' ? darkTheme : lightTheme}>
      <BrowserRouter>
        <ScrollToTop />
        <AppContent />
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;
