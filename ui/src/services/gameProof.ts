export const MAX_POINT_NUM = 20;
export const MAP_WIDTH = 20;
export const MIMC_ROUND = 2;

export interface RevealProof {
  position_hash: bigint;
  energy: bigint;
  a: [bigint, bigint];
  b: [[bigint, bigint], [bigint, bigint]];
  c: [bigint, bigint];
}

export async function getRevealProof(
  points: bigint[],
  commitment: bigint,
  duration: bigint,
  pk: bigint,
  salt: bigint,
  target_occupied: bigint
): Promise<RevealProof> {
  if (!window.snarkjs) {
    throw new Error("SnarkJS not found");
  }

  if (points.length > MAX_POINT_NUM)
    throw new Error(
      `Invalid points length, required no more than ${MAX_POINT_NUM} elements`
    );

  const positions = new Array(MAX_POINT_NUM)
    .fill(0n)
    .map((_, i) => (i >= points.length ? 0n : points[i]));

const debugObj = {
    positions,
    commitment,
    duration,
    pk,
    salt,
    target_occupied,
  };

  console.log("prove:", JSON.stringify(debugObj));

  const { proof, publicSignals } = await window.snarkjs.groth16.fullProve(
    {
      positions,
      commitment,
      duration,
      pk,
      salt,
      target_occupied,
    },

    "circuits/reveal.wasm",
    "circuits/reveal_final.zkey"
  );

  const ep = await window.snarkjs.groth16.exportSolidityCallData(
    proof,
    publicSignals
  );
  const eep = JSON.parse("[" + ep + "]");

  return {
    position_hash: eep[3][0],
    energy: eep[3][1],
    a: eep[0],
    b: eep[1],
    c: eep[2],
  };
}
