import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Input, Spin, message } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import { MenuItemCard } from '../components/menu/MenuItemCard';
import { CustomizationModal } from '../components/menu/CustomizationModal';
import { fetchMenuItems, setCategory, setDietary, setSearchQuery } from '../store/menuSlice';
import { addToCart } from '../store/cartSlice';
import { playSuccessChime } from '../utils/audio';

const springConfig = { type: 'spring', bounce: 0, duration: 0.35 };

export const CustomerMenu = () => {
  const { items, selectedCategory, selectedDietary, searchQuery, loading } = useSelector(s => s.menu);
  const dispatch = useDispatch();
  const [customizingItem, setCustomizingItem] = useState(null);

  useEffect(() => { dispatch(fetchMenuItems()); }, [dispatch]);

  const categories = ['All', 'Beverages', 'Breakfast', 'Meals', 'Snacks'];
  const dietaryOptions = ['All', 'Veg', 'Vegan', 'Keto', 'Non-Veg', 'Gluten-Free'];

  const filtered = items.filter(item => {
    const catOk = selectedCategory === 'All' || item.category === selectedCategory;
    const dietOk = selectedDietary === 'All' || item.dietaryTags?.includes(selectedDietary);
    const srchOk = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return catOk && dietOk && srchOk;
  });

  const handleQuickAdd = (item) => {
    dispatch(addToCart({
      menuItemId: item.id, name: item.name, image: item.image, price: item.price,
      selectedSize: item.sizes?.[0]?.name || 'Standard', selectedAddOns: [], specialInstructions: '', quantity: 1,
    }));
    playSuccessChime();
    message.success(`${item.name} added to cart`);
  };

  const pillBtn = (active) => ({
    padding: '8px 16px', borderRadius: 'var(--r-pill)', border: 'none', cursor: 'pointer',
    fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-ui)',
    background: active ? 'var(--text-primary)' : 'var(--bg-secondary)',
    color: active ? 'var(--text-inverse)' : 'var(--text-secondary)',
    transition: 'all 180ms ease',
  });

  const dietBtn = (active) => ({
    padding: '6px 14px', borderRadius: 'var(--r-pill)', border: 'none', cursor: 'pointer',
    fontSize: 12, fontWeight: 500, fontFamily: 'var(--font-ui)',
    background: active ? 'var(--blue-light)' : 'transparent',
    color: active ? 'var(--blue)' : 'var(--text-tertiary)',
    transition: 'all 180ms ease',
  });

  return (
    <div className="page-container">

      {/* Hero — Apple product-page style */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springConfig}
        className="page-hero"
        style={{ paddingBottom: 48 }}
      >
        <p className="chip chip-blue" style={{ marginBottom: 16, display: 'inline-flex' }}>
          Fresh from the kitchen · ~10 min
        </p>
        <h1>
          Order to your table.<br />
          <span style={{ color: 'var(--text-secondary)' }}>Simple. Fast. Delicious.</span>
        </h1>
        <p style={{ marginTop: 16 }}>
          Browse the menu, customize your meal, and track your order in real time.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 20 }}>
          <span className="chip chip-amber">ORBIT10 — 10% off first order</span>
          <span className="chip chip-blue">Earn 1 point per $1</span>
        </div>
      </motion.section>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springConfig, delay: 0.05 }}
        className="glass-panel"
        style={{ padding: '20px 24px', marginBottom: 32 }}
      >
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 8, flex: 1, flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <motion.button
                key={cat}
                whileTap={{ scale: 0.94 }}
                transition={springConfig}
                onClick={() => dispatch(setCategory(cat))}
                style={pillBtn(selectedCategory === cat)}
              >
                {cat}
              </motion.button>
            ))}
          </div>
          <Input
            placeholder="Search menu"
            prefix={<Search size={14} color="var(--text-tertiary)" />}
            value={searchQuery}
            onChange={e => dispatch(setSearchQuery(e.target.value))}
            allowClear
            style={{ width: 220, borderRadius: 'var(--r-sm)' }}
          />
        </div>

        <div style={{
          display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap',
          paddingTop: 16, borderTop: '1px solid var(--border-subtle)',
        }}>
          <Filter size={13} color="var(--text-tertiary)" />
          <span style={{ fontSize: 12, color: 'var(--text-tertiary)', marginRight: 4 }}>Dietary</span>
          {dietaryOptions.map(diet => (
            <motion.button
              key={diet}
              whileTap={{ scale: 0.92 }}
              transition={springConfig}
              onClick={() => dispatch(setDietary(diet))}
              style={dietBtn(selectedDietary === diet)}
            >
              {diet}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Results */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          {loading ? 'Loading…' : `${filtered.length} item${filtered.length !== 1 ? 's' : ''}`}
        </p>
        {(selectedCategory !== 'All' || selectedDietary !== 'All' || searchQuery) && (
          <motion.button
            whileTap={{ scale: 0.94 }}
            transition={springConfig}
            onClick={() => { dispatch(setCategory('All')); dispatch(setDietary('All')); dispatch(setSearchQuery('')); }}
            style={{
              fontSize: 13, color: 'var(--blue)', background: 'none',
              border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)',
            }}
          >
            Clear filters
          </motion.button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <Spin size="large" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel" style={{ padding: 64, textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: 17 }}>No items match your filters.</p>
        </div>
      ) : (
        <motion.div
          layout
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 24,
            paddingBottom: 48,
          }}
        >
          <AnimatePresence>
            {filtered.map((item, i) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ ...springConfig, delay: Math.min(i * 0.03, 0.24) }}
              >
                <MenuItemCard
                  item={item}
                  onQuickAdd={handleQuickAdd}
                  onCustomize={setCustomizingItem}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <CustomizationModal
        open={!!customizingItem}
        item={customizingItem}
        onClose={() => setCustomizingItem(null)}
        onAddToCart={payload => {
          dispatch(addToCart(payload));
          playSuccessChime();
          message.success(`Customized ${payload.name} added to cart`);
        }}
      />
    </div>
  );
};

export default CustomerMenu;
