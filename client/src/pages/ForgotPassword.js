import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import { authService } from '../services/auth.service.js'; 
import authImage from '../assets/images/auth-background.jpg';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await authService.forgotPassword(email);
      setMessage(response.message || "If an account exists, a reset link has been sent.");
    } catch (err) {
      setError(err.message || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${authImage})` }}
    >
      <div className="absolute inset-0 bg-black/30" />

      <div className="relative w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-2xl border border-gray-200 m-4">
        <h2 className="text-3xl font-bold text-center text-gray-900">
          Forgot Password
        </h2>
        <p className="text-center text-gray-600">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && <p className="text-red-600 bg-red-100 p-3 rounded-md text-center">{error}</p>}
          {message && <p className="text-green-600 bg-green-100 p-3 rounded-md text-center">{message}</p>}

          {!message && ( 
            <>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
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

              <Button
                type="submit"
                size="lg"
                className="w-full"
                loading={loading}
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </>
          )}

          <p className="text-sm text-center text-gray-600">
            Remembered your password?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;