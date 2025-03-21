import { Graphics } from '@pixi/react';
import { Graphics as PixiGraphics } from 'pixi.js';

interface GridProps {
  width: number;
  height: number;
  cellSize?: number;
  color?: number;
  alpha?: number;
}

export const Grid = ({ width, height, cellSize = 50, color = 0x333333, alpha = 0.3 }: GridProps) => {
  const draw = (g: PixiGraphics) => {
    g.clear();
    g.lineStyle(1, color, alpha);

    // Draw vertical lines
    for (let x = 0; x <= width; x += cellSize) {
      g.moveTo(x, 0);
      g.lineTo(x, height);
    }

    // Draw horizontal lines
    for (let y = 0; y <= height; y += cellSize) {
      g.moveTo(0, y);
      g.lineTo(width, y);
    }
  };

  return <Graphics draw={draw} />;
};
