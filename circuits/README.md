## Dark Route Circuit Design

## Circuit Constraints

**Reveal Circuit Inputs and Outputs**

Circuit inputs:
- private positions[]: Private input representing a path, containing all points traversed in one journey.
- public commitment: A commitment to the path, a `uint256` value
- public duration: Time elapsed since departing from starting point $p_0$
- public pk: Public key of the commitment creator
- public salt: Salt used in hashing
- public target_occupied: Indicates if the destination is the player's own planet. If true, no waiting cost at destination; if false, waiting cost applies

Circuit outputs:
- position_hash: Hash value of the committer's position after the specified duration
- energy (remaining): Total energy consumed after the specified duration

Circuit parameters:
- `POINT_NUM`: Length of positions[] array
- `MAP_WIDTH`: Width of the map

**Circuit Constraints**
1. The commitment calculated from positions matches the input commitment
2. Points in positions array form a connected path
3. Output position_hash is correctly calculated based on duration
4. Energy is calculated based on duration/target_occupied

### TODO

- [ ] Extend implementation with VDF slot scheme

### Constraining positions and commitment

The circuit calculates a commitment from positions and constrains it to match the input commitment.

![](/discussions/dark-route-circuit-commitment.svg)

`positions[i]` concatenated with `pk` and `salt` calculation:
- `positions[i]`: 64 bits
- `pk`: 160 bits
- `salt`: 32 bits
The concatenated result `concatenate[i] = positions[i]||pk||salt` is 256 bits.

### Constraining positions

private positions[] represents a committed path of position coordinates from point A to B, containing all coordinates traversed in one journey.

$$
p_0 \rightarrow p_1 \rightarrow \ldots \rightarrow p_{n-1}
$$

Must constrain that consecutive points are adjacent.

### Output position_hash

The output position_hash is calculated based on duration and the length of input positions.

If `duration < len(positions) - 1`, indicating the army hasn't reached its destination, outputs the hash value of the intermediate path point `a[duration]`.

![](/discussions/dark-route-circuit-position-hash.svg)

If `duration >= len(positions) - 1`, indicating the army has reached its destination, outputs the hash value $a_{n-1}$ of the final point $p_{n-1}$.

![](/discussions/dark-route-circuit-position-hash2.svg)

### Output energy

Two cases:
- duration <= len(positions): energy = duration * 10
- duration > len(positions): len(positions) * 10 + **occupied** ? 0 : (duration - len(positions)) * 1

Below is an example of energy output.

![](/discussions/dark-route-circuit-route.svg)



## References

Griffin

- Griffin algorithm paper: [Horst](https://eprint.iacr.org/2022/403.pdf)

Bloom filter algorithm:

- [Bloom Filter Basic Principles, Typical Applications and Engineering Implementation](https://zhuanlan.zhihu.com/p/559058600)
- zk bloom filter implementation, arkworks rust library: [GitHub - Tetration-Lab/arkworks-zk-filter](https://github.com/Tetration-Lab/arkworks-zk-filter/tree/master)
- bloom circom partial implementation: [bloom-circom/circuits/v3\_flag\_propagation/bloom.circom at main · gufett0/bloom-circom · GitHub](https://github.com/gufett0/bloom-circom/blob/main/circuits/v3_flag_propagation/bloom.circom)

Hash:

- circom hash library implementation: [GitHub - bkomuves/hash-circuits: Hashing circuits implemented in circom](https://github.com/bkomuves/hash-circuits)
- circomlib official library: [GitHub - iden3/circomlib: Library of basic circuits for circom](https://github.com/iden3/circomlib)
- mimc rust implementation: [GitHub - arnaucube/mimc-rs: MiMC hash function](https://github.com/arnaucube/mimc-rs)