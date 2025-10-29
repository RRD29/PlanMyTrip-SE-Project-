import api from '../lib/axios';

/**
 * Fetches all guides, with optional filters.
 * @param {object} [params] - Optional query params (e.g., { location: 'Paris', search: 'art' })
 * @returns {Promise<Array>} The array of guide objects
 */
const getAllGuides = async (params = {}) => {
  try {
    const response = await api.get('/guides', { params });
    return response.data.data; // Return the array of guides
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Fetches a single guide by their ID.
 * @param {string} guideId
 * @returns {Promise<object>} The guide object
 */
const getGuideById = async (guideId) => {
  try {
    const response = await api.get(`/guides/${guideId}`);
    return response.data.data; // Return the single guide object
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const guideService = {
  getAllGuides,
  getGuideById,
};