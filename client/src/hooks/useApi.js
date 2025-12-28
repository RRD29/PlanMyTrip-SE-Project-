import { useState, useEffect, useCallback } from 'react';
import api from '../lib/axios'; 


const useApi = (initialUrl = null, initialOptions = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [url, setUrl] = useState(initialUrl);
  const [options, setOptions] = useState(initialOptions);

  
  const fetchData = useCallback(async () => {
    if (!url) return; 

    setLoading(true);
    setError(null);

    try {
      const res = await api.request({ url, ...options });
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
  }, [url, options]);

  
  useEffect(() => {
    if (initialUrl) {
      fetchData();
    }
    
    
  }, []);

  
  useEffect(() => {
    if (url) {
      fetchData();
    }
  }, [options, fetchData]);

  
  
  
  const request = useCallback(
    async (manualUrl, manualOptions = {}) => {
      setUrl(manualUrl);
      setOptions(manualOptions);
      
      
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
    [] 
  );

  return { data, loading, error, request };
};

export default useApi;

