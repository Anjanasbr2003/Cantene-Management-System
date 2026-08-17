import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Modal, Input, message, Spin, Form, Select } from 'antd';
import { 
  ChefHat, 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  XCircle, 
  ArrowRight, 
  Plus, 
  Minus, 
  Calendar,
  Sparkles,
  Volume2,
  RefreshCw,
  SlidersHorizontal,
  Box
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchOrders, upsertOrder } from '../store/orderSlice';
import { fetchInventory, fetchExpiryRadar, updateStockLocally, addInventoryItemLocally } from '../store/inventorySlice';
import { playOrderChime, playSuccessChime } from '../utils/audio';

const springTransition = { type: 'spring', bounce: 0, duration: 0.35 };

export const StaffDashboard = () => {
  const { orders } = useSelector((state) => state.orders);
  const { items: inventory } = useSelector((state) => state.inventory);
  const { token, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState('kds');
  
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [selectedInvItem, setSelectedInvItem] = useState(null);
  const [movementType, setMovementType] = useState('Stock-In');
  const [movementQty, setMovementQty] = useState(10);
  const [movementReason, setMovementReason] = useState('');

  const [addIngredientModalOpen, setAddIngredientModalOpen] = useState(false);
  const [ingredientForm] = Form.useForm();

  const defaultKdsOrders = [
    {
      id: 'ORD-9821',
      customerName: 'Alex Mercer',
      orderType: 'Dine-In',
      tableNumber: 'T-04',
      status: 'Preparing',
      items: [
        { menuItemId: 'menu_3', name: 'Cyber Wagyu Burger', selectedSize: 'Single Stack (M)', quantity: 1, specialInstructions: 'Medium rare patty' },
        { menuItemId: 'menu_1', name: 'Quantum Espresso', selectedSize: 'Double Shot (M)', quantity: 1, specialInstructions: '' }
      ],
      estimatedPrepMinutes: 8,
      createdAt: new Date(Date.now() - 10 * 60000).toISOString()
    },
    {
      id: 'ORD-9822',
      customerName: 'Elena Rostova',
      orderType: 'Dine-In',
      tableNumber: 'T-02',
      status: 'Received',
      items: [
        { menuItemId: 'menu_2', name: 'Nebula Matcha Latte', selectedSize: 'Standard (M)', quantity: 2, specialInstructions: 'Extra hot' }
      ],
      estimatedPrepMinutes: 10,
      createdAt: new Date(Date.now() - 3 * 60000).toISOString()
    },
    {
      id: 'ORD-9823',
      customerName: 'Dr. Orion Vance',
      orderType: 'Takeaway',
      tableNumber: null,
      status: 'Ready',
      items: [
        { menuItemId: 'menu_5', name: 'Supernova Truffle Pasta', selectedSize: 'Regular', quantity: 1, specialInstructions: '' }
      ],
      estimatedPrepMinutes: 0,
      createdAt: new Date(Date.now() - 18 * 60000).toISOString()
    }
  ];

  const defaultInventory = [
    { id: 'inv_1', sku: 'INV-COFF-01', name: 'Quantum Espresso Beans', category: 'Beverages', unit: 'kg', currentStock: 45, reorderLevel: 15, purchasePrice: 18.5 },
    { id: 'inv_2', sku: 'INV-MILK-02', name: 'Oat Milk Barista Blend', category: 'Dairy & Plant', unit: 'liters', currentStock: 8, reorderLevel: 12, purchasePrice: 3.2 },
    { id: 'inv_3', sku: 'INV-MEAT-03', name: 'Wagyu Beef Patties', category: 'Meat & Proteins', unit: 'units', currentStock: 65, reorderLevel: 20, purchasePrice: 7.5 },
    { id: 'inv_4', sku: 'INV-TRUF-05', name: 'Black Truffle Oil', category: 'Gourmet Condiments', unit: 'bottles', currentStock: 4, reorderLevel: 5, purchasePrice: 32.0 },
  ];

  const displayOrders = (orders && orders.length > 0) ? orders : defaultKdsOrders;
  const displayInventory = (inventory && inventory.length > 0) ? inventory : defaultInventory;

  useEffect(() => {
    dispatch(fetchOrders(token));
    dispatch(fetchInventory(token));
    dispatch(fetchExpiryRadar(token));
  }, [dispatch, token]);

  const handleUpdateOrderStatus = async (orderId, newStatus, reason = '') => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`
        },
        body: JSON.stringify({ status: newStatus, rejectReason: reason })
      });
      const data = await res.json();
      if (data.success) {
        dispatch(upsertOrder(data.data));
      } else {
        const target = displayOrders.find(o => o.id === orderId);
        if (target) dispatch(upsertOrder({ ...target, status: newStatus }));
      }
    } catch {
      const target = displayOrders.find(o => o.id === orderId);
      if (target) dispatch(upsertOrder({ ...target, status: newStatus }));
    }
    playSuccessChime();
    message.success(`Order ${orderId} status set to ${newStatus}`);
  };

  const handleStockMovementSubmit = async () => {
    if (!selectedInvItem || !movementQty || Number(movementQty) <= 0) {
      message.error('Please enter a valid stock quantity.');
      return;
    }

    const qty = Number(movementQty);
    const delta = movementType === 'Stock-In' ? Math.abs(qty) : -Math.abs(qty);
    
    dispatch(updateStockLocally({ id: selectedInvItem.id, delta }));

    try {
      await fetch('/api/inventory/movements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`
        },
        body: JSON.stringify({
          inventoryId: selectedInvItem.id,
          type: movementType,
          quantity: qty,
          reason: movementReason || `Kitchen ${movementType} Adjustment`
        })
      });
    } catch (e) {
      console.error('Network warning:', e);
    }

    playSuccessChime();
    const newSum = Math.max(0, Number(selectedInvItem.currentStock || 0) + delta);
    message.success(`✅ Updated ${selectedInvItem.name} stock! Added ${delta > 0 ? `+${delta}` : delta} ${selectedInvItem.unit}. New sum: ${newSum} ${selectedInvItem.unit}`);
    setStockModalOpen(false);
  };

  const handleAddIngredientSubmit = async (values) => {
    const newIngredient = {
      id: 'inv_' + Date.now(),
      sku: `INV-${values.name.substring(0, 4).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      name: values.name,
      category: values.category || 'General Raw',
      unit: values.unit,
      currentStock: Number(values.currentStock) || 0,
      reorderLevel: Number(values.reorderLevel) || 10,
      purchasePrice: Number(values.purchasePrice) || 0.0
    };

    dispatch(addInventoryItemLocally(newIngredient));

    try {
      await fetch('/api/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`
        },
        body: JSON.stringify(newIngredient)
      });
    } catch {
      // Local state fallback
    }

    playSuccessChime();
    message.success(`✅ Created new ingredient "${newIngredient.name}" with starting stock sum of ${newIngredient.currentStock} ${newIngredient.unit}`);
    setAddIngredientModalOpen(false);
    ingredientForm.resetFields();
  };

  const ordersByStatus = {
    Received: displayOrders.filter(o => o.status === 'Received'),
    Preparing: displayOrders.filter(o => o.status === 'Preparing'),
    Ready: displayOrders.filter(o => o.status === 'Ready'),
    Completed: displayOrders.filter(o => ['Completed', 'Served'].includes(o.status))
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
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', borderRadius: 'var(--r-pill)', backgroundColor: 'rgba(52, 199, 89, 0.12)', color: '#248a3d', fontSize: 12, fontWeight: 600, marginBottom: 12 }}>
                <ChefHat size={14} />
                <span>{t('kds_badge')}</span>
              </div>
              <h1 className="display-lg" style={{ color: 'var(--color-ink)', marginBottom: 8 }}>
                {t('kds_title')}
              </h1>
              <p style={{ fontSize: 17, color: 'var(--color-ink-muted-80)' }}>
                {t('kds_desc')}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                onClick={() => setAddIngredientModalOpen(true)}
                className="button-primary"
                style={{ fontSize: 14 }}
              >
                <Plus size={16} />
                <span>{t('add_ingredient')}</span>
              </button>
              <button
                onClick={() => { dispatch(fetchOrders(token)); dispatch(fetchInventory(token)); message.info('KDS & Stock re-synchronized'); }}
                className="button-pearl-capsule"
                style={{ padding: '8px 16px', fontSize: 14 }}
              >
                <RefreshCw size={14} />
                <span>Sync Live Telemetry</span>
              </button>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
            <button
              onClick={() => setActiveTab('kds')}
              className={activeTab === 'kds' ? 'button-dark-utility' : 'button-pearl-capsule'}
              style={{ borderRadius: 'var(--r-pill)', padding: '8px 20px', fontSize: 14 }}
            >
              🍳 {t('kds_tab_orders')} ({displayOrders.filter(o => o.status !== 'Completed').length})
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={activeTab === 'inventory' ? 'button-dark-utility' : 'button-pearl-capsule'}
              style={{ borderRadius: 'var(--r-pill)', padding: '8px 20px', fontSize: 14 }}
            >
              📦 {t('kds_tab_inventory')} ({displayInventory.length})
            </button>
          </div>

        </div>
      </section>

      {/* Main Tab Content */}
      <section className="apple-container-wide" style={{ padding: '48px 24px' }}>
        
        {activeTab === 'kds' ? (
          
          /* KDS 4-Column Board */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            
            {/* Column 1: Received */}
            <div className="store-utility-card" style={{ backgroundColor: 'var(--color-surface-pearl)', backdropFilter: 'blur(16px)', border: '1px solid var(--color-hairline)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <span className="caption-strong" style={{ color: 'var(--color-ink)' }}>
                  1. {t('received').toUpperCase()} ({ordersByStatus.Received.length})
                </span>
                <span className="chip chip-blue" style={{ fontSize: 11 }}>Action Required</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {ordersByStatus.Received.map(order => (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ backgroundColor: 'var(--color-canvas-parchment)', padding: 18, borderRadius: 'var(--r-md)', border: '1px solid var(--color-hairline)' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: 16, color: 'var(--color-ink)' }}>{order.id}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-primary)' }}>{order.orderType} {order.tableNumber ? `(${order.tableNumber})` : ''}</span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--color-ink-muted-80)', marginBottom: 12 }}>Diner: {order.customerName}</div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16, borderTop: '1px solid var(--color-divider-soft)', paddingTop: 10 }}>
                      {order.items?.map((it, idx) => (
                        <div key={idx} style={{ fontSize: 14, color: 'var(--color-ink)', fontWeight: 500 }}>
                          {it.quantity}x {it.name} <span style={{ fontSize: 12, color: 'var(--color-ink-muted-48)' }}>({it.selectedSize})</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => handleUpdateOrderStatus(order.id, 'Preparing')}
                      className="button-primary"
                      style={{ width: '100%', padding: '8px 14px', fontSize: 13 }}
                    >
                      {t('start_cooking')} →
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Column 2: Preparing */}
            <div className="store-utility-card" style={{ backgroundColor: 'var(--color-surface-pearl)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 149, 0, 0.35)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <span className="caption-strong" style={{ color: 'var(--color-warning)' }}>
                  2. {t('preparing').toUpperCase()} ({ordersByStatus.Preparing.length})
                </span>
                <span className="chip chip-amber" style={{ fontSize: 11 }}>Cooking</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {ordersByStatus.Preparing.map(order => (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ backgroundColor: 'var(--color-canvas-parchment)', padding: 18, borderRadius: 'var(--r-md)', border: '1px solid var(--color-hairline)' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: 16, color: 'var(--color-ink)' }}>{order.id}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-warning)' }}>~{order.estimatedPrepMinutes || 8} min remaining</span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--color-ink-muted-80)', marginBottom: 12 }}>Diner: {order.customerName} • {order.tableNumber || 'Takeaway'}</div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16, borderTop: '1px solid var(--color-divider-soft)', paddingTop: 10 }}>
                      {order.items?.map((it, idx) => (
                        <div key={idx} style={{ fontSize: 14, color: 'var(--color-ink)', fontWeight: 500 }}>
                          {it.quantity}x {it.name}
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => handleUpdateOrderStatus(order.id, 'Ready')}
                      className="button-primary"
                      style={{ width: '100%', padding: '8px 14px', fontSize: 13, backgroundColor: 'var(--color-success)' }}
                    >
                      {t('mark_ready')} ✓
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Column 3: Ready */}
            <div className="store-utility-card" style={{ backgroundColor: 'var(--color-surface-pearl)', backdropFilter: 'blur(16px)', border: '1px solid rgba(52, 199, 89, 0.35)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <span className="caption-strong" style={{ color: 'var(--color-success)' }}>
                  3. {t('ready').toUpperCase()} ({ordersByStatus.Ready.length})
                </span>
                <span className="chip chip-green" style={{ fontSize: 11 }}>Ready</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {ordersByStatus.Ready.map(order => (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ backgroundColor: 'var(--color-canvas-parchment)', padding: 18, borderRadius: 'var(--r-md)', border: '1px solid var(--color-hairline)' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: 16, color: 'var(--color-ink)' }}>{order.id}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-success)' }}>{order.tableNumber ? `Table ${order.tableNumber}` : 'Counter'}</span>
                    </div>

                    <button
                      onClick={() => handleUpdateOrderStatus(order.id, 'Completed')}
                      className="button-dark-utility"
                      style={{ width: '100%', padding: '8px 14px', fontSize: 13, marginTop: 12 }}
                    >
                      {t('complete_order')}
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Column 4: Completed */}
            <div className="store-utility-card" style={{ backgroundColor: 'var(--color-surface-pearl)', backdropFilter: 'blur(16px)', border: '1px solid var(--color-hairline)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <span className="caption-strong" style={{ color: 'var(--color-ink-muted-80)' }}>
                  4. {t('completed').toUpperCase()} ({ordersByStatus.Completed.length})
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {ordersByStatus.Completed.map(order => (
                  <div key={order.id} style={{ padding: 12, borderRadius: 'var(--r-sm)', backgroundColor: 'var(--color-canvas-parchment)', border: '1px solid var(--color-hairline)', fontSize: 13 }}>
                    <div style={{ fontWeight: 600, color: 'var(--color-ink)' }}>{order.id} • {order.customerName}</div>
                    <div style={{ color: 'var(--color-ink-muted-48)' }}>{order.items?.length} items • Completed</div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        ) : (
          
          /* Inventory Control Tab */
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h2 className="display-md" style={{ color: 'var(--color-ink)', marginBottom: 4 }}>
                  Raw Ingredient & Stock Telemetry
                </h2>
                <p style={{ fontSize: 14, color: 'var(--color-ink-muted-80)' }}>
                  Tap any item to add or deduct stock. All changes update the total sum in real time.
                </p>
              </div>

              <button
                onClick={() => setAddIngredientModalOpen(true)}
                className="button-primary"
                style={{ padding: '8px 18px', fontSize: 14 }}
              >
                <Plus size={16} />
                <span>Add Ingredient</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 24 }}>
              {displayInventory.map(item => (
                <motion.div
                  key={item.id}
                  layout
                  className="store-utility-card"
                  style={{ 
                    backgroundColor: 'var(--color-surface-pearl)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid var(--color-hairline)',
                    padding: 24, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between' 
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 12, color: 'var(--color-ink-muted-48)', fontFamily: 'var(--font-mono)' }}>{item.sku}</div>
                        <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-ink)' }}>{item.name}</div>
                        <div style={{ fontSize: 13, color: 'var(--color-ink-muted-80)' }}>{item.category}</div>
                      </div>
                      <span className={`chip ${item.currentStock <= item.reorderLevel ? 'chip-rose' : 'chip-green'}`}>
                        {item.currentStock <= item.reorderLevel ? 'Low Stock' : 'In Stock'}
                      </span>
                    </div>

                    <div style={{ padding: '16px 0', borderTop: '1px solid var(--color-divider-soft)', borderBottom: '1px solid var(--color-divider-soft)', margin: '14px 0' }}>
                      <div style={{ fontSize: 12, color: 'var(--color-ink-muted-48)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                        Current Stock Sum
                      </div>
                      <div style={{ fontSize: 32, fontWeight: 600, fontFamily: 'var(--font-display)', color: item.currentStock <= item.reorderLevel ? 'var(--color-danger)' : 'var(--color-ink)' }}>
                        {item.currentStock} <span style={{ fontSize: 16, fontWeight: 400, color: 'var(--color-ink-muted-80)' }}>{item.unit}</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-ink-muted-48)', marginTop: 4 }}>
                        Reorder Threshold: {item.reorderLevel} {item.unit} • ${item.purchasePrice?.toFixed(2)}/{item.unit}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      onClick={() => {
                        setSelectedInvItem(item);
                        setMovementType('Stock-In');
                        setMovementQty(10);
                        setStockModalOpen(true);
                      }}
                      className="button-primary"
                      style={{ flex: 1, padding: '8px 12px', fontSize: 13 }}
                    >
                      + Add Stock
                    </button>
                    <button
                      onClick={() => {
                        setSelectedInvItem(item);
                        setMovementType('Stock-Out');
                        setMovementQty(5);
                        setStockModalOpen(true);
                      }}
                      className="button-pearl-capsule"
                      style={{ flex: 1, padding: '8px 12px', fontSize: 13 }}
                    >
                      − Deduct Stock
                    </button>
                  </div>

                </motion.div>
              ))}
            </div>
          </div>

        )}

      </section>

      {/* Stock Quantity Adjustment Modal */}
      {stockModalOpen && selectedInvItem && (
        <Modal
          open={stockModalOpen}
          onCancel={() => setStockModalOpen(false)}
          footer={null}
          title={`Adjust Stock Sum: ${selectedInvItem.name}`}
          centered
          width={420}
        >
          <div style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            <div style={{ backgroundColor: 'var(--color-canvas-parchment)', padding: 16, borderRadius: 'var(--r-md)', border: '1px solid var(--color-hairline)' }}>
              <div style={{ fontSize: 12, color: 'var(--color-ink-muted-48)' }}>Current Total Stock</div>
              <div style={{ fontSize: 24, fontWeight: 600, color: 'var(--color-ink)' }}>
                {selectedInvItem.currentStock} {selectedInvItem.unit}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 8 }}>
                Select Operation
              </label>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setMovementType('Stock-In')}
                  className={movementType === 'Stock-In' ? 'button-primary' : 'button-pearl-capsule'}
                  style={{ flex: 1, padding: '10px' }}
                >
                  + Add to Sum (Stock-In)
                </button>
                <button
                  type="button"
                  onClick={() => setMovementType('Stock-Out')}
                  className={movementType === 'Stock-Out' ? 'button-dark-utility' : 'button-pearl-capsule'}
                  style={{ flex: 1, padding: '10px' }}
                >
                  − Deduct from Sum
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 8 }}>
                Quantity to {movementType === 'Stock-In' ? 'Add (+)' : 'Deduct (-)'} ({selectedInvItem.unit})
              </label>
              <input
                type="number"
                min="1"
                value={movementQty}
                onChange={(e) => setMovementQty(e.target.value)}
                className="search-input-apple"
                style={{ height: 44, fontSize: 16 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 8 }}>
                Reason / Note
              </label>
              <input
                type="text"
                value={movementReason}
                onChange={(e) => setMovementReason(e.target.value)}
                placeholder="e.g. New delivery shipment, kitchen usage, wastage"
                className="search-input-apple"
                style={{ height: 40, fontSize: 14 }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
              <button
                type="button"
                onClick={() => setStockModalOpen(false)}
                className="button-pearl-capsule"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStockMovementSubmit}
                className="button-primary"
                style={{ flex: 1 }}
              >
                Calculate & Update Sum
              </button>
            </div>

          </div>
        </Modal>
      )}

      {/* Add New Raw Ingredient Modal */}
      <Modal
        open={addIngredientModalOpen}
        onCancel={() => setAddIngredientModalOpen(false)}
        footer={null}
        title="Add New Raw Ingredient to Inventory"
        centered
        width={440}
      >
        <Form form={ingredientForm} layout="vertical" onFinish={handleAddIngredientSubmit} style={{ paddingTop: 12 }}>
          <Form.Item name="name" label="Ingredient Name" rules={[{ required: true, message: 'Name is required' }]}>
            <Input className="search-input-apple" style={{ height: 40 }} placeholder="e.g. Organic Almond Milk" />
          </Form.Item>

          <Form.Item name="category" label="Category" initialValue="Dairy & Plant">
            <Select options={[
              { value: 'Dairy & Plant', label: 'Dairy & Plant' },
              { value: 'Beverages Raw', label: 'Beverages Raw' },
              { value: 'Meat & Proteins', label: 'Meat & Proteins' },
              { value: 'Fresh Produce', label: 'Fresh Produce' },
              { value: 'Gourmet Condiments', label: 'Gourmet Condiments' }
            ]} />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item name="unit" label="Measurement Unit" rules={[{ required: true }]} initialValue="kg">
              <Select options={[
                { value: 'kg', label: 'Kilograms (kg)' },
                { value: 'liters', label: 'Liters' },
                { value: 'units', label: 'Units / Pieces' },
                { value: 'bottles', label: 'Bottles' },
                { value: 'pack', label: 'Packs' }
              ]} />
            </Form.Item>

            <Form.Item name="currentStock" label="Starting Stock Sum" rules={[{ required: true }]} initialValue={50}>
              <Input type="number" className="search-input-apple" style={{ height: 40 }} />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item name="reorderLevel" label="Reorder Threshold" initialValue={10}>
              <Input type="number" className="search-input-apple" style={{ height: 40 }} />
            </Form.Item>

            <Form.Item name="purchasePrice" label="Cost per Unit ($)" initialValue={4.5}>
              <Input type="number" step="0.5" className="search-input-apple" style={{ height: 40 }} />
            </Form.Item>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 16 }}>
            <button type="button" onClick={() => setAddIngredientModalOpen(false)} className="button-pearl-capsule">
              Cancel
            </button>
            <button type="submit" className="button-primary">
              Add Ingredient to Stock
            </button>
          </div>
        </Form>
      </Modal>

    </div>
  );
};

export default StaffDashboard;
