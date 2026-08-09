import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ForecastData, TemperatureUnit } from '@/types/weather';
import { convertTemperature, getTemperatureSymbol, getWeatherIconUrl } from '@/utils/weatherUtils';

interface OptimizedHourlyForecastProps {
  forecast: ForecastData;
  temperatureUnit: TemperatureUnit;
}

export const OptimizedHourlyForecast = memo(({ forecast, temperatureUnit }: OptimizedHourlyForecastProps) => {
  // Use 3-hour forecast data and show next 24 hours (8 data points)
  const next24Hours = forecast.list.slice(0, 8);

  const formatHour = (dt_txt: string): string => {
    const date = new Date(dt_txt);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric',
      hour12: true
    });
  };

  const formatDay = (dt_txt: string): string => {
    const date = new Date(dt_txt);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
  };

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <span>📊</span>
          3-Hour Forecast
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full">
          <div className="flex gap-4 pb-4">
            {next24Hours.map((item, index) => (
              <div 
                key={item.dt} 
                className="flex flex-col items-center min-w-[90px] p-3 rounded-lg bg-background/20 border border-border/50 backdrop-blur-sm hover:bg-background/30 transition-all duration-200"
              >
                <div className="text-xs font-medium text-muted-foreground mb-1">
                  {formatDay(item.dt_txt)}
                </div>
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  {formatHour(item.dt_txt)}
                </div>
                
                <img 
                  src={getWeatherIconUrl(item.weather[0].icon)} 
                  alt={item.weather[0].description}
                  className="w-8 h-8 mb-2"
                  loading="lazy"
                />
                
                <div className="text-lg font-bold text-foreground mb-1">
                  {convertTemperature(item.main.temp, temperatureUnit)}{getTemperatureSymbol(temperatureUnit)}
                </div>
                
                <div className="text-xs text-muted-foreground mb-1">
                  Feels {convertTemperature(item.main.feels_like, temperatureUnit)}{getTemperatureSymbol(temperatureUnit)}
                </div>
                
                {item.pop > 0 && (
                  <div className="text-xs text-blue-400 flex items-center gap-1">
                    <span>💧</span>
                    <span>{Math.round(item.pop * 100)}%</span>
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground mt-1">
                  {Math.round(item.wind.speed)} m/s
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
});

OptimizedHourlyForecast.displayName = 'OptimizedHourlyForecast';