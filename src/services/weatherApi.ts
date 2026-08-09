import { WeatherData, ForecastData, LocationData } from '../types/weather';
import { supabase } from '@/integrations/supabase/client';

const SUPABASE_PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const EDGE_FUNCTION_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/weather-proxy`;

// Fallback to direct API if edge function fails
const DIRECT_BASE_URL = 'https://api.openweathermap.org/data/2.5';

class WeatherApiService {
  private apiKey: string | null = null;

  constructor() {
    this.apiKey = localStorage.getItem('weatherApiKey');
  }

  setApiKey(key: string) {
    this.apiKey = key;
    localStorage.setItem('weatherApiKey', key);
  }

  getApiKey(): string | null {
    return this.apiKey;
  }

  hasApiKey(): boolean {
    // Either local key or edge function can work
    return true;
  }

  private async makeProxyRequest(endpoint: string, params: Record<string, string>): Promise<any> {
    try {
      const url = new URL(EDGE_FUNCTION_URL);
      url.searchParams.set('endpoint', endpoint);
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });

      const response = await fetch(url.toString(), {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Weather service error: ${response.statusText}`);
      }

      return response.json();
    } catch (err) {
      // Fallback to direct API if we have a local key
      if (this.apiKey) {
        return this.makeDirectRequest(`/${endpoint}`, params);
      }
      throw err;
    }
  }

  private async makeDirectRequest(endpoint: string, params: Record<string, string>): Promise<any> {
    if (!this.apiKey) {
      throw new Error('API key is required. Please set your OpenWeatherMap API key.');
    }

    const url = new URL(`${DIRECT_BASE_URL}${endpoint}`);
    url.searchParams.append('appid', this.apiKey);
    url.searchParams.append('units', 'metric');
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your OpenWeatherMap API key.');
      } else if (response.status === 404) {
        throw new Error('City not found. Please check the city name and try again.');
      } else {
        throw new Error(`Weather service error: ${response.statusText}`);
      }
    }

    return response.json();
  }

  async getCurrentWeather(city: string): Promise<WeatherData> {
    return this.makeProxyRequest('weather', { city });
  }

  async getCurrentWeatherByCoords(lat: number, lon: number): Promise<WeatherData> {
    return this.makeProxyRequest('weather', { 
      lat: lat.toString(), 
      lon: lon.toString() 
    });
  }

  async getForecast(city: string): Promise<ForecastData> {
    return this.makeProxyRequest('forecast', { city });
  }

  async getForecastByCoords(lat: number, lon: number): Promise<ForecastData> {
    return this.makeProxyRequest('forecast', { 
      lat: lat.toString(), 
      lon: lon.toString() 
    });
  }

  // Save weather search to history (for authenticated users)
  async saveToHistory(weather: WeatherData): Promise<void> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await supabase.from('weather_history').insert({
        user_id: session.user.id,
        city: weather.name,
        country: weather.sys.country,
        temperature: weather.main.temp,
        humidity: weather.main.humidity,
        wind_speed: weather.wind.speed,
        weather_condition: weather.weather[0].main,
        weather_icon: weather.weather[0].icon,
        pressure: weather.main.pressure,
        feels_like: weather.main.feels_like,
      });
    } catch (err) {
      console.error('Failed to save weather history:', err);
    }
  }
}

export const weatherApi = new WeatherApiService();

export const getLocationFromBrowser = (): Promise<LocationData> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error('Location access denied by user.'));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error('Location information is unavailable.'));
            break;
          case error.TIMEOUT:
            reject(new Error('Location request timed out.'));
            break;
          default:
            reject(new Error('An unknown error occurred while retrieving location.'));
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  });
};
