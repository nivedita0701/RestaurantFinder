const express = require('express');
const {
  getPendingRestaurants,
  approveRestaurant,
  rejectRestaurant,
  approveDeleteRestaurant
} = require('../controllers/authController');
const { protectAdmin } = require('../middleware/authMiddleware'); // Ensure correct path

const router = express.Router();

router.get('/pending-restaurants', protectAdmin, getPendingRestaurants);
router.put('/approve-restaurant/:id', protectAdmin, approveRestaurant);
router.put('/reject-restaurant/:id', protectAdmin, rejectRestaurant);
router.put('/approve-delete/:id', protectAdmin, approveDeleteRestaurant);
module.exports = router;
