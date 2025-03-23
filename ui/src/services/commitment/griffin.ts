// Griffin permutation implementation in TypeScript
// Import permutation function from griffin_perm.ts
// const { permutation } = require('./griffin_perm.ts');
import { permutation } from './griffin_perm';

function griffinPermutation(inp: bigint[], N: number): bigint[] {
    // Initialize auxiliary arrays
    const aux: bigint[] = new Array(N + 2);

    for (let i = 0; i < N; i++) {
        aux[i] = inp[i];
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

export { griffinPermutation };