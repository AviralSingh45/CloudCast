import { useState, useEffect } from 'react';
import { WeatherData, TemperatureUnit } from '../types/weather';
import { convertTemperature, getTemperatureSymbol, capitalizeWords } from '../utils/weatherUtils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, X, MapPin, Thermometer, Droplets, Wind } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CityData {
  weather: WeatherData;
  timestamp: number;
}

interface CityDashboardProps {
  currentWeather: WeatherData | null;
  temperatureUnit: TemperatureUnit;
  onAddCity: (city: string) => void;
}

export const CityDashboard = ({ currentWeather, temperatureUnit, onAddCity }: CityDashboardProps) => {
  const [savedCities, setSavedCities] = useState<CityData[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCityName, setNewCityName] = useState('');

  const tempSymbol = getTemperatureSymbol(temperatureUnit);

  useEffect(() => {
    loadCities();
  }, []);

  useEffect(() => {
    if (currentWeather) {
      updateCityInDashboard(currentWeather);
    }
  }, [currentWeather]);

  const loadCities = () => {
    try {
      const saved = localStorage.getItem('dashboardCities');
      if (saved) {
        const cities = JSON.parse(saved);
        setSavedCities(cities);
      }
    } catch (error) {
      console.error('Error loading saved cities:', error);
    }
  };

  const saveCities = (cities: CityData[]) => {
    try {
      localStorage.setItem('dashboardCities', JSON.stringify(cities));
      setSavedCities(cities);
    } catch (error) {
      console.error('Error saving cities:', error);
    }
  };

  const updateCityInDashboard = (weather: WeatherData) => {
    const cityExists = savedCities.find(city => 
      city.weather.name.toLowerCase() === weather.name.toLowerCase()
    );

    if (cityExists) {
      const updatedCities = savedCities.map(city =>
        city.weather.name.toLowerCase() === weather.name.toLowerCase()
          ? { weather, timestamp: Date.now() }
          : city
      );
      saveCities(updatedCities);
    }
  };

  const addCity = async () => {
    if (!newCityName.trim()) return;

    const cityExists = savedCities.find(city => 
      city.weather.name.toLowerCase() === newCityName.toLowerCase()
    );

    if (cityExists) {
      toast({
        title: "City Already Added",
        description: `${newCityName} is already in your dashboard.`,
        variant: "destructive",
      });
      return;
    }

    if (savedCities.length >= 8) {
      toast({
        title: "Dashboard Full",
        description: "You can only save up to 8 cities in your dashboard.",
        variant: "destructive",
      });
      return;
    }

    try {
      await onAddCity(newCityName);
      setNewCityName('');
      setShowAddForm(false);
      
      toast({
        title: "City Added",
        description: `${newCityName} has been added to your dashboard.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add city to dashboard.",
        variant: "destructive",
      });
    }
  };

  const removeCity = (cityName: string) => {
    const updatedCities = savedCities.filter(city => 
      city.weather.name.toLowerCase() !== cityName.toLowerCase()
    );
    saveCities(updatedCities);
    
    toast({
      title: "City Removed",
      description: `${cityName} has been removed from your dashboard.`,
    });
  };

  const addCurrentCityToDashboard = () => {
    if (!currentWeather) return;

    const cityExists = savedCities.find(city => 
      city.weather.name.toLowerCase() === currentWeather.name.toLowerCase()
    );

    if (cityExists) {
      toast({
        title: "City Already Added",
        description: `${currentWeather.name} is already in your dashboard.`,
        variant: "destructive",
      });
      return;
    }

    if (savedCities.length >= 8) {
      toast({
        title: "Dashboard Full",
        description: "You can only save up to 8 cities in your dashboard.",
        variant: "destructive",
      });
      return;
    }

    const newCities = [...savedCities, { weather: currentWeather, timestamp: Date.now() }];
    saveCities(newCities);
    
    toast({
      title: "City Added",
      description: `${currentWeather.name} has been added to your dashboard.`,
    });
  };

  if (savedCities.length === 0 && !showAddForm) {
    return (
      <Card className="bg-card/60 backdrop-blur-lg border border-white/10 shadow-card">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-primary rounded-full mx-auto opacity-20 flex items-center justify-center">
              <MapPin className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Multi-City Dashboard</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Save your favorite cities for quick weather access
              </p>
              <div className="flex gap-2 justify-center">
                {currentWeather && (
                  <Button 
                    onClick={addCurrentCityToDashboard}
                    size="sm"
                    className="bg-primary/90 hover:bg-primary"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add {currentWeather.name}
                  </Button>
                )}
                <Button 
                  onClick={() => setShowAddForm(true)}
                  variant="outline"
                  size="sm"
                  className="border-white/20 hover:bg-white/10"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add City
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/60 backdrop-blur-lg border border-white/10 shadow-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              My Cities
            </h3>
            <p className="text-sm text-muted-foreground">
              {savedCities.length}/8 cities saved
            </p>
          </div>
          <div className="flex gap-2">
            {currentWeather && !savedCities.find(city => 
              city.weather.name.toLowerCase() === currentWeather.name.toLowerCase()
            ) && savedCities.length < 8 && (
              <Button 
                onClick={addCurrentCityToDashboard}
                size="sm"
                className="bg-primary/90 hover:bg-primary"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Current
              </Button>
            )}
            {savedCities.length < 8 && (
              <Button 
                onClick={() => setShowAddForm(true)}
                variant="outline"
                size="sm"
                className="border-white/20 hover:bg-white/10"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {showAddForm && (
          <div className="mb-6 p-4 bg-background/20 rounded-lg border border-white/10">
            <div className="flex gap-2">
              <input
                type="text"
                value={newCityName}
                onChange={(e) => setNewCityName(e.target.value)}
                placeholder="Enter city name..."
                className="flex-1 px-3 py-2 bg-background/40 border border-white/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                onKeyPress={(e) => e.key === 'Enter' && addCity()}
              />
              <Button onClick={addCity} size="sm" className="bg-primary/90 hover:bg-primary">
                Add
              </Button>
              <Button 
                onClick={() => {
                  setShowAddForm(false);
                  setNewCityName('');
                }}
                variant="outline"
                size="sm"
                className="border-white/20 hover:bg-white/10"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {savedCities.map((cityData, index) => {
            const { weather } = cityData;
            const isStale = Date.now() - cityData.timestamp > 30 * 60 * 1000; // 30 minutes
            
            return (
              <div
                key={`${weather.name}-${index}`}
                className="bg-background/30 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:bg-background/40 transition-all duration-300 cursor-pointer group hover-lift"
                onClick={() => onAddCity(weather.name)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-sm">{weather.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {weather.sys.country}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {isStale && (
                      <Badge variant="secondary" className="text-xs px-1 py-0">
                        Old
                      </Badge>
                    )}
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeCity(weather.name);
                      }}
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <img 
                    src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}.png`}
                    alt={weather.weather[0].description}
                    className="w-10 h-10"
                  />
                  <div>
                    <div className="text-xl font-bold">
                      {convertTemperature(weather.main.temp, temperatureUnit)}{tempSymbol}
                    </div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {weather.weather[0].description}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <Thermometer className="h-3 w-3 text-muted-foreground" />
                    <span>{convertTemperature(weather.main.feels_like, temperatureUnit)}°</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Droplets className="h-3 w-3 text-muted-foreground" />
                    <span>{weather.main.humidity}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Wind className="h-3 w-3 text-muted-foreground" />
                    <span>{Math.round(weather.wind.speed)}m/s</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};