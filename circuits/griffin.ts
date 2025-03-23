// Griffin permutation implementation in TypeScript
// Import permutation function from griffin_perm.ts
// const { permutation } = require('./griffin_perm.ts');
import { permutation } from './griffin_perm';

function griffinPermutation(inp: bigint[], N: number): bigint[] {
    // Initialize auxiliary arrays
    const aux: bigint[] = new Array(N + 2);
    
    // Copy input values to aux array
    for (let i = 0; i < N - 2; i += 3) {
        aux[i] = inp[i];
        aux[i + 1] = inp[i + 1]; 
        aux[i + 2] = inp[i + 2];
    }
    aux[N] = 0n;
    aux[N + 1] = 0n;

    // Process permutations in groups of 3
    const aux_output: bigint[] = new Array(N + 2);
    for (let i = 0; i < N; i += 3) {
        const permInput = [aux[i], aux[i + 1], aux[i + 2]];
        const permOutput = permutation(permInput);
        aux_output[i] = permOutput[0];
        aux_output[i + 1] = permOutput[1];
        aux_output[i + 2] = permOutput[2];
    }

    // Copy to output array
    const out: bigint[] = new Array(N);
    for (let i = 0; i < N; i++) {
        out[i] = aux_output[i];
    }

    return out;
}

const P_bn128 = 21888242871839275222246405745257275088548364400416034343698204186575808495617n;

// Ensure input is within the finite field Fp
function ensureInField(x: bigint, p: bigint = P_bn128): bigint {
  // Handle negative numbers and ensure value is within field
  return ((x % p) + p) % p;
}

export { griffinPermutation };

// Test example for Griffin permutation
function testGriffinPermutation() {
    // Test case with N=6
    const testInput: bigint[] = [
      26959946667150639794667015087019630673637144422577465969251029352449n,
      26959946667150639794667015087019630673637144422577465969251029352450n,
      26959946667150639794667015087019630673637144422577465969251029352451n
    ];
    
    console.log("Test input:", testInput);
    
    const output = griffinPermutation(testInput, 3);
    
    console.log("Test output:", output);
    
    // Verify output length matches input
    if (output.length !== testInput.length) {
        throw new Error("Output length does not match input length");
    }
    
    console.log("Test completed successfully");
    return output;
}

// Run test
try {
    testGriffinPermutation();
} catch (error) {
    console.error("Test failed:", error);
}
