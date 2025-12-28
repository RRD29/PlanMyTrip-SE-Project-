import api from '../lib/axios';


const getMyProfile = async () => {
  try {
    const response = await api.get('/users/profile');
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};


const updateMyProfile = async (profileFormData) => {
  try {
    
    
    const response = await api.patch('/users/profile', profileFormData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};


const sendPhoneOTP = async (data) => {
  try {
    await api.post('/users/send-phone-otp', data);
  } catch (error) {
    throw error.response?.data || error;
  }
};


const verifyPhoneOTP = async (data) => {
  try {
    const response = await api.post('/users/verify-phone-otp', data);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};


export const userService = {
  getMyProfile,
  updateMyProfile, 
  sendPhoneOTP,
  verifyPhoneOTP,
  
  
};
