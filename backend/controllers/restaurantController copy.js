const AWS = require('aws-sdk');
const { uploadToS3, deleteFromS3 } = require('../utils/s3');

const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Review = require('../models/Review');
const { sequelize } = require('../config/db'); // Ensure this is the correct path
const { Op } = require('sequelize');
const { sendVerificationEmail, sendBusinessRegistrationEmail } = require('../utils/emailService');


// Configure AWS for image deletion if needed
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

exports.getRestaurantById = async (req, res) => {
  const { id } = req.params;
  try {
    const restaurant = await Restaurant.findByPk(id, {
      include: [
        {
          model: User,
          as: 'owner', // Include owner details with alias
          attributes: ['id', 'name', 'email'], // Include only necessary fields
        },
        {
          model: Review,
          as: 'reviews', // Match the alias defined in the relationship
          include: [
            {
              model: User,
              as: 'user', // Include user details for each review
              attributes: ['name'], // Include only necessary fields
            },
          ],
        },
      ],
    });

    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    const averageRating =
      restaurant.ratingsCount > 0
        ? (restaurant.totalRatings / restaurant.ratingsCount).toFixed(1)
        : null;

    res.status(200).json({
      ...restaurant.toJSON(),
      averageRating,
      address: `${restaurant.street}${
        restaurant.building ? ', ' + restaurant.building : ''
      }, ${restaurant.city}, ${restaurant.state}, ${restaurant.pincode}`,
    });
  } catch (error) {
    console.error('Error fetching restaurant by ID:', error.message);
    res.status(500).json({ message: 'Failed to fetch restaurant details' });
  }
};

exports.getRestaurants = async (req, res) => {
  const { search, category, priceRange, rating, latitude, longitude, zipcode } = req.query;
  const filters = { status: 'approved' }; // Fetch only approved restaurants

  if (search) filters.name = { [Op.iLike]: `%${search}%` };
  if (category) filters.category = category;
  if (priceRange) filters.priceRange = priceRange;

  // Filter by rating
  if (rating) {
    filters.ratingsCount = { [Op.gt]: 0 }; // Ensure restaurants have ratings
    filters.totalRatings = {
      [Op.gte]: parseFloat(rating) * sequelize.col('ratingsCount'),
    };
  }

  try {
    let restaurants;

    if (latitude && longitude) {
      // Geolocation filtering
      restaurants = await Restaurant.findAll({
        where: filters,
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
          'ratingsCount',
          'totalRatings',
          'thumbnailUrl',
          [sequelize.literal(`"mapLocation"`), 'mapLocation'],
          // [
          //   sequelize.literal(`
          //     ST_DistanceSphere(
          //       ST_MakePoint(
          //         CAST("mapLocation"->>'lng' AS DOUBLE PRECISION),
          //         CAST("mapLocation"->>'lat' AS DOUBLE PRECISION)
          //       ),
          //       ST_MakePoint(${longitude}, ${latitude})
          //     )
          //   `),
          //   'distance',
          // ],
        ],
        order: [[sequelize.literal(`
          (CAST("mapLocation"->>'lat' AS DOUBLE PRECISION) - ${latitude})^2 +
          (CAST("mapLocation"->>'lng' AS DOUBLE PRECISION) - ${longitude})^2
        `), 'ASC']], // Simplified distance approximation
        limit: 20, // Optional: limit results
      });
    } else {
      // Fallback to simple filters (zipcode + other conditions)
      restaurants = await Restaurant.findAll({ where: filters });
    }
    res.json(restaurants);
  } catch (err) {
    console.error('Error fetching restaurants:', err.message);
    res.status(500).json({ message: 'Failed to fetch restaurants' });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Restaurant.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('category')), 'category']],
      order: [['category', 'ASC']],
    });
    const categoryList = categories.map((item) => item.get('category'));
    res.json(categoryList);
  } catch (error) {
    console.error('Error fetching categories:', error.message);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
};


exports.getOwnerRestaurant = async (req,res)=>{
  try {
    const ownerId = req.user.id;
    const restaurants = await Restaurant.findAll({
      where:{ownerId}
    });
    if(!restaurants||restaurants.length===0) {
      return res.status(404).json({message:'No restaurants found for this owner.'});
    }
    const formatted = restaurants.map(r=>({
      ...r.toJSON(),
      address:`${r.street}${r.building?', '+r.building:''}, ${r.city}, ${r.state}, ${r.pincode}`
    }));
    res.status(200).json(formatted);
  } catch(error){
    console.error('Error fetching restaurants for owner:',error.message);
    res.status(500).json({message:'Failed to fetch restaurants.'});
  }
};

// createRestaurant
exports.createRestaurant = async (req,res)=>{
  const { name, street, building, city, state, pincode, category, priceRange } = req.body;
  let workingHours = req.body.workingHours?JSON.parse(req.body.workingHours):null;
  let mapLocation = req.body.mapLocation?JSON.parse(req.body.mapLocation):null;

  if(!name||!street||!city||!state||!pincode||!category||!priceRange){
    return res.status(400).json({message:'Missing required fields.'});
  }

  try {
    const ownerId = req.user.id;
    const duplicate = await Restaurant.findOne({where:{name,street,city,state,pincode,ownerId}});
    if(duplicate){
      return res.status(400).json({message:'A restaurant with this name and address already exists under your ownership.'});
    }

    const restaurant = await Restaurant.create({
      name, street, building, city, state, pincode, category, priceRange,
      ownerId, status:'pending', workingHours, mapLocation
    });

    if (req.files && req.files.thumbnail && req.files.thumbnail[0]) {
      const file = req.files.thumbnail[0];
      try {
        const thumbnailUrl = await uploadToS3(file, `thumbnails/${restaurant.id}`); // Folder per restaurant
        restaurant.thumbnailUrl = thumbnailUrl;
      } catch (error) {
        console.error('Thumbnail upload failed:', error.message);
        return res.status(500).json({ message: 'Failed to upload thumbnail' });
      }
    }    

    // Upload gallery images
    if (req.files && req.files.galleryImages) {
      const galleryUrls = [];
      for (const file of req.files.galleryImages) {
        const galleryUrl = await uploadToS3(file, 'gallery-images');
        galleryUrls.push(galleryUrl);
      }
      restaurant.galleryImages = galleryUrls;
    }

    // Fetch the owner's details to send the emails
    const owner = await User.findByPk(ownerId);

    // Send business registration email
    await sendBusinessRegistrationEmail(owner.email, restaurant.name);

    // If the user is not verified, send the verification email
    if (!owner.isVerified) {
      await sendVerificationEmail(owner.id, owner.email);
    }

    await restaurant.save();
    res.status(201).json(restaurant);
  } catch(error){
    console.error('Error creating restaurant:',error.message);
    res.status(500).json({message:'Failed to create restaurant'});
  }
};

exports.updateRestaurant = async (req, res) => {
  const { id } = req.params;
  try {

    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    if (restaurant.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to edit this restaurant.' });
    }

    const { name, street, building, city, state, pincode, category, priceRange, notices, menu } = req.body;
    let workingHours = req.body.workingHours ? JSON.parse(req.body.workingHours) : restaurant.workingHours;
    let mapLocation = req.body.mapLocation ? JSON.parse(req.body.mapLocation) : restaurant.mapLocation;
    const updatedNotices = notices ? JSON.parse(notices) : restaurant.notices;
    const updatedMenu = menu ? JSON.parse(menu) : restaurant.menu;

    restaurant.name = name || restaurant.name;
    restaurant.street = street || restaurant.street;
    restaurant.building = building || restaurant.building;
    restaurant.city = city || restaurant.city;
    restaurant.state = state || restaurant.state;
    restaurant.pincode = pincode || restaurant.pincode;
    restaurant.category = category || restaurant.category;
    restaurant.priceRange = priceRange || restaurant.priceRange;
    restaurant.workingHours = workingHours;
    restaurant.mapLocation = mapLocation;
    restaurant.notices = updatedNotices || [];
    restaurant.menu = updatedMenu || [];

    // Handle Thumbnail Upload
    if (req.files && req.files.thumbnail && req.files.thumbnail[0]) {
      const file = req.files.thumbnail[0];
      const oldThumbnailUrl = restaurant.thumbnailUrl;
    
      try {
        const thumbnailUrl = await uploadToS3(file, `thumbnails/${restaurant.id}`); // Folder per restaurant
        restaurant.thumbnailUrl = thumbnailUrl;
    
        // Delete old thumbnail if exists
        if (oldThumbnailUrl) {
          const oldThumbnailKey = oldThumbnailUrl.split('/').pop(); // Extract key from URL
          await deleteFromS3([`thumbnails/${oldThumbnailKey}`]);
        }
      } catch (error) {
        console.error('Thumbnail upload failed:', error.message);
        return res.status(500).json({ message: 'Failed to upload thumbnail' });
      }
    }    
    
    // Handle gallery images upload
    if (req.files && req.files.galleryImages) {
      const galleryFiles = req.files.galleryImages;
      const uploadedGalleryUrls = await Promise.all(
        galleryFiles.map((file) => uploadToS3(file, 'gallery-images'))
      );

      const existingGalleryImages = restaurant.galleryImages || [];
      restaurant.galleryImages = [...existingGalleryImages, ...uploadedGalleryUrls];
    }

    // Handle image deletions (from gallery)
    // console.log("Received images to delete: ", req.body.deleteImages)
    if (req.body.deleteImages) {
      const toDelete = JSON.parse(req.body.deleteImages); // Parse the array from JSON
      console.log('Parsed deleteImages:', toDelete);
      if (toDelete.length > 0 && restaurant.galleryImages) {
        const remaining = restaurant.galleryImages.filter((img) => !toDelete.includes(img));
    
        // Extract the keys from the URLs
        const keysToDelete = toDelete.map((url) => {
          const parts = url.split('/');
          return parts[parts.length - 1]; // Get the file name
        });
    
        // Delete the images from S3
        await deleteFromS3(keysToDelete);
    
        // Update the restaurant's gallery images
        restaurant.galleryImages = remaining;
        await restaurant.save();
      }
    }
    
    await restaurant.save();

    res.status(200).json({ message: 'Restaurant updated successfully.', restaurant });
  } catch (error) {
    console.error('Error updating restaurant:', error.message);
    res.status(500).json({ message: 'Failed to update restaurant.' });
  }
};


// DELETE /api/restaurants/:id - only if admin or owner?
// If you want full removal, you said admin approves. So the direct DELETE might be admin only.
exports.deleteRestaurant = async (req,res)=>{
  const { id } = req.params;
  try {
    const restaurant = await Restaurant.findByPk(id);
    if(!restaurant)return res.status(404).json({message:'Restaurant not found.'});

    // Only admin or owner with special conditions can delete?
    // Let's say admin can directly delete:
    if(req.user.role!=='admin'){
      return res.status(403).json({message:'Only admin can directly delete restaurants.'});
    }

    // Delete images from S3
    const toDeleteKeys = [];
    if(restaurant.thumbnailUrl) toDeleteKeys.push(restaurant.thumbnailUrl.split('/').pop());
    if(restaurant.galleryImages && restaurant.galleryImages.length>0){
      restaurant.galleryImages.forEach(img=>{
        toDeleteKeys.push(img.split('/').pop());
      });
    }
    if(toDeleteKeys.length>0) await deleteFromS3(toDeleteKeys);

    await Review.destroy({where:{restaurantId:id}});
    await restaurant.destroy();
    res.status(200).json({message:'Restaurant deleted successfully.'});
  } catch(error){
    console.error('Error deleting restaurant:',error.message);
    res.status(500).json({message:'Failed to delete restaurant.'});
  }
};

// GET /api/restaurants/:id/ratings
// Make sure no adminOnly restriction
exports.getRestaurantRatings = async (req,res)=>{
  const { id } = req.params;
  try {
    const restaurant = await Restaurant.findByPk(id);
    if(!restaurant)return res.status(404).json({message:'Restaurant not found'});

    const reviews = await Review.findAll({
      where:{restaurantId:id},
      include:[{model:User,attributes:['name']}]
    });
    res.status(200).json({reviews});
  } catch(error){
    console.error('Error fetching restaurant ratings:',error.message);
    res.status(500).json({message:'Failed to fetch restaurant ratings'});
  }
};

// PUT /api/restaurants/:id/request-delete
// Owner requests deletion -> set status='delete_requested'
exports.requestDeleteRestaurant = async (req,res)=>{
  const { id } = req.params;
  try {
    const restaurant = await Restaurant.findByPk(id);
    if(!restaurant)return res.status(404).json({message:'Restaurant not found.'});
    if(restaurant.ownerId!==req.user.id){
      return res.status(403).json({message:'Not authorized to request deletion.'});
    }

    // Only if status is approved or pending can request deletion
    // If you want to allow from any status except already delete_requested
    if(restaurant.status==='delete_requested'){
      return res.status(400).json({message:'Deletion already requested.'});
    }

    restaurant.status='delete_requested';
    await restaurant.save();
    res.json({message:'Delete request submitted. Awaiting admin approval.'});
  } catch(error){
    console.error('Error requesting delete:',error.message);
    res.status(500).json({message:'Failed to request deletion.'});
  }
};
