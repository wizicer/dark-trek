import { Container, Text, Graphics } from '@pixi/react';
import { TextStyle } from 'pixi.js';
import { FederatedPointerEvent } from '@pixi/events';

interface ArmyDialogProps {
  x: number;
  y: number;
  energy: number;
  onClose: () => void;
  onSend: () => void;
  onReveal?: () => void;
  playerId: number;
  currentPlayerId: number;
}

export const ArmyDialog = ({ energy, onClose, onSend, onReveal, x, y, playerId, currentPlayerId }: ArmyDialogProps) => {
  const handleClick = (handler: () => void) => (e: FederatedPointerEvent) => {
    e.stopPropagation();
    handler();
  };

  const canSendArmy = playerId === currentPlayerId;

  return (
    <Container position={[x, y]} eventMode="static">
      <Graphics
        draw={g => {
          g.clear();
          g.beginFill(0x000000, 0.8);
          g.lineStyle(2, 0x4a5568);
          g.drawRoundedRect(-100, -60, 200, 120, 10);
          g.endFill();
        }}
      />
      <Text
        text={`Energy: ${energy}`}
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
        eventMode="static"
        onclick={handleClick(onClose)}
        cursor="pointer"
        position={[-80, 20]}
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
          text="Close"
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
      {canSendArmy && !onReveal && (
        <Container
          eventMode="static"
          onclick={handleClick(onSend)}
          cursor="pointer"
          position={[10, 20]}
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
            text="Send"
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
      )}
      {canSendArmy && onReveal && (
        <Container
          eventMode="static"
          onclick={handleClick(onReveal)}
          cursor="pointer"
          position={[10, 20]}
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
            text="Reveal"
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
      )}
    </Container>
  );
};
