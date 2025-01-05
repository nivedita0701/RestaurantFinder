import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Checkbox,
  FormControlLabel,
  Modal,
  IconButton,
  Grid,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { LoadScript, GoogleMap, Marker, Autocomplete } from '@react-google-maps/api';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '400px',
  maxHeight: '80vh',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  overflowY: 'auto',
  borderRadius: '8px',
};

const mapContainerStyle = {
  width: '100%',
  height: '300px',
};

const defaultCenter = { lat: 37.7749, lng: -122.4194 };
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const BusinessRegistrationPage = () => {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  // Determine if user is already registered (has token) or not
  const [isUserRegistered, setIsUserRegistered] = useState(!!token);

  // User registration fields (for first-time registration only)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Restaurant fields
  const [businessName, setBusinessName] = useState('');
  const [street, setStreet] = useState('');
  const [building, setBuilding] = useState('');
  const [city, setCity] = useState('');
  const [stateVal, setStateVal] = useState('');
  const [pincode, setPincode] = useState('');
  const [category, setCategory] = useState('');
  const [priceRange, setPriceRange] = useState('');

  const [openAllDays, setOpenAllDays] = useState(true);
  const [sameHoursAllDays, setSameHoursAllDays] = useState(true);
  const [closedDays, setClosedDays] = useState([]);

  const [allDaysStart, setAllDaysStart] = useState('09:00');
  const [allDaysEnd, setAllDaysEnd] = useState('18:00');
  const [specificHours, setSpecificHours] = useState({});

  const [mapLocation, setMapLocation] = useState(defaultCenter);
  const [searchText, setSearchText] = useState('');
  const geocoder = useRef(null);
  const autocompleteRef = useRef(null);
  const [autocompleteInput, setAutocompleteInput] = useState('');
  const [thumbnail, setThumbnail] = useState(null);

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [dayWiseModalOpen, setDayWiseModalOpen] = useState(false);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [closedDaysModalOpen, setClosedDaysModalOpen] = useState(false);

  const toggleClosedDay = (day) => {
    setClosedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleDayWiseChange = (day, key, value) => {
    setSpecificHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [key]: value,
      },
    }));
  };

  const handleMapClick = (e) => {
    setMapLocation({ lat: e.latLng.lat(), lng: e.latLng.lng() });
  };

  const handlePlaceSelected = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place && place.geometry) {
        setMapLocation({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
      } else {
        alert('Please select a valid location from the suggestions.');
      }
    }
  };

  const handleManualSearch = () => {
    if (!searchText.trim()) {
      alert('Please enter a location.');
      return;
    }

    if (!geocoder.current) {
      geocoder.current = new window.google.maps.Geocoder();
    }

    geocoder.current.geocode({ address: searchText }, (results, status) => {
      if (status === 'OK' && results[0]?.geometry) {
        const location = results[0].geometry.location;
        setMapLocation({ lat: location.lat(), lng: location.lng() });
      } else {
        alert('Could not find location. Please enter a valid address.');
      }
    });
  };

  const handleSearchClick = () => {
    handlePlaceSelected();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchClick();
    }
  };

  const getOpenDays = () => {
    if (openAllDays) {
      return daysOfWeek;
    } else {
      return daysOfWeek.filter((d) => !closedDays.includes(d));
    }
  };

  const handleUserRegistration = async () => {
    // Create a businessOwner user
    try {
      const { data } = await axios.post('http://localhost:5001/api/auth/register-business', {
        name,
        email,
        password
      });
      localStorage.setItem('token', data.token);
      setIsUserRegistered(true);
    } catch (err) {
      console.error('User registration failed:', err);
      setError(err.response?.data?.message || 'User registration failed.');
    }
  };

  const handleRestaurantRegistration = async () => {
    try {
      const workingHoursData = {
        openAllDays,
        sameHoursAllDays,
        closedDays,
      };

      const openDays = getOpenDays();

      if (openAllDays && sameHoursAllDays) {
        workingHoursData.allDays = { start: allDaysStart, end: allDaysEnd };
      } else if (openAllDays && !sameHoursAllDays) {
        const spec = {};
        daysOfWeek.forEach((day) => {
          if (specificHours[day]?.start && specificHours[day]?.end) {
            spec[day] = { start: specificHours[day].start, end: specificHours[day].end };
          }
        });
        workingHoursData.specific = spec;
      } else {
        // not open all days
        if (sameHoursAllDays) {
          workingHoursData.allDays = { start: allDaysStart, end: allDaysEnd };
        } else {
          const spec = {};
          openDays.forEach((day) => {
            if (specificHours[day]?.start && specificHours[day]?.end) {
              spec[day] = { start: specificHours[day].start, end: specificHours[day].end };
            }
          });
          workingHoursData.specific = spec;
        }
      }

      const payload = {
        name: businessName,
        street,
        building,
        city,
        state: stateVal,
        pincode,
        category,
        priceRange,
        workingHours: workingHoursData,
        mapLocation,
      };

      const formData = new FormData();
      for (const key in payload) {
        if (key === 'workingHours' || key === 'mapLocation') {
          formData.append(key, JSON.stringify(payload[key]));
        } else {
          formData.append(key, payload[key]);
        }
      }
      if (thumbnail) formData.append('thumbnail', thumbnail);

      await axios.post('http://localhost:5001/api/restaurants', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'multipart/form-data' },
      });

      setSuccess('Restaurant registered successfully! Awaiting admin approval.');
      setTimeout(() => {
        navigate('/business-owner');
      }, 2000);
    } catch (err) {
      console.error('Restaurant registration failed:', err);
      setError(err.response?.data?.message || 'Failed to register restaurant.');
    }
  };

  return (
    <Box
      sx={{
        maxWidth: '600px',
        margin: '50px auto',
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '10px',
        backgroundColor: '#fff',
      }}
    >
      <Typography variant="h5" sx={{ marginBottom: '20px', textAlign: 'center' }}>
        Register Your Business
      </Typography>
      {success && <Alert severity="success" sx={{ marginBottom: '20px' }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ marginBottom: '20px' }}>{error}</Alert>}

      {/* If user is not registered (no token), show user fields first */}
      {!isUserRegistered && (
        <>
          <Typography variant="h6" sx={{ marginBottom: '10px' }}>Create Business Owner Account</Typography>
          <TextField
            label="Your Name"
            variant="outlined"
            fullWidth
            sx={{ marginBottom: '10px' }}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="Your Email"
            variant="outlined"
            fullWidth
            sx={{ marginBottom: '10px' }}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            variant="outlined"
            fullWidth
            sx={{ marginBottom: '10px' }}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button variant="contained" color="primary" fullWidth onClick={handleUserRegistration}>
            Create Account
          </Button>
        </>
      )}

      {/* Once user is registered (has token), show restaurant registration form */}
      {isUserRegistered && (
        <>
          <Typography variant="h6" sx={{ margin: '20px 0 10px 0' }}>Register Your Restaurant</Typography>
          <TextField
            label="Business Name"
            variant="outlined"
            fullWidth
            sx={{ marginBottom: '10px' }}
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
          />
          <TextField
            label="Street"
            variant="outlined"
            fullWidth
            sx={{ marginBottom: '10px' }}
            value={street}
            onChange={(e) => setStreet(e.target.value)}
          />
          <TextField
            label="Building (Optional)"
            variant="outlined"
            fullWidth
            sx={{ marginBottom: '10px' }}
            value={building}
            onChange={(e) => setBuilding(e.target.value)}
          />
          <TextField
            label="City"
            variant="outlined"
            fullWidth
            sx={{ marginBottom: '10px' }}
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <TextField
            label="State"
            variant="outlined"
            fullWidth
            sx={{ marginBottom: '10px' }}
            value={stateVal}
            onChange={(e) => setStateVal(e.target.value)}
          />
          <TextField
            label="Pincode"
            variant="outlined"
            fullWidth
            sx={{ marginBottom: '10px' }}
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
          />

          <FormControl fullWidth sx={{ marginBottom: '10px' }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <MenuItem value="Cafe">Cafe</MenuItem>
              <MenuItem value="Restaurant">Restaurant</MenuItem>
              <MenuItem value="Fast Food">Fast Food</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ marginBottom: '10px' }}>
            <InputLabel>Price Range</InputLabel>
            <Select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>

          <FormControlLabel
            control={<Checkbox checked={openAllDays} onChange={(e) => setOpenAllDays(e.target.checked)} />}
            label="Open All Days"
          />

          <FormControlLabel
            control={<Checkbox checked={sameHoursAllDays} onChange={(e) => setSameHoursAllDays(e.target.checked)} />}
            label="Same Hours for All (Open) Days"
          />

          {/* Conditions for hours input */}
          {openAllDays ? (
            sameHoursAllDays ? (
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <TextField
                    label="Start Time"
                    type="time"
                    fullWidth
                    value={allDaysStart}
                    onChange={(e) => setAllDaysStart(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="End Time"
                    type="time"
                    fullWidth
                    value={allDaysEnd}
                    onChange={(e) => setAllDaysEnd(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            ) : (
              <Button variant="outlined" sx={{ mt: 2, mb: 2 }} onClick={() => setDayWiseModalOpen(true)}>
                Set Day-Wise Working Hours
              </Button>
            )
          ) : (
            <>
              <Button variant="outlined" sx={{ mt: 2, mb: 2, mr: 2 }} onClick={() => setClosedDaysModalOpen(true)}>
                Select Closed Days
              </Button>
              {sameHoursAllDays ? (
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <TextField
                      label="Start Time (Open Days)"
                      type="time"
                      fullWidth
                      value={allDaysStart}
                      onChange={(e) => setAllDaysStart(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="End Time (Open Days)"
                      type="time"
                      fullWidth
                      value={allDaysEnd}
                      onChange={(e) => setAllDaysEnd(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              ) : (
                <Button variant="outlined" sx={{ mt: 2, mb: 2 }} onClick={() => setDayWiseModalOpen(true)}>
                  Set Day-Wise Working Hours for Open Days
                </Button>
              )}
            </>
          )}

          <Typography variant="h6" sx={{ marginBottom: '10px', marginTop: '20px' }}>
            Select Location on Map
          </Typography>
          <Button variant="contained" onClick={() => setMapModalOpen(true)} sx={{ marginBottom: '10px' }}>
            Set Location on Map
          </Button>

          <Typography sx={{ marginBottom: '5px', marginTop: '10px' }}>Upload Thumbnail</Typography>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setThumbnail(e.target.files[0])}
            style={{ marginBottom: '20px' }}
          />

          <Button type="button" variant="contained" color="primary" fullWidth onClick={handleRestaurantRegistration}>
            REGISTER
          </Button>
        </>
      )}

      {/* Day-Wise Modal */}
      <Modal open={dayWiseModalOpen} onClose={() => setDayWiseModalOpen(false)}>
        <Box sx={modalStyle}>
          <IconButton
            sx={{ position: 'absolute', top: 8, right: 8 }}
            onClick={() => setDayWiseModalOpen(false)}
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" gutterBottom>Set Day-Wise Working Hours</Typography>
          <Grid container spacing={2}>
            {getOpenDays().map((day) => (
              <React.Fragment key={day}>
                <Grid item xs={6}>
                  <TextField
                    label={`${day} Start Time`}
                    type="time"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={specificHours[day]?.start || ''}
                    onChange={(e) => handleDayWiseChange(day, 'start', e.target.value)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label={`${day} End Time`}
                    type="time"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={specificHours[day]?.end || ''}
                    onChange={(e) => handleDayWiseChange(day, 'end', e.target.value)}
                  />
                </Grid>
              </React.Fragment>
            ))}
          </Grid>
          <Button variant="contained" color="primary" fullWidth sx={{ marginTop: '20px' }} onClick={() => setDayWiseModalOpen(false)}>
            Done
          </Button>
        </Box>
      </Modal>

      {/* Closed Days Modal */}
      <Modal open={closedDaysModalOpen} onClose={() => setClosedDaysModalOpen(false)}>
        <Box sx={modalStyle}>
          <IconButton
            sx={{ position: 'absolute', top: 8, right: 8 }}
            onClick={() => setClosedDaysModalOpen(false)}
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" gutterBottom>Select Closed Days</Typography>
          {daysOfWeek.map((day) => (
            <FormControlLabel
              key={day}
              control={
                <Checkbox
                  checked={closedDays.includes(day)}
                  onChange={() => toggleClosedDay(day)}
                />
              }
              label={day}
            />
          ))}
          <Button variant="contained" color="primary" fullWidth onClick={() => setClosedDaysModalOpen(false)}>
            Done
          </Button>
        </Box>
      </Modal>

      {/* Map Modal */}
      <Modal open={mapModalOpen} onClose={() => setMapModalOpen(false)}>
        <Box sx={modalStyle}>
          <IconButton
            sx={{ position: 'absolute', top: 8, right: 8 }}
            onClick={() => setMapModalOpen(false)}
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" gutterBottom>
            Select Location on Map
          </Typography>
          <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY" libraries={['places']}>
          <Autocomplete
              onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
              onPlaceChanged={handlePlaceSelected}
            >
              <TextField
                id="autocomplete-input"
                label="Search location"
                variant="outlined"
                fullWidth
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyPress={handleKeyPress}
                sx={{ marginBottom: '10px' }}
              />
            </Autocomplete>
            <Button
              variant="contained"
              color="primary"
              onClick={handleManualSearch}
              sx={{ marginBottom: '10px' }}
            >
              Search
            </Button>
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={mapLocation}
              zoom={14}
              onClick={(e) => setMapLocation({ lat: e.latLng.lat(), lng: e.latLng.lng() })}
            >
              <Marker
                position={mapLocation}
                draggable
                onDragEnd={(e) =>
                  setMapLocation({ lat: e.latLng.lat(), lng: e.latLng.lng() })
                }
              />
            </GoogleMap>
          </LoadScript>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ marginTop: '20px' }}
            onClick={() => setMapModalOpen(false)}
          >
            Done
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default BusinessRegistrationPage;
