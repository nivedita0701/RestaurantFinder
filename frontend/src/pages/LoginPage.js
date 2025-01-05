import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const validateFields = () => {
    let isValid = true;
    if (!email.includes('@') || !email.includes('.')) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    } else {
      setEmailError('');
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      isValid = false;
    } else {
      setPasswordError('');
    }
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateFields()) return;

    try {
      const response = await API.post('/auth/login', { email, password });
      const { token, role } = response.data;

      login(token, role); // Update AuthContext with token and role

      // Redirect based on role
      if (role === 'admin') {
        navigate('/admin');
      } else if (role === 'businessOwner') {
        navigate('/business-owner');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <Box
      sx={{
        maxWidth: '400px',
        margin: '50px auto',
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '10px',
      }}
    >
      <Typography variant="h5" sx={{ marginBottom: '20px', textAlign: 'center' }}>
        Welcome Back! Login to Your Account
      </Typography>
      {error && (
        <Alert severity="error" sx={{ marginBottom: '20px' }}>
          {error}
        </Alert>
      )}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          sx={{ marginBottom: '10px' }}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={!!emailError}
          helperText={emailError}
        />
        <TextField
          label="Password"
          variant="outlined"
          type="password"
          fullWidth
          sx={{ marginBottom: '10px' }}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={!!passwordError}
          helperText={passwordError}
        />
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Login
        </Button>
      </form>
      <Typography variant="body2" align="center">
        <Link to="/forgot-password">Forgot Password?</Link>
      </Typography>
      <Typography variant="body2" align="center">
        Don't have an account yet? <Link to="/register">Sign up here</Link>
      </Typography>
    </Box>
  );
};

export default LoginPage;
