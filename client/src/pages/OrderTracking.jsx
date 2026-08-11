import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { Tag, Button, Steps, message, Divider } from 'antd';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  RotateCcw, 
  Sparkles,
  UtensilsCrossed
} from 'lucide-react';
import { fetchOrders, setActiveTrackingOrder, upsertOrder } from '../store/orderSlice';
import { addToCart } from '../store/cartSlice';
import jsPDF from 'jspdf';

export const OrderTracking = () => {
  const { orders, activeTrackingOrderId } = useSelector((state) => state.orders);
  const { token, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [searchParams] = useSearchParams();
  const trackIdFromUrl = searchParams.get('track');

  useEffect(() => {
    dispatch(fetchOrders(token));
    if (trackIdFromUrl) {
      dispatch(setActiveTrackingOrder(trackIdFromUrl));
    }
  }, [dispatch, token, trackIdFromUrl]);

  const activeOrder = orders.find(o => o.id === (activeTrackingOrderId || trackIdFromUrl || orders[0]?.id));

  // Generate PDF Invoice
  const generatePDFInvoice = (order) => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('ORBIT CANTEEN INVOICE', 14, 22);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice No: ${order.id}`, 14, 30);
    doc.text(`Customer Name: ${order.customerName}`, 14, 36);
    doc.text(`Order Type: ${order.orderType} ${order.tableNumber ? `(${order.tableNumber})` : ''}`, 14, 42);
    doc.text(`Date & Time: ${new Date(order.createdAt).toLocaleString()}`, 14, 48);

    doc.line(14, 54, 196, 54);

    let y = 64;
    doc.setFont('helvetica', 'bold');
    doc.text('Item Description', 14, y);
    doc.text('Qty', 120, y);
    doc.text('Price', 140, y);
    doc.text('Total', 170, y);

    y += 6;
    doc.setFont('helvetica', 'normal');
    order.items.forEach((item) => {
      doc.text(`${item.name} (${item.selectedSize})`, 14, y);
      doc.text(`${item.quantity}`, 120, y);
      doc.text(`$${item.price.toFixed(2)}`, 140, y);
      doc.text(`$${(item.price * item.quantity).toFixed(2)}`, 170, y);
      y += 6;
    });

    doc.line(14, y, 196, y);
    y += 8;

    doc.setFont('helvetica', 'bold');
    doc.text(`Subtotal: $${order.subtotal?.toFixed(2)}`, 140, y);
    y += 6;
    doc.text(`Tax (8%): $${order.tax?.toFixed(2)}`, 140, y);
    y += 6;
    doc.text(`Total Amount Paid: $${order.totalAmount?.toFixed(2)}`, 140, y);

    doc.save(`Invoice_${order.id}.pdf`);
    message.success('PDF Invoice downloaded!');
  };

  // Re-Order Handler
  const handleReorder = (order) => {
    order.items.forEach((item) => {
      dispatch(addToCart({
        menuItemId: item.menuItemId,
        name: item.name,
        price: item.price,
        selectedSize: item.selectedSize,
        selectedAddOns: item.selectedAddOns || [],
        specialInstructions: item.specialInstructions || '',
        quantity: item.quantity
      }));
    });
    message.success('Order items copied to cart!');
  };

  // Cancel order request
  const handleCancelOrder = async (orderId) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        dispatch(upsertOrder(data.data));
        message.success('Order cancelled and refund initiated.');
      } else {
        message.error(data.message || 'Order cannot be cancelled.');
      }
    } catch (e) {
      message.error('Cancellation error.');
    }
  };

  const getStepCurrent = (status) => {
    switch (status) {
      case 'Received': return 0;
      case 'Preparing': return 1;
      case 'Ready': return 2;
      case 'Served/Completed':
      case 'Completed': return 3;
      default: return 0;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center" style={{ background: 'var(--blue)', borderRadius: 'var(--r-md)' }}>
            <ShoppingBag className="w-6 h-6" style={{ color: '#fff' }} />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-display">
              Order Tracking
            </h2>
            <p className="text-xs text-slate-400">
              Live status updates and order history
            </p>
          </div>
        </div>
      </div>

      {activeOrder ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Active Tracking Card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel-glow p-6 rounded-3xl space-y-6">
              
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs text-slate-400 font-mono">TRACKING ORDER ID</span>
                  <h3 className="text-xl font-bold font-mono text-cyan-300">{activeOrder.id}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Placed: {new Date(activeOrder.createdAt).toLocaleTimeString()} • {activeOrder.orderType} {activeOrder.tableNumber ? `(${activeOrder.tableNumber})` : ''}
                  </p>
                </div>

                <div className="text-right">
                  <Tag color={activeOrder.status === 'Ready' ? 'green' : activeOrder.status === 'Cancelled' ? 'error' : 'cyan'} className="text-xs font-bold px-3 py-1">
                    {activeOrder.status}
                  </Tag>
                  <p className="text-xs font-mono font-bold text-slate-200 mt-1">
                    Est. Prep: ~{activeOrder.estimatedPrepMinutes || 10} Mins
                  </p>
                </div>
              </div>

              {/* Real-time Status Steps Pipeline */}
              {activeOrder.status !== 'Cancelled' && activeOrder.status !== 'Rejected' && (
                <div className="py-4">
                  <Steps
                    current={getStepCurrent(activeOrder.status)}
                    items={[
                      { title: 'Received', description: 'Kitchen Notified' },
                      { title: 'Preparing', description: 'Chef Cooking' },
                      { title: 'Ready', description: 'Pickup / Serve' },
                      { title: 'Completed', description: 'Order Fulfilled' }
                    ]}
                  />
                </div>
              )}

              {/* Order Items List */}
              <div className="space-y-2 border-t border-slate-800 pt-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase">Ordered Items</h4>
                {activeOrder.items.map((it, idx) => (
                  <div key={idx} className="p-3 glass-panel rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-slate-200">{it.quantity}x {it.name}</span>
                      <span className="text-[11px] text-cyan-400 ml-2">({it.selectedSize})</span>
                      {it.specialInstructions && (
                        <p className="text-[10px] text-slate-500 italic mt-0.5">"{it.specialInstructions}"</p>
                      )}
                    </div>
                    <span className="font-mono font-bold text-slate-300">${(it.price * it.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Total & Action Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <span className="text-xs text-slate-400 block">Total Amount Paid</span>
                  <span className="text-xl font-bold font-mono text-cyan-300">${activeOrder.totalAmount?.toFixed(2)}</span>
                </div>

                <div className="flex gap-2">
                  <Button
                    icon={<FileText className="w-4 h-4 text-cyan-400" />}
                    onClick={() => generatePDFInvoice(activeOrder)}
                    className="spring-button text-xs font-bold"
                  >
                    Download Invoice (PDF)
                  </Button>

                  <Button
                    icon={<RotateCcw className="w-4 h-4 text-purple-400" />}
                    onClick={() => handleReorder(activeOrder)}
                    className="spring-button text-xs font-bold"
                  >
                    Re-Order Items
                  </Button>

                  {activeOrder.status === 'Received' && (
                    <Button
                      danger
                      onClick={() => handleCancelOrder(activeOrder.id)}
                      className="spring-button text-xs"
                    >
                      Cancel Order
                    </Button>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Sidebar: Order History List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase">Your Order History</h4>
            {orders.map((ord) => (
              <div
                key={ord.id}
                onClick={() => dispatch(setActiveTrackingOrder(ord.id))}
                className={`p-4 glass-panel rounded-2xl cursor-pointer spring-button space-y-2 border transition-all ${
                  ord.id === activeOrder.id ? 'border-cyan-400 bg-cyan-950/20' : 'border-slate-800'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-cyan-300 text-xs">{ord.id}</span>
                  <Tag color={ord.status === 'Ready' ? 'green' : 'cyan'} className="text-[10px]">
                    {ord.status}
                  </Tag>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>{new Date(ord.createdAt).toLocaleDateString()}</span>
                  <span className="font-mono text-slate-200 font-bold">${ord.totalAmount?.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      ) : (
        <div className="glass-panel p-12 text-center text-slate-400">No orders found.</div>
      )}

    </div>
  );
};

export default OrderTracking;
