import { useState, useEffect } from 'react';
import { Clock, Globe } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface LocalTimeWidgetProps {
  cityName: string;
  timezoneOffset: number;
  country: string;
}

export const LocalTimeWidget = ({ cityName, timezoneOffset, country }: LocalTimeWidgetProps) => {
  const [localTime, setLocalTime] = useState<string>('');
  const [localDate, setLocalDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const localTime = new Date(utc + (timezoneOffset * 1000));
      
      setLocalTime(localTime.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }));
      
      setLocalDate(localTime.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [timezoneOffset]);

  return (
    <Card className="bg-card/60 backdrop-blur-lg border border-white/10 shadow-card">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Local Time</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Globe className="h-3 w-3" />
              <span>{cityName}, {country}</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-3xl font-bold text-primary tabular-nums">
            {localTime}
          </div>
          <div className="text-sm text-muted-foreground">
            {localDate}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};