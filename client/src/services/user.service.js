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
 * Updates the profile for the currently logged-in user using FormData.
 * This now handles text AND file uploads in one request.
 * @param {FormData} profileFormData - A FormData object containing all text and file fields
 * @returns {Promise<object>} The updated user profile object
 */
const updateMyProfile = async (profileFormData) => {
  try {
    // Send the FormData. Axios will automatically set the
    // 'Content-Type': 'multipart/form-data' header.
    const response = await api.patch('/users/profile', profileFormData, {
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

// Export the consolidated service functions
export const userService = {
  getMyProfile,
  updateMyProfile, // This is the only update function needed now
  sendPhoneOTP,
  verifyPhoneOTP,
  // updateGuideProfile, uploadAvatar, and uploadIdentityDoc are removed
  // as their logic is now inside updateMyProfile
};
