import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import useApi from '../../hooks/useApi'; 
import { PageLoader } from '../../components/common/Loaders';
import Button from '../../components/common/Button';
import { useNavigate, Link } from 'react-router-dom';


const MOCK_STATS = {
  upcomingTrips: 1,
  pendingPayments: 0,
  completedTrips: 3,
};
const MOCK_UPCOMING_TRIPS = [
  { _id: 'b1', guide: 'Bob Johnson', date: '2025-11-02', destination: 'Paris City Tour' },
];



const StatCard = ({ title, value, loading }) => (
  <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
    <p className="text-sm font-medium text-gray-500">{title}</p>
    {loading ? (
      <div className="h-8 w-16 mt-1 bg-gray-200 rounded animate-pulse" />
    ) : (
      <p className="text-3xl font-semibold text-gray-900">{value}</p>
    )}
  </div>
);

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  
  const loading = false;
  const error = null;
  const stats = MOCK_STATS;
  const upcomingTrips = MOCK_UPCOMING_TRIPS;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {user?.fullName}!
        </h1>
        <Button size="lg" onClick={() => navigate('/dashboard/trip-planner')}>
          Plan a New Trip
        </Button>
      </div>
      
      {}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Upcoming Trips"
          value={stats?.upcomingTrips}
          loading={loading}
        />
        <StatCard
          title="Completed Trips"
          value={stats?.completedTrips}
          loading={loading}
        />
        <StatCard
          title="Pending Payments"
          value={stats?.pendingPayments}
          loading={loading}
        />
      </div>

      {}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Your Next Adventure
        </h2>
        {loading ? (
          <PageLoader text="Loading trips..." />
        ) : (
          <ul className="divide-y divide-gray-200">
            {upcomingTrips.length > 0 ? upcomingTrips.map(trip => (
              <li key={trip._id} className="py-4 flex justify-between items-center">
                <div>
                  <p className="text-base font-medium text-gray-900">{trip.destination}</p>
                  <p className="text-sm text-gray-500">
                    With {trip.guide} on {new Date(trip.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/chat/${trip._id}`)}>
                    Chat
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => navigate(`/dashboard/my-bookings`)}>
                    View Details
                  </Button>
                </div>
              </li>
            )) : (
              <p className="text-gray-500">You have no upcoming trips. Time to plan one!</p>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;