circom reveal.circom --r1cs --wasm --sym
node ./reveal_js/generate_witness.js ./reveal_js/reveal.wasm reveal_input.json ./reveal_js/witness.wtns


# snarkjs powersoftau new bn128 12 pot_01.ptau -v
# snarkjs powersoftau prepare phase2 pot_01.ptau pot_final.ptau -v
# snarkjs groth16 setup reveal.r1cs pot_final.ptau reveal_0000.zkey

# snarkjs groth16 prove reveal_0000.zkey ./reveal_js/witness.wtns ./proof/proof.json ./proof/public.json