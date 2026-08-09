import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, TrendingUp } from 'lucide-react';

interface PopularCitiesProps {
  onCitySelect: (city: string) => void;
  isLoading: boolean;
}

const popularCities = [
  { name: 'New York', country: 'US', flag: '🇺🇸' },
  { name: 'London', country: 'GB', flag: '🇬🇧' },
  { name: 'Tokyo', country: 'JP', flag: '🇯🇵' },
  { name: 'Paris', country: 'FR', flag: '🇫🇷' },
  { name: 'Sydney', country: 'AU', flag: '🇦🇺' },
  { name: 'Singapore', country: 'SG', flag: '🇸🇬' },
  { name: 'Dubai', country: 'AE', flag: '🇦🇪' },
  { name: 'Berlin', country: 'DE', flag: '🇩🇪' },
  { name: 'Toronto', country: 'CA', flag: '🇨🇦' },
  { name: 'Mumbai', country: 'IN', flag: '🇮🇳' },
  { name: 'Seoul', country: 'KR', flag: '🇰🇷' },
  { name: 'Amsterdam', country: 'NL', flag: '🇳🇱' },
];

export const PopularCities = ({ onCitySelect, isLoading }: PopularCitiesProps) => {
  return (
    <Card className="bg-card/60 backdrop-blur-lg border border-white/10 shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Popular Cities
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {popularCities.map((city) => (
            <Button
              key={`${city.name}-${city.country}`}
              onClick={() => onCitySelect(city.name)}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="h-auto p-3 flex flex-col items-center gap-2 border-white/20 hover:bg-white/10 hover:border-primary/30 transition-all duration-300 hover-lift"
            >
              <div className="text-lg">{city.flag}</div>
              <div className="text-center">
                <div className="font-medium text-xs">{city.name}</div>
                <div className="text-xs text-muted-foreground">{city.country}</div>
              </div>
            </Button>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-muted-foreground text-center">
            Click any city to view its current weather conditions
          </p>
        </div>
      </CardContent>
    </Card>
  );
};