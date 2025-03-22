import { Graphics } from '@pixi/react';
import { useCallback, useEffect, useState } from 'react';
import { Graphics as PixiGraphics } from 'pixi.js';
import { SpaceshipIcon } from './SpaceshipIcon';
import { getPlayerColor } from '../types/game';

interface ArmyProps {
  id: number;
  x: number;
  y: number;
  energy: number;
  selected?: boolean;
  onClick?: (id: number) => void;
  onHover?: (isHovered: boolean) => void;
  playerId?: number;
  currentPlayerId?: number;
}

export const Army = ({
  id,
  x,
  y,
  selected = false,
  onClick,
  onHover,
  playerId = 0,
  currentPlayerId = 1
}: ArmyProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [orbitAngle, setOrbitAngle] = useState(Math.random() * Math.PI * 2);
  const orbitRadius = 10;

  const handleHoverChange = (hovered: boolean) => {
    setIsHovered(hovered);
    onHover?.(hovered);
  };

  const glowColor = playerId === currentPlayerId ? 0x22c55e : 0xb4b4b4;
  const playerColor = getPlayerColor(playerId);

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
      g.lineStyle(1, glowColor, 0.3);
      g.drawCircle(x, y, orbitRadius);
    }

    // Draw selection/hover indicator
    if (selected || isHovered) {
      g.lineStyle(2, selected ? glowColor : 0x3b82f6);
      g.drawCircle(x, y, 25);
    }
  }, [x, y, selected, isHovered, glowColor]);

  // Calculate army position with orbit
  const armyX = x + (selected ? Math.cos(orbitAngle) * orbitRadius : 0);
  const armyY = y + (selected ? Math.sin(orbitAngle) * orbitRadius : 0);

  return (
    <>
      <Graphics draw={draw} />
      <SpaceshipIcon
        x={armyX}
        y={armyY}
        color={selected ? playerId === currentPlayerId ? 0x22c55e : 0xaaaaaa : 0xffffff}
        glowColor={playerColor}
        onClick={() => onClick?.(id)}
        onHover={handleHoverChange}
        interactive
      />
    </>
  );
};
