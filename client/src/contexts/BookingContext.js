import React, { createContext, useContext, useState } from 'react';
import api from '../lib/axios';
import { useAuth } from './AuthContext'; 


const BookingContext = createContext();


export const useBooking = () => {
  return useContext(BookingContext);
};


export const BookingProvider = ({ children }) => {
  const { user } = useAuth();
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  

  
  const fetchMyBookings = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      
      const response = await api.get('/bookings/my-bookings');
      setMyBookings(response.data.data);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      setError(err.response?.data?.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  
  const createBooking = async (bookingData) => {
    setLoading(true);
    setError(null);
    try {
      
      
      const response = await api.post('/bookings/create', bookingData);
      
      return response.data.data; 
    } catch (err) {
      console.error("Failed to create booking:", err);
      setError(err.response?.data?.message || 'Booking failed');
      throw err; 
    } finally {
      setLoading(false);
    }
  };

  
  const verifyBookingOtp = async (bookingId, otp) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(`/bookings/verify-otp/${bookingId}`, { otp });
      
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