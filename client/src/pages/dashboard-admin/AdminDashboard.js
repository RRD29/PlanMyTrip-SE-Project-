import React from 'react';
import useApi from '../../hooks/useApi';
import { PageLoader, SkeletonText } from '../../components/common/Loaders';

// --- Icons (from your icon pack or defined inline) ---
const UserGroupIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 00-12 0m12 0a9.094 9.094 0 01-12 0m12 0v-2.67a4.5 4.5 0 00-4.5-4.5h-3a4.5 4.5 0 00-4.5 4.5v2.67M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const BanknotesIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.75C2.25 5.01 2.51 4.5 2.88 4.5A.75.75 0 013.75 6H3m12 0v.75a.75.75 0 00.75.75h.75m0 0v-.75a.75.75 0 00-.75-.75h-.75M15 6h.75a.75.75 0 00.75-.75V4.5a.75.75 0 00-.75-.75h-.75M3 12h18M3 15h18" />
  </svg>
);
const CalendarIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);
// ---------------------------------------------------

// Reusable Stat Card Component
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
    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full">
      {icon}
    </div>
  </div>
);

const AdminDashboard = () => {
  // Use MOCK data for now. Replace with real API call
  // const { data: stats, loading, error } = useApi('/admin/stats');
  const loading = false;
  const error = null;
  const stats = {
    totalUsers: 142,
    totalGuides: 35,
    totalBookings: 210,
    totalEscrowed: 4520.50,
  };

  if (error) {
    return <p className="text-red-500">Error fetching stats: {error}</p>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Admin Overview</h1>
      
      {/* --- Stat Cards Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers}
          loading={loading}
          icon={<UserGroupIcon className="w-6 h-6" />}
        />
        <StatCard
          title="Total Guides"
          value={stats?.totalGuides}
          loading={loading}
          icon={<UserGroupIcon className="w-6 h-6" />}
        />
        <StatCard
          title="Total Bookings"
          value={stats?.totalBookings}
          loading={loading}
          icon={<CalendarIcon className="w-6 h-6" />}
        />
        <StatCard
          title="Currently in Escrow"
          value={`$${stats?.totalEscrowed.toLocaleString()}`}
          loading={loading}
          icon={<BanknotesIcon className="w-6 h-6" />}
        />
      </div>

      {/* --- Recent Activity Section (Example) --- */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Recent Activity
        </h2>
        {loading ? (
          <PageLoader text="Loading activity..." />
        ) : (
          <ul className="divide-y divide-gray-200">
            <li className="py-3">New guide registered: 'John D.'</li>
            <li className="py-3">Booking #1024 completed. Payment released.</li>
            <li className="py-3">New user registered: 'Alice W.'</li>
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;