import api from '../lib/axios';


const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};


const register = async (fullName, email, password, role) => {
  try {
    const response = await api.post('/auth/register', {
      fullName,
      email,
      password,
      role,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};


const logout = async () => {
  try {
    const response = await api.post('/auth/logout');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};


const forgotPassword = async (email) => {
  try {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};


const resetPassword = async (token, password) => {
  try {
    const response = await api.patch(`/auth/reset-password/${token}`, { password });
    return response.data; 
  } catch (error) {
    throw error.response?.data || error;
  }
};



export const authService = {
  login,
  register,
  logout,
  forgotPassword, 
  resetPassword,  
};