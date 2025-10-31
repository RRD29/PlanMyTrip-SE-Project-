import crypto from 'crypto';

// In-memory store for OTPs (in production, use Redis or database)
const otpStore = new Map();

/**
 * Generates a random 6-digit numerical OTP.
 * @returns {string} A 6-digit OTP string.
 */
export const generateOtp = () => {
  // Generate a random number between 100000 and 999999
  return crypto.randomInt(100000, 1000000).toString();
};

/**
 * Stores OTP for a phone number with expiration.
 * @param {string} phoneNumber - The phone number.
 * @param {string} otp - The OTP to store.
 */
const storeOtp = (phoneNumber, otp) => {
  otpStore.set(phoneNumber, {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
  });
};

/**
 * Retrieves and validates OTP for a phone number.
 * @param {string} phoneNumber - The phone number.
 * @param {string} otp - The OTP to verify.
 * @returns {boolean} True if OTP is valid and not expired.
 */
export const verifyOtp = (phoneNumber, otp) => {
  const stored = otpStore.get(phoneNumber);
  if (!stored) return false;

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(phoneNumber);
    return false;
  }

  if (stored.otp === otp) {
    otpStore.delete(phoneNumber);
    return true;
  }

  return false;
};

/**
 * Sends OTP to the provided phone number.
 * For now, this is a mock implementation. In production, integrate with SMS service.
 * @param {string} phoneNumber - The phone number to send OTP to.
 * @returns {boolean} True if OTP was sent successfully, false otherwise.
 */
export const sendOTP = async (phoneNumber) => {
  try {
    const otp = generateOtp();
    storeOtp(phoneNumber, otp);
    // Mock implementation - in production, integrate with SMS service like Twilio
    console.log(`OTP sent to ${phoneNumber}: ${otp}`);
    return true;
  } catch (error) {
    console.error('Error sending OTP:', error);
    return false;
  }
};
