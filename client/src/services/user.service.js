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

/**
 * Updates the guide profile with complete fields.
 * @param {object} profileData - Complete guide profile data
 * @returns {Promise<object>} The updated user profile object
 */
const updateGuideProfile = async (profileData) => {
  try {
    const response = await api.patch('/users/profile/guide', profileData);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Uploads avatar for the user.
 * @param {FormData} formData - FormData containing the avatar file
 * @returns {Promise<object>} The updated user profile object
 */
const uploadAvatar = async (formData) => {
  try {
    const response = await api.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Sends OTP for phone verification.
 * @param {object} data - { phoneNumber }
 * @returns {Promise<void>}
 */
const sendPhoneOTP = async (data) => {
  try {
    await api.post('/users/send-phone-otp', data);
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Verifies phone OTP.
 * @param {object} data - { phoneNumber, otp }
 * @returns {Promise<object>} The updated user profile object
 */
const verifyPhoneOTP = async (data) => {
  try {
    const response = await api.post('/users/verify-phone-otp', data);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Uploads an identity document.
 * @param {string} field - The field name (e.g., 'aadhaarCard', 'panCard').
 * @param {FormData} formData - The form data containing the file.
 * @returns {Promise<object>} The updated user profile object
 */
const uploadIdentityDoc = async (field, formData) => {
  try {
    const response = await api.post(`/users/upload-identity/${field}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const userService = {
  getMyProfile,
  updateMyProfile,
  updateGuideProfile,
  uploadAvatar,
  sendPhoneOTP,
  verifyPhoneOTP,
  uploadIdentityDoc,
};
