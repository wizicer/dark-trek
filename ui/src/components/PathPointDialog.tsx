import { Container, Text, Graphics } from '@pixi/react';
import { TextStyle } from 'pixi.js';
import { FederatedPointerEvent } from '@pixi/events';

interface PathPointDialogProps {
  onSetTarget: () => void;
  onUndo: () => void;
}

export const PathPointDialog = ({ onSetTarget, onUndo }: PathPointDialogProps) => {
  const handleClick = (handler: () => void) => (e: FederatedPointerEvent) => {
    e.stopPropagation();
    handler();
  };

  return (
    <Container position={[10, 10]} eventMode="static">
      <Graphics
        draw={g => {
          g.clear();
          g.beginFill(0x000000, 0.8);
          g.lineStyle(2, 0x4a5568);
          g.drawRoundedRect(0, 0, 160, 40, 5);
          g.endFill();
        }}
      />
      <Container
        eventMode="static"
        onclick={handleClick(onUndo)}
        cursor="pointer"
        position={[5, 5]}
      >
        <Graphics
          draw={g => {
            g.clear();
            g.beginFill(0x3b82f6);
            g.drawRoundedRect(0, 0, 70, 30, 5);
            g.endFill();
          }}
        />
        <Text
          text="Undo"
          anchor={0.5}
          position={[35, 15]}
          style={
            new TextStyle({
              fill: 0xffffff,
              fontSize: 14
            })
          }
        />
      </Container>
      <Container
        eventMode="static"
        onclick={handleClick(onSetTarget)}
        cursor="pointer"
        position={[85, 5]}
      >
        <Graphics
          draw={g => {
            g.clear();
            g.beginFill(0x22c55e);
            g.drawRoundedRect(0, 0, 70, 30, 5);
            g.endFill();
          }}
        />
        <Text
          text="Set"
          anchor={0.5}
          position={[35, 15]}
          style={
            new TextStyle({
              fill: 0xffffff,
              fontSize: 14
            })
          }
        />
      </Container>
    </Container>
  );
};
