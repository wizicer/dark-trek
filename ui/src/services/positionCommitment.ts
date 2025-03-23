import { bloom_filter, BloomFilterPathPoint } from "./commitment/bloomfilter";
import { MAP_WIDTH, MIMC_ROUND } from "./gameProof";

export function getCommitment(
  points: { x: number; y: number }[],
  salt: bigint,
  pk: bigint
): bigint {
  console.log("Points:", points);
  console.log("Salt:", salt);
  console.log("PK:", pk);
  const bf: BloomFilterPathPoint = {
    points: points,
    pk: pk,
    salt: salt,
    mapWidth: MAP_WIDTH,
    mmic_round: MIMC_ROUND,
  };

  return bloom_filter(bf);
}
