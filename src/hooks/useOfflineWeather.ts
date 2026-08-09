import { useState, useEffect } from 'react';
import { WeatherData, ForecastData } from '../types/weather';

interface CachedWeatherData {
  weather: WeatherData;
  forecast: ForecastData;
  timestamp: number;
  city: string;
}

const CACHE_KEY = 'weather_cache';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export const useOfflineWeather = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cachedData, setCachedData] = useState<CachedWeatherData[]>([]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load cached data on mount
    loadCachedData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadCachedData = () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const data = JSON.parse(cached);
        setCachedData(data);
      }
    } catch (error) {
      console.warn('Failed to load cached weather data:', error);
    }
  };

  const cacheWeatherData = (weather: WeatherData, forecast: ForecastData, city: string) => {
    try {
      const newCacheItem: CachedWeatherData = {
        weather,
        forecast,
        timestamp: Date.now(),
        city: city.toLowerCase()
      };

      const existingCache = [...cachedData];
      const existingIndex = existingCache.findIndex(item => item.city === city.toLowerCase());
      
      if (existingIndex >= 0) {
        existingCache[existingIndex] = newCacheItem;
      } else {
        existingCache.push(newCacheItem);
      }

      // Keep only last 5 cities to manage storage
      const limitedCache = existingCache.slice(-5);
      
      localStorage.setItem(CACHE_KEY, JSON.stringify(limitedCache));
      setCachedData(limitedCache);
    } catch (error) {
      console.warn('Failed to cache weather data:', error);
    }
  };

  const getCachedWeatherData = (city: string): CachedWeatherData | null => {
    const cached = cachedData.find(item => item.city === city.toLowerCase());
    
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      return cached;
    }
    
    return null;
  };

  const clearExpiredCache = () => {
    const now = Date.now();
    const validCache = cachedData.filter(item => (now - item.timestamp) < CACHE_DURATION);
    
    if (validCache.length !== cachedData.length) {
      localStorage.setItem(CACHE_KEY, JSON.stringify(validCache));
      setCachedData(validCache);
    }
  };

  return {
    isOnline,
    cacheWeatherData,
    getCachedWeatherData,
    clearExpiredCache,
    cachedCities: cachedData.map(item => item.city)
  };
};
