import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Paper,
  Modal,
} from '@mui/material';
import axios from 'axios';
import '../styles/pages/RestaurantDetailsPage.css';

const RestaurantDetailPage = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [menu, setMenu] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  const fetchRestaurantDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5001/api/restaurants/${id}`);
      setRestaurant(response.data);
      setReviews(response.data.reviews || []);
      setMenu(response.data.menu || []);
      setGalleryImages(response.data.galleryImages || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching restaurant details:', err.message);
      setError('Failed to load restaurant details');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurantDetails();
  }, [id]);

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedImage('');
  };

  const handleSubmit = async () => {
    setSuccess('');
    setError('');
    const token = localStorage.getItem('token');

    if (!token) {
      setError('You must be logged in to submit a review.');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5001/api/reviews',
        { restaurantId: id, rating: parseInt(rating, 10), comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newReview = response.data.review;
      const updatedAverageRating = response.data.averageRating;
      setReviews((prevReviews) => [newReview, ...prevReviews]);
      setRestaurant((prevRestaurant) => ({
        ...prevRestaurant,
        averageRating: updatedAverageRating, // Update the averageRating
      }));
      setSuccess('Review submitted successfully!');
      setRating('');
      setComment('');
    } catch (err) {
      console.error('Error submitting review:', err.message);
      setError(err.response?.data?.message || 'Failed to submit review');
    }
  };

  // Format "Days Open" logic
  const formatDaysOpen = (workingHours) => {
    if (!workingHours) return 'Not specified';
  
    const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const closedDays = workingHours.closedDays || [];
  
    // Determine open days
    const openDays = daysMap.filter((day) => !closedDays.includes(day));
  
    // If all days are closed
    if (openDays.length === 0) return 'Closed All Days';
  
    // Format open days into ranges
    const ranges = [];
    let start = openDays[0];
    for (let i = 1; i <= openDays.length; i++) {
      if (i === openDays.length || daysMap.indexOf(openDays[i]) !== daysMap.indexOf(openDays[i - 1]) + 1) {
        if (start === openDays[i - 1]) {
          ranges.push(`${start}`); // Single day
        } else {
          ranges.push(`${start} - ${openDays[i - 1]}`); // Range of days
        }
        start = openDays[i];
      }
    }
  
    return `Open: ${ranges.join(', ')}`;
  };
  
  

  const formatCustomHours = (workingHours) => {
    if (!workingHours) return 'Not specified';
  
    const { allDays, specific } = workingHours;
    const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
    if (specific && Object.keys(specific).length > 0) {
      const timeGroups = {};
  
      Object.entries(specific).forEach(([day, { start, end }]) => {
        const timeRange = `${start} - ${end}`;
        if (!timeGroups[timeRange]) {
          timeGroups[timeRange] = [];
        }
        timeGroups[timeRange].push(day);
      });
  
      const formattedRanges = Object.entries(timeGroups).map(([timeRange, days]) => {
        let groupedDays = '';
        let start = days[0];
  
        for (let i = 1; i <= days.length; i++) {
          if (
            i === days.length || // Last day
            daysMap.indexOf(days[i]) !== daysMap.indexOf(days[i - 1]) + 1 // Not consecutive
          ) {
            groupedDays += start === days[i - 1] ? `${start}` : `${start} - ${days[i - 1]}`;
            if (i < days.length) groupedDays += ', ';
            start = days[i];
          }
        }
  
        return `${groupedDays}: ${timeRange}`;
      });
  
      return formattedRanges.join(', ');
    }
  
    if (allDays) {
      return `All Days: ${allDays.start} - ${allDays.end}`;
    }
  
    return 'Not specified';
  };
  


  if (loading) return <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 4 }} />;
  if (!restaurant) return <Typography variant="h6">Restaurant not found.</Typography>;

  const fullAddress = `${restaurant.street}, ${
    restaurant.building ? restaurant.building + ', ' : ''
  }${restaurant.city}, ${restaurant.state} - ${restaurant.pincode}`;

  const mapLocationUrl = restaurant?.mapLocation
    ? `https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY=${
        restaurant.mapLocation.lat
      },${restaurant.mapLocation.lng}`
    : null;


  return (
    <div>
      {/* Full-width Overlay */}


    <div
        className="restaurant-overlay"
        style={{
          backgroundImage: `url(${restaurant.thumbnailUrl || '/static/default-thumbnail.jpg'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
        }}
      >
        {/* Black Overlay */}
        <div className="black-overlay">
          <Box sx={{ textAlign: 'center', padding: '50px 20px', fontFamily: 'Arial, sans-serif' }}>
            <Typography variant="h3" sx={{ fontWeight: 'bold', marginBottom: '10px', fontFamily: 'Montserrat, sans-serif' }}>
              {restaurant.name}
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                fontSize: '1.2rem',
                marginBottom: '10px',
                color: 'rgba(255, 255, 255, 0.8)',
              }}
            >
              {fullAddress}
            </Typography>
            {restaurant.averageRating !== undefined &&
        restaurant.averageRating !== null &&
        restaurant.averageRating > 0 && (
              <Typography
                variant="h6"
                sx={{
                  fontSize: '1.1rem',
                  marginBottom: '10px',
                  color: 'rgba(255, 255, 255, 0.9)',
                }}
              >
                Average Rating: {restaurant.averageRating}⭐
              </Typography>
            )}
            <Typography
              variant="h6"
              sx={{
                fontSize: '1.1rem',
                marginBottom: '10px',
                color: 'rgba(255, 255, 255, 0.9)',
              }}
            >
              Open Hours: {formatCustomHours(restaurant.workingHours)}
              {/* Open Hours:{" "}
              {restaurant.workingHours?.specific
                ? formatCustomHours(restaurant.workingHours?.specific || {})
                :`${restaurant.workingHours.allDays.start} - ${restaurant.workingHours.allDays.end}`} */}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontSize: '1.1rem',
                color: 'rgba(255, 255, 255, 0.9)',
              }}
            >
              {formatDaysOpen(restaurant.workingHours)}
            </Typography>
          </Box>
        </div>
      </div>


      {/* Menu and Map Section */}
      <Grid container spacing={4} sx={{ padding: '20px' }}>
        <Grid item xs={12} md={6}>
          <Typography variant="h5">Menu</Typography>
          {menu.length > 0 ? (
            menu.map((item, index) => (
              <Typography key={index}>
                {item.name} - ${item.price}
              </Typography>
            ))
          ) : (
            <Typography>No menu available.</Typography>
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h5">Location</Typography>
          {mapLocationUrl ? (
            <iframe
              src={mapLocationUrl}
              width="100%"
              height="300px"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
            ></iframe>
          ) : (
            <Typography>Location not available.</Typography>
          )}
        </Grid>
      </Grid>

      {/* Gallery and Review Form */}
      <Grid container spacing={4} sx={{ padding: '20px' }}>
        <Grid item xs={12} md={6}>
          <Typography variant="h5">Image Gallery</Typography>
          <Box className="image-gallery">
            {galleryImages.length > 0 ? (
              galleryImages.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt="Gallery"
                  className="gallery-image"
                  onClick={() => handleImageClick(url)}
                />
              ))
            ) : (
              <Typography>No images available.</Typography>
            )}
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h5">Submit Your Review</Typography>
          {success && <Alert severity="success">{success}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Rating (1 to 5)"
            variant="outlined"
            fullWidth
            type="number"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            sx={{ marginBottom: '10px' }}
          />
          <TextField
            label="Comment"
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            sx={{ marginTop: '10px' }}
            onClick={handleSubmit}
          >
            Submit Review
          </Button>
        </Grid>
      </Grid>

      <Box sx={{ padding: '20px' }}>
  <Typography variant="h5">Reviews</Typography>
  <Paper sx={{ maxHeight: '300px', overflowY: 'scroll', padding: '10px' }}>
    {reviews.length > 0 ? (
      reviews.map((review, index) => (
        <Box key={index} sx={{ marginBottom: '10px' }}>
          <Typography>
            <strong>{review.rating}⭐</strong> - {review.comment}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            By {review.user?.name || 'Anonymous'}
          </Typography>
        </Box>
      ))
    ) : (
      <Typography>No reviews yet. Be the first to leave one!</Typography>
    )}
  </Paper>
</Box>


      {/* Modal for Full-Size Image */}
      <Modal open={modalOpen} onClose={handleModalClose}>
        <Box className="modal-image-container">
          <img src={selectedImage} alt="Full Size" className="modal-image" />
          <Button onClick={handleModalClose} className="close-button">Close</Button>
        </Box>
      </Modal>
    </div>
  );
};

export default RestaurantDetailPage;
