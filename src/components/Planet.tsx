import { Graphics } from '@pixi/react';
import * as PIXI from 'pixi.js';

interface PlanetProps {
  x: number;
  y: number;
  radius: number;
  selected: boolean;
  onClick: () => void;
}

export const Planet = ({ x, y, radius, selected, onClick }: PlanetProps) => {
  const draw = (g: PIXI.Graphics) => {
    g.clear();
    g.beginFill(selected ? 0x4a9eff : 0x666666);
    g.drawCircle(x, y, radius);
    g.endFill();

    if (selected) {
      g.lineStyle(2, 0x00ff00);
      g.drawCircle(x, y, radius + 5);
    }
  };

  return <Graphics draw={draw} eventMode="static" onclick={onClick} />;
};
