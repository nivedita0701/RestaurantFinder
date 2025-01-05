import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';


const AdminRoute = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" />;
  }

  try {
    const decoded = jwtDecode(token);
    if (decoded.role === 'admin') {
      return <Outlet />;
    } else {
      return <Navigate to="/" />;
    }
  } catch (error) {
    return <Navigate to="/login" />;
  }
};

export default AdminRoute;
