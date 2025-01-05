import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Alert } from '@mui/material';
import axios from 'axios';

const ProfilePage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('http://localhost:5001/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setName(response.data.name);
        setEmail(response.data.email);
      } catch (err) {
        setError('Failed to load profile');
      }
    };

    fetchUserProfile();
  }, []);

  const handleSubmit = async () => {
    setSuccess('');
    setError('');
    const token = localStorage.getItem('token');
    try {
      await axios.put(
        'http://localhost:5001/api/users/profile',
        { name, email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  return (
    <Box sx={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <h1>Edit Profile</h1>
      {success && <Alert severity="success">{success}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}
      <TextField
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
        sx={{ marginBottom: '10px' }}
      />
      <TextField
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
        sx={{ marginBottom: '10px' }}
      />
      <Button variant="contained" color="primary" onClick={handleSubmit}>
        Save Changes
      </Button>
    </Box>
  );
};

export default ProfilePage;
