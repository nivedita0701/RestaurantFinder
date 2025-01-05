const express = require('express');
const {
    forgotPassword,
    resetPassword,
    updateUserProfile,
    getUserProfile,
    changeUserPassword,
  } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Route: GET /api/users/profile (Protected)
router.get('/profile', protect, getUserProfile);

// Route: PUT /api/users/profile (Protected)
router.put('/profile', protect, updateUserProfile);
router.route('/change-password').put(protect, changeUserPassword);
router.post('/forgot-password', forgotPassword);
// router.post('/reset-password', resetPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
