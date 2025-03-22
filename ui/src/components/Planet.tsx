import { Graphics } from '@pixi/react';
import { Graphics as PixiGraphics } from 'pixi.js';
import { useState, useEffect, useCallback } from 'react';
import "@pixi/events";

const ENABLE_SATELLITE_ANIMATION = false; // Switch to control satellite animation

interface SatelliteConfig {
  size: number;
  orbitRadius: number;
  orbitTilt: number;
  speed: number;
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
  const [time, setTime] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [satelliteAngles, setSatelliteAngles] = useState<number[]>(satellites.map(() => Math.random() * Math.PI * 2));

  const handleHoverChange = (hovered: boolean) => {
    setIsHovered(hovered);
    onHover(hovered);
  };

  useEffect(() => {
    let lastTime = Date.now();
    const animate = () => {
      const currentTime = Date.now();
      const deltaTime = (currentTime - lastTime) / 1000;
      setTime(t => t + deltaTime);
      lastTime = currentTime;
      requestAnimationFrame(animate);
    };
    const animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  useEffect(() => {
    if (!ENABLE_SATELLITE_ANIMATION || satellites.length === 0) return;

    const interval = setInterval(() => {
      setSatelliteAngles(prevAngles => 
        prevAngles.map((angle, index) => 
          (angle + satellites[index].speed) % (Math.PI * 2)
        )
      );
    }, 16);

    return () => clearInterval(interval);
  }, [satellites]);

  const drawSatellite = useCallback((g: PixiGraphics, config: SatelliteConfig, angle: number) => {
    const { size, orbitRadius, orbitTilt } = config;
    
    const tiltRad = (orbitTilt * Math.PI) / 180;
    
    const orbitX = Math.cos(angle) * orbitRadius;
    const orbitY = Math.sin(angle) * orbitRadius;
    
    const tiltedX = orbitX;
    const tiltedY = orbitY * Math.cos(tiltRad);
    const z = orbitY * Math.sin(tiltRad);
    
    const scale = (orbitRadius + z) / (orbitRadius * 2);
    const adjustedSize = size * scale;
    const alpha = (scale + 0.5) / 1.5;
    
    // Draw orbit path
    g.lineStyle(1, selected ? 0x4ade80 : 0x4b5563, 0.2);
    g.drawEllipse(x, y, orbitRadius, orbitRadius * Math.cos(tiltRad));
    
    // Draw satellite with glow
    g.beginFill(0x000000, 0.5);
    g.drawCircle(x + tiltedX, y + tiltedY, adjustedSize + 1);
    g.endFill();

    g.beginFill(selected ? 0x4ade80 : 0x9ca3af, alpha);
    g.drawCircle(x + tiltedX, y + tiltedY, adjustedSize);
    g.endFill();

    g.lineStyle(1, selected ? 0x4ade80 : 0x60a5fa, 0.2 * alpha);
    g.drawCircle(x + tiltedX, y + tiltedY, adjustedSize + 2);
  }, [x, y, selected]);

  const draw = useCallback((g: PixiGraphics) => {
    g.clear();

    // Draw planet surface
    const baseColor = selected ? 0x22c55e : 0x4a5568;
    const highlightColor = selected ? 0x4ade80 : 0x1f2937;

    g.beginFill(0x000000, 0.5);
    g.drawCircle(x, y, radius + 2);
    g.endFill();

    g.beginFill(baseColor);
    g.drawCircle(x, y, radius);
    g.endFill();

    g.beginFill(highlightColor, 0.3);
    g.drawCircle(x - radius * 0.3, y - radius * 0.3, radius * 0.7);
    g.endFill();

    // Add surface details
    g.lineStyle(1, selected ? 0x4ade80 : 0x374151, 0.3);
    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 * i / 5) + time * 0.2;
      const r = radius * 0.8;
      g.drawEllipse(
        x + Math.cos(angle) * r * 0.2,
        y + Math.sin(angle) * r * 0.2,
        r,
        r * 0.3
      );
    }

    // Draw atmosphere glow
    g.lineStyle(2, selected ? 0x4ade80 : 0x60a5fa, 0.2);
    g.drawCircle(x, y, radius + 4);
    g.lineStyle(1, selected ? 0x4ade80 : 0x60a5fa, 0.1);
    g.drawCircle(x, y, radius + 8);

    // Draw satellites with perspective
    satellites.forEach((config, index) => {
      drawSatellite(g, config, satelliteAngles[index]);
    });

    // Draw selection/hover effect
    if (selected || isHovered) {
      g.lineStyle(2, selected ? 0x4ade80 : 0x60a5fa, 0.8);
      g.drawCircle(x, y, radius + 2);

      if (selected) {
        g.lineStyle(1, 0x4ade80, 0.4);
        g.drawCircle(x, y, radius + 6);
        g.lineStyle(1, 0x4ade80, 0.2);
        g.drawCircle(x, y, radius + 10);
      }

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
  }, [x, y, radius, selected, satellites, satelliteAngles, time, isHovered, drawSatellite]);

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
