import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Drawer, Button, Input, message, Modal } from 'antd';
import {
  ShoppingBag, Trash2, Plus, Minus, CreditCard, Wallet, Banknote,
  Award, MapPin, CheckCircle2, Sparkles, Tag, ArrowRight, ShieldCheck
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
  const { t } = useTranslation();

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
      message.error(t('empty_bag_title'));
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
        message.success('Order placed successfully!');

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

  const paymentOption = (method, icon, title, subtitle) => (
    <div
      onClick={() => setSelectedPaymentMethod(method)}
      style={{
        padding: '16px 20px',
        borderRadius: 'var(--r-md)',
        cursor: 'pointer',
        border: `1px solid ${selectedPaymentMethod === method ? 'var(--color-primary)' : 'var(--color-hairline)'}`,
        background: selectedPaymentMethod === method ? 'rgba(0, 113, 227, 0.08)' : 'var(--color-canvas-parchment)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'all 0.2s ease',
        marginBottom: 10
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ 
          width: 40, height: 40, borderRadius: '50%', 
          backgroundColor: selectedPaymentMethod === method ? 'var(--color-primary)' : 'var(--color-surface-pearl)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: selectedPaymentMethod === method ? '#ffffff' : 'var(--color-ink)'
        }}>
          {icon}
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--color-ink)' }}>{title}</div>
          <div style={{ fontSize: 12, color: 'var(--color-ink-muted-48)' }}>{subtitle}</div>
        </div>
      </div>
      {selectedPaymentMethod === method && (
        <CheckCircle2 size={20} color="var(--color-primary)" />
      )}
    </div>
  );

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShoppingBag size={20} color="var(--color-primary)" />
          <span style={{ fontWeight: 600, fontSize: 18, letterSpacing: '-0.018em', color: 'var(--color-ink)' }}>
            {t('your_bag')} ({items.length})
          </span>
        </div>
      }
      placement="right"
      onClose={onClose}
      open={open}
      width={440}
      styles={{
        header: { borderBottom: '1px solid var(--color-hairline)', padding: '16px 24px' },
        body: { padding: '24px', backgroundColor: 'var(--color-surface-pearl)' },
        footer: { borderTop: '1px solid var(--color-hairline)', padding: '20px 24px', backgroundColor: 'var(--color-surface-pearl)' }
      }}
      footer={
        items.length > 0 ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14, color: 'var(--color-ink-muted-80)', marginBottom: 8 }}>
              <span>{t('subtotal')}</span>
              <span style={{ fontWeight: 600, color: 'var(--color-ink)' }}>${subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14, color: 'var(--color-success)', marginBottom: 8 }}>
                <span>{t('discount')}</span>
                <span style={{ fontWeight: 600 }}>−${discount.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14, color: 'var(--color-ink-muted-80)', marginBottom: 12 }}>
              <span>{t('tax')}</span>
              <span style={{ fontWeight: 600, color: 'var(--color-ink)' }}>${tax.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 18, fontWeight: 700, color: 'var(--color-ink)', marginBottom: 16, paddingTop: 12, borderTop: '1px solid var(--color-hairline)' }}>
              <span>{t('total_due')}</span>
              <span style={{ color: 'var(--color-primary)' }}>${finalTotal.toFixed(2)}</span>
            </div>
            <button
              onClick={() => setPaymentModalOpen(true)}
              className="button-primary"
              style={{ width: '100%', height: 48, borderRadius: 'var(--r-pill)', fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <span>{t('place_order')}</span>
              <span>•</span>
              <span>${finalTotal.toFixed(2)}</span>
            </button>
          </div>
        ) : null
      }
    >
      {items.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: 'var(--color-canvas-parchment)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, border: '1px solid var(--color-hairline)' }}>
            <ShoppingBag size={36} color="var(--color-ink-muted-48)" />
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 8 }}>{t('empty_bag_title')}</h3>
          <p style={{ fontSize: 14, color: 'var(--color-ink-muted-80)', maxWidth: 280, lineHeight: 1.5, marginBottom: 24 }}>{t('empty_bag_desc')}</p>
          <button onClick={onClose} className="button-primary" style={{ padding: '10px 24px', fontSize: 14 }}>
            {t('explore_menu_btn')}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Order Service Selector Card */}
          <div style={{ backgroundColor: 'var(--color-canvas-parchment)', padding: 18, borderRadius: 'var(--r-md)', border: '1px solid var(--color-hairline)' }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-ink-muted-48)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 12 }}>
              Delivery Mode & Service
            </label>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
              {[
                { type: 'Dine-In', label: t('table_service') },
                { type: 'Takeaway', label: t('takeaway') },
                { type: 'Delivery', label: 'Delivery' }
              ].map((opt) => (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => dispatch(setOrderType(opt.type))}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 'var(--r-pill)',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: orderType === opt.type ? 'var(--color-primary)' : 'var(--color-hairline)',
                    backgroundColor: orderType === opt.type ? 'var(--color-primary)' : 'transparent',
                    color: orderType === opt.type ? '#ffffff' : 'var(--color-ink)',
                    transition: 'all 0.2s ease',
                    textAlign: 'center'
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {orderType === 'Dine-In' && (
              <div style={{ borderTop: '1px solid var(--color-hairline)', paddingTop: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-ink-muted-48)', display: 'block', marginBottom: 8 }}>
                  Select Table Number
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
                  {['T-01', 'T-02', 'T-03', 'T-04', 'T-05', 'T-06'].map((tbl) => (
                    <button
                      key={tbl}
                      type="button"
                      onClick={() => dispatch(setTableNumber(tbl))}
                      style={{
                        padding: '6px 0',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        border: '1px solid',
                        borderColor: tableNumber === tbl ? 'var(--color-primary)' : 'var(--color-hairline)',
                        backgroundColor: tableNumber === tbl ? 'rgba(0, 113, 227, 0.15)' : 'var(--color-surface-pearl)',
                        color: tableNumber === tbl ? 'var(--color-primary)' : 'var(--color-ink)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {tbl}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {orderType === 'Delivery' && (
              <div style={{ borderTop: '1px solid var(--color-hairline)', paddingTop: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-ink-muted-48)', display: 'block', marginBottom: 8 }}>
                  Delivery Address
                </label>
                <Input
                  value={deliveryAddress}
                  onChange={(e) => dispatch(setDeliveryAddress(e.target.value))}
                  prefix={<MapPin size={14} color="var(--color-ink-muted-48)" />}
                  className="search-input-apple"
                  placeholder="Enter full campus / office address"
                  style={{ height: 38 }}
                />
              </div>
            )}
          </div>

          {/* Cart Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-ink-muted-48)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Order Items ({items.reduce((s, i) => s + i.quantity, 0)})
              </span>
              <button
                onClick={() => dispatch(clearCart())}
                style={{ background: 'none', border: 'none', color: 'var(--color-danger)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
              >
                Clear All
              </button>
            </div>

            {items.map((item) => (
              <div
                key={item.cartId}
                style={{
                  padding: 14,
                  display: 'flex',
                  gap: 14,
                  alignItems: 'center',
                  backgroundColor: 'var(--color-canvas-parchment)',
                  border: '1px solid var(--color-hairline)',
                  borderRadius: 'var(--r-md)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}
              >
                {/* Thumbnail */}
                <div
                  style={{
                    width: 54,
                    height: 54,
                    minWidth: 54,
                    minHeight: 54,
                    borderRadius: 10,
                    overflow: 'hidden',
                    flexShrink: 0,
                    backgroundColor: 'var(--color-surface-pearl)',
                    border: '1px solid var(--color-hairline)'
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200';
                    }}
                  />
                </div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-ink)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.name}
                  </h4>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <span className="chip chip-blue" style={{ fontSize: 11, padding: '1px 8px' }}>
                      {item.selectedSize}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-ink)' }}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>

                  {item.selectedAddOns?.length > 0 && (
                    <div style={{ fontSize: 11.5, color: 'var(--color-ink-muted-48)', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      + {item.selectedAddOns.map(a => a.name).join(', ')}
                    </div>
                  )}
                </div>

                {/* Quantity Pill */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    backgroundColor: 'var(--color-surface-pearl)',
                    padding: '4px 6px',
                    borderRadius: 'var(--r-pill)',
                    border: '1px solid var(--color-hairline)'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => dispatch(updateQuantity({ cartId: item.cartId, delta: -1 }))}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: 'var(--color-ink)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <Minus size={12} />
                  </button>
                  <span style={{ fontSize: 13, fontWeight: 600, minWidth: 16, textAlign: 'center', color: 'var(--color-ink)' }}>
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => dispatch(updateQuantity({ cartId: item.cartId, delta: 1 }))}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: 'var(--color-ink)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <Plus size={12} />
                  </button>
                </div>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => dispatch(removeFromCart(item.cartId))}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-danger)',
                    cursor: 'pointer',
                    padding: 4,
                    opacity: 0.8,
                    transition: 'opacity 0.2s'
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Loyalty & Promo Code Card */}
          <div style={{ backgroundColor: 'var(--color-canvas-parchment)', padding: 18, borderRadius: 'var(--r-md)', border: '1px solid var(--color-hairline)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--color-ink)' }}>
                <Award size={16} color="var(--color-warning)" />
                <span>Loyalty Points</span>
              </div>
              <span style={{ fontSize: 12, color: 'var(--color-ink-muted-48)', fontWeight: 500 }}>
                Balance: <strong style={{ color: 'var(--color-ink)' }}>{user?.loyaltyPoints || 0} pts</strong>
              </span>
            </div>

            {user?.loyaltyPoints >= 50 ? (
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <button
                  type="button"
                  onClick={() => dispatch(setLoyaltyPointsToRedeem(loyaltyPointsToRedeem === 50 ? 0 : 50))}
                  className={loyaltyPointsToRedeem === 50 ? 'button-primary' : 'button-pearl-capsule'}
                  style={{ flex: 1, padding: '6px 12px', fontSize: 12 }}
                >
                  50 pts (−$5)
                </button>
                {user?.loyaltyPoints >= 100 && (
                  <button
                    type="button"
                    onClick={() => dispatch(setLoyaltyPointsToRedeem(loyaltyPointsToRedeem === 100 ? 0 : 100))}
                    className={loyaltyPointsToRedeem === 100 ? 'button-primary' : 'button-pearl-capsule'}
                    style={{ flex: 1, padding: '6px 12px', fontSize: 12 }}
                  >
                    100 pts (−$10)
                  </button>
                )}
              </div>
            ) : (
              <p style={{ fontSize: 12, color: 'var(--color-ink-muted-48)', marginBottom: 14 }}>
                Earn 10 points per order to redeem discounts.
              </p>
            )}

            <div style={{ borderTop: '1px solid var(--color-hairline)', paddingTop: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-ink-muted-48)', display: 'block', marginBottom: 8 }}>
                Promo Discount Code
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <Input
                  placeholder="Promo code (ORBIT10)"
                  value={promoCode}
                  onChange={(e) => dispatch(setPromoCode(e.target.value))}
                  className="search-input-apple"
                  style={{ height: 38, flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (promoCode.trim().toUpperCase() === 'ORBIT10') message.success('10% discount applied!');
                    else message.error('Invalid promo code');
                  }}
                  className="button-dark-utility"
                  style={{ height: 38, padding: '0 16px', fontSize: 13 }}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Payment Selection Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CreditCard size={20} color="var(--color-primary)" />
            <span style={{ fontWeight: 600, fontSize: 18 }}>Select Payment Method</span>
          </div>
        }
        open={paymentModalOpen}
        onCancel={() => setPaymentModalOpen(false)}
        footer={null}
        width={420}
        centered
      >
        <div style={{ paddingTop: 12 }}>
          <div style={{ backgroundColor: 'var(--color-surface-pearl)', padding: 20, borderRadius: 'var(--r-md)', textAlign: 'center', marginBottom: 20, border: '1px solid var(--color-hairline)' }}>
            <div style={{ fontSize: 13, color: 'var(--color-ink-muted-48)', marginBottom: 4 }}>Total Amount Payable</div>
            <div style={{ fontSize: 32, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-ink)', letterSpacing: '-0.02em' }}>
              ${finalTotal.toFixed(2)}
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            {paymentOption('Card Online', <CreditCard size={20} />, 'Credit or Debit Card', 'Instant encrypted payment via Visa/Mastercard')}
            {paymentOption('Wallet', <Wallet size={20} />, 'Digital Canteen Wallet', 'Pay using your pre-funded Orbit Wallet')}
            {paymentOption('Cash', <Banknote size={20} />, 'Pay at Counter / Cash', 'Pay cash directly upon table delivery or counter pickup')}
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleCheckoutSubmit}
            className="button-primary"
            style={{ width: '100%', height: 48, borderRadius: 'var(--r-pill)', fontSize: 16, fontWeight: 600 }}
          >
            {isSubmitting ? 'Processing Payment…' : `Confirm & Pay $${finalTotal.toFixed(2)}`}
          </button>
        </div>
      </Modal>
    </Drawer>
  );
};

export default CartDrawer;
