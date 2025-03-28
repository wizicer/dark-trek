# BN254 Cryptographic Operations Benchmark

> ⚠️ **WARNING**: Most of the code in this directory was generated by AI and has not been strictly audited. Do not use in production environments without proper review and verification.

This repository contains benchmarks for various cryptographic operations on the BN254 elliptic curve, which is commonly used in zero-knowledge proof systems.

## Operations Benchmarked

1. **Square Root Calculation**: Computing square roots in the BN254 finite field
2. **Cube Root Calculation**: Computing cube roots in the BN254 finite field
3. **MiMC Hash Calculation**: Computing MiMC hashes, a common primitive in ZK systems

## Benchmark Results

Each test was run 3 times and the average time was calculated.

Experiment Machine:
- CPU: Intel(R) Core(TM) i5-11600KF CPU @ 3.90GHz
- RAM: 32GB

### Square Root Calculation

| Iterations | Total Time | Avg Time per Iteration |
|------------|------------|------------------------|
| 1          | 115.99µs   | 115.99µs              |
| 10         | 996.991µs  | 99.699µs              |
| 100        | 10.035541ms| 100.355µs             |
| 1000       | 103.324155ms| 103.324µs            |
| 10000      | 1.030278691s| 103.027µs            |

### Cube Root Calculation

| Iterations | Total Time | Avg Time per Iteration |
|------------|------------|------------------------|
| 1          | 101.275µs  | 101.275µs             |
| 10         | 753.531µs  | 75.353µs              |
| 100        | 7.51678ms  | 75.167µs              |
| 1000       | 77.111969ms| 77.111µs              |
| 10000      | 753.681909ms| 75.368µs             |

### MiMC Hash Calculation

| Iterations | Total Time | Avg Time per Iteration |
|------------|------------|------------------------|
| 1          | 57.323µs   | 57.323µs              |
| 10         | 513.155µs  | 51.315µs              |
| 100        | 5.382088ms | 53.82µs               |
| 1000       | 53.872731ms| 53.872µs              |
| 10000      | 554.79917ms| 55.479µs              |

## Performance Analysis

### Why Cube Root is Faster than Square Root

The benchmark results show that cube root calculations (~75-101µs) are generally faster than square root calculations (~100-115µs) in the BN254 field. This might seem counterintuitive at first, but there are several reasons for this:

1. **Implementation Method**:
   - Square roots in finite fields are typically computed using the Tonelli-Shanks algorithm or variants, which involve multiple steps including finding quadratic residues.
   - Cube roots in our implementation are computed using a direct exponentiation method based on Fermat's Little Theorem: x^(1/3) = x^((2*q-1)/3) where q is the field order.

2. **Exponentiation Efficiency**:
   - The exponentiation algorithm used for cube roots (using a precomputed exponent) benefits from optimized big integer arithmetic and bit manipulation techniques.
   - The square root algorithm may involve more conditional branches and complex logic, which can be less efficient on modern processors.

3. **Field-Specific Properties**:
   - In the BN254 field, the specific structure of the field order may make the exponentiation approach for cube roots particularly efficient.
   - The square root calculation may require more intermediate operations due to the field's characteristics.

### MiMC Hash Performance

While the MiMC hash function shows the best raw computational performance (~51-57µs per operation) in our benchmarks, it's important to understand the tradeoff when used in zero-knowledge proof systems:

1. **Circuit Constraint Efficiency**: 
   - From a circuit constraint perspective, square root operations are significantly more efficient than MiMC hash.
   - A single square root operation typically requires only one constraint in a ZK circuit.
   - In contrast, a single MiMC hash with 91 rounds would require hundreds of constraints (at least one per round).

2. **Proving Time vs Computation Time**:
   - Although MiMC is faster to compute directly, this advantage is reversed when generating zero-knowledge proofs.
   - The large number of constraints in MiMC significantly increases proving time and verification complexity.
   - Square root operations, despite being computationally more expensive, lead to much smaller and more efficient proofs.

3. **Application-Specific Considerations**:
   - For direct computation (as in our benchmark), MiMC's simple operations are efficiently executed by CPUs.
   - For ZK proof generation, the constraint count becomes the dominant factor in performance.
   - The choice between these primitives should be guided by whether raw computation or proof generation is the priority.

This highlights an important principle in ZK system design: operations that are computationally efficient may not be constraint-efficient, and vice versa.

## Implementation Details

The implementations use the `ark-bn254` and `ark-ff` libraries for field arithmetic operations. The MiMC hash function is implemented according to the standard specification with 91 rounds, which is appropriate for the BN254 field.

## Usage

To run the benchmarks:

```bash
cargo run
```
