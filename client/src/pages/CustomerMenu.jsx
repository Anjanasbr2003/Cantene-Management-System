import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Spin, message } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Sparkles, ArrowRight, ShoppingBag, Utensils, QrCode } from 'lucide-react';
import { MenuItemCard } from '../components/menu/MenuItemCard';
import { CustomizationModal } from '../components/menu/CustomizationModal';
import { fetchMenuItems, setCategory, setDietary, setSearchQuery } from '../store/menuSlice';
import { addToCart, setOrderType, setTableNumber } from '../store/cartSlice';
import { playSuccessChime } from '../utils/audio';
import { defaultSeedMenuItems } from '../utils/mockMenuData';

const springTransition = { type: 'spring', bounce: 0, duration: 0.4 };

export const CustomerMenu = () => {
  const { items, selectedCategory, selectedDietary, searchQuery, loading } = useSelector((s) => s.menu);
  const { items: cartItems, totalAmount, tableNumber, orderType } = useSelector((s) => s.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [customizingItem, setCustomizingItem] = useState(null);

  useEffect(() => {
    dispatch(fetchMenuItems());
    const tableParam = searchParams.get('table');
    if (tableParam) {
      dispatch(setOrderType('Dine-In'));
      dispatch(setTableNumber(tableParam));
      message.info(`Welcome! Pre-selected Dine-In for Table ${tableParam}`);
    }
  }, [dispatch, searchParams]);

  const categories = ['All', 'Beverages', 'Breakfast', 'Meals', 'Snacks'];
  const dietaryOptions = ['All', 'Veg', 'Vegan', 'Keto', 'Non-Veg', 'Gluten-Free'];

  const menuList = (items && items.length > 0) ? items : defaultSeedMenuItems;

  const filtered = menuList.filter((item) => {
    const catOk = selectedCategory === 'All' || (item.category && item.category.toLowerCase() === selectedCategory.toLowerCase());
    const dietOk = selectedDietary === 'All' || (item.dietaryTags && item.dietaryTags.some((d) => d.toLowerCase() === selectedDietary.toLowerCase()));
    const srchOk =
      !searchQuery ||
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return catOk && dietOk && srchOk;
  });

  const heroLightItem = menuList.find((i) => i.name?.includes('Espresso') || i.category === 'Beverages') || menuList[0];
  const heroDarkItem = menuList.find((i) => i.name?.includes('Wagyu') || i.name?.includes('Burger') || i.category === 'Meals') || menuList[2];

  const handleQuickAdd = (item) => {
    dispatch(
      addToCart({
        menuItemId: item.id,
        name: item.name,
        image: item.image,
        price: item.price,
        selectedSize: item.sizes?.[0]?.name || 'Standard',
        selectedAddOns: [],
        specialInstructions: '',
        quantity: 1
      })
    );
    playSuccessChime();
    message.success(`${item.name} added to bag`);
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div style={{ backgroundColor: 'var(--color-canvas)', color: 'var(--color-ink)', paddingBottom: totalCartCount > 0 ? 90 : 40 }}>
      
      {/* 1. Full-Bleed Light Hero Product Tile (Canvas #ffffff) with Custom Generated Feast Art */}
      <section className="product-tile-light" style={{ padding: '64px 24px 72px 24px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springTransition}
          style={{ maxWidth: 960, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          {tableNumber && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px', borderRadius: 'var(--r-pill)', backgroundColor: 'rgba(0, 102, 204, 0.1)', color: 'var(--color-primary)', fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
              <QrCode size={14} />
              <span>Dine-In Session Active: Table {tableNumber}</span>
            </div>
          )}

          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-primary)', letterSpacing: '-0.224px', marginBottom: 10 }}>
            Canteen Management System
          </span>

          <h1 className="hero-display" style={{ color: 'var(--color-ink)', marginBottom: 14, textAlign: 'center' }}>
            Reverent Culinary Craft.<br />
            <span style={{ color: 'var(--color-ink-muted-80)' }}>Engineered for absolute freshness.</span>
          </h1>

          <p className="lead-text" style={{ color: 'var(--color-ink-muted-80)', marginBottom: 32, textAlign: 'center', maxWidth: 640 }}>
            Organic farm-to-table preparations served directly to your table with live kitchen tracking.
          </p>

          {/* Action CTAs: Action Blue Pill + Secondary Pill */}
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 44 }}>
            {heroLightItem && (
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={() => handleQuickAdd(heroLightItem)}
                className="button-primary"
              >
                Order Direct (${heroLightItem.price?.toFixed(2)})
              </motion.button>
            )}
            {heroLightItem && (
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={() => setCustomizingItem(heroLightItem)}
                className="button-secondary-pill"
              >
                Customize Recipe
              </motion.button>
            )}
          </div>

          {/* Generated Museum Feast Banner Image */}
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ ...springTransition, delay: 0.15 }}
            style={{ position: 'relative', width: '100%', maxWidth: 840 }}
          >
            <img
              src="/canteen_hero.jpg"
              alt="Canteen Master Feast"
              onError={(e) => { e.currentTarget.src = heroLightItem?.image || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600'; }}
              className="product-image-surface"
              style={{
                width: '100%',
                maxHeight: 420,
                objectFit: 'cover',
                borderRadius: 'var(--r-lg)',
                border: '1px solid var(--color-hairline)'
              }}
            />
            <div style={{
              position: 'absolute',
              bottom: 20,
              left: 24,
              right: 24,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'var(--color-surface-pearl)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              padding: '14px 24px',
              borderRadius: 'var(--r-md)',
              border: '1px solid var(--color-hairline)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)'
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--color-ink)' }}>Artisanal Canteen Tasting Selection</div>
                <div style={{ fontSize: 13, color: 'var(--color-ink-muted-80)' }}>Nitrogen Nitro Cold Brew · Truffle Tagliatelle · Avocado Toast</div>
              </div>
              <button onClick={() => navigate('/tables')} className="button-pearl-capsule" style={{ fontSize: 13 }}>
                Check Tables →
              </button>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* 2. Full-Bleed Dark Hero Product Tile (Surface Tile 1 #272729) with Dark Wagyu Asset */}
      {heroDarkItem && (
        <section className="product-tile-dark" style={{ padding: '80px 24px' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={springTransition}
            style={{ maxWidth: 840, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px', borderRadius: 'var(--r-pill)', backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'var(--color-primary-on-dark)', fontSize: 12, fontWeight: 600, marginBottom: 16 }}>
              <Sparkles size={13} />
              <span>Chef's Special Reserve</span>
            </div>

            <h2 className="display-lg" style={{ color: 'var(--color-body-on-dark)', marginBottom: 14, textAlign: 'center' }}>
              Culinary precision meets instant dining.
            </h2>

            <p className="lead-text" style={{ color: 'var(--color-body-muted)', marginBottom: 28, textAlign: 'center' }}>
              {heroDarkItem.description || 'Nutrient-optimized balanced meal engineered for peak daily energy.'}
            </p>

            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 44 }}>
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={() => handleQuickAdd(heroDarkItem)}
                className="button-primary"
              >
                Add to Bag (${heroDarkItem.price?.toFixed(2)})
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={() => setCustomizingItem(heroDarkItem)}
                className="button-secondary-pill"
                style={{ borderColor: 'var(--color-primary-on-dark)', color: 'var(--color-primary-on-dark)' }}
              >
                Inspect Ingredients
              </motion.button>
            </div>

            <div style={{ position: 'relative', width: '100%', maxWidth: 720 }}>
              <img
                src="/canteen_dark_hero.jpg"
                alt="Cyber Wagyu Reserve"
                onError={(e) => { e.currentTarget.src = heroDarkItem.image; }}
                className="product-image-surface"
                style={{
                  width: '100%',
                  maxHeight: 400,
                  objectFit: 'cover',
                  borderRadius: 'var(--r-lg)',
                  border: '1px solid rgba(255, 255, 255, 0.15)'
                }}
              />
            </div>
          </motion.div>
        </section>
      )}

      {/* 3. Parchment Transition Section: Search & Category Filter Strip */}
      <section style={{ backgroundColor: 'var(--color-canvas-parchment)', padding: '48px 24px 32px 24px', borderTop: '1px solid var(--color-hairline)', borderBottom: '1px solid var(--color-hairline)' }}>
        <div className="apple-container-wide">
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20, marginBottom: 24 }}>
            <div>
              <h2 className="display-md" style={{ color: 'var(--color-ink)', marginBottom: 4 }}>
                Explore Full Canteen Gallery
              </h2>
              <p style={{ fontSize: 14, color: 'var(--color-ink-muted-80)' }}>
                Filter by meal category, macro balance, or dietary requirements
              </p>
            </div>

            {/* Pill Search Input */}
            <div style={{ position: 'relative', width: '100%', maxWidth: 340 }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                placeholder="Search menu & ingredients..."
                className="search-input-apple"
                style={{ paddingLeft: 44 }}
              />
              <Search size={16} color="var(--color-ink-muted-48)" style={{ position: 'absolute', left: 18, top: 14 }} />
            </div>
          </div>

          {/* Category Chips */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 18 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-ink-muted-48)', textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: 4 }}>
              Category:
            </span>
            {categories.map((cat) => {
              const active = selectedCategory.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  onClick={() => dispatch(setCategory(cat))}
                  className={active ? 'button-dark-utility' : 'button-pearl-capsule'}
                  style={{
                    borderRadius: 'var(--r-pill)',
                    padding: '8px 18px',
                    fontSize: 14,
                    fontWeight: active ? 600 : 400
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Dietary Chips */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', paddingTop: 14, borderTop: '1px solid var(--color-hairline)' }}>
            <Filter size={14} color="var(--color-ink-muted-48)" />
            <span style={{ fontSize: 12, color: 'var(--color-ink-muted-48)', marginRight: 4 }}>Dietary:</span>
            {dietaryOptions.map((diet) => {
              const active = selectedDietary.toLowerCase() === diet.toLowerCase();
              return (
                <button
                  key={diet}
                  onClick={() => dispatch(setDietary(diet))}
                  style={{
                    background: active ? 'rgba(0, 102, 204, 0.1)' : 'transparent',
                    color: active ? 'var(--color-primary)' : 'var(--color-ink-muted-80)',
                    border: active ? '1px solid var(--color-primary)' : '1px solid transparent',
                    borderRadius: 'var(--r-pill)',
                    padding: '4px 12px',
                    fontSize: 13,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {diet}
                </button>
              );
            })}
          </div>

        </div>
      </section>

      {/* 4. Product Gallery Grid (Store Utility Cards) */}
      <section className="apple-container-wide" style={{ padding: '48px 24px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <p style={{ fontSize: 14, color: 'var(--color-ink-muted-80)' }}>
            Showing {filtered.length} available preparation{filtered.length !== 1 ? 's' : ''}
          </p>
          {(selectedCategory !== 'All' || selectedDietary !== 'All' || searchQuery) && (
            <button
              onClick={() => {
                dispatch(setCategory('All'));
                dispatch(setDietary('All'));
                dispatch(setSearchQuery(''));
              }}
              className="text-link"
              style={{ fontSize: 14 }}
            >
              Reset all filters
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
            <Spin size="large" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="store-utility-card" style={{ padding: 64, textAlign: 'center', margin: '40px 0' }}>
            <p style={{ color: 'var(--color-ink-muted-80)', fontSize: 17, marginBottom: 12 }}>
              No culinary items match the selected parameters.
            </p>
            <button
              onClick={() => {
                dispatch(setCategory('All'));
                dispatch(setDietary('All'));
                dispatch(setSearchQuery(''));
              }}
              className="button-primary"
            >
              View Full Gallery
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
              gap: 28
            }}
          >
            <AnimatePresence>
              {filtered.map((item, i) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ ...springTransition, delay: Math.min(i * 0.03, 0.24) }}
                >
                  <MenuItemCard
                    item={item}
                    onQuickAdd={handleQuickAdd}
                    onCustomize={setCustomizingItem}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* 5. Apple Floating Sticky Bar (When Cart has items) */}
      {totalCartCount > 0 && (
        <div className="floating-sticky-bar">
          <div className="apple-container-wide" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                <ShoppingBag size={18} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-ink)' }}>
                  {totalCartCount} item{totalCartCount !== 1 ? 's' : ''} in Bag {tableNumber ? `(Table ${tableNumber})` : ''}
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-ink-muted-80)' }}>
                  Estimated Kitchen Prep: ~8-12 min
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, color: 'var(--color-ink-muted-48)' }}>Subtotal</div>
                <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-ink)', fontFamily: 'var(--font-display)' }}>
                  ${totalAmount?.toFixed(2)}
                </div>
              </div>

              <button
                onClick={() => navigate('/orders')}
                className="button-primary"
                style={{ padding: '10px 24px' }}
              >
                <span>Track Order</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customization Modal */}
      <CustomizationModal
        open={!!customizingItem}
        item={customizingItem}
        onClose={() => setCustomizingItem(null)}
        onAddToCart={(payload) => {
          dispatch(addToCart(payload));
          playSuccessChime();
          message.success(`Customized ${payload.name} added to bag`);
        }}
      />
    </div>
  );
};

export default CustomerMenu;
