import { useState, useEffect, useCallback } from 'react';
import { WeatherData, ForecastData, TemperatureUnit, WeatherCondition } from '../types/weather';
import { weatherApi, getLocationFromBrowser } from '../services/weatherApi';
import { getWeatherCondition, getBackgroundClass, isDay } from '../utils/weatherUtils';
import { useOfflineWeather } from '../hooks/useOfflineWeather';
import { ApiKeyModal } from './ApiKeyModal';
import { SearchBar } from './SearchBar';
import { WeatherCard } from './WeatherCard';
import { ForecastChart } from './ForecastChart';
import { OptimizedHourlyForecast } from './OptimizedHourlyForecast';
import { CityDashboard } from './CityDashboard';
import { LocalTimeWidget } from './LocalTimeWidget';
import { PopularCities } from './PopularCities';
import { WeatherBackground } from './WeatherBackground';
import { OfflineIndicator } from './OfflineIndicator';
import { LoadingSpinner, SkeletonWeatherCard } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { ThemeToggle } from './ThemeToggle';
import { TemperatureToggle } from './TemperatureToggle';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { DynamicLogo } from './DynamicLogo';
import { User, LogOut, Sparkles, LayoutDashboard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export const WeatherApp = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [temperatureUnit, setTemperatureUnit] = useState<TemperatureUnit>('celsius');
  const [backgroundCondition, setBackgroundCondition] = useState<string>('bg-gradient-hero');
  const [weatherCondition, setWeatherCondition] = useState<WeatherCondition>('clear');
  const [isUsingCachedData, setIsUsingCachedData] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const { isOnline, cacheWeatherData, getCachedWeatherData, clearExpiredCache } = useOfflineWeather();

  // Auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Initialize app
  useEffect(() => {
    // Load saved temperature unit
    const savedUnit = localStorage.getItem('temperatureUnit') as TemperatureUnit;
    if (savedUnit) {
      setTemperatureUnit(savedUnit);
    }

    // Load last searched city or use geolocation
    const lastCity = localStorage.getItem('lastSearchedCity');
    if (lastCity) {
      searchWeather(lastCity);
    } else {
      handleLocationSearch();
    }
  }, []);

  // Update background based on weather conditions
  useEffect(() => {
    if (currentWeather) {
      const isDayTime = isDay(
        Date.now() / 1000,
        currentWeather.sys.sunrise,
        currentWeather.sys.sunset,
        currentWeather.timezone
      );
      
      const condition = getWeatherCondition(currentWeather.weather[0].main, isDayTime);
      const bgClass = getBackgroundClass(condition);
      setBackgroundCondition(bgClass);
      setWeatherCondition(condition);
    }
  }, [currentWeather]);

  const handleApiKeySet = (apiKey: string) => {
    weatherApi.setApiKey(apiKey);
    setShowApiKeyModal(false);
    setError(null);
    
    // Try to load weather for user's location
    handleLocationSearch();
    
    toast({
      title: "API Key Set",
      description: "Successfully connected to OpenWeatherMap.",
    });
  };

  const searchWeather = useCallback(async (city: string) => {
    setIsLoading(true);
    setError(null);
    setIsUsingCachedData(false);

    // Clear expired cache first
    clearExpiredCache();

    // Check for cached data if offline or as fallback
    if (!isOnline) {
      const cachedData = getCachedWeatherData(city);
      if (cachedData) {
        setCurrentWeather(cachedData.weather);
        setForecast(cachedData.forecast);
        setIsUsingCachedData(true);
        setLastUpdated(new Date(cachedData.timestamp).toLocaleString());
        setIsLoading(false);
        
        toast({
          title: "Offline Mode",
          description: `Showing cached weather for ${cachedData.weather.name}`,
        });
        return;
      } else {
        setError('No cached data available for this city while offline');
        setIsLoading(false);
        return;
      }
    }

    try {
      const [weatherData, forecastData] = await Promise.all([
        weatherApi.getCurrentWeather(city),
        weatherApi.getForecast(city)
      ]);

      setCurrentWeather(weatherData);
      setForecast(forecastData);
      setLastUpdated(new Date().toLocaleString());
      
      // Cache the data for offline use
      cacheWeatherData(weatherData, forecastData, city);
      
      // Save to history for authenticated users
      weatherApi.saveToHistory(weatherData);
      
      // Save last searched city
      localStorage.setItem('lastSearchedCity', city);
      
      toast({
        title: "Weather Updated",
        description: `Showing weather for ${weatherData.name}, ${weatherData.sys.country}`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch weather data';
      
      // Try to show cached data as fallback
      const cachedData = getCachedWeatherData(city);
      if (cachedData) {
        setCurrentWeather(cachedData.weather);
        setForecast(cachedData.forecast);
        setIsUsingCachedData(true);
        setLastUpdated(new Date(cachedData.timestamp).toLocaleString());
        
        toast({
          title: "Using Cached Data",
          description: `Network error. Showing cached weather for ${cachedData.weather.name}`,
          variant: "destructive",
        });
      } else {
        setError(errorMessage);
        setCurrentWeather(null);
        setForecast(null);
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [isOnline, getCachedWeatherData, cacheWeatherData, clearExpiredCache]);

  const handleLocationSearch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setIsUsingCachedData(false);

    if (!isOnline) {
      // Try to use last searched city from cache
      const lastCity = localStorage.getItem('lastSearchedCity');
      if (lastCity) {
        await searchWeather(lastCity);
        return;
      } else {
        setError('Location services require internet connection');
        setIsLoading(false);
        return;
      }
    }

    try {
      const location = await getLocationFromBrowser();
      const [weatherData, forecastData] = await Promise.all([
        weatherApi.getCurrentWeatherByCoords(location.latitude, location.longitude),
        weatherApi.getForecastByCoords(location.latitude, location.longitude)
      ]);

      setCurrentWeather(weatherData);
      setForecast(forecastData);
      setLastUpdated(new Date().toLocaleString());
      
      // Cache the data for offline use
      cacheWeatherData(weatherData, forecastData, weatherData.name);
      
      // Save the city name for future reference
      localStorage.setItem('lastSearchedCity', weatherData.name);
      
      toast({
        title: "Location Found",
        description: `Showing weather for your current location: ${weatherData.name}`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get location';
      setError(errorMessage);
      
      toast({
        title: "Location Error", 
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [isOnline, searchWeather, cacheWeatherData]);

  const handleRefresh = () => {
    if (currentWeather) {
      searchWeather(currentWeather.name);
    }
  };

  const handleTemperatureToggle = (unit: TemperatureUnit) => {
    setTemperatureUnit(unit);
    localStorage.setItem('temperatureUnit', unit);
  };

  const handleCityAdd = useCallback(async (city: string) => {
    await searchWeather(city);
  }, [searchWeather]);

  const handleRetry = () => {
    setError(null);
    const lastCity = localStorage.getItem('lastSearchedCity');
    if (lastCity) {
      searchWeather(lastCity);
    } else {
      handleLocationSearch();
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      toast({
        title: "Logout Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={`min-h-screen ${backgroundCondition} transition-all duration-1000 relative overflow-hidden`}>
      {/* Animated Weather Background */}
      <WeatherBackground condition={weatherCondition} />
      {/* Modern Navigation Bar */}
      <nav className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <DynamicLogo condition={weatherCondition} className="h-12 w-12" />
              <div className="absolute -inset-1 bg-gradient-primary rounded-full opacity-20 blur-sm"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">CloudCast</h1>
              <p className="text-sm text-muted-foreground font-medium">Modern Weather</p>
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex items-center space-x-3">
            {currentWeather && (
              <Link to="/summary">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Summary
                </Button>
              </Link>
            )}
            
            <TemperatureToggle 
              unit={temperatureUnit} 
              onToggle={handleTemperatureToggle} 
            />
            <ThemeToggle />
            
            {user ? (
              <>
                <Link to="/dashboard">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/10 border-white/20 text-foreground hover:bg-white/20"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="bg-white/10 border-white/20 text-foreground hover:bg-white/20"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/10 border-white/20 text-foreground hover:bg-white/20"
                >
                  <User className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content Container */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pb-12">
        {/* Hero Search Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Weather Made Beautiful
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience precise weather forecasts with our elegant, modern interface
            </p>
          </div>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <SearchBar 
              onSearch={searchWeather}
              onLocationSearch={handleLocationSearch}
              onRefresh={handleRefresh}
              isLoading={isLoading}
              currentCity={currentWeather?.name || ''}
            />
          </div>
        </div>

        {/* Status Indicators */}
        <OfflineIndicator 
          isOnline={isOnline}
          isUsingCachedData={isUsingCachedData}
          lastUpdated={lastUpdated}
        />

        {/* Popular Cities */}
        <div className="max-w-6xl mx-auto">
          <PopularCities 
            onCitySelect={searchWeather}
            isLoading={isLoading}
          />
        </div>

        {/* Multi-City Dashboard */}
        <div className="max-w-6xl mx-auto">
          <CityDashboard 
            currentWeather={currentWeather}
            temperatureUnit={temperatureUnit}
            onAddCity={handleCityAdd}
          />
        </div>

        {/* Local Time Widget */}
        {currentWeather && (
          <div className="max-w-md mx-auto">
            <LocalTimeWidget 
              cityName={currentWeather.name}
              timezoneOffset={currentWeather.timezone}
              country={currentWeather.sys.country}
            />
          </div>
        )}

        {/* Weather Content */}
        <div className="space-y-8">
          {error ? (
            <div className="max-w-2xl mx-auto">
              <ErrorMessage 
                message={error}
                onRetry={handleRetry}
                onShowApiKeyModal={() => setShowApiKeyModal(true)}
                showApiKeyButton={weatherApi.hasApiKey()}
              />
            </div>
          ) : isLoading ? (
            <div className="space-y-8">
              <div className="max-w-4xl mx-auto">
                <SkeletonWeatherCard />
              </div>
              <div className="max-w-6xl mx-auto">
                <LoadingSpinner message="Fetching beautiful weather data..." />
              </div>
            </div>
          ) : currentWeather && forecast ? (
            <div className="space-y-8">
              {/* Main Weather Card */}
              <div className="max-w-4xl mx-auto">
                <WeatherCard 
                  weather={currentWeather} 
                  temperatureUnit={temperatureUnit} 
                />
              </div>
              
              {/* Hourly Forecast */}
              <div className="max-w-6xl mx-auto">
                <OptimizedHourlyForecast 
                  forecast={forecast} 
                  temperatureUnit={temperatureUnit}
                />
              </div>
              
              {/* Forecast Chart */}
              <div className="max-w-6xl mx-auto">
                <ForecastChart 
                  forecast={forecast} 
                  temperatureUnit={temperatureUnit} 
                />
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto text-center py-20">
              <div className="modern-card p-12">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full mx-auto opacity-20"></div>
                  <h3 className="text-2xl font-semibold text-foreground">
                    Ready to explore?
                  </h3>
                  <p className="text-muted-foreground text-lg">
                    Search for any city or use your current location to get started
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* API Key Modal */}
      <ApiKeyModal 
        isOpen={showApiKeyModal} 
        onApiKeySet={handleApiKeySet} 
      />
    </div>
  );
};