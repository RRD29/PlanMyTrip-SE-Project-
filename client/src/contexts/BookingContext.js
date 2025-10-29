import React, { createContext, useContext, useState } from 'react';
import api from '../lib/axios';
import { useAuth } from './AuthContext'; // To get the user token

// 1. Create the Context
const BookingContext = createContext();

// 2. Create a custom hook
export const useBooking = () => {
  return useContext(BookingContext);
};

// 3. Create the Provider
export const BookingProvider = ({ children }) => {
  const { user } = useAuth();
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- Booking Functions ---

  /**
   * Fetches all bookings for the currently logged-in user
   */
  const fetchMyBookings = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      // This API endpoint doesn't exist yet, but we'll build it
      const response = await api.get('/bookings/my-bookings');
      setMyBookings(response.data.data);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      setError(err.response?.data?.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Creates a new booking (Payment Intent)
   * @param {object} bookingData - { guideId, destination, startDate, endDate, totalAmount }
   */
  const createBooking = async (bookingData) => {
    setLoading(true);
    setError(null);
    try {
      // This will be the first step of the payment flow
      // The backend will create a booking and a payment intent
      const response = await api.post('/bookings/create', bookingData);
      // The response should include the booking details and the clientSecret for Stripe
      return response.data.data; // e.g., { booking, clientSecret }
    } catch (err) {
      console.error("Failed to create booking:", err);
      setError(err.response?.data?.message || 'Booking failed');
      throw err; // Re-throw to be handled by the component
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verifies the OTP for a specific booking
   * @param {string} bookingId
   * @param {string} otp
   */
  const verifyBookingOtp = async (bookingId, otp) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(`/bookings/verify-otp/${bookingId}`, { otp });
      // On success, update the status of the booking in our local state
      setMyBookings(prevBookings => 
        prevBookings.map(b => 
          b._id === bookingId ? { ...b, ...response.data.data } : b
        )
      );
      return response.data.data;
    } catch (err) {
      console.error("OTP verification failed:", err);
      setError(err.response?.data?.message || 'Invalid OTP');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    myBookings,
    loading,
    error,
    fetchMyBookings,
    createBooking,
    verifyBookingOtp,
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};