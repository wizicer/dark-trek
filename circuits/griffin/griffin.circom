pragma circom 2.1.8;

include "griffin_perm.circom";

template GriffinPermutation(N) {
    signal input inp[N];
    signal output out[N];

    signal aux[N + 2];
    for (var i = 0; i < N - 2; i+=3) {
        aux[i] <== inp[i];
        aux[i+1] <== inp[i+1];
        aux[i+2] <== inp[i+2];
    }
    aux[N] <== 0;
    aux[N+1] <== 0;

    component perm[N + 2];
    signal aux_output[N + 2];
    for (var i = 0; i < N; i += 3) {
        perm[i] = Permutation();
        perm[i].inp[0] <== aux[i];
        perm[i].inp[1] <== aux[i+1];
        perm[i].inp[2] <== aux[i+2];
        aux_output[i] <== perm[i].out[0];
        aux_output[i+1] <== perm[i].out[1];
        aux_output[i+2] <== perm[i].out[2];
    }

    for (var i = 0; i < N; i++) {
        out[i] <== aux_output[i];
    }
}
