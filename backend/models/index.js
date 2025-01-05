const User = require('./User');
const Restaurant = require('./Restaurant');
const Review = require('./Review');

// Relationships
User.hasMany(Restaurant, { foreignKey: 'ownerId' });
Restaurant.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' }); // Explicit alias

Restaurant.hasMany(Review, { foreignKey: 'restaurantId', as: 'reviews' }); // Define alias 'reviews'
Review.belongsTo(Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' }); // Optional

User.hasMany(Review, { foreignKey: 'userId', as: 'userReviews' }); // Define alias for user reviews
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' }); // Define alias for user in reviews


module.exports = { User, Restaurant, Review };