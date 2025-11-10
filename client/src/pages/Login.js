import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Button from '../components/common/Button';
import authImage from '../assets/images/auth-background.jpg'; // Import auth image

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { login, loading } = useAuth(); // Removed 'user' as it's not needed here
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to dashboard or the page they were trying to access, based on role
  const getDefaultRedirect = (userRole) => {
    if (userRole === 'guide') return '/dashboard-guide';
    if (userRole === 'admin') return '/dashboard-admin';
    return '/dashboard';
  };
  
  // 'from' logic is now inside handleSubmit

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      // --- THIS IS THE UPDATED PART ---
      // 1. Wait for the login function to return the user
      const loggedInUser = await login(email, password);

      // 2. Determine the correct path *after* login
      const redirectPath = location.state?.from?.pathname || getDefaultRedirect(loggedInUser.role);

      // 3. Navigate to the correct path
      navigate(redirectPath, { replace: true });
      // --- END OF UPDATE ---
    } catch (err) {
      setError(err.message || 'Failed to log in. Please check your credentials.');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${authImage})` }}
    >
      <div className="absolute inset-0 bg-black/30" /> {/* Overlay */}

      <div className="relative w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-2xl border border-gray-200 m-4">
        <h2 className="text-3xl font-bold text-center text-gray-900">
          Welcome Back!
        </h2>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <p className="text-red-600 bg-red-100 p-3 rounded-md text-center">
              {error}
            </p>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* --- FORGOT PASSWORD LINK --- */}
          <div className="flex items-center justify-end">
            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-blue-600 hover:underline"
              >
                Forgot your password?
              </Link>
            </div>
          </div>
          {/* --- END OF ADDITION --- */}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            loading={loading}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </Button>

          <p className="text-sm text-center text-gray-600">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-medium text-blue-600 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;