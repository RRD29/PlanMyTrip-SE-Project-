import crypto from 'crypto';

/**
 * Generates a random 6-digit numerical OTP.
 * @returns {string} A 6-digit OTP string.
 */
export const generateOtp = () => {
  // Generate a random number between 100000 and 999999
  return crypto.randomInt(100000, 1000000).toString();
};