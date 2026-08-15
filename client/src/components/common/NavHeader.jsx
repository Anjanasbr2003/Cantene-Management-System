import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Avatar, Tooltip, message, Dropdown } from 'antd';
import {
  Utensils,
  ChefHat,
  QrCode,
  BarChart3,
  ShoppingBag,
  Award,
  Globe,
  User,
  ShieldCheck,
  LogOut,
  LogIn,
  UserPlus,
  ChevronDown,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { logout, setDemoRole } from '../../store/authSlice';
import { toggleTheme } from '../../store/themeSlice';

export const NavHeader = ({ onOpenCart }) => {
  const { user, token } = useSelector((s) => s.auth);
  const { items: cartItems } = useSelector((s) => s.cart);
  const { orders } = useSelector((s) => s.orders);
  const { mode: themeMode } = useSelector((s) => s.theme || { mode: 'dark' });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);
  const currentRole = user?.role || 'guest';
  const isLoggedIn = !!token && !!user;

  const handleLogout = () => {
    dispatch(logout());
    message.success('Successfully signed out.');
    navigate('/login');
  };

  const handleSwitchDemoRole = (role) => {
    dispatch(setDemoRole(role));
    message.success(`Switched role to ${role.toUpperCase()}`);
    if (role === 'admin') navigate('/admin');
    else if (role === 'staff') navigate('/staff');
    else navigate('/menu');
  };

  const toggleLanguage = () => {
    const next = i18n.language === 'en' ? 'es' : 'en';
    i18n.changeLanguage(next);
    message.info(`Language switched to ${next.toUpperCase()}`);
  };

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
    message.info(`Switched to ${themeMode === 'dark' ? 'Light' : 'Dark'} Mode`);
  };

  // Determine Sub-Nav Title based on path
  const getSubNavTitle = () => {
    switch (location.pathname) {
      case '/menu':
        return 'Menu Gallery';
      case '/staff':
        return 'Kitchen Display System';
      case '/admin':
        return 'Executive Analytics';
      case '/tables':
        return 'Table QR & Dine-In';
      case '/orders':
        return 'Order Tracking & Status';
      case '/login':
        return 'Canteen Access Authentication';
      case '/register':
        return 'New Diner Registration';
      default:
        return 'Canteen Management System';
    }
  };

  const userMenuItems = [
    {
      key: 'profile-info',
      disabled: true,
      label: (
        <div style={{ padding: '4px 0' }}>
          <div style={{ fontWeight: 600, color: 'var(--color-ink)', fontSize: 14 }}>{user?.name || 'Guest Diner'}</div>
          <div style={{ fontSize: 12, color: 'var(--color-ink-muted-48)' }}>{user?.email || 'Not signed in'}</div>
          <div style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 9999, backgroundColor: 'rgba(0, 102, 204, 0.1)', color: 'var(--color-primary)', fontSize: 11, fontWeight: 600 }}>
            {currentRole.toUpperCase()} MODE
          </div>
        </div>
      )
    },
    { type: 'divider' },
    {
      key: 'switch-admin',
      icon: <ShieldCheck size={14} color="var(--color-primary)" />,
      label: 'Switch to Admin (Dr. Orion)',
      onClick: () => handleSwitchDemoRole('admin')
    },
    {
      key: 'switch-staff',
      icon: <ChefHat size={14} color="var(--color-success)" />,
      label: 'Switch to Kitchen Staff (Elena)',
      onClick: () => handleSwitchDemoRole('staff')
    },
    {
      key: 'switch-customer',
      icon: <User size={14} color="var(--color-warning)" />,
      label: 'Switch to Diner (Alex)',
      onClick: () => handleSwitchDemoRole('customer')
    },
    { type: 'divider' },
    isLoggedIn
      ? {
          key: 'logout-btn',
          icon: <LogOut size={14} color="var(--color-danger)" />,
          danger: true,
          label: 'Sign Out',
          onClick: handleLogout
        }
      : {
          key: 'login-btn',
          icon: <LogIn size={14} color="var(--color-primary)" />,
          label: 'Sign In',
          onClick: () => navigate('/login')
        }
  ];

  return (
    <>
      {/* 1. Liquid Glass Global Navigation Bar (64px, deep liquid frosted glass) */}
      <header className="global-nav-bar">
        <div
          className="apple-container-wide"
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 24
          }}
        >
          {/* Brand Logo with Liquid Glass Icon Container */}
          <Link
            to="/menu"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              textDecoration: 'none',
              color: 'var(--color-on-dark)',
              fontSize: 16,
              fontWeight: 600,
              letterSpacing: '-0.2px'
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--r-md)',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.22), rgba(255, 255, 255, 0.05))',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.4), 0 4px 12px rgba(0, 0, 0, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20
              }}
            >
              🍱
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, letterSpacing: '-0.3px' }}>
              Canteen Management System
            </span>
          </Link>

          {/* Desktop Global Nav Links with Liquid Glass Pill Styling */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Link
              to="/menu"
              className={`liquid-nav-link ${location.pathname === '/menu' ? 'active' : ''}`}
            >
              <Utensils size={15} />
              <span>Menu Gallery</span>
            </Link>

            <Link
              to="/tables"
              className={`liquid-nav-link ${location.pathname === '/tables' ? 'active' : ''}`}
            >
              <QrCode size={15} />
              <span>Table QR</span>
            </Link>

            <Link
              to="/orders"
              className={`liquid-nav-link ${location.pathname === '/orders' ? 'active' : ''}`}
            >
              <ShoppingBag size={15} />
              <span>Live Orders</span>
            </Link>

            {/* Staff Link */}
            <Link
              to="/staff"
              className={`liquid-nav-link ${location.pathname === '/staff' ? 'active' : ''}`}
            >
              <ChefHat size={15} />
              <span>Kitchen KDS</span>
            </Link>

            {/* Admin Link */}
            <Link
              to="/admin"
              className={`liquid-nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
            >
              <BarChart3 size={15} />
              <span>Executive Admin</span>
            </Link>
          </nav>

          {/* Right Action Cluster */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            
            {/* Language toggle in Liquid Glass Capsule */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={toggleLanguage}
              aria-label="Toggle language"
              className="liquid-glass-capsule"
              style={{
                border: '1px solid rgba(255, 255, 255, 0.16)',
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                height: 36
              }}
            >
              <Globe size={15} color="var(--color-primary-on-dark)" />
              <span>{i18n.language === 'en' ? 'EN' : 'ES'}</span>
            </motion.button>

            {/* Light / Dark Mode Toggle Button */}
            <Tooltip
              title={themeMode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              placement="bottom"
            >
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={handleThemeToggle}
                aria-label="Toggle theme mode"
                className="liquid-glass-capsule"
                style={{
                  border: '1px solid rgba(255, 255, 255, 0.16)',
                  color: themeMode === 'dark' ? '#ffd60a' : '#2997ff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 36,
                  height: 36,
                  padding: 0
                }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={themeMode}
                    initial={{ scale: 0.5, rotate: -90, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    exit={{ scale: 0.5, rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {themeMode === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
                  </motion.div>
                </AnimatePresence>
              </motion.button>
            </Tooltip>

            {/* Cart Bag Icon Button in Liquid Glass Capsule */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={onOpenCart}
              aria-label="Open cart bag"
              className="liquid-glass-capsule"
              style={{
                color: 'var(--color-on-dark)',
                cursor: 'pointer',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 38,
                height: 38,
                padding: 0
              }}
            >
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    minWidth: 18,
                    height: 18,
                    borderRadius: 9999,
                    backgroundColor: 'var(--color-primary)',
                    color: '#ffffff',
                    fontSize: 11,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px',
                    boxShadow: '0 2px 8px rgba(0, 102, 204, 0.6)'
                  }}
                >
                  {cartCount}
                </span>
              )}
            </motion.button>

            {/* User Account / Role Menu */}
            {isLoggedIn ? (
              <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
                <button
                  className="liquid-glass-capsule"
                  style={{
                    padding: '4px 12px 4px 6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    color: '#ffffff',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 500,
                    height: 38
                  }}
                >
                  <Avatar
                    size={26}
                    src={user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.name || 'alex'}`}
                  />
                  <span style={{ maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.name?.split(' ')[0] || 'User'}
                  </span>
                  <ChevronDown size={12} color="rgba(255, 255, 255, 0.7)" />
                </button>
              </Dropdown>
            ) : (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Link
                  to="/login"
                  className="button-primary"
                  style={{
                    fontSize: 13,
                    padding: '7px 16px',
                    height: 36
                  }}
                >
                  Sign In
                </Link>
              </div>
            )}

          </div>
        </div>
      </header>

      {/* 2. Liquid Glass Sub-Navigation Bar (58px, luminous parchment frosted glass) */}
      <nav className="sub-nav-frosted">
        <div
          className="apple-container-wide"
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16
          }}
        >
          {/* Left: Category / Section Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 22,
                fontWeight: 600,
                lineHeight: 1.15,
                letterSpacing: '-0.3px',
                color: 'var(--color-ink)'
              }}
            >
              {getSubNavTitle()}
            </span>

            {/* Loyalty points capsule if customer */}
            {user?.role === 'customer' && user?.loyaltyPoints !== undefined && (
              <div
                className="liquid-glass-capsule-light"
                style={{
                  height: 30,
                  padding: '4px 12px',
                  fontSize: 12.5,
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  color: 'var(--color-primary)'
                }}
              >
                <Award size={14} color="var(--color-primary)" />
                <span>{user.loyaltyPoints} Orbit Pts</span>
              </div>
            )}

            {/* Role badge if admin or staff */}
            {['admin', 'staff'].includes(user?.role) && (
              <span
                style={{
                  padding: '4px 12px',
                  borderRadius: 'var(--r-pill)',
                  backgroundColor: user.role === 'admin' ? 'rgba(0, 102, 204, 0.12)' : 'rgba(52, 199, 89, 0.16)',
                  color: user.role === 'admin' ? 'var(--color-primary)' : '#1e7b34',
                  fontSize: 11.5,
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  border: user.role === 'admin' ? '1px solid rgba(0, 102, 204, 0.2)' : '1px solid rgba(52, 199, 89, 0.25)'
                }}
              >
                {user.role.toUpperCase()} MODE
              </span>
            )}
          </div>

          {/* Right: Quick Action Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {location.pathname !== '/menu' && (
              <Link
                to="/menu"
                className="liquid-glass-capsule-light"
                style={{
                  textDecoration: 'none',
                  height: 36,
                  padding: '6px 14px',
                  fontSize: 13,
                  fontWeight: 500,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  color: 'var(--color-ink)'
                }}
              >
                <Utensils size={14} color="var(--color-primary)" />
                <span>View Menu</span>
              </Link>
            )}

            {location.pathname !== '/login' && !isLoggedIn && (
              <Link
                to="/login"
                className="button-primary"
                style={{ padding: '7px 18px', fontSize: 14, height: 36 }}
              >
                Sign In
              </Link>
            )}

            {isLoggedIn && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onOpenCart}
                className="button-primary"
                style={{
                  padding: '7px 18px',
                  fontSize: 14,
                  height: 36,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7
                }}
              >
                <ShoppingBag size={15} />
                <span>Bag ({cartCount})</span>
              </motion.button>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default NavHeader;
