import { Graphics } from '@pixi/react';
import { Graphics as PixiGraphics } from 'pixi.js';
import { useState, useEffect, useCallback } from 'react';
import "@pixi/events";

const ENABLE_SATELLITE_ANIMATION = false; // Switch to control satellite animation

interface SatelliteConfig {
  size: number;
  orbitRadius: number;
  orbitTilt: number; // in degrees
  speed: number; // radians per second
}

interface PlanetProps {
  x: number;
  y: number;
  radius: number;
  selected: boolean;
  onClick: () => void;
  onHover: (isHovered: boolean) => void;
  satellites?: SatelliteConfig[];
}

export const Planet = ({ x, y, radius, selected, onClick, onHover, satellites = [] }: PlanetProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [satelliteAngles, setSatelliteAngles] = useState<number[]>(satellites.map(() => Math.random() * Math.PI * 2));

  const handleHoverChange = (hovered: boolean) => {
    setIsHovered(hovered);
    onHover(hovered);
  };

  useEffect(() => {
    if (!ENABLE_SATELLITE_ANIMATION || satellites.length === 0) return;

    const interval = setInterval(() => {
      setSatelliteAngles(prevAngles => 
        prevAngles.map((angle, index) => 
          (angle + satellites[index].speed) % (Math.PI * 2)
        )
      );
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [satellites]);

  const drawSatellite = useCallback((g: PixiGraphics, config: SatelliteConfig, angle: number) => {
    const { size, orbitRadius, orbitTilt } = config;
    
    // Convert orbit tilt from degrees to radians
    const tiltRad = (orbitTilt * Math.PI) / 180;
    
    // Calculate satellite position considering tilt
    const orbitX = Math.cos(angle) * orbitRadius;
    const orbitY = Math.sin(angle) * orbitRadius;
    
    // Apply tilt transformation
    const tiltedX = orbitX;
    const tiltedY = orbitY * Math.cos(tiltRad);
    const z = orbitY * Math.sin(tiltRad); // Z coordinate for depth calculation
    
    // Calculate scale factor based on z position (perspective effect)
    const scale = (orbitRadius + z) / (orbitRadius * 2);
    
    // Draw satellite with size adjusted for perspective
    const adjustedSize = size * scale;
    const alpha = (scale + 0.5) / 1.5; // Adjust opacity based on position
    
    g.beginFill(0xffffff, alpha);
    g.drawCircle(x + tiltedX, y + tiltedY, adjustedSize);
    g.endFill();
  }, [x, y]); 

  const draw = (g: PixiGraphics) => {
    g.clear();
    
    // Draw planet
    g.beginFill(selected ? 0x4a9eff : 0x666666);
    g.drawCircle(x, y, radius);
    g.endFill();

    // Draw satellites
    satellites.forEach((config, index) => {
      drawSatellite(g, config, satelliteAngles[index]);
    });

    // Draw selection/hover effect
    if (selected || isHovered) {
      g.lineStyle(2, selected ? 0x00ff00 : 0xffffff, 0.5);
      const segments = 100;
      
      for (let i = 0; i < segments; i++) {
        if (i % 2 === 0) {
          const startAngle = (i / segments) * Math.PI * 2;
          const endAngle = ((i + 1) / segments) * Math.PI * 2;
      
          const startX = x + (radius + 100) * Math.cos(startAngle);
          const startY = y + (radius + 100) * Math.sin(startAngle);
      
          g.moveTo(startX, startY);
          g.arc(x, y, radius + 100, startAngle, endAngle);
        }
      }
    }
  };

  return (
    <Graphics 
      draw={draw}
      alpha={0.8}
      eventMode="dynamic"
      cursor="pointer"
      pointertap={onClick}
      pointerover={() => handleHoverChange(true)}
      pointerout={() => handleHoverChange(false)}
    />
  );
};
