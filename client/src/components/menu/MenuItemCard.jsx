import React from 'react';
import { motion } from 'framer-motion';
import { Plus, SlidersHorizontal, Star } from 'lucide-react';

const springTransition = { type: 'spring', bounce: 0, duration: 0.3 };

export const MenuItemCard = ({ item, onQuickAdd, onCustomize }) => {
  const isOut = !item.isAvailable;

  return (
    <div
      className="store-utility-card"
      style={{
        opacity: isOut ? 0.6 : 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      {/* 1:1 Ratio Product Imagery with Signature Apple Product Shadow */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          paddingTop: '85%', // 1:1 or slightly cinematic crop
          overflow: 'hidden',
          borderRadius: 'var(--r-sm)',
          backgroundColor: 'var(--color-canvas-parchment)',
          marginBottom: 18
        }}
      >
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600'; }}
          className="product-image-surface"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />

        {/* Dietary badges */}
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {item.dietaryTags?.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className={`chip ${tag === 'Non-Veg' ? 'chip-rose' : 'chip-green'}`}
              style={{ fontSize: 11, backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Happy Hour Badge */}
        {item.isHappyHourDiscount && (
          <div
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              padding: '4px 10px',
              borderRadius: 'var(--r-pill)',
              backgroundColor: 'var(--color-warning)',
              fontSize: 11,
              fontWeight: 600,
              color: '#ffffff'
            }}
          >
            {item.discountPercent}% off
          </div>
        )}

        {/* Sold out overlay */}
        {isOut && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <span className="chip chip-rose" style={{ fontSize: 12, fontWeight: 600 }}>
              Sold out
            </span>
          </div>
        )}
      </div>

      {/* Content Stack */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        
        {/* Title & Rating */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <h3
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 17,
              fontWeight: 600,
              lineHeight: 1.24,
              letterSpacing: '-0.374px',
              color: 'var(--color-ink)'
            }}
          >
            {item.name}
          </h3>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            <Star size={12} color="var(--color-warning)" fill="var(--color-warning)" />
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-ink-muted-80)' }}>
              {item.rating || '4.9'}
            </span>
          </div>
        </div>

        {/* Editorial Description */}
        <p
          style={{
            fontSize: 14,
            fontWeight: 400,
            lineHeight: 1.43,
            letterSpacing: '-0.224px',
            color: 'var(--color-ink-muted-80)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {item.description}
        </p>

        {/* Price & Actions Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 16,
            marginTop: 'auto',
            borderTop: '1px solid var(--color-divider-soft)'
          }}
        >
          <div>
            <div style={{ fontSize: 12, color: 'var(--color-ink-muted-48)', letterSpacing: '-0.12px' }}>
              From
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  fontFamily: 'var(--font-display)',
                  color: 'var(--color-ink)',
                  letterSpacing: '-0.28px'
                }}
              >
                ${item.price?.toFixed(2)}
              </span>
              {item.isHappyHourDiscount && (
                <span style={{ fontSize: 13, color: 'var(--color-ink-muted-48)', textDecoration: 'line-through' }}>
                  ${(item.price / (1 - item.discountPercent / 100)).toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {!isOut && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              
              {/* Customize specs */}
              <motion.button
                whileTap={{ scale: 0.92 }}
                transition={springTransition}
                onClick={() => onCustomize(item)}
                className="button-pearl-capsule"
                style={{ height: 36, padding: '0 12px' }}
                title="Customize recipe"
              >
                <SlidersHorizontal size={14} />
                <span style={{ fontSize: 12 }}>Specs</span>
              </motion.button>

              {/* Action Blue Quick Add */}
              <motion.button
                whileTap={{ scale: 0.92 }}
                transition={springTransition}
                onClick={() => onQuickAdd(item)}
                className="button-primary"
                style={{ height: 36, padding: '0 16px', fontSize: 14 }}
              >
                <Plus size={16} />
                <span>Add</span>
              </motion.button>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;
