import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Alert, CircularProgress } from '@mui/material';
import axios from 'axios';

const EditProfilePage = () => {
  const [user, setUser] = useState({ name: '', email: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5001/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      } catch (err) {
        console.error('Failed to fetch user profile:', err.message);
      }
    };

    fetchUserProfile();
  }, []);

  const handleUpdateProfile = async () => {
    setSuccess('');
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        'http://localhost:5001/api/users/profile',
        { name: user.name, email: user.email },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUser(response.data);
      setSuccess('Profile updated successfully! Please verify your new email.');
    } catch (err) {
        if (err.response?.data?.message === 'Email is already in use by another account') {
          setError('This email is already associated with another account. Please use a different email.');
        } else {
          setError(err.response?.data?.message || 'Failed to update profile');
        }
      } finally {
      setLoading(false);
    }
  };

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center' }}>
      <Typography variant="h5" gutterBottom>
        Edit Profile
      </Typography>
      {success && <Alert severity="success">{success}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}
      <TextField
        label="Name"
        variant="outlined"
        fullWidth
        value={user.name}
        onChange={(e) => setUser({ ...user, name: e.target.value })}
        sx={{ marginBottom: '20px' }}
      />
      <TextField
        label="Email"
        variant="outlined"
        fullWidth
        value={user.email}
        onChange={(e) => setUser({ ...user, email: e.target.value })}
        sx={{ marginBottom: '20px' }}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleUpdateProfile}
        disabled={loading || !user.name || !user.email}
        fullWidth
      >
        {loading ? <CircularProgress size={24} /> : 'Update Profile'}
      </Button>
    </Box>
  );
};

export default EditProfilePage;
