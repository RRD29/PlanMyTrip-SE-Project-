// client/src/lib/axios.js

import axios from 'axios';

// Ensure the default URL is correct
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1';

/**
 * Create a pre-configured Axios instance.
 */
const api = axios.create({
  baseURL: API_BASE_URL, // This must be pointing to your server
  withCredentials: true, 
});

export default api;