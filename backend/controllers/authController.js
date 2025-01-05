const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Review = require('../models/Review');
const generateToken = require('../utils/generateToken');
const validator = require('validator');
const { sendVerificationEmail, sendStatusUpdateEmail } = require('../utils/emailService');
const { sequelize } = require('../config/db'); // Ensure this is the correct path

// Login user & get token
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) return res.status(401).json({ message: 'Invalid email or password' });

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id, user.role),
    });
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ message: 'An error occurred during login' });
  }
};

// Verify user email
exports.verifyEmail = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isVerified = true;
    await user.save();
    res.status(200).json({ message: 'Email verified successfully!' });
  } catch (error) {
    console.error('Error verifying email:', error.message);
    res.status(500).json({ message: 'Failed to verify email' });
  }
};

// Register a new user
exports.registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    if (
      !validator.isStrongPassword(password, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
    ) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters long, contain a number, a symbol, and an uppercase letter',
      });
    }

    const userExists = await User.findOne({ where: { email } });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user',
    });

    await sendVerificationEmail(user.id, user.email);

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id, user.role),
    });
  } catch (error) {
    console.error('Registration Error:', error.message);
    res.status(500).json({ message: 'An error occurred during registration' });
  }
};

exports.registerBusinessOwner = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  if (
    !validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
  ) {
    return res.status(400).json({
      message: 'Password must be at least 8 characters and include uppercase, number, symbol.',
    });
  }

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    return res.status(400).json({ message: 'A user with this email already exists.' });
  }

  try {
    const businessOwner = await User.create({
      name,
      email,
      password,
      role: 'businessOwner',
      isVerified: false,
    });

    const token = generateToken(businessOwner.id, businessOwner.role);
    res.status(201).json({
      message: 'Business owner user registered successfully. You can now create your restaurant.',
      token,
    });
  } catch (error) {
    console.error('Error registering business owner:', error.message);
    res.status(500).json({ message: 'An error occurred during registration.' });
  }
};

// Get all pending restaurants
exports.getPendingRestaurants = async (req, res) => {
  try {
    const pendingRestaurants = await Restaurant.findAll({
      where: { status: 'pending' },
      attributes: [
        'id',
        'name',
        'street',
        'building',
        'city',
        'state',
        'pincode',
        'category',
        'priceRange',
        'workingHours',
        'mapLocation',
        'thumbnailUrl',
        'createdAt',
      ],
    });

    const formattedRestaurants = pendingRestaurants.map((restaurant) => ({
      ...restaurant.toJSON(),
      address: `${restaurant.street}, ${restaurant.building ? `${restaurant.building}, ` : ''}${restaurant.city}, ${restaurant.state}, ${restaurant.pincode}`,
    }));

    res.status(200).json(formattedRestaurants);
  } catch (error) {
    console.error('Error fetching pending restaurants:', error.message);
    res.status(500).json({ message: 'Failed to fetch pending restaurants.' });
  }
};

// Approve a pending restaurant
exports.approveRestaurant = async (req, res) => {
  const { id } = req.params;
  try {
    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    restaurant.status = 'approved';
    await restaurant.save();

    // Fetch owner's email
    const owner = await User.findByPk(restaurant.ownerId);
    if (owner) {
      await sendStatusUpdateEmail(owner.email, restaurant.name, 'approved');
    }

    res.json({ message: 'Restaurant approved successfully', restaurant });
  } catch (error) {
    console.error('Error approving restaurant:', error.message);
    res.status(500).json({ message: 'Failed to approve restaurant' });
  }
};

// Reject a pending restaurant
exports.rejectRestaurant = async (req, res) => {
  const { id } = req.params;
  try {
    const restaurant = await Restaurant.findByPk(id);

    if (!restaurant || restaurant.status !== 'pending') {
      return res.status(404).json({ message: 'Restaurant not found or not pending.' });
    }

    restaurant.status = 'rejected';
    await restaurant.save();

    // Fetch owner's email
    const owner = await User.findByPk(restaurant.ownerId);
    if (owner) {
      await sendStatusUpdateEmail(owner.email, restaurant.name, 'rejected');
    }

    res.status(200).json({ message: 'Restaurant rejected successfully.' });
  } catch (error) {
    console.error('Rejection Error:', error.message);
    res.status(500).json({ message: 'Failed to reject restaurant.' });
  }
};

// PUT /api/admin/approve-delete/:id
// Admin approves deletion. Actually deletes the restaurant and associated reviews.
exports.approveDeleteRestaurant = async (req, res) => {
  const { id } = req.params;
  try {
    // Admin only route, ensure `protect, adminOnly` in routes
    const restaurant = await Restaurant.findByPk(id);
    // Fetch owner's email
    const owner = await User.findByPk(restaurant.ownerId);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found.' });

    if (!restaurant.deleteRequested) {
      return res.status(400).json({ message: 'Delete not requested for this restaurant.' });
    }

    // Delete associated reviews
    await Review.destroy({ where: { restaurantId: id } });

    // Delete restaurant
    await restaurant.destroy();
    if (owner) {
      await sendStatusUpdateEmail(owner.email, restaurant.name, 'delete approved');
    }

    res.json({ message: 'Restaurant deletion approved and completed.' });
  } catch (error) {
    console.error('Error approving deletion:', error.message);
    res.status(500).json({ message: 'Failed to approve deletion.' });
  }
};
