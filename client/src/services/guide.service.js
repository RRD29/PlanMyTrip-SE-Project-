import api from '../lib/axios';


const getAllGuides = async (params = {}) => {
  try {
    const response = await api.get('/guides', { params });
    return response.data.data; 
  } catch (error) {
    throw error.response?.data || error;
  }
};


const getGuideById = async (guideId) => {
  try {
    const response = await api.get(`/guides/${guideId}`);
    return response.data.data; 
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const guideService = {
  getAllGuides,
  getGuideById,
};