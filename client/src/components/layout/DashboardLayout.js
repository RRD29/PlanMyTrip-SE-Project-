import React from 'react';
import { NavLink, Outlet, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Corrected import path
import {
  UserIcon,
  CalendarIcon,
  MapPinIcon,
  HomeIcon,
  // CurrencyDollarIcon - Can be used if you want a dedicated Earnings link
} from '../../assets/icons';

// --- Helper Icon Components ---
const SidebarIcon = ({ icon: IconComponent, colorClass }) => (
  <IconComponent className={`h-6 w-6 mr-3 ${colorClass} group-hover:text-white`} />
);

// --- Navigation Definitions ---

// User Navigation (Standard Blue Theme)
const UserNav = () => (
  <>
    <DashboardNavLink to="/" icon={HomeIcon} color="blue">Home</DashboardNavLink>
    <DashboardNavLink to="/dashboard" icon={UserIcon} color="blue">My Dashboard</DashboardNavLink>
    <DashboardNavLink to="/dashboard/my-bookings" icon={CalendarIcon} color="blue">My Bookings</DashboardNavLink>
    <DashboardNavLink to="/dashboard/trip-planner" icon={MapPinIcon} color="blue">Trip Planner</DashboardNavLink>
    <DashboardNavLink to="/dashboard/make-a-trip" icon={MapPinIcon} color="blue">Make a Trip</DashboardNavLink>
    <DashboardNavLink to="/dashboard/explore-places" icon={MapPinIcon} color="blue">Explore Places</DashboardNavLink>
    {/* Users see "Find Guides" */}
    <DashboardNavLink to="/guides" icon={MapPinIcon} color="blue">Find Guides</DashboardNavLink>
  </>
);

// Guide Navigation (Earning/Service Focused - Green Theme)
const GuideNav = () => (
  <>
    <DashboardNavLink to="/" icon={HomeIcon} color="green">Home</DashboardNavLink>
    <DashboardNavLink to="/dashboard-guide" icon={UserIcon} color="green">My Earnings</DashboardNavLink>
    <DashboardNavLink to="/dashboard-guide/booking-requests" icon={CalendarIcon} color="green">Booking Requests</DashboardNavLink>
    <DashboardNavLink to="/dashboard-guide/my-availability" icon={MapPinIcon} color="green">Availability</DashboardNavLink>
    {/* --- REMOVED: Find Guides option for the guide --- */}
    {/* <DashboardNavLink to="/guides" icon={MapPinIcon} color="green">Find Guides</DashboardNavLink> */}
  </>
);

const AdminNav = () => (
  <>
    <DashboardNavLink to="/" icon={HomeIcon} color="red">Home</DashboardNavLink>
    <DashboardNavLink to="/dashboard-admin" icon={UserIcon} color="red">Overview</DashboardNavLink>
    <DashboardNavLink to="/dashboard-admin/manage-users" icon={CalendarIcon} color="red">Manage Users</DashboardNavLink>
    <DashboardNavLink to="/dashboard-admin/transactions" icon={MapPinIcon} color="red">Escrow</DashboardNavLink>
  </>
);

// --- Reusable NavLink Component for the Sidebar ---
const DashboardNavLink = ({ to, children, icon, color }) => {
  const baseClasses = 'flex items-center px-4 py-3 rounded-lg text-sm font-medium group';

  // Define theme colors based on the 'color' prop (derived from role)
  const roleColor = {
    blue: { // User theme
      sidebarBg: 'bg-blue-600',
      sidebarHoverBg: 'hover:bg-blue-700',
      text: 'text-blue-100', // Lighter text for inactive
      icon: 'text-blue-300', // Slightly different icon color
      activeText: 'text-white' // Active link text
    },
    green: { // Guide theme
      sidebarBg: 'bg-green-600',
      sidebarHoverBg: 'hover:bg-green-700',
      text: 'text-green-100',
      icon: 'text-green-300',
      activeText: 'text-white'
    },
    red: { // Admin theme
        sidebarBg: 'bg-red-600',
        sidebarHoverBg: 'hover:bg-red-700',
        text: 'text-red-100',
        icon: 'text-red-300',
        activeText: 'text-white'
    }
  }[color];

  const navClass = ({ isActive }) =>
    `${baseClasses} ${
      isActive
        ? `${roleColor.sidebarBg} ${roleColor.activeText}` // Active state
        : `${roleColor.text} ${roleColor.sidebarHoverBg} hover:text-white` // Inactive state
    }`;

  // Determine icon color based on active state
  const getIconColorClass = (isActive) => isActive ? roleColor.activeText : roleColor.icon;

  return (
    <NavLink to={to} className={navClass} end>
      {({ isActive }) => ( // Use render prop to get isActive state
        <>
          {icon && <SidebarIcon icon={icon} colorClass={getIconColorClass(isActive)} />}
          <span>{children}</span>
        </>
      )}
    </NavLink>
  );
};

// --- Main Layout Component ---
const DashboardLayout = () => {
  const { user, loading } = useAuth();

  // Determine theme based on user role for overall layout styling
  const theme = user?.role === 'guide' ? 'green'
              : user?.role === 'admin' ? 'red'
              : 'blue'; // Default to blue for user

  const sidebarBg = {
    blue: 'bg-gray-800',
    green: 'bg-green-800',
    red: 'bg-red-800',
  }[theme];

  const sidebarFooterBg = {
    blue: 'bg-gray-900',
    green: 'bg-green-900',
    red: 'bg-red-900',
  }[theme];

  const mainBg = {
    blue: 'bg-gray-100',
    green: 'bg-green-50',
    red: 'bg-red-50',
  }[theme];

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
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
    <div className={`flex h-screen ${mainBg}`}>
      {/* --- Sidebar --- */}
      <aside className="hidden md:flex md:flex-shrink-0">
        <div className={`flex w-64 flex-col ${sidebarBg}`}>
          <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <span className="text-white text-xl font-bold">
                {user.role === 'guide' ? 'Guide Portal'
                 : user.role === 'admin' ? 'Admin Panel'
                 : 'User Dashboard'}
              </span>
            </div>
            <nav className="mt-5 flex-1 space-y-1 px-2">
              {renderSidebarNavigation()}
            </nav>
          </div>
          <div className={`flex-shrink-0 flex ${sidebarFooterBg} p-4`}>
            <div className="flex items-center">
              <div>
                <img
                  className="inline-block h-9 w-9 rounded-full"
                  src={user.avatar || "https://via.placeholder.com/150"}
                  alt="User Avatar"
                />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{user.fullName}</p>
                <Link
                  to={user.role === 'guide' ? '/dashboard-guide/profile'
                      : user.role === 'admin' ? '/dashboard-admin/settings' // Example for admin
                      : '/dashboard/profile'}
                  className="text-xs font-medium text-gray-400 hover:text-gray-200"
                >
                  View profile
                </Link>
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