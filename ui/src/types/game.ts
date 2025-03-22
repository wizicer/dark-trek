export interface PlanetData {
  id: number;
  x: number;
  y: number;
  radius: number;
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
  movingTo?: { x: number; y: number }[];
}
