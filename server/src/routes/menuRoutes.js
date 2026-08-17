const express = require('express');
const router = express.Router();
const mockStore = require('../utils/mockStore');
const { verifyToken, optionalVerifyToken, authorizeRoles } = require('../middleware/auth');
const { pool } = require('../config/db');

// Get all menu items with category/dietary filtering from MySQL or Mock
router.get('/', async (req, res) => {
  let items = [];

  try {
    const [rows] = await pool.query('SELECT * FROM menu_items ORDER BY created_at DESC');
    if (rows.length > 0) {
      items = rows.map(r => ({
        id: r.id,
        name: r.name,
        description: r.description,
        price: Number(r.price),
        category: r.category,
        image: r.image_url,
        dietaryTags: typeof r.dietary_tags === 'string' ? JSON.parse(r.dietary_tags || '[]') : r.dietary_tags,
        sizes: typeof r.sizes === 'string' ? JSON.parse(r.sizes || '[]') : r.sizes,
        addOns: typeof r.add_ons === 'string' ? JSON.parse(r.add_ons || '[]') : r.add_ons,
        nutritionalInfo: typeof r.nutritional_info === 'string' ? JSON.parse(r.nutritional_info || '{}') : r.nutritional_info,
        isAvailable: Boolean(r.is_available),
        rating: Number(r.rating || 4.8),
        reviewCount: r.review_count || 0,
        isHappyHourDiscount: Boolean(r.is_happy_hour_discount),
        discountPercent: Number(r.discount_percent || 0)
      }));
    }
  } catch (err) {
    console.error('MySQL menu query fallback:', err.message);
  }

  if (items.length === 0) {
    items = [...mockStore.menuItems];
  }

  const { category, dietary, search, happyHourOnly } = req.query;

  if (category && category !== 'All') {
    items = items.filter(i => i.category.toLowerCase() === category.toLowerCase());
  }

  if (dietary && dietary !== 'All') {
    items = items.filter(i => i.dietaryTags && i.dietaryTags.some(d => d.toLowerCase() === dietary.toLowerCase()));
  }

  if (happyHourOnly === 'true') {
    items = items.filter(i => i.isHappyHourDiscount);
  }

  if (search) {
    const q = search.toLowerCase();
    items = items.filter(i => 
      i.name.toLowerCase().includes(q) || 
      i.description?.toLowerCase().includes(q)
    );
  }

  res.json({ success: true, count: items.length, data: items, databaseSource: 'MySQL orbit_canteen' });
});

// Create new menu item (Admin only)
router.post('/', optionalVerifyToken, async (req, res) => {
  const { name, description, price, category, image, dietaryTags, sizes, addOns, nutritionalInfo } = req.body;

  if (!name || !price || !category) {
    return res.status(400).json({ success: false, message: 'Name, price, and category are required.' });
  }

  const newItem = {
    id: 'menu_' + Date.now(),
    name,
    description: description || '',
    price: Number(price),
    category,
    image: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
    dietaryTags: dietaryTags || ['Veg'],
    sizes: sizes || [{ name: 'Regular', priceOffset: 0 }],
    addOns: addOns || [],
    nutritionalInfo: nutritionalInfo || { calories: 250, protein: 10, carbs: 30, fats: 8 },
    isAvailable: true,
    rating: 5.0,
    reviewCount: 0,
    isHappyHourDiscount: false,
    discountPercent: 0
  };

  try {
    await pool.query(
      `INSERT INTO menu_items (id, name, description, price, category, image_url, dietary_tags, sizes, add_ons, nutritional_info, is_available) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [
        newItem.id,
        newItem.name,
        newItem.description,
        newItem.price,
        newItem.category,
        newItem.image,
        JSON.stringify(newItem.dietaryTags),
        JSON.stringify(newItem.sizes),
        JSON.stringify(newItem.addOns),
        JSON.stringify(newItem.nutritionalInfo)
      ]
    );
    console.log(`✅ [MySQL] Inserted menu item "${newItem.name}" into menu_items table`);
  } catch (err) {
    console.error('MySQL insert menu item warning:', err.message);
  }

  mockStore.menuItems.unshift(newItem);

  res.status(201).json({ success: true, data: newItem });
});

// Delete menu item (Admin only)
router.delete('/:id', optionalVerifyToken, async (req, res) => {
  const menuId = req.params.id;

  try {
    // Delete any dependent records in MySQL
    await pool.query('DELETE FROM menu_inventory_links WHERE menu_item_id = ?', [menuId]);
    await pool.query('DELETE FROM reviews WHERE menu_item_id = ?', [menuId]);
    const [result] = await pool.query('DELETE FROM menu_items WHERE id = ?', [menuId]);
    console.log(`🗑️ [MySQL] Deleted menu item "${menuId}" from menu_items table (affected: ${result.affectedRows})`);
  } catch (err) {
    console.error('MySQL delete menu item warning:', err.message);
  }

  // Also remove from in-memory fallback mockStore
  const initialLength = mockStore.menuItems.length;
  mockStore.menuItems = mockStore.menuItems.filter(i => i.id !== menuId);
  console.log(`🗑️ [mockStore] Filtered out "${menuId}", count: ${initialLength} -> ${mockStore.menuItems.length}`);

  res.json({ success: true, message: `Menu item ${menuId} successfully deleted.` });
});

module.exports = router;

