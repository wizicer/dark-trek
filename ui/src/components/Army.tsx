import { Graphics } from '@pixi/react';
import { useCallback, useEffect, useState } from 'react';
import { Graphics as PixiGraphics } from 'pixi.js';
import { SpaceshipIcon } from './SpaceshipIcon';

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

    // Draw selection/hover indicator
    if (selected || isHovered) {
      g.lineStyle(2, selected ? 0x22c55e : 0x3b82f6);
      g.drawCircle(x, y, 25);
    }
  }, [x, y, selected, isHovered]);

  // Calculate army position with orbit
  const armyX = x + (selected ? Math.cos(orbitAngle) * orbitRadius : 0);
  const armyY = y + (selected ? Math.sin(orbitAngle) * orbitRadius : 0);

  return (
    <>
      <Graphics draw={draw} />
      <SpaceshipIcon
        x={armyX}
        y={armyY}
        color={selected ? 0x22c55e : 0xffffff}
        glowColor={selected ? 0x4ade80 : 0x60a5fa}
        onClick={onClick}
        onHover={handleHoverChange}
        interactive
      />
    </>
  );
};
