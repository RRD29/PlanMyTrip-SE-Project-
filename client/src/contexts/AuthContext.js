import React, { createContext, useContext, useState, useEffect } from 'react';
// We'll create this api service file later. It's our central Axios instance.
import api from '../lib/axios'; 
import { PageLoader } from '../components/common/Loaders';

// 1. Create the Context
const AuthContext = createContext();

// 2. Create a custom hook to use the context easily
export const useAuth = () => {
  return useContext(AuthContext);
};

// 3. Create the Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state for initial auth check

  // Check for existing token in localStorage on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Set token for all future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUserState(parsedUser);
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        // Clear bad data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // --- Core Auth Functions ---

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, accessToken } = response.data.data;

      // 1. Store user and token
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', accessToken);

      // 2. Set token in default headers
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      // 3. Update state
      setUserState(user);

      // --- THIS IS THE UPDATED PART ---
      return user; // Return the user object for role-based redirect
      // --- END OF UPDATE ---
    } catch (error) {
      console.error("Login failed:", error);
      throw error.response.data || error; // Throw error to be caught by the login form
    }
  };

  const setUser = (updatedUser) => {
    setUserState(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const register = async (email, password, fullName, role) => {
    try {
      const response = await api.post('/auth/register', { email, password, fullName, role });
      return response;
    } catch (error) {
      console.error("Registration failed:", error);
      throw error.response.data || error;
    }
  };

  const logout = () => {
    // 1. Clear user from state
    setUserState(null);

    // 2. Clear from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // 3. Clear token from headers
    delete api.defaults.headers.common['Authorization'];
  };

  // The value to be passed to all consuming components
  const value = {
    user,
    loading,
    login,
    register,
    logout,
    setUser,
    isAuthenticated: !!user, // Helper boolean
  };

  // Show a full-page loader while checking auth
  if (loading) {
    return <PageLoader text="Authenticating..." />;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};