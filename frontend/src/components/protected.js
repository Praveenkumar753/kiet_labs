import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('authToken'); // Retrieve token from localStorage

  if (!token) {
    return <Navigate to="/login" />; // Redirect to login if no token is found
  }

  // If token exists, allow access to the route
  return children;
};

export default ProtectedRoute;
