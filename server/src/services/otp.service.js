import crypto from 'crypto';


const otpStore = new Map();


export const generateOtp = () => {
  
  return crypto.randomInt(100000, 1000000).toString();
};


const storeOtp = (phoneNumber, otp) => {
  otpStore.set(phoneNumber, {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000 
  });
};


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


export const sendOTP = async (phoneNumber) => {
  try {
    const otp = generateOtp();
    storeOtp(phoneNumber, otp);
    
    console.log(`OTP sent to ${phoneNumber}: ${otp}`);
    return true;
  } catch (error) {
    console.error('Error sending OTP:', error);
    return false;
  }
};
