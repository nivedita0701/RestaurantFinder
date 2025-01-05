import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Alert, CircularProgress } from '@mui/material';
import axios from 'axios';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await axios.post('http://localhost:5001/api/users/forgot-password', { email });
      setSuccess('Password reset link sent to your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center' }}>
      <Typography variant="h5" gutterBottom>
        Forgot Password
      </Typography>
      {success && <Alert severity="success">{success}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}
      <TextField
        label="Enter your email"
        variant="outlined"
        fullWidth
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        sx={{ marginBottom: '20px' }}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleForgotPassword}
        disabled={loading || !email}
        fullWidth
      >
        {loading ? <CircularProgress size={24} /> : 'Send Reset Link'}
      </Button>
    </Box>
  );
};

export default ForgotPasswordPage;
