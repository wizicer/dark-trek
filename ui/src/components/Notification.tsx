import { Container, Text, Graphics } from '@pixi/react';
import { TextStyle } from 'pixi.js';
import { useEffect, useState, useCallback } from 'react';
import { FederatedPointerEvent } from '@pixi/events';

interface NotificationProps {
  message: string;
  onDismiss: () => void;
}

export const Notification = ({ message, onDismiss }: NotificationProps) => {
  const [searchLevel, setSearchLevel] = useState(1);
  const [countdown, setCountdown] = useState(5);
  const [isSearching, setIsSearching] = useState(false);
  const [yOffset, setYOffset] = useState(-50);

  const handleClick = (handler: () => void) => (e: FederatedPointerEvent) => {
    e.stopPropagation();
    handler();
  };

  const startSearch = useCallback(() => {
    setIsSearching(true);
    // Simulate search for 2 seconds
    setTimeout(() => {
      if (searchLevel < 9) {
        setSearchLevel(prev => prev + 1);
        setIsSearching(false);
        setCountdown(5);
      } else {
        onDismiss();
      }
    }, 2000);
  }, [searchLevel, onDismiss]);

  useEffect(() => {
    // Initial animation
    setYOffset(0);
  }, []);

  useEffect(() => {
    if (!isSearching && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else if (!isSearching && countdown === 0) {
      startSearch();
    }
  }, [countdown, isSearching, startSearch]);

  return (
    <Container position={[window.innerWidth - 320, 20]}>
      <Graphics
        draw={g => {
          g.clear();
          g.beginFill(0x000000, 0.8);
          g.lineStyle(2, 0x4a5568);
          g.drawRoundedRect(0, yOffset, 300, 80, 5);
          g.endFill();
        }}
      />
      <Text
        text={message}
        anchor={[0.5, 0]}
        position={[150, yOffset + 10]}
        style={
          new TextStyle({
            fill: 0xffffff,
            fontSize: 14,
            align: 'center'
          })
        }
      />
      <Container
        eventMode="static"
        onclick={handleClick(isSearching ? onDismiss : startSearch)}
        cursor="pointer"
        position={[20, yOffset + 35]}
      >
        <Graphics
          draw={g => {
            g.clear();
            g.beginFill(isSearching ? 0xef4444 : 0x22c55e, isSearching ? 1 : countdown === 0 ? 0.5 : 1);
            g.drawRoundedRect(0, 0, 120, 30, 5);
            g.endFill();
          }}
        />
        <Text
          text={isSearching ? 'Stop' : `Search lvl.${searchLevel} (${countdown}s)`}
          anchor={0.5}
          position={[60, 15]}
          style={
            new TextStyle({
              fill: 0xffffff,
              fontSize: 14
            })
          }
        />
      </Container>
      {!isSearching && (
        <Container
          eventMode="static"
          onclick={handleClick(onDismiss)}
          cursor="pointer"
          position={[160, yOffset + 35]}
        >
          <Graphics
            draw={g => {
              g.clear();
              g.beginFill(0x3b82f6);
              g.drawRoundedRect(0, 0, 120, 30, 5);
              g.endFill();
            }}
          />
          <Text
            text="Dismiss"
            anchor={0.5}
            position={[60, 15]}
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
