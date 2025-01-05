import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Alert, CircularProgress, Box, Typography } from '@mui/material';

const VerifyEmailPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.post(`http://localhost:5001/api/auth/verify-email/${userId}`);
        setMessage(response.data.message);
      } catch (error) {
        setMessage(error.response?.data?.message || 'Failed to verify email');
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [userId]);

  return (
    <Box sx={{ padding: '20px', textAlign: 'center' }}>
      {loading ? (
        <CircularProgress />
      ) : (
        <Alert severity={message.includes('successfully') ? 'success' : 'error'}>
          {message}
        </Alert>
      )}
      <Typography variant="body1" sx={{ marginTop: '20px' }}>
        <a href="/login" onClick={() => navigate('/login')}>Go to Login</a>
      </Typography>
    </Box>
  );
};

export default VerifyEmailPage;
