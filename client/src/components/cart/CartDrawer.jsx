import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Drawer, Button, Input, Radio, Tag, message, Modal, Divider } from 'antd';
import {
  ShoppingBag, Trash2, Plus, Minus, CreditCard, Wallet, Banknote,
  Award, MapPin, CheckCircle2
} from 'lucide-react';
import {
  updateQuantity, removeFromCart, setOrderType, setTableNumber,
  setDeliveryAddress, setPromoCode, setLoyaltyPointsToRedeem, clearCart
} from '../../store/cartSlice';
import { fetchOrders, setActiveTrackingOrder } from '../../store/orderSlice';
import { updateLoyaltyPoints } from '../../store/authSlice';
import { playSuccessChime } from '../../utils/audio';

export const CartDrawer = ({ open, onClose }) => {
  const { items, orderType, tableNumber, deliveryAddress, promoCode, loyaltyPointsToRedeem } = useSelector((state) => state.cart);
  const { user, token } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('Card Online');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  let discount = 0;
  if (loyaltyPointsToRedeem > 0) discount += loyaltyPointsToRedeem / 10;
  if (promoCode.trim().toUpperCase() === 'ORBIT10') discount += subtotal * 0.1;

  const tax = Number((subtotal * 0.08).toFixed(2));
  const finalTotal = Math.max(0, Number((subtotal - discount + tax).toFixed(2)));

  const handleCheckoutSubmit = async () => {
    if (!items.length) {
      message.error('Your cart is empty.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`
        },
        body: JSON.stringify({
          items, orderType,
          tableNumber: orderType === 'Dine-In' ? tableNumber : null,
          deliveryAddress: orderType === 'Delivery' ? deliveryAddress : null,
          paymentMethod: selectedPaymentMethod,
          promoCode, loyaltyPointsToRedeem
        })
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (data.success) {
        playSuccessChime();
        message.success('Order placed successfully.');

        if (data.data.loyaltyPointsEarned) {
          const newBalance = (user?.loyaltyPoints || 0) - loyaltyPointsToRedeem + data.data.loyaltyPointsEarned;
          dispatch(updateLoyaltyPoints(newBalance));
        }

        dispatch(clearCart());
        dispatch(setActiveTrackingOrder(data.data.id));
        dispatch(fetchOrders(token));
        setPaymentModalOpen(false);
        onClose();
        navigate(`/orders?track=${data.data.id}`);
      } else {
        message.error(data.message || 'Checkout failed.');
      }
    } catch {
      setIsSubmitting(false);
      message.error('Unable to reach the server.');
    }
  };

  const paymentOption = (method, icon, title, subtitle, color) => (
    <div
      className={`p-4 rounded-xl border cursor-pointer spring-button flex items-center justify-between ${
        selectedPaymentMethod === method ? 'border-blue bg-blue-light' : 'border-subtle'
      }`}
      style={{
        padding: 16, borderRadius: 'var(--r-md)', cursor: 'pointer',
        border: `1px solid ${selectedPaymentMethod === method ? 'var(--blue)' : 'var(--border-subtle)'}`,
        background: selectedPaymentMethod === method ? 'var(--blue-light)' : 'var(--bg-secondary)',
      }}
      onClick={() => setSelectedPaymentMethod(method)}
    >
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <h5 style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{title}</h5>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{subtitle}</p>
        </div>
      </div>
      {selectedPaymentMethod === method && <CheckCircle2 size={20} color="var(--blue)" />}
    </div>
  );

  return (
    <Drawer
      title={
        <span style={{ fontWeight: 600, fontSize: 17, letterSpacing: '-0.018em' }}>
          Your bag
        </span>
      }
      placement="right"
      onClose={onClose}
      open={open}
      width={420}
      footer={
        items.length > 0 ? (
          <div style={{ padding: '4px 0' }}>
            <div className="flex justify-between text-sm" style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm" style={{ color: 'var(--green)', marginBottom: 8 }}>
                <span>Discount</span>
                <span>−${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm" style={{ color: 'var(--text-secondary)', marginBottom: 12 }}>
              <span>Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between" style={{ fontSize: 17, fontWeight: 600, marginBottom: 16, paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
              <span>Total</span>
              <span>${finalTotal.toFixed(2)}</span>
            </div>
            <Button type="primary" block size="large" onClick={() => setPaymentModalOpen(true)} style={{ height: 48, borderRadius: 980 }}>
              Check Out · ${finalTotal.toFixed(2)}
            </Button>
          </div>
        ) : null
      }
    >
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20" style={{ color: 'var(--text-secondary)' }}>
          <ShoppingBag size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
          <p style={{ fontSize: 17, fontWeight: 500, marginBottom: 4 }}>Your bag is empty</p>
          <p style={{ fontSize: 14 }}>Add items from the menu to get started.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="glass-panel p-4 space-y-3">
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block' }}>
              Order type
            </label>
            <Radio.Group
              value={orderType}
              onChange={(e) => dispatch(setOrderType(e.target.value))}
              buttonStyle="solid"
              className="w-full grid grid-cols-3 gap-2"
            >
              <Radio.Button value="Dine-In">Dine-In</Radio.Button>
              <Radio.Button value="Takeaway">Takeaway</Radio.Button>
              <Radio.Button value="Delivery">Delivery</Radio.Button>
            </Radio.Group>

            {orderType === 'Dine-In' && (
              <div className="pt-2">
                <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Table</label>
                <div className="grid grid-cols-6 gap-2">
                  {['T-01', 'T-02', 'T-03', 'T-04', 'T-05', 'T-06'].map((tbl) => (
                    <Button
                      key={tbl}
                      size="small"
                      type={tableNumber === tbl ? 'primary' : 'default'}
                      onClick={() => dispatch(setTableNumber(tbl))}
                    >
                      {tbl}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {orderType === 'Delivery' && (
              <div className="pt-2">
                <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Address</label>
                <Input
                  value={deliveryAddress}
                  onChange={(e) => dispatch(setDeliveryAddress(e.target.value))}
                  prefix={<MapPin size={14} color="var(--text-tertiary)" />}
                  placeholder="Delivery address"
                />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-ink-muted-80)' }}>
              Items ({items.length})
            </label>
            {items.map((item) => (
              <div
                key={item.cartId}
                className="glass-panel"
                style={{
                  padding: 12,
                  display: 'flex',
                  gap: 12,
                  alignItems: 'center',
                  background: 'var(--color-canvas)',
                  border: '1px solid var(--color-hairline)',
                  borderRadius: 'var(--r-md)'
                }}
              >
                {/* Properly constrained thumbnail */}
                <div
                  style={{
                    width: 52,
                    height: 52,
                    minWidth: 52,
                    minHeight: 52,
                    maxWidth: 52,
                    maxHeight: 52,
                    borderRadius: 'var(--r-sm)',
                    overflow: 'hidden',
                    flexShrink: 0,
                    backgroundColor: 'var(--color-canvas-parchment)',
                    border: '1px solid var(--color-hairline)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200';
                    }}
                  />
                </div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: 'var(--color-ink)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      marginBottom: 2
                    }}
                  >
                    {item.name}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: 11,
                        padding: '1px 7px',
                        borderRadius: 'var(--r-pill)',
                        backgroundColor: 'var(--color-canvas-parchment)',
                        border: '1px solid var(--color-hairline)',
                        color: 'var(--color-ink-muted-80)'
                      }}
                    >
                      {item.selectedSize}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-ink)' }}>
                      ${item.price.toFixed(2)}
                    </span>
                  </div>
                  {item.selectedAddOns?.length > 0 && (
                    <p
                      style={{
                        fontSize: 11.5,
                        color: 'var(--color-ink-muted-48)',
                        marginTop: 3,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      + {item.selectedAddOns.map(a => a.name).join(', ')}
                    </p>
                  )}
                </div>

                {/* Quantity Controls */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    background: 'var(--color-canvas-parchment)',
                    padding: '2px 4px',
                    borderRadius: 'var(--r-pill)',
                    border: '1px solid var(--color-hairline)'
                  }}
                >
                  <Button
                    type="text"
                    size="small"
                    icon={<Minus size={11} />}
                    onClick={() => dispatch(updateQuantity({ cartId: item.cartId, delta: -1 }))}
                    style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                  />
                  <span style={{ fontSize: 13, fontWeight: 600, padding: '0 4px', minWidth: 16, textAlign: 'center' }}>
                    {item.quantity}
                  </span>
                  <Button
                    type="text"
                    size="small"
                    icon={<Plus size={11} />}
                    onClick={() => dispatch(updateQuantity({ cartId: item.cartId, delta: 1 }))}
                    style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                  />
                </div>

                {/* Delete */}
                <Button
                  type="text"
                  danger
                  icon={<Trash2 size={15} />}
                  onClick={() => dispatch(removeFromCart(item.cartId))}
                  style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                />
              </div>
            ))}
          </div>

          <div className="glass-panel p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2" style={{ fontSize: 13, fontWeight: 600 }}>
                <Award size={16} color="var(--amber)" /> Loyalty points
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Balance: {user?.loyaltyPoints || 0} pts
              </span>
            </div>
            {user?.loyaltyPoints >= 20 ? (
              <div className="flex gap-2">
                <Button size="small" type={loyaltyPointsToRedeem === 50 ? 'primary' : 'default'} onClick={() => dispatch(setLoyaltyPointsToRedeem(loyaltyPointsToRedeem === 50 ? 0 : 50))}>
                  50 pts (−$5)
                </Button>
                <Button size="small" type={loyaltyPointsToRedeem === 100 ? 'primary' : 'default'} onClick={() => dispatch(setLoyaltyPointsToRedeem(loyaltyPointsToRedeem === 100 ? 0 : 100))}>
                  100 pts (−$10)
                </Button>
              </div>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Earn points on every order to unlock discounts.</p>
            )}
            <Divider style={{ margin: '12px 0' }} />
            <div className="flex gap-2">
              <Input placeholder="Promo code (ORBIT10)" value={promoCode} onChange={(e) => dispatch(setPromoCode(e.target.value))} />
              <Button onClick={() => {
                if (promoCode.trim().toUpperCase() === 'ORBIT10') message.success('10% discount applied.');
                else message.error('Invalid promo code');
              }}>Apply</Button>
            </div>
          </div>
        </div>
      )}

      <Modal
        title="Payment"
        open={paymentModalOpen}
        onCancel={() => setPaymentModalOpen(false)}
        footer={null}
        width={400}
        centered
      >
        <div className="space-y-4 py-2">
          <div className="glass-panel p-4 text-center">
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Amount due</p>
            <h2 style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.022em', marginTop: 4 }}>${finalTotal.toFixed(2)}</h2>
          </div>

          <div className="space-y-2">
            {paymentOption('Card Online', <CreditCard size={20} color="var(--blue)" />, 'Credit or debit card', 'Visa, Mastercard, Amex')}
            {paymentOption('Wallet', <Wallet size={20} color="var(--purple)" />, 'Digital wallet', 'UPI and wallet payments')}
            {paymentOption('Cash', <Banknote size={20} color="var(--amber)" />, 'Pay at counter', 'Cash on pickup')}
          </div>

          <Button type="primary" block size="large" loading={isSubmitting} onClick={handleCheckoutSubmit} style={{ height: 48, borderRadius: 980 }}>
            Place Order · ${finalTotal.toFixed(2)}
          </Button>
        </div>
      </Modal>
    </Drawer>
  );
};

export default CartDrawer;
