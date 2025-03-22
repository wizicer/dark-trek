import { Container, Text, Graphics } from '@pixi/react';
import { TextStyle } from 'pixi.js';
import { useCallback, useState } from 'react';
import { SearchItem as SearchItemType } from '../types/search';
import { SearchItemComponent } from './SearchItem';
import { FederatedPointerEvent } from '@pixi/events';

interface SearchListProps {
  items: SearchItemType[];
  onItemUpdate: (item: SearchItemType) => void;
  onItemDismiss: (id: number) => void;
  onItemSelect: (id: number) => void;
  selectedSearchId: number;
}

export const SearchList = ({ items, onItemUpdate, onItemDismiss, onItemSelect, selectedSearchId }: SearchListProps) => {
  const [showAll, setShowAll] = useState(false);

  const handleClick = (handler: () => void) => (e: FederatedPointerEvent) => {
    e.stopPropagation();
    handler();
  };

  const handleStartSearch = useCallback((id: number) => {
    const item = items.find(i => i.id === id);
    if (item) {
      onItemUpdate({
        ...item,
        isSearching: true
      });
    }
  }, [items, onItemUpdate]);

  const visibleItems = showAll ? items : items.filter(item => !item.isDismissed);

  return (
    <Container position={[window.innerWidth - 300, 20]}>
      <Container
        eventMode="static"
        onclick={handleClick(() => setShowAll(!showAll))}
        cursor="pointer"
        position={[0, 0]}
      >
        <Graphics
          draw={g => {
            g.clear();
            g.beginFill(0x000000, 0.8);
            g.lineStyle(2, 0x4a5568);
            g.drawRoundedRect(0, 0, 280, 30, 5);
            g.endFill();
          }}
        />
        <Text
          text={showAll ? 'Hide Dismissed' : 'Show All'}
          anchor={0.5}
          position={[140, 15]}
          style={
            new TextStyle({
              fill: 0xffffff,
              fontSize: 14
            })
          }
        />
      </Container>

      <Container position={[0, 40]}>
        {visibleItems.map((item, index) => (
          <Container key={item.id} position={[0, index * 70]}>
            <SearchItemComponent
              item={item}
              isSelected={item.id === selectedSearchId}
              onSelect={onItemSelect}
              onDismiss={onItemDismiss}
              onStartSearch={handleStartSearch}
            />
          </Container>
        ))}
      </Container>
    </Container>
  );
};
