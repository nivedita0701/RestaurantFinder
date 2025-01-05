import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import EditProfilePage from './pages/EditProfilePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import RestaurantDetailPage from './pages/RestaurantDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BusinessOwnerDashboard from './pages/BusinessOwnerDashboard';
import AdminPanel from './pages/AdminPanel';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import { Box } from '@mui/material';
import VerifyEmailPage from './pages/VerifyEmailPage';
import BusinessRegistrationPage from './pages/BusinessRegistrationPage';
// src/App.js
import { ThemeProvider } from '@mui/material/styles';
import theme from './styles/globalStyles';

// Separate component for handling inactivity
const InactivityHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let timeout;

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        localStorage.removeItem('token');
        navigate('/login');
        alert('You have been logged out due to inactivity.');
      }, 30 * 60 * 1000); // 30 minutes
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);

    resetTimer(); // Initialize timer on component mount

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
    };
  }, [navigate]);

  return null; // This component only manages inactivity
};

const App = () => {
  return (
    <ThemeProvider theme={theme}>
    <Router>
      <InactivityHandler /> {/* Include the inactivity handler */}
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <Box sx={{ flex: '1 0 auto' }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/restaurant/:id" element={<RestaurantDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/business-owner" element={<ProtectedRoute><BusinessOwnerDashboard /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute />}><Route path="" element={<AdminPanel />} /></Route>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/change-password" element={<ChangePasswordPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/profile/edit" element={<EditProfilePage />} />
            <Route path="/verify-email/:userId" element={<VerifyEmailPage />} />
            <Route path="/business-owner" element={<ProtectedRoute><BusinessOwnerDashboard /></ProtectedRoute>} />
            <Route path="/register-business" element={<BusinessRegistrationPage />} />
            <Route path="*" element={<div>404 Not Found</div>} />
          </Routes>
        </Box>
        <Footer />
      </Box>
    </Router>
    </ThemeProvider>
  );
};

export default App;