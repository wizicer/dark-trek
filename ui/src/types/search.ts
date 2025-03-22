export interface SearchPoint {
  x: number;
  y: number;
}

export interface SearchItem {
  id: number;
  message: string;
  searchLevel: number;
  isSearching: boolean;
  isDismissed: boolean;
  searchPoints: SearchPoint[];
  countdown: number;
}

export type SearchStatus = 'pending' | 'searching' | 'searched';
