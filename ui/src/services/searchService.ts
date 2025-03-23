import { SearchItem, SearchPoint } from '../types/search';
import { PlanetData } from '../types/game';

export class SearchService {
  private nextId = 1;
  private items: SearchItem[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;
  private onItemsChange: ((items: SearchItem[]) => void) | null = null;

  startTimer(planets: PlanetData[]) {
    if (this.timer) return;
    
    this.timer = setInterval(() => {
      let hasChanges = false;
      this.items = this.items.map(item => {
        if (item.isSearching || item.isDismissed) return item;
        if (item.countdown > 0) {
          hasChanges = true;
          return { ...item, countdown: item.countdown - 1 };
        }
        if (item.countdown === 0) {
          hasChanges = true;
          const updatedItem = {
            ...item,
            isSearching: true,
            searchPoints: this.generateSearchPoints(item.searchLevel, planets)
          };
          return updatedItem;
        }
        return item;
      });
      
      if (hasChanges && this.onItemsChange) {
        this.onItemsChange(this.items);
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  setOnItemsChange(callback: (items: SearchItem[]) => void) {
    this.onItemsChange = callback;
  }

  generateSearchPoints(level: number, planets: PlanetData[]): SearchPoint[] {
    const points: SearchPoint[] = [];
    planets.forEach(planet => {
      const radius = planet.radius * (1 + level);
      for (let angle = 0; angle < 360; angle += 45) {
        const radian = (angle * Math.PI) / 180;
        const x = Math.round((planet.x + radius * Math.cos(radian)) / 100) * 100;
        const y = Math.round((planet.y + radius * Math.sin(radian)) / 100) * 100;
        // Only add unique grid points
        if (!points.some(p => p.x === x && p.y === y)) {
          points.push({ x, y });
        }
      }
    });
    return points;
  }

  createSearchItem(message: string, armyId: number): SearchItem {
    const item: SearchItem = {
      id: this.nextId++,
      armyId,
      message,
      searchLevel: 1,
      isSearching: false,
      isDismissed: false,
      searchPoints: [],
      countdown: 5
    };
    this.items.push(item);
    return item;
  }

  updateSearchItem(item: SearchItem): SearchItem {
    const index = this.items.findIndex(i => i.id === item.id);
    if (index !== -1) {
      this.items[index] = item;
    }
    return item;
  }

  dismissSearchItem(id: number): void {
    const item = this.items.find(i => i.id === id);
    if (item) {
      item.isDismissed = true;
      item.isSearching = false;
      if (this.onItemsChange) {
        this.onItemsChange(this.items);
      }
    }
  }

  getItems(): SearchItem[] {
    return this.items;
  }
}

export const searchService = new SearchService();
