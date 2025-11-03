import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';


// --- Layout Components ---
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './utils/ProtectedRoute';

// --- Public Page Imports ---
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import GuideMarketplace from './pages/guide/GuideMarketplace';
import GuideProfile from './pages/guide/GuideProfile';
import SearchPlaces from './pages/SearchPlaces';
import NotFound from './pages/NotFound';
// --- ADD THESE IMPORTS ---
import ForgotPassword from './pages/ForgotPassword'; // Corrected
import ResetPassword from './pages/ResetPassword';   // Corrected

// --- Protected Page Imports (General) ---
import BookingPage from './pages/booking/BookingPage';
import OtpVerification from './pages/booking/OtpVerification';

// --- Protected Page Imports (User) ---
import UserDashboard from './pages/dashboard-user/UserDashboard';
import MyBookings from './pages/dashboard-user/MyBookings';
import TripPlanner from './pages/dashboard-user/TripPlanner';
import MakeATrip from './pages/dashboard-user/MakeATrip';
import UserProfile from './pages/dashboard-user/UserProfile';

// --- Protected Page Imports (Guide) ---
import GuideDashboard from './pages/dashboard-guide/GuideDashboard';
import BookingRequests from './pages/dashboard-guide/BookingRequests';
import MyAvailability from './pages/dashboard-guide/MyAvailability';

// --- Protected Page Imports (Admin) ---
import AdminDashboard from './pages/dashboard-admin/AdminDashboard';
import ManageUsers from './pages/dashboard-admin/ManageUsers';
import EscrowTransactions from './pages/dashboard-admin/EscrowTransactions';

/**
 * A layout for all public-facing pages (includes Navbar and Footer)
 */
const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Outlet /> {/* Renders the nested route's component */}
      </main>
      <Footer />
    </div>
  );
};

/**
 * A simple page for unauthorized access
 */
const Unauthorized = () => (
  <div className="text-center p-12">
    <h1 className="text-3xl font-bold text-red-600">Access Denied</h1>
    <p className="mt-2">You do not have permission to view this page.</p>
  </div>
);

function App() {
  return (
    <Routes>
      {/* --- Public Routes (with Navbar/Footer) --- */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/search-places" element={<SearchPlaces />} />
        <Route path="/guides" element={<GuideMarketplace />} />
        <Route path="/guide/:guideId" element={<GuideProfile />} />
      </Route>

      {/* --- Auth Routes (no Navbar/Footer) --- */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      {/* --- ADD THESE ROUTES --- */}
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      {/* --- END ADDITION --- */}
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* --- Protected Routes (Any Logged-in User) --- */}
      <Route element={<ProtectedRoute />}>
        <Route path="/booking/:bookingId" element={<BookingPage />} />
        <Route path="/booking/:bookingId/verify" element={<OtpVerification />} />
      </Route>

      {/* --- USER Dashboard Routes (Only accessible by users) --- */}
<Route element={<ProtectedRoute allowedRoles={['user']} />}>
  <Route element={<DashboardLayout />}>
    <Route path="/dashboard" element={<UserDashboard />} />
    <Route path="/dashboard/my-bookings" element={<MyBookings />} />
    <Route path="/dashboard/trip-planner" element={<TripPlanner />} />
    <Route path="/dashboard/make-a-trip" element={<MakeATrip />} />
    <Route path="/dashboard/profile" element={<UserProfile />} />
  </Route>
</Route>

// --- GUIDE Dashboard Routes (Only accessible by guides) ---
<Route element={<ProtectedRoute allowedRoles={['guide']} />}>
  <Route element={<DashboardLayout />}>
    <Route path="/dashboard-guide" element={<GuideDashboard />} />
    <Route path="/dashboard-guide/booking-requests" element={<BookingRequests />} />
    <Route path="/dashboard-guide/my-availability" element={<MyAvailability />} />
    <Route path="/dashboard-guide/profile" element={<UserProfile />} />
  </Route>
</Route>

      {/* --- ADMIN Dashboard Routes --- */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard-admin" element={<AdminDashboard />} />
          <Route path="/dashboard-admin/manage-users" element={<ManageUsers />} />
          <Route path="/dashboard-admin/transactions" element={<EscrowTransactions />} />
        </Route>
      </Route>

      {/* --- Not Found Route --- */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;