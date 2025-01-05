import React, { useState } from 'react';
import { TextField, Button, Box, Alert, Typography } from '@mui/material';
import axios from 'axios';

const ChangePasswordPage = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setSuccess('');
    setError('');

    if (newPassword !== confirmPassword) {
        setError('New password and confirm password do not match');
        return;
      }

    const token = localStorage.getItem('token');
    try {
      const response = await axios.put(
        'http://localhost:5001/api/users/change-password',
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(response.data.message);
    //   setSuccess('Password changed successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    }
  };

  return (
    <Box sx={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <h1>Change Password</h1>
      {success && <Alert severity="success">{success}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}
      <TextField
        label="Current Password"
        variant="outlined"
        type="password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        fullWidth
        sx={{ marginBottom: '10px' }}
      />
      <TextField
        label="New Password"
        type="password"
        variant="outlined"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        fullWidth
        sx={{ marginBottom: '10px' }}
      />
      <TextField
        label="Confirm New Password"
        variant="outlined"
        type="password"
        fullWidth
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        sx={{ marginBottom: '20px' }}
      />
      <Button variant="contained" color="primary" onClick={handleSubmit}>
        Change Password
      </Button>
    </Box>
  );
};

export default ChangePasswordPage;
