import { Container, Text, Graphics } from '@pixi/react';
import { TextStyle } from 'pixi.js';

interface PlanetDialogProps {
  planet: number;
  onClose: () => void;
  x: number;
  y: number;
}

export const PlanetDialog = ({ planet, onClose, x, y }: PlanetDialogProps) => {
  return (
    <Container position={[x, y]}>
      <Graphics
        draw={g => {
          g.clear();
          g.beginFill(0x000000, 0.8);
          g.lineStyle(2, 0x4a5568);
          g.drawRoundedRect(-100, -80, 200, 160, 10);
          g.endFill();
        }}
      />
      <Text
        text={`Planet ${planet}`}
        anchor={0.5}
        position={[0, -50]}
        style={
          new TextStyle({
            fill: 0xffffff,
            fontSize: 18,
            fontWeight: 'bold'
          })
        }
      />
      <Text
        text="Resources: 1000"
        anchor={0.5}
        position={[0, -20]}
        style={
          new TextStyle({
            fill: 0xcccccc,
            fontSize: 14
          })
        }
      />
      <Text
        text="Population: 500"
        anchor={0.5}
        position={[0, 0]}
        style={
          new TextStyle({
            fill: 0xcccccc,
            fontSize: 14
          })
        }
      />
      <Text
        text="Defense: 75%"
        anchor={0.5}
        position={[0, 20]}
        style={
          new TextStyle({
            fill: 0xcccccc,
            fontSize: 14
          })
        }
      />
      <Container
        eventMode="dynamic"
        onclick={onClose}
        cursor="pointer"
      >
        <Graphics
          draw={g => {
            g.clear();
            g.beginFill(0x3b82f6);
            g.drawRoundedRect(-40, 40, 80, 30, 5);
            g.endFill();
          }}
        />
        <Text
          text="Close"
          anchor={0.5}
          position={[0, 55]}
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
