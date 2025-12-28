import React, { useState } from 'react';
import useApi from '../../hooks/useApi';
import { PageLoader, SkeletonText } from '../../components/common/Loaders';
import Button from '../../components/common/Button';


const MOCK_BOOKINGS = [
  { _id: 'b1', user: 'Alice Smith', date: '2025-11-02', destination: 'Paris City Tour', status: 'Confirmed' },
  { _id: 'b2', user: 'Charlie Brown', date: '2025-11-05', destination: 'Louvre Museum Visit', status: 'Confirmed' },
  { _id: 'b3', user: 'Eve Davis', date: '2025-11-10', destination: 'Eiffel Tower Climb', status: 'Pending Payment' },
  { _id: 'b4', user: 'Grace Hall', date: '2025-11-12', destination: 'Food Tour', status: 'Pending Payment' },
];



const getStatusColor = (status) => {
  switch (status) {
    case 'Pending Payment':
      return 'bg-yellow-100 text-yellow-800';
    case 'Confirmed': 
      return 'bg-blue-100 text-blue-800';
    case 'Completed':
      return 'bg-green-100 text-green-800';
    case 'Cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const BookingRequests = () => {
  
  const [bookings, setBookings] = useState(MOCK_BOOKINGS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleApprove = (bookingId) => {
    
    
    console.log(`Approving ${bookingId}`);
  };

  const handleCancel = (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      console.log(`Cancelling ${bookingId}`);
      
      
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Manage Bookings</h1>
      
      <div className="bg-white shadow border border-gray-200 rounded-lg overflow-hidden">
        {error && <p className="text-red-500 p-4">Error fetching bookings: {error}</p>}
        
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trip Details</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="5"><PageLoader /></td></tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{booking.user}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.destination}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(booking.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {booking.status === 'Pending Payment' ? (
                      <>
                        <Button variant="primary" size="sm" onClick={() => handleApprove(booking._id)}>Chat</Button>
                        <Button variant="danger" size="sm" onClick={() => handleCancel(booking._id)}>Cancel</Button>
                      </>
                    ) : (
                      <Button variant="ghost" size="sm">Details</Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingRequests;