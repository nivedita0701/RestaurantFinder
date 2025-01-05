import React, { useState, useEffect } from 'react';
import {
  Button,
  Typography,
  Alert,
  Paper,
  Modal,
  Box,
  IconButton,
  Grid, TextField,
  FormControlLabel,
  Checkbox,
  Grid2
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import axios from 'axios';

const modalStyle={
  position:'absolute',
  top:'50%',
  left:'50%',
  transform:'translate(-50%, -50%)',
  width:'600px',
  bgcolor:'background.paper',
  boxShadow:24,
  p:4,
  borderRadius:'8px',
  maxHeight:'80vh',
  overflowY:'auto',
};

const AdminPanel = () => {
  const token=localStorage.getItem('token');
  const [pending,setPending] = useState([]);
  const [approved,setApproved] = useState([]);
  const [deleteRequested,setDeleteRequested] = useState([]);
  const [rejected,setRejected] = useState([]);
  const [error,setError] = useState('');
  const [success,setSuccess] = useState('');
  const [detailsModalOpen,setDetailsModalOpen] = useState(false);
  const [selectedRestaurant,setSelectedRestaurant] = useState(null);

  useEffect(()=>{
    const fetchData=async()=>{
      setError('');
      setSuccess('');
      try {
        const penRes=await axios.get('http://localhost:5001/api/admin/pending-restaurants',{headers:{Authorization:`Bearer ${token}`}});
        const allRes=await axios.get('http://localhost:5001/api/restaurants',{headers:{Authorization:`Bearer ${token}`}});
        const all = allRes.data;

        const pendingList = penRes.data||[];
        const approvedList = all.filter(r=>r.status==='approved');
        const deleteReqList = all.filter(r=>r.status==='delete_requested');
        const rejectedList = all.filter(r=>r.status==='rejected');

        setPending(pendingList);
        setApproved(approvedList);
        setDeleteRequested(deleteReqList);
        setRejected(rejectedList);
      } catch(err){
        setError('Failed to fetch data.');
      }
    };
    fetchData();
  },[token]);

  const handleApprove=(id)=>async()=>{
    try{
      await axios.put(`http://localhost:5001/api/admin/approve-restaurant/${id}`,{},{
        headers:{Authorization:`Bearer ${token}`}
      });
      const toApprove = pending.find(x=>x.id===id);
      setPending(pending.filter(r=>r.id!==id));
      if(toApprove){
        setApproved(a=>[...a,{...toApprove,status:'approved'}]);
      }
      setSuccess('Restaurant approved successfully.');
    }catch(err){
      setError('Failed to approve restaurant.');
    }
  };

  const handleReject=(id)=>async()=>{
    try{
      await axios.put(`http://localhost:5001/api/admin/reject-restaurant/${id}`,{},{
        headers:{Authorization:`Bearer ${token}`}
      });
      const toReject = pending.find(x=>x.id===id);
      setPending(pending.filter(r=>r.id!==id));
      if(toReject){
        setRejected(rej=>[...rej,{...toReject,status:'rejected'}]);
      }
      setSuccess('Restaurant rejected successfully.');
    }catch(err){
      setError('Failed to reject restaurant.');
    }
  };

  const handleApproveDelete=(id)=>async()=>{
    try{
      await axios.put(`http://localhost:5001/api/admin/approve-delete/${id}`,{},{
        headers:{Authorization:`Bearer ${token}`}
      });
      setDeleteRequested(dr=>dr.filter(r=>r.id!==id));
      setSuccess('Restaurant deletion approved and completed.');
    }catch(err){
      setError('Failed to approve deletion.');
    }
  };

  const handleViewDetails= async (id)=>{
    setError('');
    setSuccess('');
    try {
      const res= await axios.get(`http://localhost:5001/api/restaurants/${id}`,{
        headers:{Authorization:`Bearer ${token}`}
      });
      setSelectedRestaurant(res.data);
      setDetailsModalOpen(true);
    } catch(err){
      setError('Failed to fetch details.');
    }
  };

  const handleDelete=(id)=>async()=>{
    try{
      await axios.delete(`http://localhost:5001/api/restaurants/${id}`,{
        headers:{Authorization:`Bearer ${token}`}
      });
      // Remove from all arrays
      setPending(pending.filter(r=>r.id!==id));
      setApproved(approved.filter(r=>r.id!==id));
      setDeleteRequested(deleteRequested.filter(r=>r.id!==id));
      setRejected(rejected.filter(r=>r.id!==id));
      setSuccess('Restaurant deleted successfully.');
    }catch(err){
      setError('Failed to delete restaurant.');
    }
  };

  return (
    <div style={{padding:'20px'}}>
      <Typography variant="h4">Admin Panel</Typography>
      {success && <Alert severity="success" sx={{mb:2}}>{success}</Alert>}
      {error && <Alert severity="error" sx={{mb:2}}>{error}</Alert>}

      <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>Pending Restaurants</Typography>
      {pending.map(r=>(
        <Paper key={r.id} sx={{p:2,mb:2}}>
          <Typography variant='h6'>{r.name}</Typography>
          <Button variant="contained" onClick={handleApprove(r.id)}>Approve</Button>
          <Button variant="contained" color="error" onClick={handleReject(r.id)} sx={{ml:2}}>Reject</Button>
          <Button variant="outlined" sx={{ml:2}} onClick={()=>handleViewDetails(r.id)}>View Details</Button>
        </Paper>
      ))}

      <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>Approved Restaurants</Typography>
      {approved.map(r=>(
        <Paper key={r.id} sx={{p:2,mb:2}}>
          <Typography>{r.name}</Typography>
          <Button variant="outlined" onClick={()=>handleViewDetails(r.id)}>View Details</Button>
          <Button variant="contained" color="error" onClick={handleDelete(r.id)} sx={{ml:2}}>Delete</Button>
        </Paper>
      ))}

      <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>Delete Requested</Typography>
      {deleteRequested.map(r=>(
        <Paper key={r.id} sx={{p:2,mb:2}}>
          <Typography>{r.name}</Typography>
          <Button variant="outlined" onClick={()=>handleViewDetails(r.id)}>View Details</Button>
          <Button variant="contained" color="primary" onClick={handleApproveDelete(r.id)} sx={{ml:2}}>Approve Deletion</Button>
          <Button variant="contained" color="error" onClick={handleDelete(r.id)} sx={{ml:2}}>Force Delete</Button>
        </Paper>
      ))}

      <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>Rejected Restaurants</Typography>
      {rejected.map(r=>(
        <Paper key={r.id} sx={{p:2,mb:2}}>
          <Typography>{r.name}</Typography>
          <Button variant="outlined" onClick={()=>handleViewDetails(r.id)}>View Details</Button>
          <Button variant="contained" color="error" onClick={handleDelete(r.id)} sx={{ml:2}}>Delete</Button>
        </Paper>
      ))}

<Modal open={detailsModalOpen} onClose={() => setDetailsModalOpen(false)}>
  <Box sx={modalStyle}>
    <IconButton sx={{ position: 'absolute', top: 8, right: 8 }} onClick={() => setDetailsModalOpen(false)}>
      <CloseIcon />
    </IconButton>
    {selectedRestaurant ? (
      <>
        <Typography variant="h5" gutterBottom>
          Restaurant Details
        </Typography>
        <Grid container spacing={2}>
          {/* Owner Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Owner Information
            </Typography>
            <TextField
              label="Owner Name"
              fullWidth
              value={selectedRestaurant.owner?.name || 'N/A'}
              disabled
              style={{ marginBottom: "20px" }}
            />
            <TextField
              label="Owner Email"
              fullWidth
              value={selectedRestaurant.owner?.email || 'N/A'}
              disabled
            />
          </Grid>

          {/* Restaurant Details */}
          <Grid item xs={12}>
            <TextField
              label="Business Name"
              fullWidth
              value={selectedRestaurant.name}
              disabled
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Street"
              fullWidth
              value={selectedRestaurant.street}
              disabled
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Building (Optional)"
              fullWidth
              value={selectedRestaurant.building || ''}
              disabled
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="City"
              fullWidth
              value={selectedRestaurant.city}
              disabled
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="State"
              fullWidth
              value={selectedRestaurant.state}
              disabled
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Pincode"
              fullWidth
              value={selectedRestaurant.pincode}
              disabled
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Category"
              fullWidth
              value={selectedRestaurant.category}
              disabled
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Price Range"
              fullWidth
              value={selectedRestaurant.priceRange}
              disabled
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={<Checkbox checked={selectedRestaurant.workingHours.openAllDays} disabled />}
              label="Open All Days"
            />
            <FormControlLabel
              control={<Checkbox checked={selectedRestaurant.workingHours.sameHoursAllDays} disabled />}
              label="Same Hours for All (Open) Days"
            />
          </Grid>
          {selectedRestaurant.workingHours.openAllDays && selectedRestaurant.workingHours.sameHoursAllDays ? (
            <>
              <Grid item xs={6}>
                <TextField
                  label="Start Time"
                  type="time"
                  fullWidth
                  value={selectedRestaurant.workingHours.allDays?.start || ''}
                  disabled
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="End Time"
                  type="time"
                  fullWidth
                  value={selectedRestaurant.workingHours.allDays?.end || ''}
                  disabled
                />
              </Grid>
            </>
          ) : (
            <>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Day-wise Working Hours
                </Typography>
              </Grid>
              {Object.keys(selectedRestaurant.workingHours.specific || {}).map((day, idx) => (
                <Grid item xs={6} key={idx}>
                  <Typography>
                    {day}: {selectedRestaurant.workingHours.specific[day]?.start || 'Closed'} -{' '}
                    {selectedRestaurant.workingHours.specific[day]?.end || 'Closed'}
                  </Typography>
                </Grid>
              ))}
            </>
          )}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Current Gallery Images
            </Typography>
            {selectedRestaurant.galleryImages?.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {selectedRestaurant.galleryImages.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Gallery ${idx}`}
                    style={{
                      width: '100px',
                      height: '100px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '1px solid #ddd',
                    }}
                  />
                ))}
              </div>
            ) : (
              <Typography>No images</Typography>
            )}
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Map Location
            </Typography>
            <div style={{ height: '300px', width: '100%' }}>
              {/* YOUR_GOOGLE_MAPS_API_KEY */}
              <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
                <GoogleMap
                  mapContainerStyle={{ height: '100%', width: '100%' }}
                  center={selectedRestaurant.mapLocation}
                  zoom={15}
                >
                  <Marker position={selectedRestaurant.mapLocation} />
                </GoogleMap>
              </LoadScript>
            </div>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Restaurant Reviews
            </Typography>
            {selectedRestaurant?.reviews?.length > 0 ? (
              <Box sx={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px', padding: '8px', mt: 2 }}>
                {selectedRestaurant.reviews.map((review, index) => (
                  <Paper key={index} sx={{ mb: 1, p: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {review.User.name || 'Anonymous'}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {`Rating: ${review.rating} / 5`}
                    </Typography>
                    <Typography variant="body2">{review.comment}</Typography>
                  </Paper>
                ))}
              </Box>
            ) : (
              <Typography sx={{ mt: 2 }}>No reviews yet.</Typography>
            )}
          </Grid>

        </Grid>
      </>
    ) : (
      <Typography>Loading...</Typography>
    )}
  </Box>
</Modal>

    </div>
  );
};

export default AdminPanel;
