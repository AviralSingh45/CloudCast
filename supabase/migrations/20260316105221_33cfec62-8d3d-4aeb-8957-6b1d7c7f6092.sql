
-- Weather history table for tracking searches and trends
CREATE TABLE public.weather_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  city TEXT NOT NULL,
  country TEXT,
  temperature NUMERIC,
  humidity INTEGER,
  wind_speed NUMERIC,
  weather_condition TEXT,
  weather_icon TEXT,
  pressure INTEGER,
  feels_like NUMERIC,
  searched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.weather_history ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (even anonymous for tracking)
CREATE POLICY "Users can insert their own history"
  ON public.weather_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own history"
  ON public.weather_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own history"
  ON public.weather_history FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Index for fast user queries
CREATE INDEX idx_weather_history_user_id ON public.weather_history(user_id);
CREATE INDEX idx_weather_history_searched_at ON public.weather_history(searched_at DESC);
