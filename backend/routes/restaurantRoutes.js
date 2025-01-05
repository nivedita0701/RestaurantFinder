const express = require('express');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getRestaurantById,
  getRestaurants,
  getCategories,
  createRestaurant,
  updateRestaurant,
  getRestaurantRatings,
  getOwnerRestaurant,
  deleteRestaurant,
  requestDeleteRestaurant
} = require('../controllers/restaurantController');
const upload = require('../middleware/upload'); 


const router = express.Router();

router.get('/', getRestaurants);
router.post('/', protect, upload.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'galleryImages', maxCount: 10 }]), createRestaurant);
router.get('/categories', getCategories);
router.get('/owner', protect, getOwnerRestaurant);
router.get('/:id', getRestaurantById);
router.put('/:id', protect, upload.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'galleryImages', maxCount: 10 }]), updateRestaurant);
router.delete('/:id', protect, adminOnly, deleteRestaurant);
router.get('/:id/ratings', getRestaurantRatings); // Public (no adminOnly)
router.put('/:id/request-delete', protect, requestDeleteRestaurant);

module.exports = router;
