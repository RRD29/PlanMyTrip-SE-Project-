import { useState, useEffect, useCallback } from 'react';
import api from '../lib/axios'; // Your central Axios instance

/**
 * A custom hook for making API requests.
 * @param {string | null} [initialUrl=null] - The API endpoint to call. If null, hook won't run initially.
 * @param {object} [initialOptions={}] - Optional request config (e.g., params).
 * @returns {{
 * data: any,
 * loading: boolean,
 * error: object | null,
 * request: (url: string, options?: object) => Promise<any>
 * }}
 */
const useApi = (initialUrl = null, initialOptions = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [url, setUrl] = useState(initialUrl);
  const [options, setOptions] = useState(initialOptions);

  // --- Main data fetching function ---
  const fetchData = useCallback(async () => {
    if (!url) return; // Don't run if no URL is set

    setLoading(true);
    setError(null);

    try {
      const res = await api.request({ url, ...options });
      setData(res.data.data); // Assuming your API wraps data in a 'data' property
      return res.data.data;
    } catch (err) {
      const apiError = err.response?.data?.message || err.message || 'An error occurred';
      setError(apiError);
      console.error("API Error:", apiError, err.response);
      throw err; // Re-throw for component-level handling
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  // --- Run hook on mount if initialUrl is provided ---
  useEffect(() => {
    if (initialUrl) {
      fetchData();
    }
    // We only want this to run when the component mounts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Manual request function ---
  // This allows components to trigger a request manually (e.g., on a button click)
  // or re-fetch data.
  const request = useCallback(
    async (manualUrl, manualOptions = {}) => {
      setUrl(manualUrl);
      setOptions(manualOptions);
      // Wait for state to update (using useEffect would be too slow)
      // We'll call fetchData directly with the new params
      setLoading(true);
      setError(null);
  
      try {
        const res = await api.request({ url: manualUrl, ...manualOptions });
        setData(res.data.data);
        return res.data.data;
      } catch (err) {
        const apiError = err.response?.data?.message || err.message || 'An error occurred';
        setError(apiError);
        console.error("API Error:", apiError, err.response);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [] // No dependencies, it's a stable function
  );

  return { data, loading, error, request };
};

export default useApi;

/*
// --- How to use this hook in a component (e.g., GuideMarketplace.js) ---

import React, { useEffect } from 'react';
import useApi from '../hooks/useApi';
import { PageLoader } from '../components/common/Loaders';

const GuideMarketplace = () => {
  // Pass the URL to fetch data as soon as the component mounts
  const { data: guides, loading, error } = useApi('/guides');

  if (loading) {
    return <PageLoader text="Finding guides..." />;
  }

  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  return (
    <div>
      {guides && guides.map(guide => (
        <div key={guide._id}>{guide.fullName}</div>
      ))}
    </div>
  );
}
*/