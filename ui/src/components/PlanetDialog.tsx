import { Container, Text, Graphics } from '@pixi/react';
import { TextStyle } from 'pixi.js';

interface PlanetDialogProps {
  planet: {
    id: number;
    x: number;
    y: number;
    radius: number;
    playerId?: number;
    energy: number;
  };
  onClose: () => void;
  onSendArmy: () => void;
  onOccupy: () => void;
  currentPlayerId: number;
}

export const PlanetDialog = ({ planet, onClose, onSendArmy, onOccupy, currentPlayerId }: PlanetDialogProps) => {
  const canSendArmy = planet.playerId === currentPlayerId;
  const canOccupy = planet.playerId === 0;

  return (
    <Container position={[planet.x + 150, planet.y]}>
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
        text={`Planet ${planet.id}`}
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
        text={`Energy: ${planet.energy}`}
        anchor={0.5}
        position={[0, -20]}
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
        position={[-80, 40]}
      >
        <Graphics
          draw={g => {
            g.clear();
            g.beginFill(0x3b82f6);
            g.drawRoundedRect(0, 0, 80, 30, 5);
            g.endFill();
          }}
        />
        <Text
          text="Close"
          anchor={0.5}
          position={[40, 15]}
          style={
            new TextStyle({
              fill: 0xffffff,
              fontSize: 14
            })
          }
        />
      </Container>
      {canSendArmy && (
        <Container
          eventMode="dynamic"
          onclick={onSendArmy}
          cursor="pointer"
          position={[10, 40]}
        >
          <Graphics
            draw={g => {
              g.clear();
              g.beginFill(0x22c55e);
              g.drawRoundedRect(0, 0, 80, 30, 5);
              g.endFill();
            }}
          />
          <Text
            text="Send Army"
            anchor={0.5}
            position={[40, 15]}
            style={
              new TextStyle({
                fill: 0xffffff,
                fontSize: 14
              })
            }
          />
        </Container>
      )}
      {canOccupy && (
        <Container
          eventMode="dynamic"
          onclick={onOccupy}
          cursor="pointer"
          position={[10, 40]}
        >
          <Graphics
            draw={g => {
              g.clear();
              g.beginFill(0x22c55e);
              g.drawRoundedRect(0, 0, 80, 30, 5);
              g.endFill();
            }}
          />
          <Text
            text="Occupy"
            anchor={0.5}
            position={[40, 15]}
            style={
              new TextStyle({
                fill: 0xffffff,
                fontSize: 14
              })
            }
          />
        </Container>
      )}
    </Container>
  );
};
