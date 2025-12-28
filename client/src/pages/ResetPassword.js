import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import { authService } from '../services/auth.service.js'; 
import { useAuth } from '../contexts/AuthContext'; 
import authImage from '../assets/images/auth-background.jpg';

const ResetPassword = () => {
  const { token } = useParams(); 
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  // const { login } = useAuth(); // We'll force reload instead

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) { // Add basic password validation
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.resetPassword(token, password);
      setMessage(response.message || "Password reset successfully! Redirecting...");

      // Automatically log the user in using the data from the response
      const { user, accessToken } = response.data;
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', accessToken);

      setTimeout(() => {
         window.location.href = '/dashboard'; 
      }, 2000);

    } catch (err) {
      setError(err.message || 'Failed to reset password. The link may be invalid or expired.');
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
          Set New Password
        </h2>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && <p className="text-red-600 bg-red-100 p-3 rounded-md text-center">{error}</p>}
          {message && <p className="text-green-600 bg-green-100 p-3 rounded-md text-center">{message}</p>}

          {!message && ( 
            <>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  New Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;