import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

/**
 * A simple hook to access the AuthContext.
 * This provides `user`, `loading`, `isAuthenticated`, `login`, `logout`, and `register`.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};