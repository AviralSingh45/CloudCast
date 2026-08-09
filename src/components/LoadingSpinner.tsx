import { Loader2, Cloud, Sun, CloudRain } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner = ({ message = 'Loading weather data...' }: LoadingSpinnerProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
      {/* Animated Weather Icons */}
      <div className="relative">
        <div className="absolute inset-0 animate-ping">
          <Cloud className="h-16 w-16 text-primary/30" />
        </div>
        <div className="relative animate-bounce">
          <Sun className="h-16 w-16 text-primary" />
        </div>
      </div>

      {/* Loading Spinner */}
      <div className="flex items-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-lg font-medium text-foreground">{message}</p>
      </div>

      {/* Animated Dots */}
      <div className="flex space-x-2">
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
};

export const SkeletonWeatherCard = () => {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="bg-card/60 backdrop-blur-lg border border-white/10 rounded-lg p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column Skeleton */}
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="h-4 bg-muted/50 rounded w-48 animate-pulse"></div>
              <div className="h-4 bg-muted/50 rounded w-32 animate-pulse"></div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-muted/50 rounded-full animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-16 bg-muted/50 rounded w-32 animate-pulse"></div>
                <div className="h-4 bg-muted/50 rounded w-24 animate-pulse"></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="h-8 bg-muted/50 rounded w-24 animate-pulse"></div>
              <div className="h-4 bg-muted/50 rounded w-40 animate-pulse"></div>
            </div>
          </div>

          {/* Right Column Skeleton */}
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-background/30 rounded-lg p-4 space-y-2">
                <div className="h-4 bg-muted/50 rounded w-16 animate-pulse"></div>
                <div className="h-8 bg-muted/50 rounded w-12 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};