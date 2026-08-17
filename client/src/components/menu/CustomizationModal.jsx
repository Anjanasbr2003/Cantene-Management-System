import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Plus, Minus, X, Check } from 'lucide-react';

const spring = { type: 'spring', bounce: 0, duration: 0.32 };

export const CustomizationModal = ({ open, item, onClose, onAddToCart }) => {
  const { t } = useTranslation();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (item) {
      setSelectedSize(item.sizes?.[0]?.name || 'Standard');
      setSelectedAddOns([]);
      setSpecialInstructions('');
      setQty(1);
    }
  }, [item]);

  if (!item) return null;

  const sizeOffset = item.sizes?.find((s) => s.name === selectedSize)?.priceOffset ?? 0;
  const addOnsTotal = selectedAddOns.reduce((s, a) => s + a.price, 0);
  let unitPrice = item.price + sizeOffset + addOnsTotal;
  if (item.isHappyHourDiscount) unitPrice *= 1 - item.discountPercent / 100;
  const totalPrice = unitPrice * qty;

  const toggleAddOn = (addOn) => {
    setSelectedAddOns((prev) =>
      prev.some((a) => a.name === addOn.name)
        ? prev.filter((a) => a.name !== addOn.name)
        : [...prev, addOn]
    );
  };

  const handleAdd = () => {
    onAddToCart({
      menuItemId: item.id,
      name: item.name,
      image: item.image,
      price: +unitPrice.toFixed(2),
      selectedSize,
      selectedAddOns,
      specialInstructions,
      quantity: qty
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
        >
          {/* Frosted Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)'
            }}
          />

          {/* Modal Container */}
          <motion.div
            key="sheet"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={spring}
            style={{
              position: 'relative',
              zIndex: 1001,
              width: 'min(480px, 100%)',
              maxHeight: 'min(780px, calc(100dvh - 32px))',
              overflowY: 'auto',
              borderRadius: 'var(--r-lg)',
              backgroundColor: 'var(--color-surface-pearl)',
              border: '1px solid var(--color-hairline)',
              boxShadow: '0 25px 60px -10px rgba(0, 0, 0, 0.6), inset 0 1px 0 0 rgba(255, 255, 255, 0.12)'
            }}
          >
            {/* Header Image */}
            <div style={{ position: 'relative' }}>
              <img
                src={item.image}
                alt={item.name}
                className="product-image-surface"
                style={{ width: '100%', height: 200, objectFit: 'cover' }}
              />
              <button
                onClick={onClose}
                className="button-icon-circular"
                style={{
                  position: 'absolute',
                  top: 14,
                  right: 14,
                  width: 36,
                  height: 36,
                  backgroundColor: 'var(--color-surface-pearl)',
                  border: '1px solid var(--color-hairline)',
                  color: 'var(--color-ink)'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, letterSpacing: '-0.28px', color: 'var(--color-ink)', marginBottom: 6 }}>
                  {item.name}
                </h3>
                <p style={{ fontSize: 14, color: 'var(--color-ink-muted-80)', lineHeight: 1.47 }}>
                  {item.description}
                </p>
              </div>

              {/* Sizes Selection (Apple Configurator Chips) */}
              {item.sizes && item.sizes.length > 0 && (
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-ink-muted-48)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                    {t('portion_size')}
                  </label>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {item.sizes.map((s) => {
                      const active = selectedSize === s.name;
                      return (
                        <button
                          key={s.name}
                          type="button"
                          onClick={() => setSelectedSize(s.name)}
                          className={`configurator-option-chip ${active ? 'configurator-option-chip-selected' : ''}`}
                        >
                          {active && <Check size={14} color="var(--color-primary)" />}
                          <span>{s.name}</span>
                          {s.priceOffset > 0 && (
                            <span style={{ fontSize: 12, color: 'var(--color-ink-muted-48)' }}>
                              (+${s.priceOffset.toFixed(2)})
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Add-Ons Options */}
              {item.addOns && item.addOns.length > 0 && (
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-ink-muted-48)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                    {t('add_ons')}
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {item.addOns.map((addOn) => {
                      const active = selectedAddOns.some((a) => a.name === addOn.name);
                      return (
                        <div
                          key={addOn.name}
                          onClick={() => toggleAddOn(addOn)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 16px',
                            borderRadius: 'var(--r-pill)',
                            border: active ? '2px solid var(--color-primary-focus)' : '1px solid var(--color-hairline)',
                            backgroundColor: 'var(--color-canvas)',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div
                              style={{
                                width: 18,
                                height: 18,
                                borderRadius: '50%',
                                border: active ? 'none' : '1px solid var(--color-hairline)',
                                backgroundColor: active ? 'var(--color-primary)' : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              {active && <Check size={12} color="#ffffff" />}
                            </div>
                            <span style={{ fontSize: 14, color: 'var(--color-ink)', fontWeight: active ? 600 : 400 }}>
                              {addOn.name}
                            </span>
                          </div>
                          <span style={{ fontSize: 13, color: 'var(--color-ink-muted-80)', fontWeight: 500 }}>
                            +${addOn.price.toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Special instructions */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-ink-muted-48)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                  {t('special_notes')}
                </label>
                <input
                  type="text"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder={t('special_notes_placeholder')}
                  className="search-input-apple"
                  style={{ height: 40, fontSize: 14 }}
                />
              </div>

              {/* Quantity Counter & Final Action Button */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  paddingTop: 16,
                  borderTop: '1px solid var(--color-hairline)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="button-pearl-capsule"
                    style={{ width: 34, height: 34, padding: 0 }}
                  >
                    <Minus size={14} />
                  </button>
                  <span style={{ fontSize: 16, fontWeight: 600, minWidth: 20, textAlign: 'center' }}>
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="button-pearl-capsule"
                    style={{ width: 34, height: 34, padding: 0 }}
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <button
                  onClick={handleAdd}
                  className="button-primary"
                  style={{ flex: 1, height: 44, fontSize: 15 }}
                >
                  <span>{t('add_to_bag')} • ${totalPrice.toFixed(2)}</span>
                </button>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CustomizationModal;
