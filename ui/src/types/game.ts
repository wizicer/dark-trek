export interface PlanetData {
  id: number;
  x: number;
  y: number;
  radius: number;
  energy: number;
  playerId?: number;
  satellites: {
    size: number;
    orbitRadius: number;
    orbitTilt: number;
    speed: number;
  }[];
}

export interface PathPoint {
  x: number;
  y: number;
}

export interface ArmyData {
  id: number;
  x: number;
  y: number;
  energy: number;
  commitment?: bigint;
  playerId: number;
  movingTo?: { x: number; y: number }[];
}

export function getPlayerColor(playerId: number) {
  if (playerId === 1) return 0xde4a80; // Red
  if (playerId === 2) return 0x225ec5; // Blue
  return 0x888888; // Grey
}