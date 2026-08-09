import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wifi, WifiOff } from 'lucide-react';

interface OfflineIndicatorProps {
  isOnline: boolean;
  isUsingCachedData?: boolean;
  lastUpdated?: string;
}

export const OfflineIndicator = ({ isOnline, isUsingCachedData, lastUpdated }: OfflineIndicatorProps) => {
  if (isOnline && !isUsingCachedData) {
    return null;
  }

  return (
    <div className="space-y-2">
      {!isOnline && (
        <Alert className="bg-orange-500/10 border-orange-500/20">
          <WifiOff className="h-4 w-4 text-orange-500" />
          <AlertDescription className="text-orange-500">
            You're offline. Showing cached weather data.
          </AlertDescription>
        </Alert>
      )}
      
      {isUsingCachedData && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            Cached Data
          </Badge>
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              Last updated: {lastUpdated}
            </span>
          )}
        </div>
      )}
    </div>
  );
};