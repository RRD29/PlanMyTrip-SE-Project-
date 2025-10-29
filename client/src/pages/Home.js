import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import heroImage from '../assets/images/hero-background.jpg'; // ✅ fixed path

// --- Icons ---
const MapPinIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);
const UserGroupIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 00-12 0m12 0a9.094 9.094 0 01-12 0m12 0v-2.67a4.5 4.5 0 00-4.5-4.5h-3a4.5 4.5 0 00-4.5 4.5v2.67M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const CheckBadgeIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
  </svg>
);
// ---------------------------------------------------

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white">
      {/* --- Hero Section --- */}
      <div className="relative h-[70vh] min-h-[500px] text-white">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center p-4">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Your Adventure, Your Way
          </h1>
          <p className="mt-4 text-lg md:text-2xl max-w-2xl">
            Connect with expert local guides and plan the trip of a lifetime.
          </p>
          <Button
            size="lg"
            className="mt-8 px-10 py-4 text-lg"
            onClick={() => navigate("/guides")}
          >
            Find Your Guide
          </Button>
        </div>
      </div>

      {/* --- How It Works Section --- */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900">
            How It Works
          </h2>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600">
                <MapPinIcon className="h-8 w-8" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">
                1. Plan Your Trip
              </h3>
              <p className="mt-2 text-gray-600">
                Use our planner to find destinations and search for the perfect
                local guide for your interests.
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600">
                <UserGroupIcon className="h-8 w-8" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">
                2. Book Securely
              </h3>
              <p className="mt-2 text-gray-600">
                Pay with our secure escrow system. Your money is held safely
                until your trip is confirmed.
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600">
                <CheckBadgeIcon className="h-8 w-8" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">
                3. Meet & Verify
              </h3>
              <p className="mt-2 text-gray-600">
                Meet your guide, exchange your unique OTPs, and start your
                unforgettable adventure!
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
