import { bloom_filter, BloomFilterPathPoint } from "./commitment/bloomfilter";
import { MAP_WIDTH, MIMC_ROUND } from "./gameProof";

export function getCommitment(
  points: { x: number; y: number }[],
  salt: bigint,
  pk: bigint
): bigint {
  const bf: BloomFilterPathPoint = {
    points: points,
    pk: pk,
    salt: salt,
    mapWidth: MAP_WIDTH,
    mmic_round: MIMC_ROUND,
  };

  return bloom_filter(bf);
}

export function getFullPointsFromKeyPoints(
  points: { x: number; y: number }[]
): { x: number; y: number }[] {
  // key:  (1, 1) -> (5, 5)
  // full: (1, 1) -> (2, 2) -> (3, 3) -> (4, 4) -> (5, 5)
  const fullPoints: { x: number; y: number }[] = [];
  
  if (points.length < 2) {
    return points;
  }

  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i];
    const end = points[i + 1];
    
    // Add the starting point
    fullPoints.push({ x: start.x, y: start.y });
    
    // Calculate direction and distance
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const steps = Math.max(Math.abs(dx), Math.abs(dy));
    
    // Skip if start and end are the same point
    if (steps === 0) continue;
    
    // Add intermediate points
    for (let step = 1; step < steps; step++) {
      fullPoints.push({
        x: Math.round(start.x + (dx * step) / steps),
        y: Math.round(start.y + (dy * step) / steps)
      });
    }
  }
  
  // Add the final point
  if (points.length > 0) {
    fullPoints.push({ x: points[points.length - 1].x, y: points[points.length - 1].y });
  }
  
  return fullPoints;
}

// test only code
export function testFullPoints() {
  {
    const points = [
      { x: 1, y: 1 },
      { x: 5, y: 5 },
    ];
    const fullPoints = getFullPointsFromKeyPoints(points);
    console.log("KEY", points);
    console.log("FULL", fullPoints);
  }

  {
    const points = [
      { x: 1, y: 1 },
      { x: 3, y: 1 },
      { x: 5, y: 3 },
    ];
    const fullPoints = getFullPointsFromKeyPoints(points);
    console.log("KEY", points);
    console.log("FULL", fullPoints);
  }
}
