import { useEffect, useRef } from 'react';
import { WeatherCondition } from '../types/weather';

interface WeatherBackgroundProps {
  condition: WeatherCondition;
}

export const WeatherBackground = ({ condition }: WeatherBackgroundProps) => {
  const rainRef = useRef<HTMLDivElement>(null);
  const cloudsRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Clear existing animations
    if (rainRef.current) rainRef.current.innerHTML = '';
    if (cloudsRef.current) cloudsRef.current.innerHTML = '';
    if (starsRef.current) starsRef.current.innerHTML = '';

    switch (condition) {
      case 'rain':
        createRaindrops();
        break;
      case 'clouds':
        createClouds();
        break;
      case 'night':
        createStars();
        break;
      default:
        break;
    }
  }, [condition]);

  const createRaindrops = () => {
    if (!rainRef.current) return;
    
    for (let i = 0; i < 100; i++) {
      const raindrop = document.createElement('div');
      raindrop.className = 'raindrop';
      raindrop.style.left = Math.random() * 100 + '%';
      raindrop.style.animationDelay = Math.random() * 2 + 's';
      raindrop.style.animationDuration = (Math.random() * 0.5 + 0.5) + 's';
      rainRef.current.appendChild(raindrop);
    }
  };

  const createClouds = () => {
    if (!cloudsRef.current) return;
    
    for (let i = 0; i < 8; i++) {
      const cloud = document.createElement('div');
      cloud.className = 'cloud';
      
      const size = Math.random() * 80 + 40;
      cloud.style.width = size + 'px';
      cloud.style.height = size * 0.7 + 'px';
      cloud.style.top = Math.random() * 40 + '%';
      cloud.style.animationDuration = (Math.random() * 20 + 15) + 's';
      cloud.style.animationDelay = Math.random() * 10 + 's';
      
      // Add cloud layers
      const cloudLayer = document.createElement('div');
      cloudLayer.style.position = 'absolute';
      cloudLayer.style.top = size * 0.3 + 'px';
      cloudLayer.style.left = size * 0.3 + 'px';
      cloudLayer.style.width = size * 0.8 + 'px';
      cloudLayer.style.height = size * 0.5 + 'px';
      cloudLayer.style.background = 'rgba(255, 255, 255, 0.06)';
      cloudLayer.style.borderRadius = '50px';
      cloud.appendChild(cloudLayer);
      
      cloudsRef.current.appendChild(cloud);
    }
  };

  const createStars = () => {
    if (!starsRef.current) return;
    
    for (let i = 0; i < 150; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.left = Math.random() * 100 + '%';
      star.style.top = Math.random() * 70 + '%';
      star.style.animationDelay = Math.random() * 3 + 's';
      star.style.animationDuration = (Math.random() * 2 + 2) + 's';
      
      // Vary star sizes
      const size = Math.random() * 2 + 1;
      star.style.width = size + 'px';
      star.style.height = size + 'px';
      
      starsRef.current.appendChild(star);
    }
  };

  return (
    <>
      {condition === 'rain' && (
        <div ref={rainRef} className="rain-animation" />
      )}
      
      {condition === 'clouds' && (
        <div ref={cloudsRef} className="cloud-animation" />
      )}
      
      {condition === 'clear' && (
        <div className="sun-animation">
          <div className="sun" />
        </div>
      )}
      
      {condition === 'night' && (
        <>
          <div className="moon-animation">
            <div className="moon" />
          </div>
          <div ref={starsRef} className="stars-animation" />
        </>
      )}
    </>
  );
};