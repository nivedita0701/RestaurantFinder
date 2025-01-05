const express = require('express');
const { registerUser, loginUser, verifyEmail, registerBusinessOwner, rejectRestaurant, approveRestaurant, getPendingRestaurants } = require('../controllers/authController');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-email/:userId', verifyEmail);
router.post('/register-business', registerBusinessOwner);

module.exports = router;
