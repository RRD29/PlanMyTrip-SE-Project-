import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBooking } from '../../contexts/BookingContext';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/common/Button';

// A simple 6-digit OTP input
const OtpInput = ({ value, onChange, length = 6 }) => {
  const handleChange = (e) => {
    // Only allow numbers and limit length
    const val = e.target.value.replace(/\D/g, '').slice(0, length);
    onChange(val);
  };

  return (
    <input
      type="tel"
      value={value}
      onChange={handleChange}
      maxLength={length}
      className="w-full px-4 py-3 text-2xl tracking-[1em] text-center font-semibold bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="------"
      autoComplete="one-time-code"
    />
  );
};

const OtpVerification = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const { bookingId } = useParams(); // Get bookingId from URL: /booking/:bookingId/verify
  const navigate = useNavigate();
  const { user } = useAuth();
  const { verifyBookingOtp, loading } = useBooking();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP.');
      return;
    }

    try {
      const response = await verifyBookingOtp(bookingId, otp);
      
      if (response.status === 'Completed') {
        // Both parties have verified!
        setMessage('Success! Payment has been released to the guide.');
        setTimeout(() => navigate('/dashboard/my-bookings'), 3000);
      } else if (response.status === 'OTP Verified') {
        // This user/guide verified, waiting on the other.
        setMessage('OTP Verified! Waiting for the other party to confirm.');
        setTimeout(() => navigate('/dashboard/my-bookings'), 3000);
      }
      
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP. Please try again.');
    }
  };

  const roleText = user?.role === 'guide'
    ? "Enter the 6-digit code from the user to confirm the trip."
    : "Enter the 6-digit code from your guide to release payment.";

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-xl border border-gray-200">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Confirm Meet-up</h1>
          <p className="mt-2 text-gray-600">{roleText}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="otp" className="text-sm font-medium text-gray-700">
              Verification Code
            </label>
            <OtpInput value={otp} onChange={setOtp} />
          </div>
          
          <Button
            type="submit"
            loading={loading}
            disabled={loading || otp.length !== 6}
            className="w-full"
            size="lg"
          >
            {loading ? 'Verifying...' : 'Confirm & Complete'}
          </Button>

          {error && (
            <div className="text-center text-red-600 font-medium">
              {error}
            </div>
          )}
          {message && (
            <div className="text-center text-green-600 font-medium">
              {message}
            </div>
          )}
        </form>

        <p className="text-center text-sm text-gray-500">
          Having trouble?{' '}
          <button className="font-medium text-blue-600 hover:underline">
            Resend Code
          </button>
        </p>
      </div>
    </div>
  );
};

export default OtpVerification;