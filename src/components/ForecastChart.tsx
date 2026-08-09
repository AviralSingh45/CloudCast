import { useState } from 'react';
import { ForecastData, TemperatureUnit } from '../types/weather';
import { convertTemperature, getTemperatureSymbol } from '../utils/weatherUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar, Clock } from 'lucide-react';

interface ForecastChartProps {
  forecast: ForecastData;
  temperatureUnit: TemperatureUnit;
}

export const ForecastChart = ({ forecast, temperatureUnit }: ForecastChartProps) => {
  const [viewMode, setViewMode] = useState<'daily' | 'hourly'>('daily');
  const tempSymbol = getTemperatureSymbol(temperatureUnit);

  // Process forecast data for daily view
  const dailyForecast = forecast.list
    .filter((item, index) => index % 8 === 0) // Every 8th item (24 hours / 3 hours = 8)
    .slice(0, 5) // Next 5 days
    .map(item => {
      const date = new Date(item.dt * 1000);
      return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        temp: convertTemperature(item.main.temp, temperatureUnit),
        minTemp: convertTemperature(item.main.temp_min, temperatureUnit),
        maxTemp: convertTemperature(item.main.temp_max, temperatureUnit),
        description: item.weather[0].description,
        icon: item.weather[0].icon,
        humidity: item.main.humidity,
        windSpeed: item.wind.speed,
      };
    });

  // Process forecast data for hourly view (next 24 hours)
  const hourlyForecast = forecast.list
    .slice(0, 8) // Next 24 hours (8 items * 3 hours each)
    .map(item => {
      const date = new Date(item.dt * 1000);
      return {
        time: date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
        fullTime: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        temp: convertTemperature(item.main.temp, temperatureUnit),
        minTemp: convertTemperature(item.main.temp_min, temperatureUnit),
        maxTemp: convertTemperature(item.main.temp_max, temperatureUnit),
        description: item.weather[0].description,
        icon: item.weather[0].icon,
        humidity: item.main.humidity,
        windSpeed: item.wind.speed,
      };
    });

  const currentData = viewMode === 'daily' ? dailyForecast : hourlyForecast;
  const xAxisKey = viewMode === 'daily' ? 'day' : 'time';

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card/90 backdrop-blur-sm border border-white/20 rounded-lg p-3 shadow-lg">
          <p className="font-medium">
            {viewMode === 'daily' ? (
              `${data.day}, ${data.date}`
            ) : (
              `${data.fullTime || data.time}`
            )}
          </p>
          <p className="text-primary">
            Temperature: {data.temp}{tempSymbol}
          </p>
          <p className="text-muted-foreground text-sm">
            High: {data.maxTemp}{tempSymbol} • Low: {data.minTemp}{tempSymbol}
          </p>
          <p className="text-muted-foreground text-sm capitalize">
            {data.description}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-card/60 backdrop-blur-lg border border-white/10 shadow-weather">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {viewMode === 'daily' ? '5-Day' : '24-Hour'} Temperature Forecast
          </CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={() => setViewMode('daily')}
              variant={viewMode === 'daily' ? 'default' : 'outline'}
              size="sm"
              className={viewMode === 'daily' 
                ? 'bg-primary/90 hover:bg-primary' 
                : 'border-white/20 hover:bg-white/10'
              }
            >
              <Calendar className="h-4 w-4 mr-1" />
              Daily
            </Button>
            <Button
              onClick={() => setViewMode('hourly')}
              variant={viewMode === 'hourly' ? 'default' : 'outline'}
              size="sm"
              className={viewMode === 'hourly' 
                ? 'bg-primary/90 hover:bg-primary' 
                : 'border-white/20 hover:bg-white/10'
              }
            >
              <Clock className="h-4 w-4 mr-1" />
              Hourly
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Chart */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={currentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey={xAxisKey}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  label={{ 
                    value: `Temperature (${tempSymbol})`, 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle' }
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="temp" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Data Cards */}
          <div className={`grid gap-3 ${
            viewMode === 'daily' 
              ? 'grid-cols-2 md:grid-cols-5' 
              : 'grid-cols-2 md:grid-cols-4 lg:grid-cols-8'
          }`}>
            {currentData.map((item, index) => (
              <div 
                key={index}
                className="bg-background/30 rounded-lg p-3 text-center space-y-2"
              >
                <div className="font-medium text-sm">
                  {viewMode === 'daily' ? item.day : item.time}
                </div>
                {viewMode === 'daily' && (
                  <div className="text-xs text-muted-foreground">{item.date}</div>
                )}
                <img 
                  src={`https://openweathermap.org/img/wn/${item.icon}.png`}
                  alt={item.description}
                  className="w-8 h-8 mx-auto"
                />
                <div className="font-bold">{item.temp}{tempSymbol}</div>
                {viewMode === 'daily' && (
                  <div className="text-xs text-muted-foreground">
                    {item.maxTemp}° / {item.minTemp}°
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};