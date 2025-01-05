import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Menu,
  MenuItem,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AccountCircle from '@mui/icons-material/AccountCircle';
import axios from 'axios';
import '../styles/pages/Header.css'; // Separate CSS for styling

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('http://localhost:5001/api/users/profile', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(response.data);
        } catch (error) {
          console.error('Error fetching user profile:', error.message);
          setUser(null);
        }
      }
      setLoading(false);
    };

    fetchUserProfile();
  }, [location]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <AppBar position="static" className="header">
      <Toolbar className="header-toolbar">
        <Box
          className="header-logo"
          onClick={() => navigate('/')}
        >
          <img src="../styles/static/logo.jpeg" alt="RestaurantFinder" className="header-logo-img" />
          <Typography variant="h6" className="header-title">
            RestaurantFinder
          </Typography>
        </Box>
        <Box className="header-menu">
          {loading ? (
            <CircularProgress color="inherit" size={24} />
          ) : user ? (
            <>
              <IconButton color="inherit" onClick={handleMenuOpen}>
                <AccountCircle />
              </IconButton>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem onClick={() => navigate('/profile/edit')}>Edit Profile</MenuItem>
                <MenuItem onClick={() => navigate('/change-password')}>Change Password</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
              <Button color="inherit" component={Link} to="/register">
                Register
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/register-business')}
                className="header-business-btn"
              >
                Register Your Business
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
