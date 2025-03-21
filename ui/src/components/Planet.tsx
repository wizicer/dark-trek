import { Graphics } from '@pixi/react';
import { Graphics as PixiGraphics } from 'pixi.js';
import { useState } from 'react';
import "@pixi/events";

interface PlanetProps {
  x: number;
  y: number;
  radius: number;
  selected: boolean;
  onClick: () => void;
  onHover: (isHovered: boolean) => void;
}

export const Planet = ({ x, y, radius, selected, onClick, onHover }: PlanetProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleHoverChange = (hovered: boolean) => {
    setIsHovered(hovered);
    onHover(hovered);
  };

  const draw = (g: PixiGraphics) => {
    g.clear();
    g.beginFill(selected ? 0x4a9eff : 0x666666);
    g.drawCircle(x, y, radius);
    g.endFill();

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
      eventMode="dynamic"
      cursor="pointer"
      pointertap={onClick}
      pointerover={() => handleHoverChange(true)}
      pointerout={() => handleHoverChange(false)}
    />
  );
};
