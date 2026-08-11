import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Avatar, Drawer, Tooltip, Modal, message } from 'antd';
import {
  Utensils, ChefHat, QrCode, BarChart3,
  ShoppingBag, Award, Globe, User, Bell, Lock, Eye, EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { setDemoRole } from '../../store/authSlice';

const ADMIN_PASSWORD = 'admin123';
const STAFF_PASSWORD = 'staff123';
const springConfig = { type: 'spring', bounce: 0, duration: 0.35 };

export const NavHeader = ({ onOpenCart }) => {
  const { user } = useSelector((s) => s.auth);
  const { items: cartItems } = useSelector((s) => s.cart);
  const { orders } = useSelector((s) => s.orders);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const [notifOpen, setNotifOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingRole, setPendingRole] = useState(null);
  const [showPw, setShowPw] = useState(false);
  const [pwValue, setPwValue] = useState('');
  const [pwError, setPwError] = useState('');

  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);
  const currentRole = user?.role || 'customer';

  const handleRoleRequest = (role) => {
    if (role === 'customer') {
      dispatch(setDemoRole('customer'));
      navigate('/menu');
      return;
    }
    setPendingRole(role);
    setPwValue('');
    setPwError('');
    setAuthModalOpen(true);
  };

  const handlePasswordConfirm = () => {
    const expected = pendingRole === 'admin' ? ADMIN_PASSWORD : STAFF_PASSWORD;
    if (pwValue !== expected) {
      setPwError('Incorrect password. Please try again.');
      return;
    }
    dispatch(setDemoRole(pendingRole));
    navigate(pendingRole === 'admin' ? '/admin' : '/staff');
    setAuthModalOpen(false);
    setPwValue('');
    setPwError('');
    message.success(`Switched to ${pendingRole} mode.`);
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'es' : 'en');
  };

  const navLinks = [
    { path: '/menu', icon: Utensils, label: t('menu'), always: true },
    { path: '/staff', icon: ChefHat, label: t('kds'), roles: ['admin', 'staff'] },
    { path: '/admin', icon: BarChart3, label: t('analytics'), roles: ['admin'] },
    { path: '/tables', icon: QrCode, label: t('tables'), always: true },
    { path: '/orders', icon: ShoppingBag, label: t('orders'), always: true },
  ];

  const visibleLinks = navLinks.filter(l =>
    l.always || (l.roles && l.roles.includes(currentRole))
  );

  const alertCount = orders.filter(o => ['Received', 'Ready'].includes(o.status)).length;

  const iconBtnStyle = {
    width: 36, height: 36, borderRadius: '50%', border: 'none',
    background: 'transparent', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--text-secondary)',
  };

  return (
    <>
      <header className="glass-nav" style={{ position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{
          maxWidth: 980, margin: '0 auto', padding: '0 22px',
          height: 48, display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 16,
        }}>
          {/* Brand */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            transition={springConfig}
            onClick={() => navigate('/menu')}
            style={{
              display: 'flex', alignItems: 'center', gap: 0,
              background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0,
            }}
          >
            <span style={{
              fontSize: 21, fontWeight: 600, fontFamily: 'var(--font-display)',
              color: 'var(--text-primary)', letterSpacing: '-0.022em',
            }}>
              Orbit
            </span>
          </motion.button>

          {/* Nav links — Apple-style minimal text nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, justifyContent: 'center' }}>
            {visibleLinks.map(({ path, label }) => {
              const isActive = location.pathname === path;
              return (
                <motion.button
                  key={path}
                  whileTap={{ scale: 0.94 }}
                  transition={springConfig}
                  onClick={() => navigate(path)}
                  style={{
                    padding: '6px 12px', borderRadius: 'var(--r-pill)', border: 'none',
                    cursor: 'pointer', fontSize: 12, fontWeight: 400,
                    fontFamily: 'var(--font-ui)', letterSpacing: 0,
                    background: isActive ? 'rgba(0,0,0,0.04)' : 'transparent',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    transition: 'color 150ms ease, background 150ms ease',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = 'var(--text-primary)'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  <span className="nav-label">{label}</span>
                </motion.button>
              );
            })}
          </nav>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>

            {/* Role switcher — compact pill */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 2,
              background: 'var(--bg-secondary)', borderRadius: 'var(--r-pill)',
              padding: '2px 4px', height: 28,
            }}>
              {(['customer', 'staff', 'admin']).map((role) => (
                <motion.button
                  key={role}
                  whileTap={{ scale: 0.90 }}
                  transition={springConfig}
                  onClick={() => handleRoleRequest(role)}
                  style={{
                    padding: '2px 10px', borderRadius: 'var(--r-pill)', border: 'none', cursor: 'pointer',
                    fontSize: 11, fontWeight: 500, textTransform: 'capitalize',
                    fontFamily: 'var(--font-ui)',
                    background: currentRole === role ? 'var(--bg-elevated)' : 'transparent',
                    color: currentRole === role ? 'var(--text-primary)' : 'var(--text-tertiary)',
                    boxShadow: currentRole === role ? 'var(--shadow-sm)' : 'none',
                    transition: 'all 150ms ease',
                  }}
                >
                  {role !== 'customer' && <Lock size={8} style={{ display: 'inline', marginRight: 3, verticalAlign: 'middle' }} />}
                  {role}
                </motion.button>
              ))}
            </div>

            <Tooltip title={i18n.language === 'en' ? 'Español' : 'English'}>
              <motion.button whileTap={{ scale: 0.90 }} transition={springConfig} onClick={toggleLanguage} style={iconBtnStyle}>
                <Globe size={15} />
              </motion.button>
            </Tooltip>

            <div style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '4px 10px', borderRadius: 'var(--r-pill)',
              background: 'var(--amber-light)',
            }}>
              <Award size={12} color="var(--amber)" />
              <span style={{ fontSize: 12, fontWeight: 500, color: '#c93400' }}>
                {user?.loyaltyPoints ?? 0}
              </span>
            </div>

            <Tooltip title="Alerts">
              <motion.div whileTap={{ scale: 0.90 }} transition={springConfig} style={{ position: 'relative' }}>
                <button onClick={() => setNotifOpen(true)} style={iconBtnStyle}>
                  <Bell size={15} />
                </button>
                {alertCount > 0 && (
                  <span style={{
                    position: 'absolute', top: 2, right: 2, width: 14, height: 14,
                    background: 'var(--rose)', borderRadius: '50%',
                    fontSize: 9, fontWeight: 600, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {alertCount}
                  </span>
                )}
              </motion.div>
            </Tooltip>

            <motion.button
              whileTap={{ scale: 0.94 }}
              transition={springConfig}
              onClick={onOpenCart}
              className="btn-primary"
              style={{ height: 32, padding: '0 16px', fontSize: 12, position: 'relative' }}
            >
              <ShoppingBag size={13} />
              <span className="nav-cart-label">{t('cart')}</span>
              {cartCount > 0 && (
                <span style={{
                  background: 'rgba(255,255,255,0.25)', borderRadius: '50%',
                  minWidth: 16, height: 16, padding: '0 4px',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 600, marginLeft: 2,
                }}>
                  {cartCount}
                </span>
              )}
            </motion.button>

            <Avatar
              src={user?.avatar}
              icon={<User size={14} />}
              size={28}
              style={{ cursor: 'pointer', flexShrink: 0 }}
            />
          </div>
        </div>
      </header>

      {/* Password modal */}
      <Modal
        open={authModalOpen}
        onCancel={() => setAuthModalOpen(false)}
        footer={null}
        width={400}
        centered
        title={`Switch to ${pendingRole === 'admin' ? 'Admin' : 'Staff'}`}
      >
        <div style={{ paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Enter your password to access {pendingRole} features.
          </p>

          <div style={{
            padding: '12px 16px', borderRadius: 'var(--r-md)',
            background: 'var(--bg-secondary)',
          }}>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>Demo password</div>
            <div style={{ fontSize: 14, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {pendingRole === 'admin' ? 'admin123' : 'staff123'}
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <input
              type={showPw ? 'text' : 'password'}
              placeholder="Password"
              value={pwValue}
              onChange={e => { setPwValue(e.target.value); setPwError(''); }}
              onKeyDown={e => e.key === 'Enter' && handlePasswordConfirm()}
              autoFocus
              style={{
                width: '100%', height: 44, borderRadius: 'var(--r-sm)', padding: '0 44px 0 14px',
                background: 'var(--bg-elevated)',
                border: `1px solid ${pwError ? 'var(--rose)' : 'var(--border-default)'}`,
                color: 'var(--text-primary)', fontSize: 14,
                fontFamily: 'var(--font-ui)', outline: 'none',
              }}
              onFocus={e => !pwError && (e.target.style.borderColor = 'var(--blue)')}
              onBlur={e => !pwError && (e.target.style.borderColor = 'var(--border-default)')}
            />
            <button
              onClick={() => setShowPw(!showPw)}
              style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center',
              }}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <AnimatePresence>
            {pwError && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={springConfig}
                style={{ fontSize: 13, color: 'var(--rose)', margin: 0 }}
              >
                {pwError}
              </motion.p>
            )}
          </AnimatePresence>

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <motion.button
              whileTap={{ scale: 0.94 }}
              transition={springConfig}
              onClick={() => setAuthModalOpen(false)}
              className="btn-secondary"
              style={{ flex: 1, height: 44 }}
            >
              Cancel
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.94 }}
              transition={springConfig}
              onClick={handlePasswordConfirm}
              className="btn-primary"
              style={{ flex: 2, height: 44 }}
            >
              Continue
            </motion.button>
          </div>
        </div>
      </Modal>

      {/* Notifications drawer */}
      <Drawer
        title="Notifications"
        placement="right"
        onClose={() => setNotifOpen(false)}
        open={notifOpen}
        width={360}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="glass-panel" style={{ padding: '14px 16px' }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--green)', marginBottom: 4 }}>
              Connected
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Live order updates are active.
            </p>
          </div>
          {orders.slice(0, 8).map(ord => (
            <div key={ord.id} className="glass-panel" style={{ padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500 }}>{ord.id}</span>
                <span className={`chip chip-${ord.status === 'Ready' ? 'green' : ord.status === 'Received' ? 'amber' : 'blue'}`}>
                  {ord.status}
                </span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{ord.customerName} · {ord.orderType}</p>
              <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>
                {new Date(ord.createdAt).toLocaleTimeString()}
              </p>
            </div>
          ))}
        </div>
      </Drawer>

      <style>{`
        @media (max-width: 834px) {
          .nav-label { display: none; }
        }
        @media (max-width: 640px) {
          .nav-cart-label { display: none; }
        }
      `}</style>
    </>
  );
};

export default NavHeader;
