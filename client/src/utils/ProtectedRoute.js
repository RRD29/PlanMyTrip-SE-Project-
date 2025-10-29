import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PageLoader } from '../components/common/Loaders';

/**
 * A wrapper for routes that require authentication.
 * @param {object} props
 * @param {string[]} [props.allowedRoles] - Optional array of roles allowed (e.g., ['admin', 'guide'])
 */
const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // 1. Show a loader while the AuthContext is checking for a user
  if (loading) {
    return <PageLoader text="Authenticating..." />;
  }

  // 2. If not loading and not authenticated, redirect to login
  if (!isAuthenticated) {
    // Save the location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. If authenticated, but role is not allowed, redirect to unauthorized
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // User is logged in, but doesn't have the right role
    return <Navigate to="/unauthorized" replace />;
  }

  // 4. If authenticated and has the correct role (or no role specified), show the page
  return <Outlet />; // Renders the child component (e.t., <UserDashboard />)
};

export default ProtectedRoute;

/*
  This file should end here. The example comment was causing the error.
*/