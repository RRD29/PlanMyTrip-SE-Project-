import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const SearchPlaces = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [images, setImages] = useState([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const inputRef = useRef(null);
  const debounceTimer = useRef(null);

  // Load search history from localStorage on component mount
  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    setSearchHistory(history);
  }, []);

  // Save search history to localStorage
  const saveToHistory = (searchTerm) => {
    const updatedHistory = [searchTerm, ...searchHistory.filter(item => item !== searchTerm)].slice(0, 5);
    setSearchHistory(updatedHistory);
    localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
  };

  // Fetch suggestions based on input
  const fetchSuggestions = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await axios.get(
        `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(searchTerm)}&limit=8&namespace=0&format=json&origin=*`
      );
      const [query, titles] = response.data;
      // Filter suggestions to only include places/tourist attractions (basic filtering)
      const placeSuggestions = titles.filter(title =>
        !title.includes('List of') &&
        !title.includes('Category:') &&
        !title.includes('Template:') &&
        !title.includes('Wikipedia:') &&
        !title.includes('Portal:') &&
        !title.includes('Help:') &&
        !title.includes('File:') &&
        title.length > 2
      ).slice(0, 5);
      setSuggestions(placeSuggestions);
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      setSuggestions([]);
    }
  };

  // Debounced suggestion fetching
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(query);
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query]);

  // Fetch images for a place
  const fetchImages = async (title) => {
    setImagesLoading(true);
    try {
      const response = await axios.get(
        `https://en.wikipedia.org/w/api.php?action=query&prop=images&titles=${encodeURIComponent(title)}&format=json&origin=*`
      );
      const pages = response.data.query.pages;
      const pageId = Object.keys(pages)[0];
      const imageTitles = pages[pageId].images || [];

      // Get image URLs for the first 6 images
      const imagePromises = imageTitles.slice(0, 6).map(async (img) => {
        try {
          const imgResponse = await axios.get(
            `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(img.title)}&prop=imageinfo&iiprop=url&format=json&origin=*`
          );
          const imgPages = imgResponse.data.query.pages;
          const imgPageId = Object.keys(imgPages)[0];
          return imgPages[imgPageId].imageinfo?.[0]?.url;
        } catch {
          return null;
        }
      });

      const imageUrls = (await Promise.all(imagePromises)).filter(url => url !== null);
      setImages(imageUrls);
    } catch (err) {
      console.error('Error fetching images:', err);
      setImages([]);
    } finally {
      setImagesLoading(false);
    }
  };

  // Fetch weather for a place
  const fetchWeather = async (placeName) => {
    setWeatherLoading(true);
    try {
      // First, geocode the place to get coordinates
      const geoResponse = await axios.get(
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(placeName)}&apiKey=${process.env.REACT_APP_GEOAPIFY_API_KEY}`
      );

      if (!geoResponse.data.features || geoResponse.data.features.length === 0) {
        console.error('Could not geocode place for weather');
        setWeather(null);
        return;
      }

      const [lng, lat] = geoResponse.data.features[0].geometry.coordinates;

      // Fetch weather data from OpenWeatherMap
      const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=bb9b1cc74b30047f0f6662a4725c19ef&units=metric`
      );

      setWeather({
        temperature: Math.round(weatherResponse.data.main.temp),
        precipitation: weatherResponse.data.rain ? weatherResponse.data.rain['1h'] || 0 : 0,
        description: weatherResponse.data.weather[0].description,
        icon: weatherResponse.data.weather[0].icon,
        location: weatherResponse.data.name
      });
    } catch (err) {
      console.error('Error fetching weather:', err);
      setWeather(null);
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError('');
    setResults([]);
    setShowSuggestions(false);
    setShowHistory(false);
    setImages([]);
    setWeather(null);

    saveToHistory(searchQuery);

    try {
      // Fetch summary for the exact query as title
      const summaryResponse = await axios.get(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchQuery.trim())}`
      );
      const summary = summaryResponse.data;

      // Check if it's a disambiguation page or not a standard article
      if (summary.type === 'disambiguation' || summary.type === 'no-extract') {
        setError('No exact match found. Please try a more specific search term.');
      } else {
        setResults([summary]);
        // Fetch images for the place
        fetchImages(searchQuery.trim());
        // Fetch weather for the place
        fetchWeather(searchQuery.trim());
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError('No article found with that exact title. Please check your spelling or try a different term.');
      } else {
        setError('Failed to fetch data from Wikipedia.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    handleSearch(suggestion);
  };

  const handleHistoryClick = (historyItem) => {
    setQuery(historyItem);
    setShowHistory(false);
    handleSearch(historyItem);
  };

  const deleteHistoryItem = (index) => {
    const updatedHistory = searchHistory.filter((_, i) => i !== index);
    setSearchHistory(updatedHistory);
    localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  const handleInputFocus = () => {
    if (query.trim() === '' && searchHistory.length > 0) {
      setShowHistory(true);
    } else if (query.trim() !== '' && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setShowHistory(value.trim() === '' && searchHistory.length > 0);
    setShowSuggestions(value.trim() !== '' && suggestions.length > 0);
  };



  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Search Places</h1>
      <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="max-w-md mx-auto mb-8 relative">
        <div className="flex">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder="Search for a city or tourist place..."
            className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Search History Dropdown */}
        {showHistory && searchHistory.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
            <div className="flex justify-between items-center px-4 py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Recent Searches</span>
              <button
                onClick={clearHistory}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Clear
              </button>
            </div>
            {searchHistory.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm group"
              >
                <span onClick={() => handleHistoryClick(item)} className="flex-grow">
                  {item}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteHistoryItem(index);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 ml-2 p-1"
                  title="Delete from history"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </form>

      {error && <p className="text-red-500 text-center">{error}</p>}

      <div className="max-w-4xl mx-auto">
        {results.map((place, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            {/* Multiple Images Grid */}
            {(images.length > 0 || imagesLoading) && (
              <div className="p-4 bg-gray-50">
                {imagesLoading ? (
                  <div className="text-center text-gray-500 py-8">Loading images...</div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((imageUrl, index) => (
                      <div key={index} className="aspect-square overflow-hidden rounded-lg bg-white shadow-sm">
                        <img
                          src={imageUrl}
                          alt={`${place.title} image ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Weather Section */}
            {(weather || weatherLoading) && (
              <div className="p-6 bg-blue-50 border-b border-blue-200">
                <h3 className="text-xl font-semibold mb-4 text-blue-800">Current Weather</h3>
                {weatherLoading ? (
                  <div className="text-center text-blue-600 py-4">Loading weather...</div>
                ) : weather ? (
                  <div className="flex items-center space-x-4">
                    <img
                      src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                      alt={weather.description}
                      className="w-16 h-16"
                    />
                    <div>
                      <p className="text-2xl font-bold text-blue-900">{weather.temperature}°C</p>
                      <p className="text-blue-700 capitalize">{weather.description}</p>
                      <p className="text-sm text-blue-600">Precipitation: {weather.precipitation} mm</p>
                      <p className="text-sm text-blue-600">Location: {weather.location}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-blue-600">Weather data not available</p>
                )}
              </div>
            )}

            {/* Place Info */}
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">{place.title}</h2>
              <p className="text-gray-700 mb-6 leading-relaxed">{place.extract}</p>
              <a
                href={place.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(place.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Read more on Wikipedia
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchPlaces;
