import { WeatherCondition, TemperatureUnit } from '../types/weather';

export const getWeatherCondition = (weatherMain: string, isDay: boolean): WeatherCondition => {
  const condition = weatherMain.toLowerCase();
  
  if (!isDay) return 'night';
  
  switch (condition) {
    case 'clear':
      return 'clear';
    case 'clouds':
      return 'clouds';
    case 'rain':
    case 'drizzle':
      return 'rain';
    case 'thunderstorm':
      return 'storm';
    case 'snow':
      return 'snow';
    case 'mist':
    case 'fog':
    case 'haze':
    case 'dust':
    case 'sand':
    case 'ash':
    case 'squall':
    case 'tornado':
      return 'mist';
    default:
      return 'clear';
  }
};

export const getBackgroundClass = (condition: WeatherCondition): string => {
  const baseClasses = 'min-h-screen transition-all duration-1000 ease-in-out';
  
  switch (condition) {
    case 'clear':
      return `${baseClasses} bg-gradient-clear`;
    case 'clouds':
      return `${baseClasses} bg-gradient-clouds`;
    case 'rain':
      return `${baseClasses} bg-gradient-rain`;
    case 'storm':
      return `${baseClasses} bg-gradient-storm`;
    case 'snow':
      return `${baseClasses} bg-gradient-snow`;
    case 'mist':
      return `${baseClasses} bg-gradient-mist`;
    case 'sunset':
      return `${baseClasses} bg-gradient-sunset`;
    case 'night':
      return `${baseClasses} bg-gradient-night`;
    default:
      return `${baseClasses} bg-gradient-clear`;
  }
};

export const convertTemperature = (temp: number, unit: TemperatureUnit): number => {
  if (unit === 'fahrenheit') {
    return Math.round((temp * 9/5) + 32);
  }
  return Math.round(temp);
};

export const getTemperatureSymbol = (unit: TemperatureUnit): string => {
  return unit === 'fahrenheit' ? '°F' : '°C';
};

export const formatTime = (timestamp: number, timezoneOffset: number): string => {
  const date = new Date((timestamp + timezoneOffset) * 1000);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    timeZone: 'UTC'
  });
};

export const formatLocalTime = (timezoneOffset: number): string => {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const localTime = new Date(utc + (timezoneOffset * 1000));
  
  return localTime.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true
  });
};

export const isDay = (currentTime: number, sunrise: number, sunset: number, timezoneOffset: number): boolean => {
  const localTime = currentTime + timezoneOffset;
  const localSunrise = sunrise + timezoneOffset;
  const localSunset = sunset + timezoneOffset;
  
  return localTime >= localSunrise && localTime <= localSunset;
};

export const getWeatherIconUrl = (icon: string): string => {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
};

export const capitalizeWords = (str: string): string => {
  return str.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};