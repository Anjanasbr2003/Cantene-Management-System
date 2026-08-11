import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Tabs, Button, Tag, Card, Modal, Input, message, Badge, Tooltip } from 'antd';
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
  Volume2
} from 'lucide-react';
import { fetchOrders, upsertOrder } from '../store/orderSlice';
import { fetchInventory, fetchExpiryRadar, updateStockLocally } from '../store/inventorySlice';
import { playOrderChime, playSuccessChime } from '../utils/audio';

export const StaffDashboard = () => {
  const { orders } = useSelector((state) => state.orders);
  const { items: inventory, expiryRadar } = useSelector((state) => state.inventory);
  const { token, user } = useSelector((state) => state.auth);

  const dispatch = useDispatch();

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [selectedInvItem, setSelectedInvItem] = useState(null);
  const [movementType, setMovementType] = useState('Stock-In');
  const [movementQty, setMovementQty] = useState(10);
  const [movementReason, setMovementReason] = useState('');

  useEffect(() => {
    dispatch(fetchOrders(token));
    dispatch(fetchInventory(token));
    dispatch(fetchExpiryRadar(token));
  }, [dispatch, token]);

  // Update order status via backend API
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
        playSuccessChime();
        message.success(`Order ${orderId} updated to ${newStatus}`);
      } else {
        message.error(data.message || 'Status update failed.');
      }
    } catch (e) {
      message.error('Failed to connect to server.');
    }
  };

  // Submit Stock Movement
  const handleStockMovementSubmit = async () => {
    if (!selectedInvItem || !movementQty) return;

    try {
      const res = await fetch('/api/inventory/movements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`
        },
        body: JSON.stringify({
          inventoryId: selectedInvItem.id,
          type: movementType,
          quantity: Number(movementQty),
          reason: movementReason
        })
      });

      const data = await res.json();
      if (data.success) {
        dispatch(updateStockLocally({ inventoryId: selectedInvItem.id, newStock: data.updatedStock }));
        message.success(`Logged ${movementType} of ${movementQty} ${selectedInvItem.unit}`);
        setStockModalOpen(false);
        dispatch(fetchInventory(token));
      } else {
        message.error(data.message || 'Stock movement log failed.');
      }
    } catch (e) {
      message.error('Server error logging stock movement.');
    }
  };

  // Group orders by pipeline stage
  const receivedOrders = orders.filter((o) => o.status === 'Received');
  const preparingOrders = orders.filter((o) => o.status === 'Preparing');
  const readyOrders = orders.filter((o) => o.status === 'Ready');
  const completedOrders = orders.filter((o) => o.status === 'Served/Completed' || o.status === 'Completed');

  const lowStockCount = inventory.filter((i) => i.currentStock <= i.reorderLevel).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center" style={{ background: 'var(--purple)', borderRadius: 'var(--r-md)' }}>
            <ChefHat className="w-6 h-6" style={{ color: '#fff' }} />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-display">
              Kitchen Display
            </h2>
            <p className="text-xs text-slate-400">
              Live orders and inventory · {user?.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            icon={<Volume2 className="w-4 h-4 text-cyan-400" />}
            onClick={() => { playOrderChime(); message.info('Web Audio Sound Alert Tested'); }}
            className="spring-button text-xs font-semibold"
          >
            Test Sound Alert
          </Button>

          {lowStockCount > 0 && (
            <Badge count={lowStockCount}>
              <Tag color="error" className="text-xs font-bold px-3 py-1 rounded-lg">
                ⚠️ {lowStockCount} Low Stock Items
              </Tag>
            </Badge>
          )}
        </div>
      </div>

      <Tabs
        defaultActiveKey="kds"
        items={[
          {
            key: 'kds',
            label: (
              <span className="flex items-center gap-2 font-bold text-sm">
                <ChefHat className="w-4 h-4 text-cyan-400" /> Live Kitchen Queue ({receivedOrders.length + preparingOrders.length})
              </span>
            ),
            children: (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                
                {/* Column 1: Received / New Orders */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 glass-panel rounded-xl border-l-4 border-amber-400">
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                      1. New Received ({receivedOrders.length})
                    </span>
                    <Badge count={receivedOrders.length} showZero color="#FFB800" />
                  </div>

                  {receivedOrders.map((ord) => (
                    <div key={ord.id} className="p-4 glass-panel rounded-2xl space-y-3 border-amber-500/30">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-bold font-mono text-cyan-300">{ord.id}</h4>
                          <p className="text-xs text-slate-300 font-semibold">{ord.customerName}</p>
                          <p className="text-[11px] text-slate-400">{ord.orderType} {ord.tableNumber ? `(${ord.tableNumber})` : ''}</p>
                        </div>
                        <Tag color="gold" className="text-[11px] font-bold">{ord.paymentStatus}</Tag>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-slate-800">
                        {ord.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between text-xs">
                            <span className="text-slate-200 font-medium">
                              {it.quantity}x {it.name} <span className="text-[10px] text-cyan-400">({it.selectedSize})</span>
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-slate-800">
                        <Button
                          type="primary"
                          block
                          size="small"
                          onClick={() => handleUpdateOrderStatus(ord.id, 'Preparing')}
                          className="spring-button text-xs font-bold bg-amber-500 border-0"
                        >
                          Start Preparing →
                        </Button>
                        <Button
                          danger
                          size="small"
                          icon={<XCircle className="w-4 h-4" />}
                          onClick={() => { setSelectedOrder(ord); setRejectModalOpen(true); }}
                          className="spring-button"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Column 2: Preparing */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 glass-panel rounded-xl border-l-4 border-cyan-400">
                    <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                      2. Preparing ({preparingOrders.length})
                    </span>
                    <Badge count={preparingOrders.length} showZero color="#00F2FE" />
                  </div>

                  {preparingOrders.map((ord) => (
                    <div key={ord.id} className="p-4 glass-panel-glow rounded-2xl space-y-3 border-cyan-500/40">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-bold font-mono text-cyan-300">{ord.id}</h4>
                          <p className="text-xs text-slate-300 font-semibold">{ord.customerName}</p>
                          <p className="text-[11px] text-slate-400">{ord.orderType} {ord.tableNumber ? `(${ord.tableNumber})` : ''}</p>
                        </div>
                        <Tag color="cyan" className="text-[11px] font-bold">Preparing</Tag>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-slate-800">
                        {ord.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between text-xs">
                            <span className="text-slate-200 font-medium">
                              {it.quantity}x {it.name} <span className="text-[10px] text-cyan-400">({it.selectedSize})</span>
                            </span>
                          </div>
                        ))}
                      </div>

                      <Button
                        type="primary"
                        block
                        size="small"
                        onClick={() => handleUpdateOrderStatus(ord.id, 'Ready')}
                        className="spring-button text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 border-0"
                      >
                        Mark Ready for Pickup →
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Column 3: Ready for Pickup */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 glass-panel rounded-xl border-l-4 border-emerald-400">
                    <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                      3. Ready for Customer ({readyOrders.length})
                    </span>
                    <Badge count={readyOrders.length} showZero color="#00F5A0" />
                  </div>

                  {readyOrders.map((ord) => (
                    <div key={ord.id} className="p-4 glass-panel rounded-2xl space-y-3 border-emerald-500/40">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-bold font-mono text-emerald-300">{ord.id}</h4>
                          <p className="text-xs text-slate-300 font-semibold">{ord.customerName}</p>
                          <p className="text-[11px] text-slate-400">{ord.orderType} {ord.tableNumber ? `(${ord.tableNumber})` : ''}</p>
                        </div>
                        <Tag color="green" className="text-[11px] font-bold">READY</Tag>
                      </div>

                      <Button
                        type="primary"
                        block
                        size="small"
                        onClick={() => handleUpdateOrderStatus(ord.id, 'Served/Completed')}
                        className="spring-button text-xs font-bold bg-emerald-500 border-0"
                      >
                        Complete / Handover Order ✓
                      </Button>
                    </div>
                  ))}
                </div>

              </div>
            )
          },
          {
            key: 'inventory',
            label: (
              <span className="flex items-center gap-2 font-bold text-sm">
                <Package className="w-4 h-4 text-purple-400" /> Inventory & Stock Controls
              </span>
            ),
            children: (
              <div className="space-y-6 pt-2">
                
                {/* Expiry Radar Alert Widget */}
                {expiryRadar && (
                  <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 border-amber-500/30">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-8 h-8 text-amber-400" />
                      <div>
                        <h4 className="text-sm font-bold text-amber-300">Expiry Radar Alert</h4>
                        <p className="text-xs text-slate-400">
                          {expiryRadar.expiring7DaysCount} batch items expiring within 7 days • {expiryRadar.expiring30DaysCount} within 30 days.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {expiryRadar.expiring7DaysItems?.map((item) => (
                        <Tag key={item.id} color="warning" className="text-xs font-semibold">
                          {item.name} ({new Date(item.expiryDate).toLocaleDateString()})
                        </Tag>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stock Table */}
                <div className="glass-panel p-4 rounded-2xl overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-800 pb-2">
                        <th className="p-2">SKU</th>
                        <th className="p-2">Item Name</th>
                        <th className="p-2">Category</th>
                        <th className="p-2">Current Stock</th>
                        <th className="p-2">Reorder Level</th>
                        <th className="p-2">Expiry Date</th>
                        <th className="p-2 text-right">Quick Stock Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventory.map((item) => {
                        const isLow = item.currentStock <= item.reorderLevel;
                        return (
                          <tr key={item.id} className="border-b border-slate-800/60 hover:bg-slate-900/40">
                            <td className="p-2 font-mono text-cyan-400 font-bold">{item.sku}</td>
                            <td className="p-2 font-bold text-slate-200">{item.name}</td>
                            <td className="p-2 text-slate-400">{item.category}</td>
                            <td className="p-2 font-mono">
                              <span className={isLow ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                                {item.currentStock} {item.unit}
                              </span>
                              {isLow && <Tag color="error" className="ml-2 text-[10px]">LOW STOCK</Tag>}
                            </td>
                            <td className="p-2 text-slate-400 font-mono">{item.reorderLevel} {item.unit}</td>
                            <td className="p-2 text-slate-400 font-mono">
                              {new Date(item.expiryDate).toLocaleDateString()}
                            </td>
                            <td className="p-2 text-right">
                              <Button
                                size="small"
                                onClick={() => { setSelectedInvItem(item); setStockModalOpen(true); }}
                                className="spring-button text-xs"
                              >
                                Log Movement
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

              </div>
            )
          }
        ]}
      />

      {/* Reject Order Modal */}
      <Modal
        title="Reject Order"
        open={rejectModalOpen}
        onCancel={() => setRejectModalOpen(false)}
        onOk={() => {
          if (selectedOrder) {
            handleUpdateOrderStatus(selectedOrder.id, 'Rejected', rejectReason);
            setRejectModalOpen(false);
          }
        }}
      >
        <p className="text-xs text-slate-300 mb-2">Provide reason for rejection (reflected to customer):</p>
        <Input.TextArea
          rows={3}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="e.g. Out of stock ingredients, kitchen busy..."
        />
      </Modal>

      {/* Log Stock Movement Modal */}
      <Modal
        title={`Log Stock Movement: ${selectedInvItem?.name}`}
        open={stockModalOpen}
        onCancel={() => setStockModalOpen(false)}
        onOk={handleStockMovementSubmit}
      >
        <div className="space-y-3 py-2 text-xs">
          <div>
            <label className="text-slate-300 font-bold block mb-1">Movement Type:</label>
            <select
              value={movementType}
              onChange={(e) => setMovementType(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-slate-200 p-2 rounded-lg"
            >
              <option value="Stock-In">Stock-In (Purchase / Restock)</option>
              <option value="Consumption">Consumption (Kitchen Usage)</option>
              <option value="Wastage">Wastage (Spill / Expiry)</option>
              <option value="Return">Return to Supplier</option>
            </select>
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Quantity ({selectedInvItem?.unit}):</label>
            <Input
              type="number"
              value={movementQty}
              onChange={(e) => setMovementQty(e.target.value)}
            />
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Notes / Reason:</label>
            <Input
              value={movementReason}
              onChange={(e) => setMovementReason(e.target.value)}
              placeholder="e.g. Restock PO fulfilled, spilled during prep..."
            />
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default StaffDashboard;
