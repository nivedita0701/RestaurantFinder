import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer = () => {
  return (
    <Box sx={{ backgroundColor: '#007BFF', color: 'white', padding: '10px', textAlign: 'center' }}>
      <Typography variant="body2">
        © {new Date().getFullYear()} RestaurantFinder. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer;
