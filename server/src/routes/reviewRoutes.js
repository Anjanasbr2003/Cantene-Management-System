const express = require('express');
const router = express.Router();
const mockStore = require('../utils/mockStore');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

// Get approved reviews (or all for Admin)
router.get('/', (req, res) => {
  let reviews = [...mockStore.reviews];
  if (req.query.status) {
    reviews = reviews.filter(r => r.status === req.query.status);
  } else if (!req.headers.authorization) {
    reviews = reviews.filter(r => r.status === 'Approved');
  }
  res.json({ success: true, count: reviews.length, data: reviews });
});

// Submit review (Customer)
router.post('/', verifyToken, (req, res) => {
  const { menuItemId, menuItemName, rating, comment } = req.body;
  if (!menuItemId || !rating) {
    return res.status(400).json({ success: false, message: 'Menu item ID and rating are required.' });
  }

  const newReview = {
    id: 'rev_' + Date.now(),
    menuItemId,
    menuItemName: menuItemName || 'Canteen Item',
    customerName: req.user.name,
    rating: Number(rating),
    comment: comment || '',
    status: 'Approved', // Auto-approved for demo
    createdAt: new Date().toISOString()
  };

  mockStore.reviews.unshift(newReview);

  // Recalculate menu item rating
  const itemReviews = mockStore.reviews.filter(r => r.menuItemId === menuItemId && r.status === 'Approved');
  const avgRating = itemReviews.reduce((sum, r) => sum + r.rating, 0) / itemReviews.length;
  
  const menuItem = mockStore.menuItems.find(m => m.id === menuItemId);
  if (menuItem) {
    menuItem.rating = Number(avgRating.toFixed(2));
    menuItem.reviewCount = itemReviews.length;
  }

  res.status(201).json({ success: true, data: newReview });
});

// Admin moderate review
router.patch('/:id/moderate', verifyToken, authorizeRoles('admin'), (req, res) => {
  const { status } = req.body;
  const review = mockStore.reviews.find(r => r.id === req.params.id);

  if (!review) {
    return res.status(404).json({ success: false, message: 'Review not found.' });
  }

  review.status = status;
  res.json({ success: true, data: review });
});

module.exports = router;
