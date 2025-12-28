import React, { createContext, useContext, useState, useEffect } from 'react';

import api from '../lib/axios'; 
import { PageLoader } from '../components/common/Loaders';


const AuthContext = createContext();


export const useAuth = () => {
  return useContext(AuthContext);
};


export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true); 

  
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUserState(parsedUser);
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, accessToken } = response.data.data;

      
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', accessToken);

      
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      
      setUserState(user);

      return response;
    } catch (error) {
      console.error("Login failed:", error);
      throw error.response.data || error; 
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
    
    setUserState(null);

    
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    
    delete api.defaults.headers.common['Authorization'];
  };

  
  const value = {
    user,
    loading,
    login,
    register,
    logout,
    setUser,
    isAuthenticated: !!user, 
  };

  
  if (loading) {
    return <PageLoader text="Authenticating..." />;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};