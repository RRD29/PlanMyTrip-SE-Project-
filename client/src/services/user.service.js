import api from '../lib/axios';

/**
 * Fetches the profile for the currently logged-in user.
 * @returns {Promise<object>} The user profile object
 */
const getMyProfile = async () => {
  try {
    const response = await api.get('/users/profile');
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Updates the profile for the currently logged-in user.
 * @param {object} profileData - { fullName, ...other fields }
 * @returns {Promise<object>} The updated user profile object
 */
const updateMyProfile = async (profileData) => {
  try {
    const response = await api.patch('/users/profile', profileData);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const userService = {
  getMyProfile,
  updateMyProfile,
};