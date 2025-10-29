import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Assuming AuthContext is here
import Button from '../common/Button';

// --- Icons for Mobile Menu ---
const MenuIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
    />
  </svg>
);

const CloseIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// --- Main Navbar Component ---
const Navbar = () => {
  const { user, logout } = useAuth(); // Get user state and logout function
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Helper for NavLink active styling
  const navLinkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium ${
      isActive
        ? 'bg-gray-900 text-white'
        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`;
  
  const mobileNavLinkClass = ({ isActive }) =>
    `block px-3 py-2 rounded-md text-base font-medium ${
      isActive
        ? 'bg-gray-900 text-white'
        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`;

  return (
    <nav className="bg-gray-800 shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* --- Logo and Desktop Nav Links --- */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 text-white text-xl font-bold">
              PlanMyTrip ✈️
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <NavLink to="/" className={navLinkClass} end>
                  Home
                </NavLink>
                <NavLink to="/guides" className={navLinkClass}>
                  Find Guides
                </NavLink>
                {user && (
                  <NavLink to="/dashboard" className={navLinkClass}>
                    Dashboard
                  </NavLink>
                )}
              </div>
            </div>
          </div>

          {/* --- Desktop Auth Buttons --- */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {user ? (
                <>
                  <span className="text-gray-300 mr-4">Hi, {user.fullName}!</span>
                  <Button onClick={handleLogout} variant="secondary" size="sm">
                    Logout
                  </Button>
                </>
              ) : (
                <div className="space-x-2">
                  <Button
                    onClick={() => navigate('/login')}
                    variant="secondary"
                    size="sm"
                  >
                    Login
                  </Button>
                  <Button
                    onClick={() => navigate('/register')}
                    variant="primary"
                    size="sm"
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* --- Mobile Menu Button --- */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              type="button"
              className="inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <CloseIcon className="block h-6 w-6" />
              ) : (
                <MenuIcon className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* --- Mobile Menu Panel --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="space-y-1 px-2 pt-2 pb-3 sm:px-3">
            <NavLink to="/" className={mobileNavLinkClass} end>
              Home
            </NavLink>
            <NavLink to="/guides" className={mobileNavLinkClass}>
              Find Guides
            </NavLink>
            {user && (
              <NavLink to="/dashboard" className={mobileNavLinkClass}>
                Dashboard
              </NavLink>
            )}
          </div>
          <div className="border-t border-gray-700 pt-4 pb-3">
            {user ? (
              <div className="px-5">
                <div className="text-base font-medium leading-none text-white">
                  {user.fullName}
                </div>
                <div className="mt-1 text-sm font-medium leading-none text-gray-400">
                  {user.email}
                </div>
                <Button
                  onClick={handleLogout}
                  variant="secondary"
                  size="sm"
                  className="mt-4 w-full"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="space-y-2 px-2">
                <Button
                  onClick={() => navigate('/login')}
                  variant="secondary"
                  size="sm"
                  className="w-full"
                >
                  Login
                </Button>
                <Button
                  onClick={() => navigate('/register')}
                  variant="primary"
                  size="sm"
                  className="w-full"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;