import { Graphics } from '@pixi/react';
import { useCallback } from 'react';
import { Graphics as PixiGraphics } from 'pixi.js';

interface SpaceshipIconProps {
  x: number;
  y: number;
  angle?: number;
  color?: number;
  glowColor?: number;
  size?: number;
  onClick?: () => void;
  onHover?: (isHovered: boolean) => void;
  interactive?: boolean;
}

// Moved to a separate file to avoid fast refresh issues
export const SpaceshipIcon = ({ 
  x, 
  y, 
  angle = 0, 
  color = 0xffffff, 
  glowColor = 0x60a5fa, 
  size = 15,
  onClick,
  onHover,
  interactive = false
}: SpaceshipIconProps) => {
  const draw = useCallback((g: PixiGraphics) => {
    g.clear();
    
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    // Helper function to rotate point around center
    const rotatePoint = (px: number, py: number) => {
      const rx = (px - x) * cos - (py - y) * sin + x;
      const ry = (px - x) * sin + (py - y) * cos + y;
      return { x: rx, y: ry };
    };

    g.lineStyle(0);
    g.beginFill(color);
    
    // Calculate rotated points for spaceship shape
    const top = rotatePoint(x, y - size);
    const rightWing = rotatePoint(x + size, y + size);
    const rightBody = rotatePoint(x + size * 0.6, y + size * 0.8);
    const bottom = rotatePoint(x, y + size);
    const leftBody = rotatePoint(x - size * 0.6, y + size * 0.8);
    const leftWing = rotatePoint(x - size, y + size);

    // Draw rotated spaceship shape
    g.moveTo(top.x, top.y);
    g.lineTo(rightWing.x, rightWing.y);
    g.lineTo(rightBody.x, rightBody.y);
    g.lineTo(bottom.x, bottom.y);
    g.lineTo(leftBody.x, leftBody.y);
    g.lineTo(leftWing.x, leftWing.y);
    g.lineTo(top.x, top.y);
    g.endFill();

    // Draw engine glow
    g.beginFill(glowColor, 0.5);
    const enginePos = rotatePoint(x, y + size * 0.8);
    g.drawCircle(enginePos.x, enginePos.y, 4);
    g.endFill();
  }, [x, y, angle, color, glowColor, size]);

  return (
    <Graphics 
      draw={draw} 
      eventMode={interactive ? "dynamic" : "none"}
      cursor={interactive ? "pointer" : "default"}
      pointertap={onClick}
      pointerover={() => onHover?.(true)}
      pointerout={() => onHover?.(false)}
    />
  );
};
