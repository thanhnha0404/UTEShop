import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAdmin } from '../utils/authStorage';

const AdminRoute = ({ children }) => {
  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default AdminRoute;
