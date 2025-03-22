import { Container, Text, Graphics } from '@pixi/react';
import { TextStyle } from 'pixi.js';
import { FederatedPointerEvent } from '@pixi/events';
import { SearchItem } from '../types/search';

interface SearchItemProps {
  item: SearchItem;
  isSelected: boolean;
  onSelect: (id: number) => void;
  onDismiss: (id: number) => void;
  onStartSearch: (id: number) => void;
}

export const SearchItemComponent = ({ item, isSelected, onSelect, onDismiss, onStartSearch }: SearchItemProps) => {
  const handleClick = (handler: () => void) => (e: FederatedPointerEvent) => {
    e.stopPropagation();
    handler();
  };

  return (
    <Container position={[0, 0]}>
      <Graphics
        draw={g => {
          g.clear();
          g.beginFill(0x000000, isSelected ? 0.9 : 0.7);
          g.lineStyle(2, isSelected ? 0x22c55e : 0x4a5568);
          g.drawRoundedRect(0, 0, 280, 60, 5);
          g.endFill();
        }}
        eventMode="static"
        onclick={handleClick(() => onSelect(item.id))}
      />
      <Text
        text={item.message}
        anchor={[0, 0]}
        position={[10, 10]}
        style={
          new TextStyle({
            fill: 0xffffff,
            fontSize: 14
          })
        }
      />
      <Container
        eventMode="static"
        onclick={handleClick(() => item.isSearching ? onDismiss(item.id) : onStartSearch(item.id))}
        cursor="pointer"
        position={[10, 30]}
      >
        <Graphics
          draw={g => {
            g.clear();
            g.beginFill(item.isSearching ? 0xef4444 : 0x22c55e, item.isSearching ? 1 : item.countdown === 0 ? 0.5 : 1);
            g.drawRoundedRect(0, 0, 120, 20, 5);
            g.endFill();
          }}
        />
        <Text
          text={item.isSearching ? 'Stop' : `Search lvl.${item.searchLevel} (${item.countdown}s)`}
          anchor={0.5}
          position={[60, 10]}
          style={
            new TextStyle({
              fill: 0xffffff,
              fontSize: 12
            })
          }
        />
      </Container>
      {!item.isSearching && (
        <Container
          eventMode="static"
          onclick={handleClick(() => onDismiss(item.id))}
          cursor="pointer"
          position={[140, 30]}
        >
          <Graphics
            draw={g => {
              g.clear();
              g.beginFill(0x3b82f6);
              g.drawRoundedRect(0, 0, 120, 20, 5);
              g.endFill();
            }}
          />
          <Text
            text="Dismiss"
            anchor={0.5}
            position={[60, 10]}
            style={
              new TextStyle({
                fill: 0xffffff,
                fontSize: 12
              })
            }
          />
        </Container>
      )}
    </Container>
  );
};
