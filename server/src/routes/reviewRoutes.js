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
  if (!menuItemId || rating === undefined) {
    return res.status(400).json({ success: false, message: 'Menu item ID and rating are required.' });
  }

  const numericRating = Math.min(5, Math.max(1, parseInt(rating, 10) || 5));

  const newReview = {
    id: 'rev_' + Date.now(),
    menuItemId: String(menuItemId).slice(0, 50),
    menuItemName: menuItemName ? String(menuItemName).slice(0, 120) : 'Canteen Item',
    customerName: req.user?.name ? String(req.user.name).slice(0, 100) : 'Diner',
    rating: numericRating,
    comment: comment ? String(comment).slice(0, 500) : '',
    status: 'Approved',
    createdAt: new Date().toISOString()
  };

  mockStore.reviews.unshift(newReview);

  // Recalculate menu item rating
  const itemReviews = mockStore.reviews.filter(r => r.menuItemId === menuItemId && r.status === 'Approved');
  const avgRating = itemReviews.reduce((sum, r) => sum + r.rating, 0) / (itemReviews.length || 1);
  
  const menuItem = mockStore.menuItems.find(m => m.id === menuItemId);
  if (menuItem) {
    menuItem.rating = Number(avgRating.toFixed(2));
    menuItem.reviewCount = itemReviews.length;
  }

  res.status(201).json({ success: true, data: newReview });
});

// Admin moderate review
const ALLOWED_REVIEW_STATUSES = ['Pending', 'Approved', 'Rejected'];

router.patch('/:id/moderate', verifyToken, authorizeRoles('admin'), (req, res) => {
  const { status } = req.body;

  if (!status || !ALLOWED_REVIEW_STATUSES.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid review status. Allowed: ${ALLOWED_REVIEW_STATUSES.join(', ')}`
    });
  }

  const review = mockStore.reviews.find(r => r.id === req.params.id);

  if (!review) {
    return res.status(404).json({ success: false, message: 'Review not found.' });
  }

  review.status = status;
  res.json({ success: true, data: review });
});

module.exports = router;
