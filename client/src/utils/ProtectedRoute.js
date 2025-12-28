import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PageLoader } from '../components/common/Loaders';


const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  
  if (loading) {
    return <PageLoader text="Authenticating..." />;
  }

  
  if (!isAuthenticated) {
    
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    
    return <Navigate to="/unauthorized" replace />;
  }

  
  
  if (user.role === 'guide' && !user.isProfileComplete && location.pathname !== '/dashboard-guide/profile') {
    return <Navigate to="/dashboard-guide/profile" replace />;
  }

  
  return <Outlet />; 
};

export default ProtectedRoute;

