import { Graphics } from '@pixi/react';
import { useCallback, useEffect, useState } from 'react';
import { Graphics as PixiGraphics } from 'pixi.js';

interface ArmyProps {
  x: number;
  y: number;
  selected: boolean;
  onClick: () => void;
  onHover?: (isHovered: boolean) => void;
}

export const Army = ({ x, y, selected, onClick, onHover }: ArmyProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [orbitAngle, setOrbitAngle] = useState(Math.random() * Math.PI * 2);
  const orbitRadius = 10;

  const handleHoverChange = (hovered: boolean) => {
    setIsHovered(hovered);
    onHover?.(hovered);
  };

  useEffect(() => {
    if (!selected) return;
    
    const interval = setInterval(() => {
      setOrbitAngle(angle => (angle + 0.05) % (Math.PI * 2));
    }, 50);

    return () => clearInterval(interval);
  }, [selected]);

  const draw = useCallback((g: PixiGraphics) => {
    g.clear();

    // Draw orbit path when selected
    if (selected) {
      g.lineStyle(1, 0x4a5568, 0.3);
      g.drawCircle(x, y, orbitRadius);
    }

    // Calculate army position with orbit
    const armyX = x + (selected ? Math.cos(orbitAngle) * orbitRadius : 0);
    const armyY = y + (selected ? Math.sin(orbitAngle) * orbitRadius : 0);

    // Draw selection/hover indicator
    if (selected || isHovered) {
      g.lineStyle(2, selected ? 0x22c55e : 0x3b82f6);
      g.drawCircle(x, y, 25);
    }

    // Draw army icon
    g.lineStyle(0);
    g.beginFill(selected ? 0x22c55e : 0xffffff);
    
    const offsetX = armyX - 15;
    const offsetY = armyY - 15;

    // Draw simplified spaceship shape
    g.moveTo(offsetX + 15, offsetY); // Top point
    g.lineTo(offsetX + 30, offsetY + 30); // Right wing
    g.lineTo(offsetX + 20, offsetY + 25); // Right body
    g.lineTo(offsetX + 15, offsetY + 30); // Bottom point
    g.lineTo(offsetX + 10, offsetY + 25); // Left body
    g.lineTo(offsetX, offsetY + 30); // Left wing
    g.lineTo(offsetX + 15, offsetY); // Back to top

    // Draw engine glow
    g.endFill();
    g.beginFill(selected ? 0x4ade80 : 0x60a5fa, 0.5);
    g.drawCircle(offsetX + 15, offsetY + 28, 4);
    
    g.endFill();
  }, [x, y, selected, isHovered, orbitAngle]);

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
