import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  RotateCcw, 
  Sparkles,
  ChefHat,
  ArrowRight,
  PhoneCall,
  Flame,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchOrders, setActiveTrackingOrder } from '../store/orderSlice';
import { addToCart } from '../store/cartSlice';
import { playSuccessChime } from '../utils/audio';
import jsPDF from 'jspdf';

const springTransition = { type: 'spring', bounce: 0, duration: 0.35 };

export const OrderTracking = () => {
  const { orders, activeTrackingOrderId } = useSelector((state) => state.orders);
  const { token, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const trackIdFromUrl = searchParams.get('track');

  const defaultSampleOrders = [
    {
      id: 'ORD-9821',
      customerName: user?.name || 'Alex Mercer',
      customerId: user?.id || 'usr_customer',
      orderType: 'Dine-In',
      tableNumber: 'T-04',
      status: 'Preparing',
      items: [
        { menuItemId: 'menu_3', name: 'Cyber Wagyu Burger', selectedSize: 'Single Stack (M)', price: 16.5, quantity: 1, selectedAddOns: [{ name: 'Fried Farm Egg', price: 1.5 }], specialInstructions: 'Medium rare patty' },
        { menuItemId: 'menu_1', name: 'Quantum Espresso', selectedSize: 'Double Shot (M)', price: 5.7, quantity: 1, selectedAddOns: [], specialInstructions: '' }
      ],
      subtotal: 23.7,
      discount: 2.0,
      loyaltyPointsEarned: 23,
      tax: 1.9,
      totalAmount: 23.6,
      paymentMethod: 'Card Online',
      paymentStatus: 'Paid',
      estimatedPrepMinutes: 8,
      createdAt: new Date(Date.now() - 10 * 60000).toISOString()
    },
    {
      id: 'ORD-9822',
      customerName: user?.name || 'Alex Mercer',
      customerId: user?.id || 'usr_customer',
      orderType: 'Dine-In',
      tableNumber: 'T-02',
      status: 'Ready',
      items: [
        { menuItemId: 'menu_2', name: 'Nebula Matcha Latte', selectedSize: 'Standard (M)', price: 6.0, quantity: 2, selectedAddOns: [{ name: 'Boba Pearls', price: 1.0 }], specialInstructions: 'Extra warm' },
        { menuItemId: 'menu_6', name: 'Dark Matter Chocolate Brownie', selectedSize: 'Single Slice', price: 7.5, quantity: 1, selectedAddOns: [], specialInstructions: '' }
      ],
      subtotal: 21.5,
      discount: 0,
      loyaltyPointsEarned: 21,
      tax: 1.7,
      totalAmount: 23.2,
      paymentMethod: 'Apple Pay',
      paymentStatus: 'Paid',
      estimatedPrepMinutes: 0,
      createdAt: new Date(Date.now() - 22 * 60000).toISOString()
    },
    {
      id: 'ORD-9818',
      customerName: user?.name || 'Alex Mercer',
      customerId: user?.id || 'usr_customer',
      orderType: 'Takeaway',
      tableNumber: null,
      status: 'Completed',
      items: [
        { menuItemId: 'menu_5', name: 'Supernova Truffle Pasta', selectedSize: 'Regular', price: 18.0, quantity: 1, selectedAddOns: [], specialInstructions: '' }
      ],
      subtotal: 18.0,
      discount: 1.8,
      loyaltyPointsEarned: 18,
      tax: 1.4,
      totalAmount: 17.6,
      paymentMethod: 'Card Online',
      paymentStatus: 'Paid',
      estimatedPrepMinutes: 0,
      createdAt: new Date(Date.now() - 120 * 60000).toISOString()
    }
  ];

  const allOrders = (orders && orders.length > 0) ? orders : defaultSampleOrders;

  useEffect(() => {
    dispatch(fetchOrders(token));
    if (trackIdFromUrl) {
      dispatch(setActiveTrackingOrder(trackIdFromUrl));
    }
  }, [dispatch, token, trackIdFromUrl]);

  const activeOrder = allOrders.find(o => o.id === (activeTrackingOrderId || trackIdFromUrl || allOrders[0]?.id)) || allOrders[0];

  const getStepIndex = (status) => {
    switch (status) {
      case 'Received': return 0;
      case 'Preparing': return 1;
      case 'Ready': return 2;
      case 'Served':
      case 'Completed': return 3;
      case 'Cancelled': return -1;
      default: return 0;
    }
  };

  const stepsList = [
    { title: 'Received', subtitle: 'Sent to KDS', icon: ShoppingBag },
    { title: 'Preparing', subtitle: 'Cooking', icon: ChefHat },
    { title: 'Ready', subtitle: 'Dispatch', icon: Sparkles },
    { title: 'Completed', subtitle: 'Served', icon: CheckCircle2 }
  ];

  const currentStep = activeOrder ? getStepIndex(activeOrder.status) : 0;

  const generatePDFInvoice = (order) => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('CANTEEN MANAGEMENT SYSTEM - INVOICE', 14, 22);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Order Ref: ${order.id}`, 14, 32);
    doc.text(`Customer Name: ${order.customerName}`, 14, 38);
    doc.text(`Order Type: ${order.orderType} ${order.tableNumber ? `(Table ${order.tableNumber})` : ''}`, 14, 44);
    doc.text(`Date & Time: ${new Date(order.createdAt).toLocaleString()}`, 14, 50);

    doc.line(14, 56, 196, 56);

    let y = 66;
    doc.setFont('helvetica', 'bold');
    doc.text('Item Description', 14, y);
    doc.text('Qty', 120, y);
    doc.text('Price', 140, y);
    doc.text('Total', 170, y);

    y += 8;
    doc.setFont('helvetica', 'normal');
    order.items.forEach((item) => {
      const lineTotal = item.price * item.quantity;
      doc.text(item.name, 14, y);
      doc.text(String(item.quantity), 120, y);
      doc.text(`$${item.price.toFixed(2)}`, 140, y);
      doc.text(`$${lineTotal.toFixed(2)}`, 170, y);
      y += 8;
    });

    doc.line(14, y, 196, y);
    y += 10;
    doc.text(`Subtotal: $${order.subtotal?.toFixed(2)}`, 140, y);
    y += 6;
    doc.text(`Tax (8%): $${order.tax?.toFixed(2)}`, 140, y);
    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.text(`Final Paid Amount: $${order.totalAmount?.toFixed(2)}`, 140, y);

    doc.save(`Invoice_${order.id}.pdf`);
    playSuccessChime();
    message.success(`Downloaded Invoice PDF for ${order.id}`);
  };

  const handleReorder = (order) => {
    order.items.forEach(item => {
      dispatch(addToCart({
        menuItemId: item.menuItemId,
        name: item.name,
        price: item.price,
        selectedSize: item.selectedSize || 'Standard',
        selectedAddOns: item.selectedAddOns || [],
        specialInstructions: item.specialInstructions || '',
        quantity: item.quantity
      }));
    });
    playSuccessChime();
    message.success(`Items from ${order.id} re-added to your bag!`);
    navigate('/menu');
  };

  const handleCallStaff = (tableNumber) => {
    playSuccessChime();
    message.info(`🔔 Staff notified for Table ${tableNumber || 'service'}. A team member will arrive shortly!`);
  };

  return (
    <div 
      style={{ 
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.90), rgba(245, 245, 247, 0.94)), url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600&auto=format&fit=crop&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        minHeight: 'calc(100vh - 96px)',
        paddingBottom: 64
      }}
    >
      
      {/* Header Bar */}
      <section 
        style={{ 
          backgroundColor: 'rgba(245, 245, 247, 0.85)', 
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
                <Clock size={14} />
                <span>Live Kitchen Dispatch & Order Telemetry</span>
              </div>
              <h1 className="display-lg" style={{ color: 'var(--color-ink)', marginBottom: 8 }}>
                Live Order Radar & Tracking
              </h1>
              <p style={{ fontSize: 17, color: 'var(--color-ink-muted-80)' }}>
                Track active preparations in real time or view historical receipts.
              </p>
            </div>

            <button onClick={() => navigate('/menu')} className="button-primary">
              <ShoppingBag size={16} />
              <span>Place New Order</span>
            </button>
          </div>

          {/* Quick Order Tabs */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 28 }}>
            {allOrders.map((ord) => {
              const active = activeOrder?.id === ord.id;
              return (
                <button
                  key={ord.id}
                  onClick={() => dispatch(setActiveTrackingOrder(ord.id))}
                  className={active ? 'button-dark-utility' : 'button-pearl-capsule'}
                  style={{
                    borderRadius: 'var(--r-pill)',
                    padding: '8px 18px',
                    fontSize: 14,
                    fontWeight: active ? 600 : 400,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  <span>{ord.id}</span>
                  <span style={{ fontSize: 11, opacity: 0.8 }}>({ord.status})</span>
                </button>
              );
            })}
          </div>

        </div>
      </section>

      {/* Main Order Details & Timeline */}
      {activeOrder && (
        <section className="apple-container-wide" style={{ padding: '48px 24px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 32 }}>
            
            {/* Left Card */}
            <div 
              className="store-utility-card" 
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.94)', 
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                padding: 32 
              }}
            >
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--color-hairline)' }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--color-ink-muted-48)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                    Active Order Reference
                  </div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 600, color: 'var(--color-ink)', letterSpacing: '-0.374px' }}>
                    {activeOrder.id}
                  </h2>
                  <div style={{ fontSize: 14, color: 'var(--color-ink-muted-80)', marginTop: 4 }}>
                    {activeOrder.orderType} {activeOrder.tableNumber ? `• Table ${activeOrder.tableNumber}` : ''}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span className={`chip ${activeOrder.status === 'Preparing' ? 'chip-amber' : activeOrder.status === 'Ready' ? 'chip-green' : 'chip-blue'}`} style={{ fontSize: 13, padding: '6px 14px' }}>
                    ● {activeOrder.status}
                  </span>
                  {activeOrder.status === 'Preparing' && (
                    <div style={{ fontSize: 12, color: 'var(--color-ink-muted-80)', marginTop: 8 }}>
                      Prep time: ~{activeOrder.estimatedPrepMinutes || 8} min
                    </div>
                  )}
                </div>
              </div>

              {/* Custom Un-Truncated Responsive Step Tracker */}
              <div style={{ margin: '36px 0 28px 0' }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, position: 'relative' }}>
                  
                  {/* Connecting Line Track */}
                  <div style={{ position: 'absolute', top: 22, left: '12%', right: '12%', height: 3, backgroundColor: 'var(--color-hairline)', zIndex: 0 }}>
                    <div 
                      style={{ 
                        height: '100%', 
                        width: `${(currentStep / 3) * 100}%`, 
                        backgroundColor: 'var(--color-primary)', 
                        transition: 'width 0.4s ease' 
                      }} 
                    />
                  </div>

                  {stepsList.map((step, idx) => {
                    const isDone = idx < currentStep;
                    const isCurrent = idx === currentStep;
                    const IconComp = step.icon;

                    return (
                      <div key={idx} style={{ textAlign: 'center', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        
                        {/* Circle Badge */}
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: isDone || isCurrent ? 'var(--color-primary)' : '#f5f5f7',
                            color: isDone || isCurrent ? '#ffffff' : '#7a7a7a',
                            boxShadow: isCurrent ? '0 0 0 4px rgba(0, 102, 204, 0.2)' : 'none',
                            transition: 'all 0.3s ease',
                            marginBottom: 10
                          }}
                        >
                          {isDone ? <Check size={20} /> : <IconComp size={20} />}
                        </div>

                        {/* Title & Subtitle */}
                        <div style={{ fontSize: 13, fontWeight: isCurrent || isDone ? 600 : 500, color: isCurrent || isDone ? 'var(--color-ink)' : 'var(--color-ink-muted-48)', lineHeight: 1.2 }}>
                          {step.title}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--color-ink-muted-48)', marginTop: 2 }}>
                          {step.subtitle}
                        </div>

                      </div>
                    );
                  })}

                </div>

              </div>

              {/* Status Callout Card */}
              <div
                style={{
                  backgroundColor: 'rgba(245, 245, 247, 0.8)',
                  borderRadius: 'var(--r-md)',
                  padding: 20,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  border: '1px solid var(--color-hairline)',
                  marginBottom: 28
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: 'rgba(0, 102, 204, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {activeOrder.status === 'Preparing' ? <ChefHat size={22} color="var(--color-warning)" /> : <CheckCircle2 size={22} color="var(--color-success)" />}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-ink)' }}>
                    {activeOrder.status === 'Preparing' ? 'Chefs are crafting your dish now' : activeOrder.status === 'Ready' ? 'Your order is hot & ready!' : 'Order Processed & Completed'}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--color-ink-muted-80)' }}>
                    {activeOrder.tableNumber ? `Delivering to Table ${activeOrder.tableNumber} shortly.` : 'Ready for pickup at the main counter.'}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button
                  onClick={() => generatePDFInvoice(activeOrder)}
                  className="button-pearl-capsule"
                  style={{ flex: 1, padding: '10px 16px', fontSize: 14 }}
                >
                  <FileText size={15} />
                  <span>Download Invoice PDF</span>
                </button>

                <button
                  onClick={() => handleReorder(activeOrder)}
                  className="button-pearl-capsule"
                  style={{ flex: 1, padding: '10px 16px', fontSize: 14 }}
                >
                  <RotateCcw size={15} />
                  <span>Re-Order Items</span>
                </button>

                {activeOrder.tableNumber && (
                  <button
                    onClick={() => handleCallStaff(activeOrder.tableNumber)}
                    className="button-secondary-pill"
                    style={{ padding: '10px 16px', fontSize: 14 }}
                  >
                    <PhoneCall size={15} />
                    <span>Call Table Service</span>
                  </button>
                )}
              </div>

            </div>

            {/* Right Card */}
            <div 
              className="store-utility-card" 
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.94)', 
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                padding: 32, 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between' 
              }}
            >
              
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid var(--color-hairline)' }}>
                  Itemized Order Breakdown
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 28 }}>
                  {activeOrder.items?.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-primary)', backgroundColor: 'rgba(0, 102, 204, 0.1)', padding: '2px 8px', borderRadius: 6, height: 24, display: 'inline-flex', alignItems: 'center' }}>
                          {item.quantity}x
                        </span>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-ink)' }}>
                            {item.name}
                          </div>
                          <div style={{ fontSize: 13, color: 'var(--color-ink-muted-48)' }}>
                            {item.selectedSize} {item.selectedAddOns?.map(a => `+ ${a.name}`).join(', ')}
                          </div>
                          {item.specialInstructions && (
                            <div style={{ fontSize: 12, color: 'var(--color-warning)', fontStyle: 'italic', marginTop: 2 }}>
                              Note: "{item.specialInstructions}"
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-ink)', fontFamily: 'var(--font-display)' }}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Totals */}
              <div style={{ borderTop: '1px solid var(--color-hairline)', paddingTop: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--color-ink-muted-80)', marginBottom: 8 }}>
                  <span>Subtotal</span>
                  <span>${activeOrder.subtotal?.toFixed(2)}</span>
                </div>

                {activeOrder.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--color-success)', marginBottom: 8 }}>
                    <span>Discount / Loyalty</span>
                    <span>−${activeOrder.discount?.toFixed(2)}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--color-ink-muted-80)', marginBottom: 14 }}>
                  <span>Tax (8%)</span>
                  <span>${activeOrder.tax?.toFixed(2)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 600, color: 'var(--color-ink)', paddingTop: 12, borderTop: '1px solid var(--color-divider-soft)' }}>
                  <span>Total Paid ({activeOrder.paymentMethod})</span>
                  <span style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-display)' }}>
                    ${activeOrder.totalAmount?.toFixed(2)}
                  </span>
                </div>
              </div>

            </div>

          </div>

        </section>
      )}

    </div>
  );
};

export default OrderTracking;
