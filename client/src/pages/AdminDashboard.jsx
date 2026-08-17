import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Tabs, Button, Table, Modal, Form, Input, Select, Switch, message, Spin, Popconfirm, Tooltip } from 'antd';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Package, 
  FileText, 
  Download, 
  Plus, 
  Sparkles,
  ShieldCheck,
  RefreshCw,
  SlidersHorizontal,
  Trash2,
  UserPlus,
  UserCheck,
  Shield,
  UserX,
  User
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, BarChart, Bar, CartesianGrid } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { playSuccessChime } from '../utils/audio';
import { defaultSeedMenuItems } from '../utils/mockMenuData';
import { addLocalMenuItem, removeLocalMenuItem } from '../store/menuSlice';

const springTransition = { type: 'spring', bounce: 0, duration: 0.35 };

export const AdminDashboard = () => {
  const { token, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [metrics, setMetrics] = useState(null);
  const [menuItems, setMenuItems] = useState(defaultSeedMenuItems);
  const [usersList, setUsersList] = useState([]);
  const [userRoleFilter, setUserRoleFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const [createMenuModalOpen, setCreateMenuModalOpen] = useState(false);
  const [createUserModalOpen, setCreateUserModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [userForm] = Form.useForm();

  const defaultAnalytics = {
    totalRevenue: 2840.50,
    totalOrders: 142,
    activeCustomers: 88,
    avgPrepTimeMinutes: 7.4,
    revenueByHour: [
      { hour: '08:00', revenue: 240 },
      { hour: '10:00', revenue: 480 },
      { hour: '12:00', revenue: 920 },
      { hour: '14:00', revenue: 610 },
      { hour: '16:00', revenue: 350 },
      { hour: '18:00', revenue: 240 }
    ],
    salesByCategory: [
      { category: 'Beverages', sales: 940 },
      { category: 'Meals', sales: 1320 },
      { category: 'Breakfast', sales: 380 },
      { category: 'Snacks', sales: 200 }
    ]
  };

  const currentMetrics = metrics || defaultAnalytics;

  const loadData = async () => {
    try {
      const [resDash, resMenu, resUsers] = await Promise.all([
        fetch('/api/analytics/dashboard', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/menu'),
        fetch('/api/users', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const dataDash = await resDash.json();
      const dataMenu = await resMenu.json();
      const dataUsers = await resUsers.json();

      if (dataDash.success) setMetrics(dataDash.data);
      if (dataMenu.success && Array.isArray(dataMenu.data)) setMenuItems(dataMenu.data);
      if (dataUsers.success && Array.isArray(dataUsers.data)) setUsersList(dataUsers.data);
    } catch {
      // Retain fallback data
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const handleCreateMenuItem = async (values) => {
    const newItem = {
      id: 'menu_' + Date.now(),
      name: values.name,
      description: values.description || '',
      price: Number(values.price),
      category: values.category,
      image: values.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
      dietaryTags: values.dietaryTags || ['Veg'],
      isAvailable: true,
      rating: 5.0,
      reviewCount: 0
    };

    try {
      if (token) {
        await fetch('/api/menu', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(newItem)
        });
      }
    } catch (err) {
      console.error('Save menu item error:', err);
    }

    setMenuItems(prev => [newItem, ...prev]);
    dispatch(addLocalMenuItem(newItem));
    playSuccessChime();
    message.success(`Created new menu item: ${newItem.name}`);
    setCreateMenuModalOpen(false);
    form.resetFields();
  };

  const handleDeleteMenuItem = async (item) => {
    try {
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`/api/menu/${item.id}`, {
        method: 'DELETE',
        headers
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        message.error(data.message || 'Failed to remove menu item from server');
        return;
      }
    } catch (err) {
      console.error('Delete menu item error:', err);
    }

    setMenuItems(prev => prev.filter(i => i.id !== item.id));
    dispatch(removeLocalMenuItem(item.id));
    playSuccessChime();
    message.success(`Removed "${item.name}" from catalogue`);
  };

  const handleCreateUser = async (values) => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(values)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        message.error(data.message || 'Failed to create user');
        return;
      }
      setUsersList(prev => [data.data, ...prev]);
      playSuccessChime();
      message.success(`Account created for ${data.data.name} (${data.data.role.toUpperCase()})`);
      setCreateUserModalOpen(false);
      userForm.resetFields();
    } catch (err) {
      message.error('Failed to create account.');
    }
  };

  const handleUpdateUserRole = async (targetUser, newRole) => {
    try {
      const res = await fetch(`/api/users/${targetUser.id}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        message.error(data.message || 'Failed to update user role');
        return;
      }
      setUsersList(prev => prev.map(u => u.id === targetUser.id ? { ...u, role: newRole } : u));
      playSuccessChime();
      message.success(`Updated ${targetUser.name}'s role to ${newRole.toUpperCase()}`);
    } catch (err) {
      message.error('Failed to update user role.');
    }
  };

  const handleDeleteUser = async (targetUser) => {
    try {
      const res = await fetch(`/api/users/${targetUser.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        message.error(data.message || 'Failed to delete account');
        return;
      }
      setUsersList(prev => prev.filter(u => u.id !== targetUser.id));
      playSuccessChime();
      message.success(`Revoked account for ${targetUser.name}`);
    } catch (err) {
      message.error('Failed to delete account.');
    }
  };

  const exportPDFReport = () => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('CANTEEN MANAGEMENT SYSTEM - EXECUTIVE REPORT', 14, 22);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated Date: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Generated By: ${user?.name || 'Administrator'}`, 14, 36);

    doc.line(14, 42, 196, 42);

    let y = 52;
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Daily Revenue: $${currentMetrics.totalRevenue.toFixed(2)}`, 14, y);
    y += 8;
    doc.text(`Total Orders Fulfilled: ${currentMetrics.totalOrders}`, 14, y);
    y += 8;
    doc.text(`Active Diners Registered: ${currentMetrics.activeCustomers}`, 14, y);
    y += 8;
    doc.text(`Average Prep Speed: ${currentMetrics.avgPrepTimeMinutes} minutes`, 14, y);

    doc.save(`Canteen_Executive_Report_${Date.now()}.pdf`);
    playSuccessChime();
    message.success('Exported Executive Report PDF');
  };

  const exportExcelData = () => {
    const ws = XLSX.utils.json_to_sheet(menuItems);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'MenuItems');
    XLSX.writeFile(wb, `Canteen_Menu_Catalogue_${Date.now()}.xlsx`);
    playSuccessChime();
    message.success('Exported Menu Catalogue XLSX');
  };

  return (
    <div 
      style={{ 
        backgroundColor: 'var(--color-canvas)',
        minHeight: 'calc(100vh - 96px)',
        paddingBottom: 64
      }}
    >
      
      {/* Header Bar */}
      <section 
        style={{ 
          backgroundColor: 'var(--color-canvas-parchment)', 
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          padding: '48px 24px 36px 24px', 
          borderBottom: '1px solid var(--color-hairline)' 
        }}
      >
        <div className="apple-container-wide">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', borderRadius: 'var(--r-pill)', backgroundColor: 'rgba(0, 102, 204, 0.08)', color: 'var(--color-primary)', fontSize: 12, fontWeight: 600, marginBottom: 12 }}>
                <ShieldCheck size={14} />
                <span>{t('admin_badge')}</span>
              </div>
              <h1 className="display-lg" style={{ color: 'var(--color-ink)', marginBottom: 8 }}>
                {t('admin_title')}
              </h1>
              <p style={{ fontSize: 17, color: 'var(--color-ink-muted-80)' }}>
                {t('admin_desc')}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button onClick={exportPDFReport} className="button-pearl-capsule" style={{ fontSize: 14 }}>
                <Download size={14} />
                <span>{t('export_pdf')}</span>
              </button>
              <button onClick={exportExcelData} className="button-pearl-capsule" style={{ fontSize: 14 }}>
                <FileText size={14} />
                <span>{t('export_excel')}</span>
              </button>
              <button onClick={() => setCreateMenuModalOpen(true)} className="button-primary" style={{ fontSize: 14 }}>
                <Plus size={16} />
                <span>{t('add_dish')}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="apple-container-wide" style={{ padding: '48px 24px' }}>
        
        {/* Metric Cards Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 40 }}>
          
          <div className="store-utility-card" style={{ backgroundColor: 'var(--color-surface-pearl)', backdropFilter: 'blur(16px)', border: '1px solid var(--color-hairline)', padding: 24 }}>
            <div style={{ fontSize: 13, color: 'var(--color-ink-muted-48)', marginBottom: 4 }}>{t('daily_gross_revenue')}</div>
            <div style={{ fontSize: 32, fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--color-ink)' }}>
              ${currentMetrics.totalRevenue?.toFixed(2)}
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-success)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
              <TrendingUp size={14} /> +14.2% vs yesterday
            </div>
          </div>

          <div className="store-utility-card" style={{ backgroundColor: 'var(--color-surface-pearl)', backdropFilter: 'blur(16px)', border: '1px solid var(--color-hairline)', padding: 24 }}>
            <div style={{ fontSize: 13, color: 'var(--color-ink-muted-48)', marginBottom: 4 }}>{t('total_orders_placed')}</div>
            <div style={{ fontSize: 32, fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--color-ink)' }}>
              {currentMetrics.totalOrders}
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-primary)', marginTop: 8 }}>
              100% On-Time Target
            </div>
          </div>

          <div className="store-utility-card" style={{ backgroundColor: 'var(--color-surface-pearl)', backdropFilter: 'blur(16px)', border: '1px solid var(--color-hairline)', padding: 24 }}>
            <div style={{ fontSize: 13, color: 'var(--color-ink-muted-48)', marginBottom: 4 }}>{t('active_diners')}</div>
            <div style={{ fontSize: 32, fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--color-ink)' }}>
              {currentMetrics.activeCustomers}
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-ink-muted-80)', marginTop: 8 }}>
              Registered Orbit Users
            </div>
          </div>

          <div className="store-utility-card" style={{ backgroundColor: 'var(--color-surface-pearl)', backdropFilter: 'blur(16px)', border: '1px solid var(--color-hairline)', padding: 24 }}>
            <div style={{ fontSize: 13, color: 'var(--color-ink-muted-48)', marginBottom: 4 }}>{t('avg_prep_speed')}</div>
            <div style={{ fontSize: 32, fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--color-ink)' }}>
              {currentMetrics.avgPrepTimeMinutes}m
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-success)', marginTop: 8 }}>
              Optimal KDS Speed
            </div>
          </div>

        </div>

        {/* Recharts Analytics Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 32, marginBottom: 48 }}>
          
          <div className="store-utility-card" style={{ backgroundColor: 'var(--color-surface-pearl)', backdropFilter: 'blur(16px)', border: '1px solid var(--color-hairline)', padding: 28 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 20 }}>
              Hourly Revenue Rush Telemetry
            </h3>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={currentMetrics.revenueByHour}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-hairline)" />
                  <XAxis dataKey="hour" stroke="var(--color-ink-muted-48)" fontSize={12} />
                  <YAxis stroke="var(--color-ink-muted-48)" fontSize={12} />
                  <RechartsTooltip contentStyle={{ backgroundColor: 'var(--color-surface-pearl)', borderColor: 'var(--color-hairline)', color: 'var(--color-ink)', borderRadius: 8 }} />
                  <Line type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="store-utility-card" style={{ backgroundColor: 'var(--color-surface-pearl)', backdropFilter: 'blur(16px)', border: '1px solid var(--color-hairline)', padding: 28 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 20 }}>
              Category Sales Volume
            </h3>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={currentMetrics.salesByCategory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-hairline)" />
                  <XAxis dataKey="category" stroke="var(--color-ink-muted-48)" fontSize={12} />
                  <YAxis stroke="var(--color-ink-muted-48)" fontSize={12} />
                  <RechartsTooltip contentStyle={{ backgroundColor: 'var(--color-surface-pearl)', borderColor: 'var(--color-hairline)', color: 'var(--color-ink)', borderRadius: 8 }} />
                  <Bar dataKey="sales" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Menu Manager Section */}
        <div className="store-utility-card" style={{ backgroundColor: 'var(--color-surface-pearl)', backdropFilter: 'blur(16px)', border: '1px solid var(--color-hairline)', padding: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: 'var(--color-ink)' }}>
                Active Menu Catalogue ({menuItems.length} items)
              </h3>
              <p style={{ fontSize: 14, color: 'var(--color-ink-muted-80)' }}>
                Manage pricing, active availability, and dietary specifications
              </p>
            </div>

            <button onClick={() => setCreateMenuModalOpen(true)} className="button-primary" style={{ padding: '8px 18px', fontSize: 14 }}>
              <Plus size={16} />
              <span>Add New Dish</span>
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-hairline)', color: 'var(--color-ink-muted-48)' }}>
                  <th style={{ padding: '12px 16px' }}>Item</th>
                  <th style={{ padding: '12px 16px' }}>Category</th>
                  <th style={{ padding: '12px 16px' }}>Price</th>
                  <th style={{ padding: '12px 16px' }}>Dietary</th>
                  <th style={{ padding: '12px 16px' }}>Availability</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {menuItems.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--color-divider-soft)' }}>
                    <td style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img src={item.image} alt={item.name} style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--color-ink)' }}>{item.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--color-ink-muted-48)' }}>{item.description?.slice(0, 40)}…</div>
                      </div>
                    </td>
                    <td style={{ padding: '16px', color: 'var(--color-ink-muted-80)' }}>{item.category}</td>
                    <td style={{ padding: '16px', fontWeight: 600, color: 'var(--color-ink)' }}>${item.price?.toFixed(2)}</td>
                    <td style={{ padding: '16px' }}>
                      <span className="chip chip-blue" style={{ fontSize: 11 }}>
                        {item.dietaryTags?.join(', ') || 'Veg'}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span className={`chip ${item.isAvailable ? 'chip-green' : 'chip-rose'}`}>
                        {item.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <Popconfirm
                        title="Remove Dish"
                        description={`Are you sure you want to remove "${item.name}" from the menu?`}
                        onConfirm={() => handleDeleteMenuItem(item)}
                        okText="Yes, Remove"
                        cancelText="Cancel"
                        okButtonProps={{ danger: true }}
                      >
                        <button
                          type="button"
                          className="button-pearl-capsule"
                          style={{
                            padding: '6px 10px',
                            color: 'var(--color-danger)',
                            borderColor: 'rgba(255, 69, 58, 0.25)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            fontSize: 12,
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={14} />
                          <span>Remove</span>
                        </button>
                      </Popconfirm>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* User & Kitchen Staff Roster Section */}
        <div className="store-utility-card" style={{ backgroundColor: 'var(--color-surface-pearl)', backdropFilter: 'blur(16px)', border: '1px solid var(--color-hairline)', padding: 32, marginTop: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--color-primary)', marginBottom: 4 }}>
                <Users size={14} />
                <span>ROLE PERMISSIONS & ACCOUNTS</span>
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: 'var(--color-ink)' }}>
                User & Kitchen Staff Roster ({usersList.length} accounts)
              </h3>
              <p style={{ fontSize: 14, color: 'var(--color-ink-muted-80)' }}>
                Manage role access levels, onboard new kitchen staff members, or revoke account permissions.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <Select
                value={userRoleFilter}
                onChange={setUserRoleFilter}
                style={{ width: 160, height: 38 }}
                options={[
                  { value: 'All', label: 'All Roles' },
                  { value: 'staff', label: '👨‍🍳 Kitchen Staff' },
                  { value: 'customer', label: '👤 Diners' },
                  { value: 'admin', label: '🛡️ Admins' }
                ]}
              />

              <button onClick={() => setCreateUserModalOpen(true)} className="button-primary" style={{ padding: '8px 18px', fontSize: 14 }}>
                <UserPlus size={16} />
                <span>Add Staff / User</span>
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-hairline)', color: 'var(--color-ink-muted-48)' }}>
                  <th style={{ padding: '12px 16px' }}>User</th>
                  <th style={{ padding: '12px 16px' }}>Role Level</th>
                  <th style={{ padding: '12px 16px' }}>Phone</th>
                  <th style={{ padding: '12px 16px' }}>Loyalty Points</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Role Control & Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersList
                  .filter(u => userRoleFilter === 'All' || u.role.toLowerCase() === userRoleFilter.toLowerCase())
                  .map((usr) => (
                    <tr key={usr.id} style={{ borderBottom: '1px solid var(--color-divider-soft)' }}>
                      <td style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img 
                          src={usr.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(usr.name)}`} 
                          alt={usr.name} 
                          style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--color-hairline)' }} 
                        />
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--color-ink)' }}>
                            {usr.name} {usr.id === user?.id && <span style={{ fontSize: 11, color: 'var(--color-primary)', fontWeight: 600 }}>(You)</span>}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--color-ink-muted-48)' }}>{usr.email}</div>
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span className={`chip ${usr.role === 'admin' ? 'chip-purple' : usr.role === 'staff' ? 'chip-amber' : 'chip-blue'}`}>
                          {usr.role === 'admin' ? '🛡️ Admin Executive' : usr.role === 'staff' ? '👨‍🍳 Kitchen Staff' : '👤 Customer Diner'}
                        </span>
                      </td>
                      <td style={{ padding: '16px', color: 'var(--color-ink-muted-80)' }}>{usr.phone || 'N/A'}</td>
                      <td style={{ padding: '16px', fontWeight: 600, color: 'var(--color-ink)' }}>{usr.loyaltyPoints || 0} pts</td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                          <Select
                            value={usr.role}
                            disabled={usr.id === user?.id}
                            onChange={(newRole) => handleUpdateUserRole(usr, newRole)}
                            style={{ width: 140 }}
                            size="small"
                            options={[
                              { value: 'staff', label: '👨‍🍳 Staff' },
                              { value: 'customer', label: '👤 Customer' },
                              { value: 'admin', label: '🛡️ Admin' }
                            ]}
                          />

                          <Popconfirm
                            title="Revoke Account"
                            description={`Are you sure you want to delete ${usr.name}'s account?`}
                            onConfirm={() => handleDeleteUser(usr)}
                            okText="Yes, Delete"
                            cancelText="Cancel"
                            disabled={usr.id === user?.id}
                            okButtonProps={{ danger: true }}
                          >
                            <button
                              type="button"
                              disabled={usr.id === user?.id}
                              className="button-pearl-capsule"
                              style={{
                                padding: '5px 9px',
                                color: usr.id === user?.id ? 'var(--color-ink-muted-48)' : 'var(--color-danger)',
                                borderColor: 'rgba(255, 69, 58, 0.25)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                fontSize: 12,
                                opacity: usr.id === user?.id ? 0.4 : 1,
                                cursor: usr.id === user?.id ? 'not-allowed' : 'pointer'
                              }}
                            >
                              <UserX size={14} />
                              <span>Remove</span>
                            </button>
                          </Popconfirm>
                        </div>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </section>

      {/* Create New Menu Item Modal */}
      <Modal
        open={createMenuModalOpen}
        onCancel={() => setCreateMenuModalOpen(false)}
        footer={null}
        title="Add New Canteen Menu Item"
        centered
        width={480}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateMenuItem} style={{ paddingTop: 12 }}>
          <Form.Item name="name" label="Item Name" rules={[{ required: true, message: 'Item name required' }]}>
            <Input className="search-input-apple" style={{ height: 40 }} placeholder="e.g. Organic Acai Bowl" />
          </Form.Item>

          <Form.Item name="category" label="Category" rules={[{ required: true }]}>
            <Select options={[
              { value: 'Beverages', label: 'Beverages' },
              { value: 'Meals', label: 'Meals' },
              { value: 'Breakfast', label: 'Breakfast' },
              { value: 'Snacks', label: 'Snacks' }
            ]} />
          </Form.Item>

          <Form.Item name="price" label="Price ($)" rules={[{ required: true }]}>
            <Input type="number" step="0.5" className="search-input-apple" style={{ height: 40 }} placeholder="12.50" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Brief ingredient and preparation notes..." />
          </Form.Item>

          <Form.Item name="image" label="Image URL">
            <Input className="search-input-apple" style={{ height: 40 }} placeholder="https://images.unsplash.com/..." />
          </Form.Item>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
            <button type="button" onClick={() => setCreateMenuModalOpen(false)} className="button-pearl-capsule">
              Cancel
            </button>
            <button type="submit" className="button-primary">
              Create Dish
            </button>
          </div>
        </Form>
      </Modal>

      {/* Create New Staff / User Modal */}
      <Modal
        open={createUserModalOpen}
        onCancel={() => setCreateUserModalOpen(false)}
        footer={null}
        title="Onboard Kitchen Staff or User Account"
        centered
        width={480}
      >
        <Form form={userForm} layout="vertical" onFinish={handleCreateUser} style={{ paddingTop: 12 }} initialValues={{ role: 'staff' }}>
          <Form.Item name="name" label="Full Name" rules={[{ required: true, message: 'Please enter user name' }]}>
            <Input className="search-input-apple" style={{ height: 40 }} placeholder="e.g. Marcus Vance" />
          </Form.Item>

          <Form.Item name="email" label="Email Address" rules={[{ required: true, type: 'email', message: 'Valid email required' }]}>
            <Input className="search-input-apple" style={{ height: 40 }} placeholder="marcus@canteen.io" />
          </Form.Item>

          <Form.Item name="password" label="Initial Password" rules={[{ required: true, min: 6, message: 'Minimum 6 characters required' }]}>
            <Input.Password className="search-input-apple" style={{ height: 40 }} placeholder="••••••••" />
          </Form.Item>

          <Form.Item name="role" label="Account Role Level" rules={[{ required: true }]}>
            <Select options={[
              { value: 'staff', label: '👨‍🍳 Kitchen Staff (KDS & Inventory Access)' },
              { value: 'admin', label: '🛡️ Admin Executive (Full Dashboard Control)' },
              { value: 'customer', label: '👤 Customer Diner (Standard Access)' }
            ]} />
          </Form.Item>

          <Form.Item name="phone" label="Phone Number">
            <Input className="search-input-apple" style={{ height: 40 }} placeholder="+1 800-555-0142" />
          </Form.Item>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
            <button type="button" onClick={() => setCreateUserModalOpen(false)} className="button-pearl-capsule">
              Cancel
            </button>
            <button type="submit" className="button-primary">
              Create Account
            </button>
          </div>
        </Form>
      </Modal>

    </div>
  );
};

export default AdminDashboard;
