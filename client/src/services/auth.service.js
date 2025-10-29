import api from '../lib/axios';

/**
 * Logs in a user.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>} The API response (including user and token)
 */
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

/**
 * Registers a new user.
 * @param {string} fullName
 * @param {string} email
 * @param {string} password
 * @param {'user' | 'guide'} role
 * @returns {Promise<object>} The API response
 */
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

/**
 * Logs out the current user (by calling the backend endpoint).
 * @returns {Promise<object>} The API response
 */
const logout = async () => {
  try {
    const response = await api.post('/auth/logout');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Sends a password reset request.
 * @param {string} email
 * @returns {Promise<object>} The API response
 */
const forgotPassword = async (email) => {
  try {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Resets the password using a token.
 * @param {string} token - The reset token from the URL.
 * @param {string} password - The new password.
 * @returns {Promise<object>} The API response (including logged-in user data)
 */
const resetPassword = async (token, password) => {
  try {
    const response = await api.patch(`/auth/reset-password/${token}`, { password });
    return response.data; // Return the full response data
  } catch (error) {
    throw error.response?.data || error;
  }
};


// Export all functions
export const authService = {
  login,
  register,
  logout,
  forgotPassword, // Add new function
  resetPassword,  // Add new function
};