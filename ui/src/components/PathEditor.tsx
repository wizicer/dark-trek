import { Container, Graphics } from '@pixi/react';
import { PathPointDialog } from './PathPointDialog';

interface PathPoint {
  x: number;
  y: number;
}

interface PathEditorProps {
  sourcePlanet: { x: number; y: number };
  pathPoints: PathPoint[];
  hoverPosition: PathPoint | null;
  onSetTarget: () => void;
  onUndo: () => void;
}

export const PathEditor = ({ sourcePlanet, pathPoints, hoverPosition, onSetTarget, onUndo }: PathEditorProps) => {
  return (
    <Container>
      <Graphics
        draw={g => {
          g.clear();

          // Draw existing path
          g.lineStyle(2, 0x22c55e, 0.6);
          g.moveTo(sourcePlanet.x, sourcePlanet.y);
          
          // Draw path points and connections
          pathPoints.forEach((point, index) => {
            const prevPoint = index === 0 ? sourcePlanet : pathPoints[index - 1];
            g.moveTo(prevPoint.x, prevPoint.y);
            g.lineTo(point.x, point.y);
            g.beginFill(0x22c55e, 0.3);
            g.drawCircle(point.x, point.y, 10);
            g.endFill();
          });

          // Draw point at source planet
          g.beginFill(0x22c55e, 0.3);
          g.drawCircle(sourcePlanet.x, sourcePlanet.y, 10);
          g.endFill();

          // Draw preview line to hover position if valid
          if (hoverPosition) {
            const startPoint = pathPoints.length > 0 
              ? pathPoints[pathPoints.length - 1]
              : sourcePlanet;

            const dx = Math.abs(hoverPosition.x - startPoint.x);
            const dy = Math.abs(hoverPosition.y - startPoint.y);
            const isDiagonal = dx === dy;
            const isOrthogonal = dx === 0 || dy === 0;

            if (isDiagonal || isOrthogonal) {
              g.lineStyle(2, 0x22c55e, 0.3);
              g.moveTo(startPoint.x, startPoint.y);
              g.lineTo(hoverPosition.x, hoverPosition.y);
            }

            // Draw hover position marker
            g.beginFill(0x22c55e, 0.3);
            g.lineStyle(2, 0x22c55e);
            g.drawCircle(hoverPosition.x, hoverPosition.y, 20);
            g.endFill();
          }
        }}
      />
      {pathPoints.length > 0 && (
        <PathPointDialog
          onSetTarget={onSetTarget}
          onUndo={onUndo}
        />
      )}
    </Container>
  );
};
