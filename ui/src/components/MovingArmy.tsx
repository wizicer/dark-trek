import { Graphics } from '@pixi/react';
import { useCallback, useEffect, useState } from 'react';
import { Graphics as PixiGraphics } from 'pixi.js';
import { SpaceshipIcon } from './SpaceshipIcon';
import { ArmyDialog } from './ArmyDialog';

interface MovingArmyProps {
  startX: number;
  startY: number;
  pathPoints: { x: number; y: number }[];
  speed: number; // pixels per second
  energy: number;
  id: number;
  playerId: number;
  currentPlayerId: number;
  selected?: boolean;
  onSelect?: (id: number) => void;
  onReveal?: () => void;
}

export const MovingArmy = ({ 
  startX, 
  startY, 
  pathPoints, 
  speed,
  energy,
  id,
  playerId,
  currentPlayerId,
  selected = false,
  onSelect,
  onReveal
}: MovingArmyProps) => {
  const [position, setPosition] = useState({ x: startX, y: startY });
  const [currentSegment, setCurrentSegment] = useState(0);

  useEffect(() => {
    if (currentSegment >= pathPoints.length) return;

    const target = pathPoints[currentSegment];
    const dx = target.x - position.x;
    const dy = target.y - position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const timeToTarget = distance / speed * 1000; // Convert to milliseconds

    const startTime = Date.now();
    const startPos = { ...position };

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const segmentProgress = Math.min(1, elapsed / timeToTarget);

      if (segmentProgress < 1) {
        setPosition({
          x: startPos.x + dx * segmentProgress,
          y: startPos.y + dy * segmentProgress
        });
        requestAnimationFrame(animate);
      } else {
        setPosition(target);
        if (currentSegment < pathPoints.length) {
          setCurrentSegment(prev => prev + 1);
        }
      }
    };

    const animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [position, currentSegment, pathPoints, speed]);

  const draw = useCallback((g: PixiGraphics) => {
    g.clear();

    // Draw completed path segments in dark grey
    g.lineStyle(2, 0x4a5568, 0.8);
    g.moveTo(startX, startY);
    for (let i = 0; i < currentSegment; i++) {
      g.lineTo(pathPoints[i].x, pathPoints[i].y);
    }

    // Draw current segment with progress
    if (currentSegment < pathPoints.length) {
      const current = position;
      const target = pathPoints[currentSegment];
      g.lineTo(current.x, current.y);

      // Draw remaining path in light grey
      g.lineStyle(2, 0x9ca3af, 0.4);
      g.moveTo(current.x, current.y);
      g.lineTo(target.x, target.y);

      // Draw remaining segments
      for (let i = currentSegment + 1; i < pathPoints.length; i++) {
        g.lineTo(pathPoints[i].x, pathPoints[i].y);
      }
    }
  }, [startX, startY, position, currentSegment, pathPoints]);

  // Calculate rotation based on movement direction
  let angle = 0;
  if (currentSegment < pathPoints.length) {
    const target = pathPoints[currentSegment];
    angle = Math.atan2(target.y - position.y, target.x - position.x) + Math.PI / 2;
  } else {
    angle = 0;
  }

  const handleClick = () => {
    onSelect?.(id);
  };

  const handleClose = () => {
    onSelect?.(id); // Clicking again deselects
  };

  const handleReveal = () => {
    onReveal?.();
  };

  return (
    <>
      <Graphics draw={draw} />
      <SpaceshipIcon
        x={position.x}
        y={position.y}
        angle={angle}
        color={selected ? 0x22c55e : 0xffffff}
        glowColor={selected ? 0x4ade80 : 0x60a5fa}
        onClick={handleClick}
        onHover={() => {}}
        interactive
      />
      {selected && (
        <ArmyDialog
          x={position.x + 120}
          y={position.y}
          energy={energy}
          onClose={handleClose}
          onSend={() => {}}
          onReveal={handleReveal}
          playerId={playerId}
          currentPlayerId={currentPlayerId}
        />
      )}
    </>
  );
};
