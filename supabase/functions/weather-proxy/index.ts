const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

// Simple in-memory cache
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function getCached(key: string) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: unknown) {
  cache.set(key, { data, timestamp: Date.now() });
  // Limit cache size
  if (cache.size > 100) {
    const oldest = cache.keys().next().value;
    if (oldest) cache.delete(oldest);
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('OPENWEATHERMAP_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Weather API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const endpoint = url.searchParams.get('endpoint'); // 'weather' or 'forecast'
    const city = url.searchParams.get('city');
    const lat = url.searchParams.get('lat');
    const lon = url.searchParams.get('lon');
    const lang = url.searchParams.get('lang') || 'en';

    if (!endpoint || !['weather', 'forecast'].includes(endpoint)) {
      return new Response(
        JSON.stringify({ error: 'Invalid endpoint. Use "weather" or "forecast".' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!city && (!lat || !lon)) {
      return new Response(
        JSON.stringify({ error: 'Provide either "city" or "lat" and "lon" parameters.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build cache key
    const cacheKey = `${endpoint}:${city || `${lat},${lon}`}:${lang}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return new Response(
        JSON.stringify(cached),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Cache': 'HIT' } }
      );
    }

    // Build OpenWeatherMap URL
    const owmUrl = new URL(`https://api.openweathermap.org/data/2.5/${endpoint}`);
    owmUrl.searchParams.set('appid', apiKey);
    owmUrl.searchParams.set('units', 'metric');
    owmUrl.searchParams.set('lang', lang);
    if (city) {
      owmUrl.searchParams.set('q', city);
    } else {
      owmUrl.searchParams.set('lat', lat!);
      owmUrl.searchParams.set('lon', lon!);
    }

    const response = await fetch(owmUrl.toString());
    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: data.message || 'Weather API error' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Cache the result
    setCache(cacheKey, data);

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Cache': 'MISS' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
