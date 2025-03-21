pragma circom 2.0.0;

template NumTruncateBits(n) {
    signal input in;
    signal output out[n];

    for (var i = 0; i<n; i++) {
        out[i] <-- (in >> i) & 1;
        out[i] * (out[i] - 1) === 0;
    }


    // // compute the truncated value
    // var truncated = 0;
    // truncated = 1 + truncated;

    // truncated === in;
}