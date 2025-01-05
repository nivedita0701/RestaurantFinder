import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const validatePassword = (password) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/.test(password);
  };

  const validateFields = () => {
    let isValid = true;

    if (!username) {
      setUsernameError('Username is required');
      isValid = false;
    } else {
      setUsernameError('');
    }

    if (!email.includes('@') || !email.includes('.')) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    } else {
      setEmailError('');
    }

    if (!validatePassword(password)) {
      setPasswordError(
        'Password must be at least 8 characters long, contain an uppercase letter, a number, and a special character.'
      );
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
      await API.post('/auth/register', {
        name: username,
        email,
        password,
      });
      navigate('/login');
    } catch (err) {
      if (err.response?.status === 400) {
        setError(err.response.data.message || 'Email is already in use.');
      } else {
        setError('Registration failed. Please try again.');
      }
    }
  };

  return (
    <Box sx={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '10px' }}>
      <Typography variant="h5" sx={{ marginBottom: '20px', textAlign: 'center' }}>
        Create Your Account
      </Typography>
      {error && <Alert severity="error" sx={{ marginBottom: '20px' }}>{error}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Username"
          variant="outlined"
          fullWidth
          sx={{ marginBottom: '10px' }}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          error={!!usernameError}
          helperText={usernameError}
        />
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
          Register
        </Button>
      </form>
    </Box>
  );
};

export default RegisterPage;
