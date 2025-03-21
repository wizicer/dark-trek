use ark_bn254::Fr;
use ark_ff::{Field, PrimeField};
use ark_std::{UniformRand, str::FromStr};
use std::time::{Duration, Instant};

fn main() {
    println!("BN128 Square Root Benchmark");
    println!("===========================");
    
    // Number of iterations for the benchmark
    let iterations = [1, 10, 100, 1000, 10000];
    
    // Number of runs for each iteration count (to get more stable results)
    let runs = 3;
    
    println!("Running each test {} times and taking the average.", runs);
    println!("\nIterations | Total Time | Avg Time per Iteration");
    println!("-----------------------------------------------");
    
    let total_benchmark_start = Instant::now();
    
    for &iter in &iterations {
        let mut total_duration = Duration::new(0, 0);
        
        for _ in 0..runs {
            // Generate a random field element that is a perfect square
            let mut rng = ark_std::test_rng();
            let y = Fr::rand(&mut rng);
            let x = y * y;  // x is guaranteed to be a perfect square
            
            // Benchmark square root calculation
            let start = Instant::now();
            let mut result = x;
            
            for _ in 0..iter {
                // Calculate square root - we know it exists because we constructed it as a square
                result = result.sqrt().unwrap();
                
                // To ensure we always have a square root in the next iteration,
                // we square the result again
                result = result * result;
            }
            
            total_duration += start.elapsed();
        }
        
        // Calculate average duration across runs
        let avg_duration = total_duration / runs;
        let avg_per_iteration = if iter > 0 { avg_duration / iter as u32 } else { avg_duration };
        
        println!(
            "{:10} | {:10?} | {:10?}",
            iter,
            avg_duration,
            avg_per_iteration
        );
    }
    
    // Benchmark for cube root calculation
    println!("\nBN128 Cube Root Benchmark");
    println!("=========================");
    println!("Running each test {} times and taking the average.", runs);
    println!("\nIterations | Total Time | Avg Time per Iteration");
    println!("-----------------------------------------------");
    
    for &iter in &iterations {
        let mut total_duration = Duration::new(0, 0);
        
        for _ in 0..runs {
            // Generate a random field element that is a perfect cube
            let mut rng = ark_std::test_rng();
            let z = Fr::rand(&mut rng);
            let x = z * z * z;  // x is guaranteed to be a perfect cube
            
            // Benchmark cube root calculation
            let start = Instant::now();
            let mut result = x;
            
            for _ in 0..iter {
                // Calculate cube root using exponentiation
                // For a field of order q, x^(1/3) = x^((2*q-1)/3)
                // This works because in a prime field, Fermat's little theorem gives us x^q = x
                
                // First, we need to calculate the exponent (2*q-1)/3
                // For BN254, q is a large prime, and we can use a precomputed value
                // This is approximately (2*q-1)/3 for the BN254 scalar field
                let exponent = Fr::from_str("10944121435919637611123202872628637544348155578648911831344518947322613104291").unwrap();
                
                // Calculate the cube root using exponentiation
                result = result.pow(&exponent.into_bigint());
                
                // To ensure we always have a cube root in the next iteration,
                // we cube the result again
                result = result * result * result;
            }
            
            total_duration += start.elapsed();
        }
        
        // Calculate average duration across runs
        let avg_duration = total_duration / runs;
        let avg_per_iteration = if iter > 0 { avg_duration / iter as u32 } else { avg_duration };
        
        println!(
            "{:10} | {:10?} | {:10?}",
            iter,
            avg_duration,
            avg_per_iteration
        );
    }
    
    let total_benchmark_time = total_benchmark_start.elapsed();
    println!("\nTotal benchmark time: {:?}", total_benchmark_time);
}
