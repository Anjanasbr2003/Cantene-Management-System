import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, X } from 'lucide-react';

const spring = { type: 'spring', bounce: 0, duration: 0.32 };

export const CustomizationModal = ({ open, item, onClose, onAddToCart }) => {
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

  const sizeOffset = item.sizes?.find(s => s.name === selectedSize)?.priceOffset ?? 0;
  const addOnsTotal = selectedAddOns.reduce((s, a) => s + a.price, 0);
  let unitPrice = item.price + sizeOffset + addOnsTotal;
  if (item.isHappyHourDiscount) unitPrice *= (1 - item.discountPercent / 100);
  const totalPrice = unitPrice * qty;

  const toggleAddOn = (addOn) => {
    setSelectedAddOns(prev =>
      prev.some(a => a.name === addOn.name)
        ? prev.filter(a => a.name !== addOn.name)
        : [...prev, addOn]
    );
  };

  const handleAdd = () => {
    onAddToCart({
      menuItemId: item.id, name: item.name, image: item.image,
      price: +unitPrice.toFixed(2), selectedSize, selectedAddOns,
      specialInstructions, quantity: qty,
    });
    onClose();
  };

  const optionStyle = (active) => ({
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 16px', borderRadius: 'var(--r-md)', cursor: 'pointer',
    background: active ? 'var(--blue-light)' : 'var(--bg-secondary)',
    border: `1px solid ${active ? 'var(--blue)' : 'transparent'}`,
    transition: 'all 140ms ease', textAlign: 'left',
    fontFamily: 'var(--font-ui)', width: '100%',
  });

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, zIndex: 999,
              background: 'rgba(0,0,0,0.32)', backdropFilter: 'blur(4px)',
            }}
          />

          <motion.div
            key="sheet"
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={spring}
            style={{
              position: 'fixed', zIndex: 1000,
              top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: 'min(440px, calc(100vw - 32px))',
              maxHeight: 'calc(100dvh - 48px)',
              overflowY: 'auto',
              borderRadius: 'var(--r-xl)',
              background: 'var(--bg-elevated)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ position: 'relative' }}>
              <img src={item.image} alt={item.name} style={{ width: '100%', height: 180, objectFit: 'cover' }} />
              <button
                onClick={onClose}
                style={{
                  position: 'absolute', top: 12, right: 12, width: 32, height: 32,
                  borderRadius: '50%', background: 'rgba(255,255,255,0.92)', border: 'none',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-secondary)', boxShadow: 'var(--shadow-sm)',
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                  {item.dietaryTags?.map(t => (
                    <span key={t} className={`chip ${t === 'Non-Veg' ? 'chip-rose' : 'chip-green'}`}>{t}</span>
                  ))}
                </div>
                <h2 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.022em' }}>{item.name}</h2>
              </div>

              {item.nutritionalInfo && (
                <div style={{ display: 'flex', gap: 0, borderRadius: 'var(--r-md)', overflow: 'hidden', background: 'var(--bg-secondary)' }}>
                  {[
                    { label: 'Calories', value: `${item.nutritionalInfo.calories} kcal` },
                    { label: 'Protein', value: `${item.nutritionalInfo.protein}g` },
                    { label: 'Carbs', value: `${item.nutritionalInfo.carbs}g` },
                  ].map((n, i, arr) => (
                    <div key={n.label} style={{
                      flex: 1, padding: '12px', textAlign: 'center',
                      borderRight: i < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    }}>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4 }}>{n.label}</div>
                      <div style={{ fontSize: 15, fontWeight: 600 }}>{n.value}</div>
                    </div>
                  ))}
                </div>
              )}

              {item.sizes?.length > 0 && (
                <section>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 10 }}>
                    Portion size
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {item.sizes.map(s => {
                      const active = selectedSize === s.name;
                      return (
                        <motion.button
                          key={s.name}
                          whileTap={{ scale: 0.97 }}
                          transition={spring}
                          onClick={() => setSelectedSize(s.name)}
                          style={optionStyle(active)}
                        >
                          <span style={{ fontSize: 14, fontWeight: 500, color: active ? 'var(--blue)' : 'var(--text-primary)' }}>{s.name}</span>
                          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                            {s.priceOffset > 0 ? `+$${s.priceOffset.toFixed(2)}` : s.priceOffset < 0 ? `−$${Math.abs(s.priceOffset).toFixed(2)}` : 'Included'}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </section>
              )}

              {item.addOns?.length > 0 && (
                <section>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 10 }}>
                    Add-ons
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {item.addOns.map(addOn => {
                      const checked = selectedAddOns.some(a => a.name === addOn.name);
                      return (
                        <motion.button
                          key={addOn.name}
                          whileTap={{ scale: 0.97 }}
                          transition={spring}
                          onClick={() => toggleAddOn(addOn)}
                          style={optionStyle(checked)}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                              width: 18, height: 18, borderRadius: 4,
                              background: checked ? 'var(--blue)' : 'transparent',
                              border: `1.5px solid ${checked ? 'var(--blue)' : 'var(--border-default)'}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              {checked && <span style={{ fontSize: 11, color: '#fff', fontWeight: 700 }}>✓</span>}
                            </div>
                            <span style={{ fontSize: 14, fontWeight: 500 }}>{addOn.name}</span>
                          </div>
                          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>+${addOn.price.toFixed(2)}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </section>
              )}

              <section>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 10 }}>
                  Special instructions
                </label>
                <textarea
                  value={specialInstructions}
                  onChange={e => setSpecialInstructions(e.target.value)}
                  placeholder="Less ice, medium-rare, nut allergy…"
                  rows={2}
                  style={{
                    width: '100%', borderRadius: 'var(--r-md)', padding: '12px 16px',
                    background: 'var(--bg-secondary)', border: '1px solid transparent',
                    color: 'var(--text-primary)', fontSize: 14, fontFamily: 'var(--font-ui)',
                    resize: 'vertical', outline: 'none', lineHeight: 1.5,
                  }}
                  onFocus={e => (e.target.style.borderColor = 'var(--blue)')}
                  onBlur={e => (e.target.style.borderColor = 'transparent')}
                />
              </section>

              <div style={{ display: 'flex', gap: 12, alignItems: 'center', paddingTop: 8 }}>
                <div style={{
                  display: 'flex', alignItems: 'center',
                  border: '1px solid var(--border-default)', borderRadius: 'var(--r-pill)', overflow: 'hidden',
                }}>
                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    transition={spring}
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                  >
                    <Minus size={14} />
                  </motion.button>
                  <span style={{ padding: '0 16px', fontSize: 15, fontWeight: 600, minWidth: 40, textAlign: 'center' }}>{qty}</span>
                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    transition={spring}
                    onClick={() => setQty(q => q + 1)}
                    style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                  >
                    <Plus size={14} />
                  </motion.button>
                </div>

                <motion.button
                  whileTap={{ scale: 0.96 }}
                  transition={spring}
                  onClick={handleAdd}
                  className="btn-primary"
                  style={{ flex: 1, height: 44 }}
                >
                  Add to Cart · ${totalPrice.toFixed(2)}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CustomizationModal;
