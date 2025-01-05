const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const { connectDB } = require('./config/db');
require('./models');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const { errorHandler } = require('./middleware/errorHandler');
const adminRoutes = require('./routes/adminRoutes');


const cors = require('cors');


dotenv.config(); // Load environment variables

const app = express();

// Connect to the database
connectDB();

// Middleware
app.use(express.json()); // Parse JSON requests
app.use(morgan('dev')); // Log HTTP requests in development mode
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Global error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
