import { Button } from '@/components/ui/button';
import { TemperatureUnit } from '../types/weather';

interface TemperatureToggleProps {
  unit: TemperatureUnit;
  onToggle: (unit: TemperatureUnit) => void;
}

export const TemperatureToggle = ({ unit, onToggle }: TemperatureToggleProps) => {
  const toggleUnit = () => {
    const newUnit = unit === 'celsius' ? 'fahrenheit' : 'celsius';
    onToggle(newUnit);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleUnit}
      className="bg-card/60 backdrop-blur-sm border border-white/10 hover:bg-card/80 font-mono"
    >
      {unit === 'celsius' ? '°C' : '°F'}
    </Button>
  );
};