import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WeatherData } from '@/types/weather';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Sparkles, RefreshCw, MapPin, Clock } from 'lucide-react';
import { DynamicLogo } from '@/components/DynamicLogo';
import { getWeatherCondition, isDay } from '@/utils/weatherUtils';
import { toast } from '@/hooks/use-toast';

interface WeatherSummaryProps {
  weather?: WeatherData;
}

export default function WeatherSummary() {
  // Get weather data from localStorage or context (for demo purposes)
  const [weather, setWeather] = useState<WeatherData | null>(null);
  
  useEffect(() => {
    // Try to get current weather from localStorage
    const lastSearchedCity = localStorage.getItem('lastSearchedCity');
    if (lastSearchedCity) {
      // In a real app, you'd fetch this from your weather service
      // For now, we'll create a basic weather object for demo
      const demoWeather: WeatherData = {
        coord: { lon: 0, lat: 0 },
        weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
        base: 'stations',
        main: { temp: 25, feels_like: 25, temp_min: 20, temp_max: 30, pressure: 1013, humidity: 60 },
        visibility: 10000,
        wind: { speed: 3.5, deg: 180 },
        clouds: { all: 0 },
        dt: Date.now() / 1000,
        sys: { type: 1, id: 1, country: 'Demo', sunrise: Date.now() / 1000 - 3600, sunset: Date.now() / 1000 + 3600 },
        timezone: 0,
        id: 1,
        name: lastSearchedCity,
        cod: 200
      };
      setWeather(demoWeather);
    }
  }, []);
  const navigate = useNavigate();
  const [aiSummary, setAiSummary] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [clothingSuggestions, setClothingSuggestions] = useState<string[]>([]);
  const [activitySuggestions, setActivitySuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (weather) {
      generateAISummary();
    }
  }, [weather]);

  const generateAISummary = async () => {
    if (!weather) return;
    
    setIsGenerating(true);
    
    try {
      // Simulated AI summary generation (in a real app, this would call an AI API)
      const weatherCondition = weather.weather[0].main.toLowerCase();
      const temperature = Math.round(weather.main.temp);
      const humidity = weather.main.humidity;
      const windSpeed = weather.wind.speed;
      const cityName = weather.name;
      const country = weather.sys.country;
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate weather summary based on conditions
      let summary = `Today in ${cityName}, ${country}, `;
      
      switch (weatherCondition) {
        case 'clear':
          summary += `it's a beautiful clear day with bright sunshine. The temperature is ${temperature}°C with low humidity at ${humidity}%. `;
          if (windSpeed > 5) {
            summary += `There's a pleasant breeze at ${windSpeed} m/s. `;
          }
          summary += `Perfect weather for outdoor activities!`;
          setClothingSuggestions(['Light clothing', 'Sunglasses', 'Sunscreen', 'Hat']);
          setActivitySuggestions(['Outdoor picnic', 'Beach visit', 'Hiking', 'Sports activities']);
          break;
          
        case 'clouds':
          summary += `it's partly cloudy with overcast skies. The temperature is ${temperature}°C with ${humidity}% humidity. `;
          summary += `A comfortable day with mild conditions.`;
          setClothingSuggestions(['Light jacket', 'Comfortable shoes', 'Layers']);
          setActivitySuggestions(['City walking', 'Indoor activities', 'Photography']);
          break;
          
        case 'rain':
          summary += `it's rainy with precipitation expected throughout the day. Temperature is ${temperature}°C with high humidity at ${humidity}%. `;
          summary += `Stay dry and enjoy indoor activities.`;
          setClothingSuggestions(['Waterproof jacket', 'Umbrella', 'Rain boots', 'Quick-dry clothing']);
          setActivitySuggestions(['Indoor museums', 'Cozy café visits', 'Reading', 'Movie watching']);
          break;
          
        case 'snow':
          summary += `it's snowy with winter conditions. Temperature is ${temperature}°C with snow precipitation. `;
          summary += `Bundle up and enjoy the winter wonderland!`;
          setClothingSuggestions(['Heavy coat', 'Winter boots', 'Gloves', 'Warm hat', 'Scarf']);
          setActivitySuggestions(['Snow sports', 'Hot chocolate', 'Indoor activities', 'Winter photography']);
          break;
          
        case 'thunderstorm':
          summary += `there are thunderstorms in the area with ${temperature}°C temperature and ${humidity}% humidity. `;
          summary += `Stay indoors and safe during the storm.`;
          setClothingSuggestions(['Rain gear', 'Waterproof clothing', 'Sturdy shoes']);
          setActivitySuggestions(['Stay indoors', 'Read a book', 'Watch movies', 'Plan future trips']);
          break;
          
        default:
          summary += `the weather is ${weatherCondition} with ${temperature}°C temperature and ${humidity}% humidity. `;
          summary += `Check the current conditions before heading out.`;
          setClothingSuggestions(['Weather-appropriate clothing', 'Check forecast']);
          setActivitySuggestions(['Check weather updates', 'Plan accordingly']);
      }
      
      setAiSummary(summary);
      
      toast({
        title: "AI Summary Generated",
        description: "Weather insights and recommendations are ready!",
      });
      
    } catch (error) {
      console.error('Error generating AI summary:', error);
      setAiSummary('Unable to generate weather summary at this time. Please try again later.');
      
      toast({
        title: "Summary Generation Failed",
        description: "Could not generate AI weather summary.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!weather) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-6">
        <Card className="w-full max-w-2xl modern-card">
          <CardHeader className="text-center">
            <CardTitle>No Weather Data</CardTitle>
            <CardDescription>
              Please search for a city first to view the AI weather summary.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Search
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isDayTime = isDay(
    Date.now() / 1000,
    weather.sys.sunrise,
    weather.sys.sunset,
    weather.timezone
  );
  
  const weatherCondition = getWeatherCondition(weather.weather[0].main, isDayTime);

  return (
    <div className="min-h-screen bg-gradient-hero p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center space-x-3">
            <DynamicLogo condition={weatherCondition} className="h-10 w-10" />
            <h1 className="text-2xl font-bold gradient-text">AI Weather Summary</h1>
          </div>
          
          <Button 
            variant="outline" 
            onClick={generateAISummary}
            disabled={isGenerating}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
            Regenerate
          </Button>
        </div>

        {/* Current Weather Overview */}
        <Card className="modern-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>{weather.name}, {weather.sys.country}</span>
                </CardTitle>
                <CardDescription className="flex items-center space-x-2 mt-1">
                  <Clock className="w-4 h-4" />
                  <span>Local time: {new Date().toLocaleTimeString()}</span>
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{Math.round(weather.main.temp)}°C</div>
                <div className="text-muted-foreground capitalize">{weather.weather[0].description}</div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* AI Generated Summary */}
        <Card className="modern-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <span>AI Weather Insights</span>
            </CardTitle>
            <CardDescription>
              Intelligent weather summary and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isGenerating ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
                <div className="flex items-center space-x-2 mt-4">
                  <Sparkles className="w-4 h-4 animate-pulse text-purple-500" />
                  <span className="text-sm text-muted-foreground">Generating intelligent weather insights...</span>
                </div>
              </div>
            ) : (
              <div className="prose prose-invert max-w-none">
                <p className="text-foreground leading-relaxed">{aiSummary}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Clothing Suggestions */}
        <Card className="modern-card">
          <CardHeader>
            <CardTitle>👗 Clothing Recommendations</CardTitle>
            <CardDescription>What to wear for today's weather</CardDescription>
          </CardHeader>
          <CardContent>
            {isGenerating ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {clothingSuggestions.map((item, index) => (
                  <div 
                    key={index}
                    className="bg-secondary/20 rounded-lg p-3 text-center text-sm font-medium"
                  >
                    {item}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Suggestions */}
        <Card className="modern-card">
          <CardHeader>
            <CardTitle>🎯 Activity Recommendations</CardTitle>
            <CardDescription>Perfect activities for today's weather</CardDescription>
          </CardHeader>
          <CardContent>
            {isGenerating ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {activitySuggestions.map((activity, index) => (
                  <div 
                    key={index}
                    className="bg-primary/10 rounded-lg p-3 text-center text-sm font-medium border border-primary/20"
                  >
                    {activity}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}