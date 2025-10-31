import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/common/Button';
import heroImage from '../assets/images/hero-background.jpg';

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
const StarIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
  </svg>
);

// --- Animation variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

const Home = () => {
  const navigate = useNavigate();
  const [featuredGuides, setFeaturedGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock API call to fetch featured guides
  useEffect(() => {
    const fetchFeaturedGuides = async () => {
      try {
        // Simulate API call with mock data
        const mockData = [
          {
            id: 1,
            name: 'Maria Rodriguez',
            location: 'Barcelona, Spain',
            rating: 4.9,
            reviews: 127,
            specialties: ['Cultural Tours', 'Food & Wine'],
            image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=300&fit=crop&crop=face',
            description: 'Passionate local guide with 8 years of experience showing visitors the hidden gems of Barcelona.'
          },
          {
            id: 2,
            name: 'Ahmed Hassan',
            location: 'Cairo, Egypt',
            rating: 4.8,
            reviews: 89,
            specialties: ['Historical Sites', 'Desert Adventures'],
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&crop=face',
            description: 'Expert in Egyptian history and culture, offering authentic experiences in the land of pharaohs.'
          },
          {
            id: 3,
            name: 'Yuki Tanaka',
            location: 'Tokyo, Japan',
            rating: 5.0,
            reviews: 203,
            specialties: ['Modern Culture', 'Traditional Temples'],
            image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=300&fit=crop&crop=face',
            description: 'Native Tokyoite who blends traditional Japanese culture with contemporary experiences.'
          }
        ];

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setFeaturedGuides(mockData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load featured guides. Please try again later.');
        setLoading(false);
      }
    };

    fetchFeaturedGuides();
  }, []);

  return (
    <div className="bg-white">
      {/* --- Hero Section --- */}
      <motion.div
        className="relative h-[70vh] min-h-[500px] text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center p-4">
          <motion.h1
            className="text-4xl md:text-6xl font-bold leading-tight"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Your Adventure, Your Way
          </motion.h1>
          <motion.p
            className="mt-4 text-lg md:text-2xl max-w-2xl"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Connect with expert local guides and plan the trip of a lifetime.
          </motion.p>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <Button
              size="lg"
              className="mt-8 px-10 py-4 text-lg"
              onClick={() => navigate("/guides")}
            >
              Find Your Guide
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* --- How It Works Section --- */}
      <motion.section
        className="py-20 bg-gray-50"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.h2
            className="text-3xl font-bold text-center text-gray-900"
            variants={itemVariants}
          >
            How It Works
          </motion.h2>
          <motion.div
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-12 text-center"
            variants={containerVariants}
          >
            <motion.div
              className="flex flex-col items-center"
              variants={itemVariants}
            >
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
            </motion.div>

            <motion.div
              className="flex flex-col items-center"
              variants={itemVariants}
            >
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
            </motion.div>

            <motion.div
              className="flex flex-col items-center"
              variants={itemVariants}
            >
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
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* --- Featured Guides Section --- */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.h2
            className="text-3xl font-bold text-center text-gray-900 mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Featured Guides
          </motion.h2>

          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-red-600 text-lg">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="mt-4"
                variant="secondary"
              >
                Try Again
              </Button>
            </div>
          )}

          {!loading && !error && (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {featuredGuides.map((guide) => (
                <motion.div
                  key={guide.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <img
                    src={guide.image}
                    alt={guide.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {guide.name}
                    </h3>
                    <p className="text-gray-600 mb-3 flex items-center">
                      <MapPinIcon className="w-4 h-4 mr-1" />
                      {guide.location}
                    </p>
                    <div className="flex items-center mb-3">
                      <div className="flex items-center">
                        <StarIcon className="w-5 h-5 text-yellow-400 fill-current" />
                        <span className="ml-1 text-gray-900 font-medium">
                          {guide.rating}
                        </span>
                      </div>
                      <span className="ml-2 text-gray-600">
                        ({guide.reviews} reviews)
                      </span>
                    </div>
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {guide.specialties.map((specialty, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">
                      {guide.description}
                    </p>
                    <Button
                      onClick={() => navigate(`/guide/${guide.id}`)}
                      className="w-full"
                      size="sm"
                    >
                      View Profile
                    </Button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* --- Call to Action Section --- */}
      <motion.section
        className="py-20 bg-blue-600 text-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-6"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Ready to Start Your Journey?
          </motion.h2>
          <motion.p
            className="text-xl mb-8 text-blue-100"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Join thousands of travelers who have discovered amazing destinations with our expert guides.
          </motion.p>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <Button
              size="lg"
              className="px-10 py-4 text-lg bg-white text-blue-600 hover:bg-gray-100"
              onClick={() => navigate("/register")}
            >
              Get Started Today
            </Button>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default Home;
