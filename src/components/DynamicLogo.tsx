import { useMemo } from 'react';
import { WeatherCondition } from '@/types/weather';

interface DynamicLogoProps {
  condition: WeatherCondition;
  className?: string;
}

export const DynamicLogo = ({ condition, className = "h-12 w-12" }: DynamicLogoProps) => {
  const logoStyles = useMemo(() => {
    const baseClasses = "object-contain drop-shadow-lg transition-all duration-500";
    
    switch (condition) {
      case 'rain':
        return `${baseClasses} filter hue-rotate-180 brightness-110`;
      case 'snow':
        return `${baseClasses} filter brightness-150 contrast-110`;
      case 'clouds':
        return `${baseClasses} filter brightness-75 contrast-125`;
      case 'clear':
        return `${baseClasses} filter brightness-125 saturate-150`;
      case 'night':
        return `${baseClasses} filter brightness-50 hue-rotate-240`;
      case 'thunderstorm':
        return `${baseClasses} filter brightness-50 contrast-150 hue-rotate-270`;
      case 'mist':
      case 'fog':
        return `${baseClasses} filter brightness-90 blur-[0.5px] opacity-80`;
      default:
        return baseClasses;
    }
  }, [condition]);

  const gradientOverlay = useMemo(() => {
    switch (condition) {
      case 'rain':
        return 'from-blue-500/20 to-cyan-500/20';
      case 'snow':
        return 'from-slate-200/30 to-white/30';
      case 'clouds':
        return 'from-gray-400/20 to-slate-500/20';
      case 'clear':
        return 'from-yellow-400/20 to-orange-500/20';
      case 'night':
        return 'from-indigo-800/30 to-purple-900/30';
      case 'thunderstorm':
        return 'from-purple-700/30 to-gray-900/30';
      case 'mist':
      case 'fog':
        return 'from-gray-300/20 to-slate-400/20';
      default:
        return 'from-primary/10 to-primary/20';
    }
  }, [condition]);

  return (
    <div className={`relative ${className}`}>
      {/* Dynamic Weather Logo SVG */}
      <svg
        viewBox="0 0 100 100"
        className={logoStyles}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background Circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="currentColor"
          className="text-primary/10"
        />
        
        {/* Weather Icon based on condition */}
        {condition === 'clear' && (
          <g>
            {/* Sun */}
            <circle cx="50" cy="50" r="20" fill="#FFA500" />
            <g stroke="#FFD700" strokeWidth="3" strokeLinecap="round">
              <line x1="50" y1="15" x2="50" y2="25" />
              <line x1="50" y1="75" x2="50" y2="85" />
              <line x1="15" y1="50" x2="25" y2="50" />
              <line x1="75" y1="50" x2="85" y2="50" />
              <line x1="25.86" y1="25.86" x2="32.93" y2="32.93" />
              <line x1="67.07" y1="67.07" x2="74.14" y2="74.14" />
              <line x1="25.86" y1="74.14" x2="32.93" y2="67.07" />
              <line x1="67.07" y1="32.93" x2="74.14" y2="25.86" />
            </g>
          </g>
        )}
        
        {condition === 'night' && (
          <g>
            {/* Moon */}
            <path
              d="M40 20 Q60 25 65 45 Q60 65 40 70 Q55 60 55 45 Q55 30 40 20"
              fill="#E6E6FA"
            />
            {/* Stars */}
            <circle cx="25" cy="30" r="1.5" fill="#FFD700" />
            <circle cx="70" cy="25" r="1" fill="#FFD700" />
            <circle cx="75" cy="40" r="1.2" fill="#FFD700" />
            <circle cx="30" cy="70" r="1" fill="#FFD700" />
          </g>
        )}
        
        {(condition === 'clouds' || condition === 'mist' || condition === 'fog') && (
          <g>
            {/* Clouds */}
            <path
              d="M20 55 Q15 45 25 45 Q30 35 40 45 Q50 35 60 45 Q70 40 75 50 Q80 60 70 65 L25 65 Q15 65 20 55"
              fill="#B0C4DE"
              opacity="0.8"
            />
            <path
              d="M25 45 Q20 35 30 35 Q35 25 45 35 Q55 25 65 35 Q75 30 80 40 Q85 50 75 55 L30 55 Q20 55 25 45"
              fill="#D3D3D3"
              opacity="0.6"
            />
          </g>
        )}
        
        {condition === 'rain' && (
          <g>
            {/* Cloud */}
            <path
              d="M20 45 Q15 35 25 35 Q30 25 40 35 Q50 25 60 35 Q70 30 75 40 Q80 50 70 55 L25 55 Q15 55 20 45"
              fill="#696969"
            />
            {/* Rain drops */}
            <g stroke="#4169E1" strokeWidth="2" strokeLinecap="round">
              <line x1="30" y1="60" x2="28" y2="75" />
              <line x1="40" y1="58" x2="38" y2="73" />
              <line x1="50" y1="60" x2="48" y2="75" />
              <line x1="60" y1="58" x2="58" y2="73" />
            </g>
          </g>
        )}
        
        {condition === 'snow' && (
          <g>
            {/* Cloud */}
            <path
              d="M20 45 Q15 35 25 35 Q30 25 40 35 Q50 25 60 35 Q70 30 75 40 Q80 50 70 55 L25 55 Q15 55 20 45"
              fill="#C0C0C0"
            />
            {/* Snowflakes */}
            <g stroke="#FFFFFF" strokeWidth="1.5" fill="#FFFFFF">
              <g transform="translate(30, 65)">
                <line x1="-3" y1="0" x2="3" y2="0" />
                <line x1="0" y1="-3" x2="0" y2="3" />
                <line x1="-2" y1="-2" x2="2" y2="2" />
                <line x1="-2" y1="2" x2="2" y2="-2" />
              </g>
              <g transform="translate(50, 68)">
                <line x1="-3" y1="0" x2="3" y2="0" />
                <line x1="0" y1="-3" x2="0" y2="3" />
                <line x1="-2" y1="-2" x2="2" y2="2" />
                <line x1="-2" y1="2" x2="2" y2="-2" />
              </g>
            </g>
          </g>
        )}
        
        {condition === 'thunderstorm' && (
          <g>
            {/* Dark Cloud */}
            <path
              d="M20 45 Q15 35 25 35 Q30 25 40 35 Q50 25 60 35 Q70 30 75 40 Q80 50 70 55 L25 55 Q15 55 20 45"
              fill="#2F2F2F"
            />
            {/* Lightning */}
            <path
              d="M45 60 L40 70 L43 70 L38 80 L48 68 L45 68 L50 60 Z"
              fill="#FFD700"
            />
          </g>
        )}
        
        {/* CloudCast text */}
        <text
          x="50"
          y="90"
          textAnchor="middle"
          fontSize="8"
          fontWeight="bold"
          fill="currentColor"
          className="text-primary"
        >
          CC
        </text>
      </svg>
      
      {/* Dynamic Gradient Overlay */}
      <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${gradientOverlay} opacity-30 pointer-events-none`} />
    </div>
  );
};