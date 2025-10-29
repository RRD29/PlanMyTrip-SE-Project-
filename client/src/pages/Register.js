import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/common/Button';
import authImage from '../assets/images/auth-background.jpg';

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // Default role
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  // Get both register and login functions from AuthContext
  const { register, login, loading: authLoading } = useAuth(); 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (!email || !password || !fullName) {
      setError('Please fill out all fields.');
      return;
    }

    try {
      // 1. REGISTER the user
      await register(email, password, fullName, role);

      // 2. LOG IN the user immediately to get the token and update AuthContext
      // This is crucial because registration doesn't return the token directly.
      await login(email, password); 

      setMessage('Registration successful! Redirecting to profile setup...');

      // 3. REDIRECT based on the selected role
      // Guides are sent to their profile edit page to ensure data is filled.
      const redirectPath = role === 'guide' ? '/dashboard-guide/profile' : '/dashboard'; 
      
      setTimeout(() => navigate(redirectPath, { replace: true }), 100);

    } catch (err) {
      const errorMessage = err.message || err.response?.data?.message || 'Failed to register. This email may already be in use.';
      setError(errorMessage);
    }
  };
  
  const loading = authLoading;

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center py-12"
      style={{ backgroundImage: `url(${authImage})` }}
    >
      <div className="absolute inset-0 bg-black/30" />
      
      <div className="relative w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-2xl border border-gray-200 m-4">
        <h2 className="text-3xl font-bold text-center text-gray-900">
          Join PlanMyTrip
        </h2>
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <p className="text-red-600 bg-red-100 p-3 rounded-md text-center">
              {error}
            </p>
          )}
          {message && (
            <p className="text-green-600 bg-green-100 p-3 rounded-md text-center">
              {message}
            </p>
          )}

          {/* Full Name Input */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Role Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700">I am a...</label>
            <div className="mt-2 flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={role === 'user'}
                  onChange={(e) => setRole(e.target.value)}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">Traveler</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="guide"
                  checked={role === 'guide'}
                  onChange={(e) => setRole(e.target.value)}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">Guide</span>
              </label>
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            loading={loading}
            disabled={loading || message}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
          
          <p className="text-sm text-center text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:underline"
            >
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;