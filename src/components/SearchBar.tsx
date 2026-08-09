import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, X, RefreshCw, Clock, History } from 'lucide-react';
import { VoiceSearch } from './VoiceSearch';

interface SearchBarProps {
  onSearch: (city: string) => void;
  onLocationSearch: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  currentCity: string;
}

// Extended list of cities for autocomplete
const allCities = [
  'Amsterdam', 'Athens', 'Atlanta', 'Auckland', 'Austin', 'Baghdad', 'Bangkok', 'Barcelona', 
  'Beijing', 'Berlin', 'Bogota', 'Boston', 'Brisbane', 'Brussels', 'Budapest', 'Buenos Aires',
  'Cairo', 'Calgary', 'Cape Town', 'Chicago', 'Copenhagen', 'Dallas', 'Delhi', 'Denver', 
  'Dubai', 'Dublin', 'Edinburgh', 'Frankfurt', 'Geneva', 'Hamburg', 'Helsinki', 'Hong Kong',
  'Houston', 'Istanbul', 'Jakarta', 'Johannesburg', 'Kiev', 'Kuala Lumpur', 'Las Vegas', 
  'Lima', 'Lisbon', 'London', 'Los Angeles', 'Madrid', 'Manchester', 'Manila', 'Melbourne',
  'Mexico City', 'Miami', 'Milan', 'Montreal', 'Moscow', 'Mumbai', 'Munich', 'Nairobi',
  'Naples', 'New York', 'Nice', 'Oslo', 'Ottawa', 'Paris', 'Philadelphia', 'Phoenix',
  'Prague', 'Riyadh', 'Rome', 'San Francisco', 'Santiago', 'Sao Paulo', 'Seattle', 
  'Seoul', 'Shanghai', 'Singapore', 'Stockholm', 'Sydney', 'Tel Aviv', 'Tokyo', 'Toronto',
  'Vancouver', 'Venice', 'Vienna', 'Warsaw', 'Washington', 'Zurich'
];

const popularCities = [
  'London', 'New York', 'Tokyo', 'Paris', 'Sydney', 
  'Dubai', 'Singapore', 'Los Angeles', 'Mumbai', 'Berlin'
];

export const SearchBar = ({ 
  onSearch, 
  onLocationSearch, 
  onRefresh, 
  isLoading, 
  currentCity 
}: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Load search history on component mount
  useEffect(() => {
    const saved = localStorage.getItem('weather-search-history');
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to parse search history:', error);
      }
    }
  }, []);

  // Save search history to localStorage
  const saveToHistory = (city: string) => {
    const newHistory = [city, ...searchHistory.filter(h => h.toLowerCase() !== city.toLowerCase())].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem('weather-search-history', JSON.stringify(newHistory));
  };

  // Filter cities based on search query
  const filteredCities = searchQuery.trim() 
    ? allCities.filter(city => 
        city.toLowerCase().startsWith(searchQuery.toLowerCase())
      ).sort()
    : [];

  // Handle clicks outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current && 
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const city = searchQuery.trim();
      onSearch(city);
      saveToHistory(city);
      setSearchQuery('');
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSuggestions(value.length > 0);
  };

  const handleInputFocus = () => {
    if (searchQuery.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleClearInput = () => {
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (city: string) => {
    onSearch(city);
    saveToHistory(city);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const handleHistoryClick = (city: string) => {
    onSearch(city);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('weather-search-history');
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Search History */}
      {searchHistory.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground/70 font-medium flex items-center gap-2">
              <History className="h-4 w-4" />
              Recent searches:
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearHistory}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </Button>
          </div>
          <div className="flex flex-wrap gap-1">
            {searchHistory.map((city, index) => (
              <Button
                key={`${city}-${index}`}
                variant="outline"
                size="sm"
                onClick={() => handleHistoryClick(city)}
                disabled={isLoading}
                className="text-xs bg-card/40 backdrop-blur-sm border-white/10 hover:bg-card/60 flex items-center gap-1"
              >
                <Clock className="h-3 w-3" />
                {city}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Main Search Bar */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search for a city..."
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              className="pl-10 pr-10 h-12 text-lg bg-card/80 backdrop-blur-sm border-white/20"
              disabled={isLoading}
              autoComplete="off"
            />
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearInput}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted/50 z-10"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <VoiceSearch
            onResult={onSearch}
            isDisabled={isLoading}
          />
          
          <Button 
            type="submit" 
            size="lg" 
            disabled={isLoading || !searchQuery.trim()}
            className="h-12 px-6"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {/* Autocomplete Suggestions */}
        {showSuggestions && filteredCities.length > 0 && (
          <div 
            ref={suggestionsRef}
            className="absolute top-full left-0 right-12 mt-1 bg-card/95 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
          >
            {filteredCities.slice(0, 8).map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => handleSuggestionClick(city)}
                className="w-full px-4 py-3 text-left hover:bg-accent/50 transition-colors border-b border-white/10 last:border-b-0 flex items-center gap-2"
                disabled={isLoading}
              >
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{city}</span>
              </button>
            ))}
          </div>
        )}
      </form>

      {/* Action Buttons */}
      <div className="flex gap-2 justify-center">
        <Button
          variant="secondary"
          onClick={onLocationSearch}
          disabled={isLoading}
          className="flex items-center gap-2 bg-card/60 backdrop-blur-sm border border-white/10 hover:bg-card/80"
        >
          <MapPin className="h-4 w-4" />
          Use My Location
        </Button>
        
        {currentCity && (
          <Button
            variant="secondary"
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 bg-card/60 backdrop-blur-sm border border-white/10 hover:bg-card/80"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        )}
      </div>

      {/* Popular Cities */}
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <span className="text-sm text-foreground/70 font-medium whitespace-nowrap">
          Quick search:
        </span>
        <div className="flex flex-wrap gap-1 justify-center">
          {popularCities.map((city) => (
            <Button
              key={city}
              variant="outline"
              size="sm"
              onClick={() => handleSuggestionClick(city)}
              disabled={isLoading}
              className="text-xs bg-card/40 backdrop-blur-sm border-white/10 hover:bg-card/60"
            >
              {city}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};