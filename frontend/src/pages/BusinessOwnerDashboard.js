import React, { useState, useEffect, useRef } from 'react';
import {
  Button,
  TextField,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Modal,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Tooltip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { GoogleMap, LoadScript, Marker, Autocomplete } from '@react-google-maps/api';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

const mapContainerStyle = {
  width: '100%',
  height: '300px',
};

const modalStyle = {
  position:'absolute',
  top:'50%',
  left:'50%',
  transform:'translate(-50%, -50%)',
  width:'600px',
  maxHeight:'80vh',
  bgcolor:'background.paper',
  boxShadow:24,
  p:4,
  overflowY:'auto',
  borderRadius:'8px',
};

const defaultCenter = {
  lat:37.7749,
  lng:-122.4194,
};

const daysOfWeek = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

const BusinessOwnerDashboard = () => {
  const token = localStorage.getItem('token');
  const [restaurants,setRestaurants] = useState([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState('');
  const [success,setSuccess] = useState('');

  const [registerModalOpen,setRegisterModalOpen] = useState(false);
  const [editModalOpen,setEditModalOpen] = useState(false);
  const [workingHoursModalOpen,setWorkingHoursModalOpen] = useState(false);
  const [closedDaysModalOpen,setClosedDaysModalOpen] = useState(false);
  const [mapModalOpen,setMapModalOpen] = useState(false);

  // For new registration
  const [businessName,setBusinessName] = useState('');
  const [street,setStreet] = useState('');
  const [building,setBuilding] = useState('');
  const [city,setCity] = useState('');
  const [stateVal,setStateVal] = useState('');
  const [pincode,setPincode] = useState('');
  const [category,setCategory] = useState('');
  const [priceRange,setPriceRange] = useState('');
  const [openAllDays,setOpenAllDays] = useState(true);
  const [sameHoursAllDays,setSameHoursAllDays] = useState(true);
  const [closedDays,setClosedDays] = useState([]);
  const [workingHours,setWorkingHours] = useState({allDays:{start:'09:00',end:'18:00'},specific:{}});
  const [mapLocation,setMapLocation] = useState(defaultCenter);
  const [thumbnail,setThumbnail] = useState(null);

  // For editing
  const [selectedRestaurant,setSelectedRestaurant] = useState(null);
  const [editBusinessName,setEditBusinessName] = useState('');
  const [editStreet,setEditStreet] = useState('');
  const [editBuilding,setEditBuilding] = useState('');
  const [editCity,setEditCity] = useState('');
  const [editStateVal,setEditStateVal] = useState('');
  const [editPincode,setEditPincode] = useState('');
  const [editCategory,setEditCategory] = useState('');
  const [editPriceRange,setEditPriceRange] = useState('');
  const [editOpenAllDays,setEditOpenAllDays] = useState(true);
  const [editSameHoursAllDays,setEditSameHoursAllDays] = useState(true);
  const [editClosedDays,setEditClosedDays] = useState([]);
  const [editWorkingHours,setEditWorkingHours] = useState({allDays:{start:'09:00',end:'18:00'},specific:{}});
  const [editMapLocation,setEditMapLocation] = useState(defaultCenter);

  const [editThumbnail,setEditThumbnail] = useState(null);
  const [existingGalleryImages,setExistingGalleryImages] = useState([]);
  const [galleryImages,setGalleryImages] = useState([]);
  const [imagesToDelete,setImagesToDelete] = useState([]);
  const [notices,setNotices] = useState('');
  const [menu,setMenu] = useState('');
  const [ratings,setRatings] = useState([]);

  const editAutocompleteRef = useRef(null);
  const newAutocompleteRef = useRef(null);
  const [editSearchText, setEditSearchText] = useState('');
  const [newSearchText, setNewSearchText] = useState('');

  const fetchOwnerRestaurants = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5001/api/restaurants/owner',{headers:{Authorization:`Bearer ${token}`}});
      setRestaurants(res.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message||'Failed to fetch restaurants.');
      setLoading(false);
    }
  };

  useEffect(()=>{
    fetchOwnerRestaurants();
  },[token]);

  const handleRegisterBusiness = async () => {
    setError('');
    setSuccess('');
  
    // Validate inputs before submission
    if (
      !businessName ||
      !street ||
      !city ||
      !stateVal ||
      !pincode ||
      !category ||
      !priceRange ||
      !mapLocation ||
      (!openAllDays && closedDays.length === 0) // Closed days should be selected if not open all days
    ) {
      setError('Please fill in all required fields.');
      return;
    }
  
    const workingHoursData = {
      openAllDays,
      sameHoursAllDays,
      closedDays,
      allDays: workingHours.allDays,
      specific: workingHours.specific,
    };
  
    try {
      const payload = {
        name: businessName,
        street,
        building,
        city,
        state: stateVal,
        pincode,
        category,
        priceRange,
        workingHours: JSON.stringify(workingHoursData),
        mapLocation: JSON.stringify(mapLocation),
      };
  
      const formData = new FormData();
      for (const key in payload) {
        formData.append(key, payload[key]);
      }
  
      if (thumbnail) formData.append('thumbnail', thumbnail);
  
      await axios.post('http://localhost:5001/api/restaurants', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
  
      setSuccess('Business registered successfully!');
      setRegisterModalOpen(false);
      fetchOwnerRestaurants();
    } catch (err) {
      console.error('Error registering business:', err);
      setError(err.response?.data?.message || 'Failed to register business.');
    }
  };  

  const handleSelectRestaurant = async (restaurantId) => {
    setError('');
    setSuccess('');
    try {
      const restaurantRes = await axios.get(`http://localhost:5001/api/restaurants/${restaurantId}`, {
        headers:{Authorization:`Bearer ${token}`}
      });
      const restaurant = restaurantRes.data;
      setSelectedRestaurant(restaurant);

      setEditBusinessName(restaurant.name);
      setEditStreet(restaurant.street);
      setEditBuilding(restaurant.building||'');
      setEditCity(restaurant.city);
      setEditStateVal(restaurant.state);
      setEditPincode(restaurant.pincode);
      setEditCategory(restaurant.category);
      setEditPriceRange(restaurant.priceRange);

      const wh = restaurant.workingHours||{openAllDays:true,sameHoursAllDays:true,allDays:{start:"09:00",end:"18:00"},specific:{}};
      setEditOpenAllDays(wh.openAllDays);
      setEditSameHoursAllDays(wh.sameHoursAllDays);
      setEditClosedDays(wh.closedDays||[]);
      setEditWorkingHours({allDays:wh.allDays||{start:'09:00',end:'18:00'},specific:wh.specific||{}});
      setEditMapLocation(restaurant.mapLocation||defaultCenter);

      let noticesText = '';
      if(restaurant.notices && restaurant.notices.length>0){
        noticesText = restaurant.notices.join('\n');
      }
      setNotices(noticesText);

      let menuText = '';
      if(restaurant.menu && Array.isArray(restaurant.menu)){
        menuText = restaurant.menu.map(m=>`${m.name}|${m.price}`).join('\n');
      }
      setMenu(menuText);

      if(restaurant.galleryImages && restaurant.galleryImages.length>0){
        setExistingGalleryImages(restaurant.galleryImages);
      } else {
        setExistingGalleryImages([]);
      }
      setGalleryImages([]);
      setImagesToDelete([]);

      const ratingsRes = await axios.get(`http://localhost:5001/api/reviews/${restaurantId}`, {
        headers:{Authorization:`Bearer ${token}`}
      });
      setRatings(ratingsRes.data);

      setEditModalOpen(true);
    } catch (error) {
      console.error(error);
      setError('Failed to load restaurant details.');
    }
  };

  const handleUpdateRestaurant = async () => {

    console.log('handleUpdateRestaurant called with:', imagesToDelete);

    setError('');
    setSuccess('');

    const updatedNotices = notices.split('\n').map(n=>n.trim()).filter(n=>n);
    const menuItems = menu.split('\n').map(line=>line.trim()).filter(line=>line).map(line=>{
      const parts = line.split('|');
      return {name:parts[0], price:parseFloat(parts[1])};
    });

    const workingHoursData = {
      openAllDays:editOpenAllDays,
      sameHoursAllDays:editSameHoursAllDays,
      closedDays:editClosedDays,
      allDays:editWorkingHours.allDays,
      specific:editWorkingHours.specific
    };

    const payload = {
      name:editBusinessName,
      street:editStreet,
      building:editBuilding,
      city:editCity,
      state:editStateVal,
      pincode:editPincode,
      category:editCategory,
      priceRange:editPriceRange,
      workingHours:JSON.stringify(workingHoursData),
      mapLocation:JSON.stringify(editMapLocation),
      notices: JSON.stringify(updatedNotices),
      menu: JSON.stringify(menuItems),
    };

    const formData = new FormData();
    for(const key in payload) {
      formData.append(key,payload[key]);
    }

    if(editThumbnail) formData.append('thumbnail',editThumbnail);
    galleryImages.forEach(imgFile=>{
      formData.append('galleryImages',imgFile);
    });
    console.log('Images to delete:', imagesToDelete);
    if(imagesToDelete.length>0){
      formData.append('deleteImages',JSON.stringify(imagesToDelete));
    }

    try {
      await axios.put(`http://localhost:5001/api/restaurants/${selectedRestaurant.id}`, formData, {
        headers:{Authorization:`Bearer ${token}`,'Content-Type':'multipart/form-data'}
      });

      setSuccess('Restaurant updated successfully!');
      setEditModalOpen(false);
      fetchOwnerRestaurants();
    } catch(err) {
      console.error(err);
      setError(err.response?.data?.message||'Failed to update restaurant.');
    }
  };

  const handleRequestDeletion = async () => {
    try {
      await axios.put(`http://localhost:5001/api/restaurants/${selectedRestaurant.id}/request-delete`,{},{
        headers:{Authorization:`Bearer ${token}`}
      });
      alert('Delete request submitted. Admin approval pending.');
      setEditModalOpen(false);
      fetchOwnerRestaurants();
    } catch(error){
      console.error(error);
      alert('Failed to request delete.');
    }
  };

  const handleAddGalleryImages = (event) => {
    const newFiles = Array.from(event.target.files);
    setGalleryImages((prev) => [...prev, ...newFiles]);
  };

  const handleDeleteGalleryImage = (imgUrl) => {
    setImagesToDelete((prev) => [...prev, imgUrl]);
  };

  const handleDeleteImage = (imgUrl) => {

    console.log('Delete clicked for:', imgUrl);
    setExistingGalleryImages(existingGalleryImages.filter((url) => url !== imgUrl));
    setImagesToDelete((prev) => [...prev, imgUrl]);
  };

  const handlePlaceSelected = (autocompleteRef, setMapLocation) => {
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

  const handleManualSearch = (searchText, setMapLocation) => {
    if (!searchText.trim()) {
      alert('Please enter a location.');
      return;
    }
  
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: searchText }, (results, status) => {
      if (status === 'OK' && results[0]?.geometry) {
        const location = results[0].geometry.location;
        setMapLocation({ lat: location.lat(), lng: location.lng() });
      } else {
        alert('Could not find location. Please enter a valid address.');
      }
    });
  };  
  
  

  const renderGalleryImages = () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
  {existingGalleryImages.length === 0 ? (
    <Typography>No images</Typography>
  ) : (
    existingGalleryImages.map((imgUrl, idx) => (
      <div key={idx} style={{ position: 'relative', width: '100px', height: '100px' }}>
        {/* Display the image */}
        <img
          src={imgUrl}
          alt={`Gallery ${idx}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '8px',
            border: '1px solid #ddd',
          }}
        />
        {/* Bin Icon */}
        <IconButton
          onClick={() => handleDeleteImage(imgUrl)}
          style={{
            position: 'absolute',
            bottom: '5px',
            right: '5px',
            backgroundColor: '#fff',
            padding: '4px',
            borderRadius: '50%',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
        >
          <CloseIcon fontSize="small" style={{ color: 'red' }} />
        </IconButton>
      </div>
    ))
  )}
</div>
  );
  
  const toggleClosedDay = (day) => {
    setClosedDays(prev=>prev.includes(day)?prev.filter(d=>d!==day):[...prev,day]);
  };

  const toggleEditClosedDay = (day) => {
    setEditClosedDays(prev=>prev.includes(day)?prev.filter(d=>d!==day):[...prev,day]);
  };

  const handleMapClickNew = (event) => {
    setMapLocation({lat:event.latLng.lat(),lng:event.latLng.lng()});
  };

  const handleMapClickEdit = (event) => {
    setEditMapLocation({lat:event.latLng.lat(),lng:event.latLng.lng()});
  };

  const getOpenDaysForEdit = () => {
    if(editOpenAllDays)return daysOfWeek;
    return daysOfWeek.filter(d=>!editClosedDays.includes(d));
  };

  const renderEditWorkingHoursFields = () => {
    if (editSameHoursAllDays) {
      return (
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              label="Start Time"
              type="time"
              fullWidth
              value={editWorkingHours.allDays.start}
              onChange={(e)=>
                setEditWorkingHours({...editWorkingHours,allDays:{...editWorkingHours.allDays,start:e.target.value}})
              }
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="End Time"
              type="time"
              fullWidth
              value={editWorkingHours.allDays.end}
              onChange={(e)=>
                setEditWorkingHours({...editWorkingHours,allDays:{...editWorkingHours.allDays,end:e.target.value}})
              }
            />
          </Grid>
        </Grid>
      );
    } else {
      return (
        <Button variant="outlined" color="primary" onClick={()=>setWorkingHoursModalOpen(true)}>
          Set Day-Wise Working Hours
        </Button>
      );
    }
  };

  if(loading)return <CircularProgress />;

  return (
    <div style={{ padding:'20px' }}>
      <Typography variant="h4" gutterBottom>Business Owner Dashboard</Typography>
      {success && <Alert severity="success" sx={{mb:2}}>{success}</Alert>}
      {error && <Alert severity="error" sx={{mb:2}}>{error}</Alert>}

      <Button variant="contained" color="primary" sx={{mb:'20px'}} onClick={()=>setRegisterModalOpen(true)}>
        Register New Business
      </Button>

      <Grid container spacing={2}>
        {restaurants.map((restaurant)=>(
          <Grid item xs={12} md={6} key={restaurant.id}>
            <Card>
              <CardContent>
                <Typography variant="h5">{restaurant.name}</Typography>
                <Typography>Status: {restaurant.status}</Typography>
                <Typography>Category: {restaurant.category}</Typography>
                <Typography>Address: {`${restaurant.street}, ${restaurant.city}, ${restaurant.state}`}</Typography>
                <Button variant="outlined" sx={{mt:'10px'}} onClick={()=>handleSelectRestaurant(restaurant.id)}>
                  View/Edit
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Register Modal */}
      <Modal open={registerModalOpen} onClose={()=>setRegisterModalOpen(false)}>
        <Box sx={modalStyle}>
          <IconButton sx={{position:'absolute',top:8,right:8}} onClick={()=>setRegisterModalOpen(false)}>
            <CloseIcon/>
          </IconButton>
          <Typography variant="h6" gutterBottom>Register Your Business</Typography>
          <TextField label="Business Name" fullWidth sx={{mb:2}} value={businessName} onChange={(e)=>setBusinessName(e.target.value)}/>
          <TextField label="Street" fullWidth sx={{mb:2}} value={street} onChange={(e)=>setStreet(e.target.value)}/>
          <TextField label="Building (Optional)" fullWidth sx={{mb:2}} value={building} onChange={(e)=>setBuilding(e.target.value)}/>
          <TextField label="City" fullWidth sx={{mb:2}} value={city} onChange={(e)=>setCity(e.target.value)}/>
          <TextField label="State" fullWidth sx={{mb:2}} value={stateVal} onChange={(e)=>setStateVal(e.target.value)}/>
          <TextField label="Pincode" fullWidth sx={{mb:2}} value={pincode} onChange={(e)=>setPincode(e.target.value)}/>
          <FormControl fullWidth sx={{mb:2}}>
            <InputLabel>Category</InputLabel>
            <Select value={category} onChange={(e)=>setCategory(e.target.value)}>
              <MenuItem value="Cafe">Cafe</MenuItem>
              <MenuItem value="Restaurant">Restaurant</MenuItem>
              <MenuItem value="Fast Food">Fast Food</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
  <InputLabel>Price Range</InputLabel>
  <Select
    value={priceRange}
    onChange={(e) => setPriceRange(e.target.value)}
    required
  >
    <MenuItem value="low">Low</MenuItem>
    <MenuItem value="medium">Medium</MenuItem>
    <MenuItem value="high">High</MenuItem>
  </Select>
</FormControl>

          <FormControlLabel control={<Checkbox checked={openAllDays} onChange={(e)=>setOpenAllDays(e.target.checked)} />} label="Open All Days" />
          {openAllDays && (
            <FormControlLabel control={<Checkbox checked={sameHoursAllDays} onChange={(e)=>setSameHoursAllDays(e.target.checked)} />} label="Same Working Hours All Days" />
          )}
          {sameHoursAllDays && openAllDays ? (
            <Grid container spacing={2} sx={{mb:2}}>
              <Grid item xs={6}>
                <TextField label="Start Time" type="time" fullWidth value={workingHours.allDays.start} onChange={(e)=>
                  setWorkingHours({...workingHours,allDays:{...workingHours.allDays,start:e.target.value}})} />
              </Grid>
              <Grid item xs={6}>
                <TextField label="End Time" type="time" fullWidth value={workingHours.allDays.end} onChange={(e)=>
                  setWorkingHours({...workingHours,allDays:{...workingHours.allDays,end:e.target.value}})} />
              </Grid>
            </Grid>
          ) : (
            !sameHoursAllDays && openAllDays && (
              <Button variant="outlined" color="primary" sx={{mt:2,mb:2}} onClick={()=>setWorkingHoursModalOpen(true)}>
                Set Day-Wise Working Hours
              </Button>
            )
          )}

          {!openAllDays && (
            <Button variant="outlined" sx={{mt:2,mb:2}} onClick={()=>setClosedDaysModalOpen(true)}>
              Select Closed Days
            </Button>
          )}

          <Typography variant="h6" sx={{mt:2,mb:1}}>Select Location on Map</Typography>
          <Button variant="contained" color="primary" sx={{mb:2}} onClick={()=>setMapModalOpen(true)}>Set Location on Map</Button>
          <Typography sx={{mb:1}}>Upload Thumbnail</Typography>
          <input type="file" accept="image/*" onChange={(e)=>setThumbnail(e.target.files[0])} style={{ marginBottom:'20px' }} />
          <Button variant="contained" color="primary" fullWidth onClick={handleRegisterBusiness} sx={{mt:2}}>
            Submit
          </Button>
        </Box>
      </Modal>

      {/* Edit Modal */}
      <Modal open={editModalOpen} onClose={()=>setEditModalOpen(false)}>
        <Box sx={modalStyle}>
          <IconButton sx={{position:'absolute',top:8,right:8}} onClick={()=>setEditModalOpen(false)}><CloseIcon/></IconButton>
          <Typography variant="h5" gutterBottom>Edit Restaurant Details</Typography>
          <TextField label="Business Name" fullWidth sx={{mb:2}} value={editBusinessName} onChange={(e)=>setEditBusinessName(e.target.value)} />
          <TextField label="Street" fullWidth sx={{mb:2}} value={editStreet} onChange={(e)=>setEditStreet(e.target.value)}/>
          <TextField label="Building (Optional)" fullWidth sx={{mb:2}} value={editBuilding} onChange={(e)=>setEditBuilding(e.target.value)}/>
          <TextField label="City" fullWidth sx={{mb:2}} value={editCity} onChange={(e)=>setEditCity(e.target.value)}/>
          <TextField label="State" fullWidth sx={{mb:2}} value={editStateVal} onChange={(e)=>setEditStateVal(e.target.value)}/>
          <TextField label="Pincode" fullWidth sx={{mb:2}} value={editPincode} onChange={(e)=>setEditPincode(e.target.value)}/>
          <FormControl fullWidth sx={{mb:2}}>
            <InputLabel>Category</InputLabel>
            <Select value={editCategory} onChange={(e)=>setEditCategory(e.target.value)}>
              <MenuItem value="Cafe">Cafe</MenuItem>
              <MenuItem value="Restaurant">Restaurant</MenuItem>
              <MenuItem value="Fast Food">Fast Food</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{mb:2}}>
            <InputLabel>Price Range</InputLabel>
            <Select value={editPriceRange} onChange={(e)=>setEditPriceRange(e.target.value)}>
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>
          <FormControlLabel control={<Checkbox checked={editOpenAllDays} onChange={(e)=>setEditOpenAllDays(e.target.checked)} />} label="Open All Days" />
          {!editOpenAllDays && (
            <Button variant="outlined" sx={{mt:2,mb:2}} onClick={()=>setClosedDaysModalOpen(true)}>
              Select Closed Days
            </Button>
          )}
          <FormControlLabel control={<Checkbox checked={editSameHoursAllDays} onChange={(e)=>setEditSameHoursAllDays(e.target.checked)} />} label="Same Hours for All (Open) Days" />
          {renderEditWorkingHoursFields()}

          <Typography variant="h6" sx={{ mt:2, mb:1 }}>Current Gallery Images</Typography>
          {/* {existingGalleryImages.length===0?<Typography>No images</Typography>:(
            existingGalleryImages.map((imgUrl,idx)=>
              <FormControlLabel
                key={idx}
                control={<Checkbox checked={imagesToDelete.includes(imgUrl)} onChange={(e)=>{
                  if(e.target.checked) setImagesToDelete([...imagesToDelete,imgUrl]);
                  else setImagesToDelete(imagesToDelete.filter(u=>u!==imgUrl));
                }}/>}
                label={<a href={imgUrl} target="_blank" rel="noopener noreferrer">{imgUrl}</a>}
              />
            )
          )} */}
          {renderGalleryImages()}

          <Typography variant="h6" sx={{ mt:2, mb:1 }}>Add New Gallery Images</Typography>
          <input type="file" multiple accept="image/*" onChange={(e)=>setGalleryImages(Array.from(e.target.files))} style={{marginBottom:'20px'}} />

          <Typography variant="h6" sx={{ mt:2, mb:1 }}>Notices (one per line)</Typography>
          <TextField multiline rows={3} fullWidth sx={{mb:2}} value={notices} onChange={(e)=>setNotices(e.target.value)}/>

          <Typography variant="h6" sx={{ mt:2, mb:1 }}>Menu (Format: ItemName|Price)</Typography>
          <TextField multiline rows={5} fullWidth sx={{mb:2}} value={menu} onChange={(e)=>setMenu(e.target.value)}/>

          <Typography variant="h6" sx={{ mt:2, mb:1 }}>Ratings & Reviews</Typography>
          <Paper sx={{maxHeight:'150px',overflow:'auto',mb:2}}>
            {ratings.length===0?(
              <Typography sx={{p:1}}>No reviews yet.</Typography>
            ):(
              <List>
                {ratings.map((r,i)=>(
                  <ListItem key={i}>
                    <ListItemText primary={`${r.User?r.User.name:'User'}: ${r.rating} stars`} secondary={r.comment} />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>

          <Typography variant="h6" sx={{ mt:2, mb:1 }}>Map Location</Typography>
          <Button variant="contained" color="primary" onClick={()=>setMapModalOpen(true)} sx={{mb:2}}>
            Set Location on Map
          </Button>

          <Typography sx={{mb:1}}>Upload New Thumbnail (optional)</Typography>
          <input type="file" accept="image/*" onChange={(e)=>setEditThumbnail(e.target.files[0])} style={{ marginBottom:'20px'}} />

          <Button variant="contained" color="primary" fullWidth onClick={handleUpdateRestaurant} sx={{mt:2}}>
            Update Restaurant
          </Button>
          <Button variant="outlined" color="error" fullWidth sx={{mt:2}} onClick={handleRequestDeletion}>
            Request Deletion
          </Button>
        </Box>
      </Modal>

      {/* Working Hours Modal (Edit) */}
      <Modal open={workingHoursModalOpen} onClose={()=>setWorkingHoursModalOpen(false)}>
        <Box sx={{...modalStyle,width:'400px'}}>
          <IconButton sx={{position:'absolute',top:8,right:8}} onClick={()=>setWorkingHoursModalOpen(false)}>
            <CloseIcon/>
          </IconButton>
          <Typography variant="h6" gutterBottom>Set Day-Wise Working Hours</Typography>
          <Grid container spacing={2}>
            {getOpenDaysForEdit().map(day=>(
              <React.Fragment key={day}>
                <Grid item xs={6}>
                  <TextField
                    label={`${day} Start Time`}
                    type="time"
                    fullWidth
                    InputLabelProps={{shrink:true}}
                    value={editWorkingHours.specific[day]?.start||''}
                    onChange={(e)=>
                      setEditWorkingHours({
                        ...editWorkingHours,
                        specific:{
                          ...editWorkingHours.specific,
                          [day]:{...editWorkingHours.specific[day], start:e.target.value}
                        }
                      })
                    }
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label={`${day} End Time`}
                    type="time"
                    fullWidth
                    InputLabelProps={{shrink:true}}
                    value={editWorkingHours.specific[day]?.end||''}
                    onChange={(e)=>
                      setEditWorkingHours({
                        ...editWorkingHours,
                        specific:{
                          ...editWorkingHours.specific,
                          [day]:{...editWorkingHours.specific[day], end:e.target.value}
                        }
                      })
                    }
                  />
                </Grid>
              </React.Fragment>
            ))}
          </Grid>
          <Button variant="contained" color="primary" fullWidth onClick={()=>setWorkingHoursModalOpen(false)} sx={{mt:2}}>
            Done
          </Button>
        </Box>
      </Modal>

      {/* Closed Days Modal */}
      <Modal open={closedDaysModalOpen} onClose={()=>setClosedDaysModalOpen(false)}>
        <Box sx={{...modalStyle,width:'300px'}}>
          <IconButton sx={{position:'absolute',top:8,right:8}} onClick={()=>setClosedDaysModalOpen(false)}>
            <CloseIcon/>
          </IconButton>
          <Typography variant="h6" gutterBottom>Select Closed Days</Typography>
          {daysOfWeek.map(day=>(
            editModalOpen ? (
              <FormControlLabel
                key={day}
                control={<Checkbox checked={editClosedDays.includes(day)} onChange={()=>toggleEditClosedDay(day)} />}
                label={day}
              />
            ):(
              <FormControlLabel
                key={day}
                control={<Checkbox checked={closedDays.includes(day)} onChange={()=>toggleClosedDay(day)} />}
                label={day}
              />
            )
          ))}
          <Button variant="contained" color="primary" fullWidth onClick={()=>setClosedDaysModalOpen(false)}>
            Done
          </Button>
        </Box>
      </Modal>

      {/* Map Modal */}
      <Modal open={mapModalOpen} onClose={() => setMapModalOpen(false)}>
  <Box sx={{ ...modalStyle, width: '500px' }}>
    <IconButton
      sx={{ position: 'absolute', top: 8, right: 8 }}
      onClick={() => setMapModalOpen(false)}
    >
      <CloseIcon />
    </IconButton>
    <Typography variant="h6" gutterBottom>Select Location on Map</Typography>
    <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY" libraries={['places']}>
      {/* Autocomplete Input Field */}
      <Autocomplete
        onLoad={(autocomplete) => {
          if (editModalOpen) {
            editAutocompleteRef.current = autocomplete;
          } else {
            newAutocompleteRef.current = autocomplete;
          }
        }}
        onPlaceChanged={() => {
          if (editModalOpen) handlePlaceSelected(editAutocompleteRef, setEditMapLocation);
          else handlePlaceSelected(newAutocompleteRef, setMapLocation);
        }}
      >
        <TextField
          id="autocomplete-input"
          label="Search location"
          variant="outlined"
          fullWidth
          value={editModalOpen ? editSearchText : newSearchText}
          onChange={(e) => {
            editModalOpen
              ? setEditSearchText(e.target.value)
              : setNewSearchText(e.target.value);
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              if (editModalOpen) handleManualSearch(editSearchText, setEditMapLocation);
              else handleManualSearch(newSearchText, setMapLocation);
            }
          }}
          sx={{ marginBottom: '10px' }}
        />
      </Autocomplete>
      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          if (editModalOpen) handleManualSearch(editSearchText, setEditMapLocation);
          else handleManualSearch(newSearchText, setMapLocation);
        }}
        sx={{ marginBottom: '10px' }}
      >
        Search
      </Button>

      {/* Google Map */}
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={14}
        center={editModalOpen ? editMapLocation : mapLocation}
        onClick={(e) => {
          const position = { lat: e.latLng.lat(), lng: e.latLng.lng() };
          if (editModalOpen) setEditMapLocation(position);
          else setMapLocation(position);
        }}
      >
        <Marker
          position={editModalOpen ? editMapLocation : mapLocation}
          draggable
          onDragEnd={(e) => {
            const position = { lat: e.latLng.lat(), lng: e.latLng.lng() };
            if (editModalOpen) setEditMapLocation(position);
            else setMapLocation(position);
          }}
        />
      </GoogleMap>
    </LoadScript>
    <Button
      variant="contained"
      color="primary"
      fullWidth
      sx={{ mt: 2 }}
      onClick={() => setMapModalOpen(false)}
    >
      Done
    </Button>
  </Box>
</Modal>
    </div>
  );
};

export default BusinessOwnerDashboard;
