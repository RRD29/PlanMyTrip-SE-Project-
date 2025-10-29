import React from 'react';
import useApi from '../../hooks/useApi';
import { useAuth } from '../../contexts/AuthContext';
import { PageLoader, SkeletonText } from '../../components/common/Loaders';
import { Link } from 'react-router-dom';

// --- Icons ---
const CurrencyDollarIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0l.879-.659M12 6V5.25A2.25 2.25 0 009.75 3h-3.75A2.25 2.25 0 003.75 5.25V6m0 0v2.25A2.25 2.25 0 006 10.5h12A2.25 2.25 0 0020.25 8.25V6m-3.75 0v2.25A2.25 2.25 0 0018 10.5h-3.75a2.25 2.25 0 00-2.25 2.25V18m-3.75-9.75h9.75" />
  </svg>
);
const CalendarDaysIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);
// ---------------

// Reusable Stat Card
const StatCard = ({ title, value, icon, loading }) => (
  <div className="bg-white p-6 rounded-lg shadow border border-gray-200 flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      {loading ? (
        <SkeletonText className="h-8 w-24 mt-1" />
      ) : (
        <p className="text-3xl font-semibold text-gray-900">{value}</p>
      )}
    </div>
    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-green-100 text-green-600 rounded-full">
      {icon}
    </div>
  </div>
);

// --- MOCK DATA ---
const MOCK_STATS = {
  pendingEarnings: 450.00,
  totalEarnings: 2150.00,
  upcomingTrips: 3,
  pendingRequests: 2,
};
const MOCK_UPCOMING_TRIPS = [
  { _id: 'b1', user: 'Alice Smith', date: '2025-11-02', destination: 'Paris City Tour' },
  { _id: 'b2', user: 'Charlie Brown', date: '2025-11-05', destination: 'Louvre Museum Visit' },
];
// -------------------

const GuideDashboard = () => {
  const { user } = useAuth();
  // const { data: stats, loading, error } = useApi('/guides/dashboard-stats'); // Real API call
  const loading = false;
  const error = null;
  const stats = MOCK_STATS;
  const upcomingTrips = MOCK_UPCOMING_TRIPS;

  if (error) {
    return <p className="text-red-500">Error fetching stats: {error}</p>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">
        Welcome back, {user?.fullName}!
      </h1>
      
      {/* --- Stat Cards Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Pending Earnings"
          value={`$${stats?.pendingEarnings.toFixed(2)}`}
          loading={loading}
          icon={<CurrencyDollarIcon className="w-6 h-6" />}
        />
        <StatCard
          title="Total Earnings"
          value={`$${stats?.totalEarnings.toFixed(2)}`}
          loading={loading}
          icon={<CurrencyDollarIcon className="w-6 h-6" />}
        />
        <StatCard
          title="Upcoming Trips"
          value={stats?.upcomingTrips}
          loading={loading}
          icon={<CalendarDaysIcon className="w-6 h-6" />}
        />
        <StatCard
          title="Pending Requests"
          value={stats?.pendingRequests}
          loading={loading}
          icon={<CalendarDaysIcon className="w-6 h-6" />}
        />
      </div>

      {/* --- Upcoming Trips Section --- */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Upcoming Confirmed Trips
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
                    With {trip.user} on {new Date(trip.date).toLocaleDateString()}
                  </p>
                </div>
                <Link to={`/chat/${trip._id}`} className="text-sm font-medium text-blue-600 hover:text-blue-800">
                  Chat
                </Link>
              </li>
            )) : (
              <p className="text-gray-500">No upcoming trips.</p>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default GuideDashboard;