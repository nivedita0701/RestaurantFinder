import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, TextField, Button, Typography, Alert, CircularProgress } from '@mui/material';
import axios from 'axios';

const ResetPasswordPage = () => {
  const { token } = useParams(); // Extract token from URL
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await axios.post(`http://localhost:5001/api/users/reset-password/${token}`, { token, password });
      setSuccess('Password reset successfully. You can now log in.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center' }}>
      <Typography variant="h5" gutterBottom>
        Reset Password
      </Typography>
      {success && <Alert severity="success">{success}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}
      <TextField
        label="New Password"
        variant="outlined"
        fullWidth
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        sx={{ marginBottom: '20px' }}
      />
      <TextField
        label="Confirm Password"
        variant="outlined"
        fullWidth
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        sx={{ marginBottom: '20px' }}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleResetPassword}
        disabled={loading || !password || !confirmPassword}
        fullWidth
      >
        {loading ? <CircularProgress size={24} /> : 'Reset Password'}
      </Button>
    </Box>
  );
};

export default ResetPasswordPage;
