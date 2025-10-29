import api from '../lib/axios';

/**
 * Creates a new booking and payment intent.
 * @param {object} bookingData - { guideId, startDate, endDate, totalAmount, ... }
 * @returns {Promise<object>} The response data (e.g., { booking, clientSecret })
 */
const createBooking = async (bookingData) => {
  try {
    const response = await api.post('/bookings/create', bookingData);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Fetches all bookings for the currently logged-in user.
 * @returns {Promise<Array>} The array of booking objects
 */
const getMyBookings = async () => {
  try {
    const response = await api.get('/bookings/my-bookings');
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Verifies the OTP for a specific booking.
 * @param {string} bookingId
 * @param {string} otp
 * @returns {Promise<object>} The updated booking object
 */
const verifyOtp = async (bookingId, otp) => {
  try {
    const response = await api.post(`/bookings/verify-otp/${bookingId}`, { otp });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const bookingService = {
  createBooking,
  getMyBookings,
  verifyOtp,
};