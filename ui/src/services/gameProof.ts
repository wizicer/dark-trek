export interface RevealProof {
  position_hash: bigint;
  energy: bigint;
  a: [bigint, bigint];
  b: [[bigint, bigint], [bigint, bigint]];
  c: [bigint, bigint];
}

export async function getRevealProof(
  positions: bigint[],
  commitment: bigint,
  duration: bigint,
  pk: bigint,
  salt: bigint,
  target_occupied: bigint,
): Promise<RevealProof> {
  if (!window.snarkjs) {
    throw new Error('SnarkJS not found');
  }

  const { proof, publicSignals } = await window.snarkjs.groth16.fullProve(
    {
      positions,
      commitment,
      duration,
      pk,
      salt,
      target_occupied,
    },

    'circuits/reveal.wasm',
    'circuits/reveal_final.zkey',
  );

  const ep = await window.snarkjs.groth16.exportSolidityCallData(
    proof,
    publicSignals,
  );
  const eep = JSON.parse('[' + ep + ']');

  return {
    position_hash: eep[3][0],
    energy: eep[3][1],
    a: eep[0],
    b: eep[1],
    c: eep[2],
  };
}
