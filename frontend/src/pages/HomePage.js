import React, { useState, useEffect, useRef } from 'react';
import {
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import '../styles/pages/HomePage.css';
import axios from 'axios';

const mapContainerStyle = {
  width: '100%',
  height: '600px',
};

const defaultCenter = {
  lat: 37.7749,
  lng: -122.4194,
};

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [categories, setCategories] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [rating, setRating] = useState('');
  const [zipcode, setZipcode] = useState('');
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const mapRef = useRef(null); // Ref to access the Google Map instance
  const [trendingRestaurants, setTrendingRestaurants] = useState([]);
  const [overlayHeight, setOverlayHeight] = useState(400);

  const navigate = useNavigate();

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/restaurants/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error.message);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchTrendingRestaurants = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/restaurants', { params: { limit: 5 } }); // Adjust limit as needed
        setTrendingRestaurants(response.data);
      } catch (error) {
        console.error('Error fetching trending restaurants:', error.message);
      }
    };

    fetchTrendingRestaurants();
  }, []);

  // Handle sticky search bar
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClear = () => {
    setSearchQuery('');
    setCategory('');
    setPriceRange('');
    setRating('');
    setZipcode('');
    setSearched(false);
    setRestaurants([]);
    setMapCenter(defaultCenter); // Reset map center
  };

  const geocodeZipcode = async (zipcode) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${zipcode}&key=YOUR_GOOGLE_MAPS_API_KEY`
      );
      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const location = response.data.results[0].geometry.location;
        return { lat: location.lat, lng: location.lng };
      } else {
        console.error('Geocoding API error:', response.data.status);
        return null;
      }
    } catch (error) {
      console.error('Error geocoding zipcode:', error.message);
      return null;
    }
  };
  

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    setRestaurants([]);
    setSearched(false);
  
    try {
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (category) params.category = category;
      if (priceRange) params.priceRange = priceRange;
      if (rating) params.rating = rating;
  
      if (zipcode) {
        const location = await geocodeZipcode(zipcode);
        if (location) {
          params.latitude = location.lat;
          params.longitude = location.lng;
        } else {
          setError('Invalid zipcode');
          setLoading(false);
          return;
        }
      }
  
      const response = await axios.get('http://localhost:5001/api/restaurants', { params });
      setRestaurants(response.data);
      setSearched(true);
  
      if (response.data.length > 0) {
        const bounds = new window.google.maps.LatLngBounds();
  
        response.data.forEach((restaurant) => {
          if (restaurant.mapLocation) {
            bounds.extend({
              lat: parseFloat(restaurant.mapLocation.lat),
              lng: parseFloat(restaurant.mapLocation.lng),
            });
          }
        });
  
        if (!bounds.isEmpty()) {
          mapRef.current.fitBounds(bounds);
        }
      }
    } catch (err) {
      console.error('Error in handleSearch:', err.message);
      setError(err.response?.data?.message || 'Failed to fetch restaurants');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="homepage">
      {/* Sticky Search Bar */}
      {isSticky && (
        <div className="sticky-search-bar">
          <Grid container spacing={2} alignItems="center" justifyContent="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Search Restaurants"
                variant="outlined"
                fullWidth
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  style: { backgroundColor: 'white', color: 'black' },
                }}
              />
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <TextField
                label="Zipcode"
                variant="outlined"
                fullWidth
                value={zipcode}
                onChange={(e) => setZipcode(e.target.value)}
                InputProps={{
                  style: { backgroundColor: 'white', color: 'black' },
                }}
              />
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ backgroundColor: 'white' }}
                >
                  <MenuItem value="">All</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <FormControl fullWidth>
                <InputLabel>Price Range</InputLabel>
                <Select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  style={{ backgroundColor: 'white' }}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <FormControl fullWidth>
                <InputLabel>Rating</InputLabel>
                <Select
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  style={{ backgroundColor: 'white' }}
                >
                  <MenuItem value="">All</MenuItem>
                  {[5, 4, 3, 2, 1].map((rate) => (
                    <MenuItem key={rate} value={rate}>
                      {`${rate} Star${rate > 1 ? 's' : ''}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2} md={2}>
              <Button variant="contained" className="search-button" onClick={handleSearch}>
                Search
              </Button>
              <Button
                variant="outlined"
                className="clear-button"
                onClick={handleClear}
                style={{ marginLeft: '10px' }}
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </div>
      )}

      {/* Hero Section */}
      <div className="hero-section">
        <div className="overlay">
          <div className="hero-content">
            <Typography variant="h3" className="hero-title">
              Discover the Best Places to Eat & Explore
            </Typography>
            <Typography variant="subtitle1" className="hero-subtitle">
              Find restaurants, home services, and more near you!
            </Typography>
            <div className="search-bar" style={{ marginLeft: '10px' }}>
              <Grid container spacing={2} alignItems="center" justifyContent="center">
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    label="Search Restaurants"
                    variant="outlined"
                    fullWidth
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      style: { backgroundColor: 'white', color: 'black' },
                    }}
                  />
                </Grid>
                <Grid item xs={6} sm={3} md={2}>
                  <TextField
                    label="Zipcode"
                    variant="outlined"
                    fullWidth
                    value={zipcode}
                    onChange={(e) => setZipcode(e.target.value)}
                    InputProps={{
                      style: { backgroundColor: 'white', color: 'black' },
                    }}
                  />
                </Grid>
                <Grid item xs={6} sm={3} md={2}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      style={{ backgroundColor: 'white' }}
                    >
                      <MenuItem value="">All</MenuItem>
                      {categories.map((cat) => (
                        <MenuItem key={cat} value={cat}>
                          {cat}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6} sm={3} md={2}>
                  <FormControl fullWidth>
                    <InputLabel>Price Range</InputLabel>
                    <Select
                      value={priceRange}
                      onChange={(e) => setPriceRange(e.target.value)}
                      style={{ backgroundColor: 'white' }}
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="low">Low</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6} sm={3} md={2} style={{ marginRight: '10px' }}>
                  <FormControl fullWidth>
                    <InputLabel>Rating</InputLabel>
                    <Select
                      value={rating}
                      onChange={(e) => setRating(e.target.value)}
                      style={{ backgroundColor: 'white' }}
                    >
                      <MenuItem value="">All</MenuItem>
                      {[5, 4, 3, 2, 1].map((rate) => (
                        <MenuItem key={rate} value={rate}>
                          {`${rate} Star${rate > 1 ? 's' : ''}`}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={2} md={2} style={{ marginTop: '10px' }}>
                  <Button variant="contained" className="search-button" onClick={handleSearch}>
                    Search
                  </Button>
                  <Button
                    variant="outlined"
                    className="clear-button"
                    onClick={handleClear}
                    style={{ marginLeft: '10px' }}
                  >
                    Clear
                  </Button>
                </Grid>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="results-section">
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4} className="results-column">
            {loading && <CircularProgress />}
            {error && (
              <Alert severity="error" className="alert">
                {error}
              </Alert>
            )}
            {!loading && searched && restaurants.length === 0 && (
              <Typography variant="body1" className="no-results">
                No results found. Try adjusting your filters.
              </Typography>
            )}
            {restaurants.length > 0 ? (
              restaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="restaurant-card"
                onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                style={{
                  backgroundImage: `url(${restaurant.thumbnailUrl || 'default-thumbnail.jpg'})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  marginBottom: '15px',
                }}
              >
                {/* Overlay to fade the thumbnail */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.5)', // Adjust opacity for fading effect
                zIndex: 1, // Ensure it sits above the image but below everything else
              }}
                ></div>
                <div
              className="card-gradient"
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                height: '40%', // Adjust this to control the size of the gradient
                background: 'linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0))',
                zIndex: 2, // Place the gradient above the image but below the text
              }}
            ></div>
                <div className="card-content"
                  style={{
                    position: 'relative', // Position relative to the card
                    color: 'black', // Make text visible on dark background
                    padding: '15px',
                    zIndex: 2, // Ensure it appears above the overlay
                  }}
                >
                  <Typography variant="h6" className="card-title">
                    {restaurant.name}
                  </Typography>
                  <Typography className="card-address">
                    {`${restaurant.street}, ${restaurant.city}, ${restaurant.state}, ${restaurant.pincode}`}
                  </Typography>
                  <Typography className="card-category">{`Category: ${restaurant.category}`}</Typography>
                  <Typography className="card-price">{`Price Range: ${restaurant.priceRange}`}</Typography>
                  <Typography className="card-rating">{`Ratings: ${
                    restaurant.averageRating !== null && restaurant.averageRating !== undefined
                      ? `${restaurant.averageRating.toFixed(1)}⭐`
                      : 'N/A'
                  }`}</Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/restaurant/${restaurant.id}`);
                    }}
                    className="card-button"
                  >
                    Review
                  </Button>
                </div>
              </div>
            ))
            ): (
              <>
                <Typography variant="h5" className="trending-title" sx={{mb:2}}>
                  Now Trending
                </Typography>
                {trendingRestaurants.map((restaurant) => (
                  <div
                    key={restaurant.id}
                    className="restaurant-card"
                    onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                    style={{
                      backgroundImage: `url(${restaurant.thumbnailUrl || 'default-thumbnail.jpg'})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      position: 'relative',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      marginBottom: '15px',
                    }}
                  >
                    {/* Overlay to fade the thumbnail */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(255, 255, 255, 0.5)', // Adjust opacity for fading effect
                        zIndex: 1, // Ensure it sits above the image but below everything else
                      }}
                    ></div>
                    <div
                      className="card-gradient"
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        width: '100%',
                        height: '40%', // Adjust this to control the size of the gradient
                        background: 'linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0))',
                        zIndex: 2, // Place the gradient above the image but below the text
                      }}
                    ></div>
                    <div className="card-content"
                    style={{
                      position: 'relative', // Position relative to the card
                      color: 'black',
                      padding: '15px',
                      zIndex: 2, // Ensure it appears above the overlay
                    }}>
                      <Typography variant="h6" className="card-title">
                        {restaurant.name}
                      </Typography>
                      <Typography className="card-address">
                        {`${restaurant.street}, ${restaurant.city}, ${restaurant.state}, ${restaurant.pincode}`}
                      </Typography>
                    </div>
                  </div>
                ))}
              </>
            )}
          </Grid>
          <Grid item xs={12} sm={8} className="map-column">
            {/* YOUR_GOOGLE_MAPS_API_KEY */}
            <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={mapCenter}
                zoom={8}
                onLoad={(map) => (mapRef.current = map)} // Assign map instance to ref
              >
                {restaurants.map((restaurant) =>
                  restaurant.mapLocation ? (
                    <Marker
                      key={restaurant.id}
                      position={{
                        lat: parseFloat(restaurant.mapLocation.lat),
                        lng: parseFloat(restaurant.mapLocation.lng),
                      }}
                      title={restaurant.name}
                    />
                  ) : null
                )}
              </GoogleMap>
            </LoadScript>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default HomePage;
