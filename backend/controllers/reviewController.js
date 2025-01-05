const { v4: isUuid } = require('uuid');
const Restaurant = require('../models/Restaurant');
const Review = require('../models/Review');
const User = require('../models/User'); // Ensure User is imported for review details

// @desc Create a review for a restaurant
// @route POST /api/reviews
// @access Protected
exports.createReview = async (req, res) => {
  const { restaurantId, rating, comment } = req.body;

  // Validate restaurantId
  if (!isUuid(restaurantId)) {
    return res.status(400).json({ message: 'Invalid restaurant ID' });
  }

  // Validate rating
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }

  try {
    // Find the restaurant
    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Create the review
    const review = await Review.create({
      restaurantId,
      userId: req.user.id, // From the authenticated user
      rating,
      comment,
    });

    // Fetch the review with user details
    const populatedReview = await Review.findOne({
      where: { id: review.id },
      include: [{ model: User, as: 'user', attributes: ['name', 'email'] }], // Include user details
    });

    // Update restaurant's ratings
    restaurant.ratingsCount += 1;
    restaurant.totalRatings += rating;
    await restaurant.save();

    const averageRating =
      restaurant.ratingsCount > 0
        ? (restaurant.totalRatings / restaurant.ratingsCount).toFixed(1)
        : null;

    res.status(201).json({
      message: 'Review added successfully',
      review: populatedReview,
      averageRating
    });
  } catch (error) {
    console.error('Error creating review:', error.message);
    res.status(500).json({ message: 'Failed to add review' });
  }
};

// @desc Get all reviews for a restaurant
// @route GET /api/reviews/:restaurantId
// @access Public
exports.getReviewsForRestaurant = async (req, res) => {
  const { restaurantId } = req.params;

  // Validate restaurant existence
  const restaurant = await Restaurant.findByPk(restaurantId);
  if (!restaurant) {
    return res.status(404).json({ message: 'Restaurant not found' });
  }

  try {
    // Fetch all reviews for the restaurant
    const reviews = await Review.findAll({
      where: { restaurantId },
      include: [{ model: User, as: 'user', attributes: ['id', 'name'] }], // Include reviewer name
    });

    res.status(200).json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error.message);
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
};

exports.deleteRating = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the review by ID
    const review = await Review.findByPk(id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Delete the review
    await review.destroy();

    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error.message);
    res.status(500).json({ message: 'Failed to delete review' });
  }
};