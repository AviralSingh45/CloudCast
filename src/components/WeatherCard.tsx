import { WeatherData, TemperatureUnit } from '../types/weather';
import { 
  convertTemperature, 
  getTemperatureSymbol, 
  formatTime, 
  formatLocalTime,
  getWeatherIconUrl,
  capitalizeWords 
} from '../utils/weatherUtils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Gauge, 
  Sunrise, 
  Sunset, 
  Clock,
  MapPin 
} from 'lucide-react';

interface WeatherCardProps {
  weather: WeatherData;
  temperatureUnit: TemperatureUnit;
}

export const WeatherCard = ({ weather, temperatureUnit }: WeatherCardProps) => {
  const tempSymbol = getTemperatureSymbol(temperatureUnit);
  const currentTemp = convertTemperature(weather.main.temp, temperatureUnit);
  const feelsLike = convertTemperature(weather.main.feels_like, temperatureUnit);
  const minTemp = convertTemperature(weather.main.temp_min, temperatureUnit);
  const maxTemp = convertTemperature(weather.main.temp_max, temperatureUnit);

  const sunriseTime = formatTime(weather.sys.sunrise, weather.timezone);
  const sunsetTime = formatTime(weather.sys.sunset, weather.timezone);
  const localTime = formatLocalTime(weather.timezone);

  const mainWeather = weather.weather[0];
  const weatherDescription = capitalizeWords(mainWeather.description);
  const iconUrl = getWeatherIconUrl(mainWeather.icon);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Main Weather Card */}
      <Card className="bg-card/60 backdrop-blur-lg border border-white/10 shadow-weather">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Main Info */}
            <div className="space-y-6">
              {/* Location and Time */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {weather.name}, {weather.sys.country}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Local time: {localTime}</span>
                </div>
              </div>

              {/* Main Temperature Display */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-4">
                  <img 
                    src={iconUrl} 
                    alt={weatherDescription}
                    className="w-20 h-20 drop-shadow-lg"
                  />
                  <div>
                    <div className="text-6xl font-bold text-foreground">
                      {currentTemp}{tempSymbol}
                    </div>
                    <div className="text-muted-foreground">
                      Feels like {feelsLike}{tempSymbol}
                    </div>
                  </div>
                </div>
              </div>

              {/* Weather Description */}
              <div className="space-y-2">
                <Badge variant="secondary" className="text-base px-4 py-2">
                  {weatherDescription}
                </Badge>
                <div className="text-muted-foreground text-sm">
                  High: {maxTemp}{tempSymbol} • Low: {minTemp}{tempSymbol}
                </div>
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="grid grid-cols-2 gap-4">
              {/* Humidity */}
              <div className="bg-background/30 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Droplets className="h-4 w-4" />
                  <span className="text-sm font-medium">Humidity</span>
                </div>
                <div className="text-2xl font-bold">{weather.main.humidity}%</div>
              </div>

              {/* Wind Speed */}
              <div className="bg-background/30 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Wind className="h-4 w-4" />
                  <span className="text-sm font-medium">Wind</span>
                </div>
                <div className="text-2xl font-bold">{weather.wind.speed} m/s</div>
              </div>

              {/* Pressure */}
              <div className="bg-background/30 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Gauge className="h-4 w-4" />
                  <span className="text-sm font-medium">Pressure</span>
                </div>
                <div className="text-2xl font-bold">{weather.main.pressure} hPa</div>
              </div>

              {/* Feels Like */}
              <div className="bg-background/30 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Thermometer className="h-4 w-4" />
                  <span className="text-sm font-medium">Feels Like</span>
                </div>
                <div className="text-2xl font-bold">{feelsLike}{tempSymbol}</div>
              </div>

              {/* Sunrise */}
              <div className="bg-background/30 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Sunrise className="h-4 w-4" />
                  <span className="text-sm font-medium">Sunrise</span>
                </div>
                <div className="text-lg font-bold">{sunriseTime}</div>
              </div>

              {/* Sunset */}
              <div className="bg-background/30 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Sunset className="h-4 w-4" />
                  <span className="text-sm font-medium">Sunset</span>
                </div>
                <div className="text-lg font-bold">{sunsetTime}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};