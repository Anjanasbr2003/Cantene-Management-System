import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Settings2, Star } from 'lucide-react';

const springConfig = { type: 'spring', bounce: 0, duration: 0.30 };

export const MenuItemCard = ({ item, onQuickAdd, onCustomize }) => {
  const isOut = !item.isAvailable;

  return (
    <motion.div
      layout
      whileHover={isOut ? {} : { y: -4 }}
      whileTap={isOut ? {} : { scale: 0.98 }}
      transition={springConfig}
      className="card-pressable"
      style={{
        borderRadius: 'var(--r-lg)',
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-subtle)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        opacity: isOut ? 0.6 : 1,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', height: 200, overflow: 'hidden', flexShrink: 0, background: 'var(--bg-secondary)' }}>
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transition: 'transform 500ms var(--spring-snappy)',
          }}
          onMouseEnter={e => !isOut && (e.currentTarget.style.transform = 'scale(1.03)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        />

        {/* Dietary tags */}
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {item.dietaryTags?.slice(0, 2).map(tag => (
            <span
              key={tag}
              className={`chip ${tag === 'Non-Veg' ? 'chip-rose' : 'chip-green'}`}
              style={{ fontSize: 11, backdropFilter: 'blur(8px)' }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Happy hour */}
        {item.isHappyHourDiscount && (
          <div style={{
            position: 'absolute', top: 12, right: 12,
            padding: '4px 10px', borderRadius: 'var(--r-pill)',
            background: 'var(--amber)', fontSize: 11, fontWeight: 600, color: '#fff',
          }}>
            {item.discountPercent}% off
          </div>
        )}

        {isOut && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(251,251,253,0.75)', backdropFilter: 'blur(2px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span className="chip chip-rose">Sold out</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <h3 style={{
            fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600,
            color: 'var(--text-primary)', lineHeight: 1.2, letterSpacing: '-0.018em',
          }}>
            {item.name}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            <Star size={12} color="var(--amber)" fill="var(--amber)" />
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
              {item.rating || '4.8'}
            </span>
          </div>
        </div>

        <p style={{
          fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5,
          WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {item.description}
        </p>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: 14, marginTop: 'auto',
        }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 2 }}>From</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{
                fontSize: 20, fontWeight: 600, fontFamily: 'var(--font-display)',
                color: 'var(--text-primary)', letterSpacing: '-0.018em',
              }}>
                ${item.price?.toFixed(2)}
              </span>
              {item.isHappyHourDiscount && (
                <span style={{ fontSize: 13, color: 'var(--text-tertiary)', textDecoration: 'line-through' }}>
                  ${(item.price / (1 - item.discountPercent / 100)).toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {!isOut && (
            <div style={{ display: 'flex', gap: 8 }}>
              <motion.button
                whileTap={{ scale: 0.88 }}
                transition={springConfig}
                onClick={() => onCustomize(item)}
                className="btn-secondary"
                style={{ width: 36, height: 36, padding: 0, borderRadius: '50%' }}
                aria-label="Customize"
              >
                <Settings2 size={15} />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.88 }}
                transition={springConfig}
                onClick={() => onQuickAdd(item)}
                className="btn-primary"
                style={{ width: 36, height: 36, padding: 0, borderRadius: '50%' }}
                aria-label="Add to cart"
              >
                <Plus size={18} />
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MenuItemCard;
