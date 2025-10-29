import React, { useEffect } from 'react';
import { useBooking } from '../../contexts/BookingContext';
import { PageLoader } from '../../components/common/Loaders';
import Button from '../../components/common/Button';
import { useNavigate } from 'react-router-dom';

// --- MOCK DATA ---
const MOCK_BOOKINGS = [
  { _id: 'b101', guide: 'Bob Johnson', destination: 'Paris City Tour', date: '2025-11-02', status: 'Paid/Escrowed', amount: 250 },
  { _id: 'b102', guide: 'David Lee', destination: 'Rome Food Tour', date: '2025-10-15', status: 'Completed', amount: 400 },
  { _id: 'b103', guide: 'Frank White', destination: 'Tokyo Day Trip', date: '2025-09-01', status: 'Completed', amount: 320 },
];
// -----------------

// Helper to get color for status badge
const getStatusColor = (status) => {
  switch (status) {
    case 'Pending Payment':
      return 'bg-yellow-100 text-yellow-800';
    case 'Paid/Escrowed':
      return 'bg-blue-100 text-blue-800';
    case 'Completed':
      return 'bg-green-100 text-green-800';
    case 'Cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// --- Single Booking Card (NAVIGATE IS CORRECT HERE) ---
const BookingCard = ({ booking }) => {
  const navigate = useNavigate();

  return (
    <li className="bg-white p-6 rounded-lg shadow border border-gray-200 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{booking.destination}</h3>
          <p className="text-sm text-gray-600">with {booking.guide}</p>
        </div>
        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
          {booking.status}
        </span>
      </div>
      
      <div className="flex justify-between items-end">
        <div>
          <p className="text-sm text-gray-500">Date: {new Date(booking.date).toLocaleDateString()}</p>
          <p className="text-lg font-bold text-gray-900">${booking.amount}</p>
        </div>
        <div className="space-x-2">
          {booking.status === 'Pending Payment' && (
            <Button variant="primary" onClick={() => navigate(`/booking/${booking._id}`)}>
              Complete Payment
            </Button>
          )}
          {booking.status === 'Paid/Escrowed' && (
            <Button variant="primary" onClick={() => navigate(`/booking/${booking._id}/verify`)}>
              Confirm Meet-up (Verify OTP)
            </Button>
          )}
          {booking.status === 'Completed' && (
            <Button variant="secondary" onClick={() => {/* Open Review Modal */}}>
              Leave a Review
            </Button>
          )}
        </div>
      </div>
    </li>
  );
};


const MyBookings = () => {
  // ADD THIS LINE HERE:
  const navigate = useNavigate(); 
  
  // const { myBookings, loading, error, fetchMyBookings } = useBooking();
  
  // // Fetch bookings on component mount
  // useEffect(() => {
  //   fetchMyBookings();
  // }, [fetchMyBookings]);
  
  // Mock data for now
  const loading = false;
  const error = null;
  const myBookings = MOCK_BOOKINGS;

  if (loading) {
    return <PageLoader text="Loading your bookings..." />;
  }

  if (error) {
   return <p className="text-red-500 text-center">Error: {error}</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
      
      {myBookings.length > 0 ? (
        <ul className="space-y-6">
          {myBookings.map((booking) => (
            <BookingCard key={booking._id} booking={booking} />
          ))}
        </ul>
      ) : (
        <div className="text-center py-10 px-6 bg-white rounded-lg shadow border">
          <h4 className="text-lg font-medium text-gray-700">No Bookings Found</h4>
          <p className="text-gray-500 mt-1">You haven't booked any trips yet.</p>
          {/* NAVIGATE IS NOW CORRECTLY DEFINED HERE */}
          <Button size="lg" className="mt-6" onClick={() => navigate('/dashboard/trip-planner')}>
            Plan Your First Trip
          </Button>
        </div>
      )}
    </div>
  );
};

export default MyBookings;