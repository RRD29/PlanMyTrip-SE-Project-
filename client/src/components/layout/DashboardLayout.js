import React from 'react';
// Import 'Link' here
import { NavLink, Outlet, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  UserIcon,
  CalendarIcon,
  MapPinIcon,
} from '../../assets/icons'; // Assuming you have these in assets/icons

// --- Helper Icon Components ---
const SidebarIcon = ({ icon: IconComponent }) => (
  <IconComponent className="h-6 w-6 mr-3 text-gray-400 group-hover:text-gray-300" />
);

const UserNav = () => (
  <>
    <DashboardNavLink to="/dashboard" icon={UserIcon}>My Dashboard</DashboardNavLink>
    <DashboardNavLink to="/dashboard/my-bookings" icon={CalendarIcon}>My Bookings</DashboardNavLink>
    <DashboardNavLink to="/dashboard/trip-planner" icon={MapPinIcon}>Trip Planner</DashboardNavLink>
  </>
);

const GuideNav = () => (
  <>
    <DashboardNavLink to="/dashboard-guide" icon={UserIcon}>My Dashboard</DashboardNavLink>
    <DashboardNavLink to="/dashboard-guide/booking-requests" icon={CalendarIcon}>Booking Requests</DashboardNavLink>
    <DashboardNavLink to="/dashboard-guide/my-availability" icon={MapPinIcon}>My Availability</DashboardNavLink>
  </>
);

const AdminNav = () => (
  <>
    <DashboardNavLink to="/dashboard-admin" icon={UserIcon}>Overview</DashboardNavLink>
    <DashboardNavLink to="/dashboard-admin/manage-users" icon={CalendarIcon}>Manage Users</DashboardNavLink>
    <DashboardNavLink to="/dashboard-admin/transactions" icon={MapPinIcon}>Escrow</DashboardNavLink>
  </>
);

// --- Reusable NavLink Component for the Sidebar ---
const DashboardNavLink = ({ to, children, icon }) => {
  const navClass = ({ isActive }) =>
    `flex items-center px-4 py-3 rounded-lg text-sm font-medium group ${
      isActive
        ? 'bg-gray-900 text-white'
        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`;

  return (
    <NavLink to={to} className={navClass} end>
      {icon && <SidebarIcon icon={icon} />}
      <span>{children}</span>
    </NavLink>
  );
};

// --- Main Layout Component ---
const DashboardLayout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or your PageLoader component
  }

  if (!user) {
    // This should be handled by ProtectedRoute, but as a fallback:
    return <Navigate to="/login" replace />;
  }

  // Render the correct sidebar based on user role
  const renderSidebarNavigation = () => {
    switch (user.role) {
      case 'user':
        return <UserNav />;
      case 'guide':
        return <GuideNav />;
      case 'admin':
        return <AdminNav />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* --- Sidebar --- */}
      <aside className="hidden md:flex md:flex-shrink-0">
        <div className="flex w-64 flex-col bg-gray-800">
          <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <span className="text-white text-xl font-bold">Dashboard</span>
            </div>
            <nav className="mt-5 flex-1 space-y-1 px-2">
              {renderSidebarNavigation()}
            </nav>
          </div>
          <div className="flex-shrink-0 flex bg-gray-900 p-4">
            <div className="flex items-center">
              <div>
                <img
                  className="inline-block h-9 w-9 rounded-full"
                  src="https://via.placeholder.com/150" // Placeholder, replace with user.avatar
                  alt="User Avatar"
                />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{user.fullName}</p>
                {/* --- THIS IS THE UPDATED LINK --- */}
                <Link
                  to={user.role === 'guide' ? '/dashboard-guide/profile' : '/dashboard/profile'}
                  className="text-xs font-medium text-gray-400 hover:text-gray-200"
                >
                  View profile
                </Link>
                {/* --- END OF UPDATE --- */}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* --- Main Content Area --- */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
              {/* The Outlet renders the specific dashboard page */}
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;