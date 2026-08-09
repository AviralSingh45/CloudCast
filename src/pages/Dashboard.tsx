import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Trash2, MapPin, Thermometer, History, Settings, Loader2 } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

interface WeatherHistoryEntry {
  id: string;
  city: string;
  country: string | null;
  temperature: number | null;
  humidity: number | null;
  wind_speed: number | null;
  weather_condition: string | null;
  searched_at: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [favoriteCities, setFavoriteCities] = useState<string[]>([]);
  const [weatherHistory, setWeatherHistory] = useState<WeatherHistoryEntry[]>([]);
  const [newCity, setNewCity] = useState('');
  const [tempUnit, setTempUnit] = useState('celsius');
  const [themePreference, setThemePreference] = useState('system');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session) {
          navigate('/auth');
        } else {
          setUser(session.user);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/auth');
      } else {
        setUser(session.user);
        loadUserData(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadUserData = async (userId: string) => {
    setIsLoading(true);
    try {
      // Load preferences
      const { data: prefs } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (prefs) {
        setFavoriteCities(prefs.favorite_cities || []);
        setTempUnit(prefs.temperature_unit || 'celsius');
        setThemePreference(prefs.theme_preference || 'system');
      }

      // Load weather history (last 20)
      const { data: history } = await supabase
        .from('weather_history')
        .select('*')
        .eq('user_id', userId)
        .order('searched_at', { ascending: false })
        .limit(20);

      if (history) {
        setWeatherHistory(history as WeatherHistoryEntry[]);
      }
    } catch (err) {
      console.error('Failed to load user data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const addFavoriteCity = async () => {
    if (!newCity.trim() || !user) return;
    const city = newCity.trim();
    if (favoriteCities.includes(city)) {
      toast({ title: "Already added", description: `${city} is already in your favorites.` });
      return;
    }
    const updated = [...favoriteCities, city];
    const { error } = await supabase
      .from('user_preferences')
      .update({ favorite_cities: updated })
      .eq('user_id', user.id);
    if (!error) {
      setFavoriteCities(updated);
      setNewCity('');
      toast({ title: "City Added", description: `${city} added to favorites.` });
    }
  };

  const removeFavoriteCity = async (city: string) => {
    if (!user) return;
    const updated = favoriteCities.filter(c => c !== city);
    const { error } = await supabase
      .from('user_preferences')
      .update({ favorite_cities: updated })
      .eq('user_id', user.id);
    if (!error) {
      setFavoriteCities(updated);
      toast({ title: "City Removed", description: `${city} removed from favorites.` });
    }
  };

  const updatePreference = async (key: string, value: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('user_preferences')
      .update({ [key]: value })
      .eq('user_id', user.id);
    if (!error) {
      if (key === 'temperature_unit') {
        setTempUnit(value);
        localStorage.setItem('temperatureUnit', value);
      }
      if (key === 'theme_preference') setThemePreference(value);
      toast({ title: "Preference Updated" });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/')} className="text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Weather
          </Button>
          <h1 className="text-2xl font-bold gradient-text">Dashboard</h1>
        </div>

        {/* Preferences */}
        <Card className="modern-card backdrop-blur-md bg-card/80 border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" /> Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Temperature Unit</p>
                <div className="flex gap-2">
                  <Button size="sm" variant={tempUnit === 'celsius' ? 'default' : 'outline'} onClick={() => updatePreference('temperature_unit', 'celsius')}>°C</Button>
                  <Button size="sm" variant={tempUnit === 'fahrenheit' ? 'default' : 'outline'} onClick={() => updatePreference('temperature_unit', 'fahrenheit')}>°F</Button>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Theme</p>
                <div className="flex gap-2">
                  {['light', 'dark', 'system'].map(t => (
                    <Button key={t} size="sm" variant={themePreference === t ? 'default' : 'outline'} onClick={() => updatePreference('theme_preference', t)} className="capitalize">{t}</Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Favorite Cities */}
        <Card className="modern-card backdrop-blur-md bg-card/80 border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" /> Favorite Cities</CardTitle>
            <CardDescription>Quick access to your saved cities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input placeholder="Add a city..." value={newCity} onChange={(e) => setNewCity(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addFavoriteCity()} />
              <Button onClick={addFavoriteCity}><Plus className="h-4 w-4" /></Button>
            </div>
            {favoriteCities.length === 0 ? (
              <p className="text-sm text-muted-foreground">No favorite cities yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {favoriteCities.map((city) => (
                  <div key={city} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-white/10">
                    <button onClick={() => navigate(`/?city=${encodeURIComponent(city)}`)} className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
                      <MapPin className="h-4 w-4" />
                      {city}
                    </button>
                    <Button size="sm" variant="ghost" onClick={() => removeFavoriteCity(city)} className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weather History */}
        <Card className="modern-card backdrop-blur-md bg-card/80 border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><History className="h-5 w-5" /> Recent Searches</CardTitle>
          </CardHeader>
          <CardContent>
            {weatherHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground">No search history yet. Search for weather to start tracking.</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {weatherHistory.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-white/10">
                    <div className="flex items-center gap-3">
                      <Thermometer className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{entry.city}{entry.country ? `, ${entry.country}` : ''}</p>
                        <p className="text-xs text-muted-foreground">
                          {entry.temperature !== null ? `${Math.round(entry.temperature)}°C` : ''} · {entry.weather_condition || ''} · {new Date(entry.searched_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => navigate(`/?city=${encodeURIComponent(entry.city)}`)}>
                      View
                    </Button>
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
