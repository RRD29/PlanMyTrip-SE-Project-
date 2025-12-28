import api from '../lib/axios';


const createBooking = async (bookingData) => {
  try {
    const response = await api.post('/bookings/create', bookingData);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};


const getMyBookings = async () => {
  try {
    const response = await api.get('/bookings/my-bookings');
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};


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