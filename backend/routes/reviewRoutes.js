const express = require('express');
const {
  createReview,
  getReviewsForRestaurant,
  deleteRating
} = require('../controllers/reviewController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Route: POST /api/reviews (Protected)
// Description: Add a new review
router.post('/', protect, createReview);

// Route: GET /api/reviews/:restaurantId
// Description: Get all reviews for a restaurant
router.get('/:restaurantId', getReviewsForRestaurant);
router.delete('/:id', protect, adminOnly, deleteRating);

module.exports = router;
