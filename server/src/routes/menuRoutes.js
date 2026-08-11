const express = require('express');
const router = express.Router();
const mockStore = require('../utils/mockStore');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

// Get all menu items with category/dietary filtering
router.get('/', (req, res) => {
  let items = [...mockStore.menuItems];
  const { category, dietary, search, happyHourOnly } = req.query;

  if (category && category !== 'All') {
    items = items.filter(i => i.category.toLowerCase() === category.toLowerCase());
  }

  if (dietary && dietary !== 'All') {
    items = items.filter(i => i.dietaryTags && i.dietaryTags.includes(dietary));
  }

  if (happyHourOnly === 'true') {
    items = items.filter(i => i.isHappyHourDiscount);
  }

  if (search) {
    const q = search.toLowerCase();
    items = items.filter(i => 
      i.name.toLowerCase().includes(q) || 
      i.description.toLowerCase().includes(q)
    );
  }

  res.json({ success: true, count: items.length, data: items });
});

// Create new menu item (Admin only)
router.post('/', verifyToken, authorizeRoles('admin'), (req, res) => {
  const { name, description, price, category, image, dietaryTags, sizes, addOns, nutritionalInfo, linkedInventoryIds } = req.body;

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
    linkedInventoryIds: linkedInventoryIds || [],
    rating: 5.0,
    reviewCount: 0,
    isHappyHourDiscount: false,
    discountPercent: 0
  };

  mockStore.menuItems.push(newItem);
  mockStore.addAuditLog('MENU_ITEM_CREATED', `${req.user.name} (${req.user.role})`, `Created menu item "${name}" ($${price})`);

  res.status(201).json({ success: true, data: newItem });
});

// Update menu item (Admin only)
router.put('/:id', verifyToken, authorizeRoles('admin'), (req, res) => {
  const item = mockStore.menuItems.find(m => m.id === req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Menu item not found.' });
  }

  Object.assign(item, req.body);
  mockStore.addAuditLog('MENU_ITEM_UPDATED', `${req.user.name} (${req.user.role})`, `Updated menu item "${item.name}"`);

  res.json({ success: true, data: item });
});

// Toggle Availability (Admin & Staff)
router.patch('/:id/toggle-availability', verifyToken, authorizeRoles('admin', 'staff'), (req, res) => {
  const item = mockStore.menuItems.find(m => m.id === req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Menu item not found.' });
  }

  item.isAvailable = !item.isAvailable;
  mockStore.addAuditLog(
    'MENU_AVAILABILITY_TOGGLED',
    `${req.user.name} (${req.user.role})`,
    `Toggled "${item.name}" to ${item.isAvailable ? 'Available' : 'Unavailable'}`
  );

  res.json({ success: true, data: item });
});

// Toggle Happy Hour discount (Admin only)
router.patch('/:id/happy-hour', verifyToken, authorizeRoles('admin'), (req, res) => {
  const { isHappyHourDiscount, discountPercent } = req.body;
  const item = mockStore.menuItems.find(m => m.id === req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Menu item not found.' });
  }

  item.isHappyHourDiscount = !!isHappyHourDiscount;
  item.discountPercent = discountPercent !== undefined ? Number(discountPercent) : 15;

  mockStore.addAuditLog(
    'HAPPY_HOUR_TOGGLE',
    `${req.user.name} (${req.user.role})`,
    `Happy Hour ${item.isHappyHourDiscount ? 'ON' : 'OFF'} for "${item.name}" (${item.discountPercent}%)`
  );

  res.json({ success: true, data: item });
});

// Delete menu item (Admin only)
router.delete('/:id', verifyToken, authorizeRoles('admin'), (req, res) => {
  const idx = mockStore.menuItems.findIndex(m => m.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Menu item not found.' });
  }

  const deleted = mockStore.menuItems.splice(idx, 1)[0];
  mockStore.addAuditLog('MENU_ITEM_DELETED', `${req.user.name} (${req.user.role})`, `Deleted menu item "${deleted.name}"`);

  res.json({ success: true, message: 'Menu item deleted.' });
});

module.exports = router;
