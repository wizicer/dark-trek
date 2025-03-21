use ark_bn254::Fr;
use ark_ff::Field;
use ark_std::UniformRand;
use std::time::{Duration, Instant};

fn main() {
    println!("BN128 Square Root Benchmark");
    println!("===========================");
    
    // Number of iterations for the benchmark
    let iterations = [1, 10, 100, 1000, 10000, 100000];
    
    // Number of runs for each iteration count (to get more stable results)
    let runs = 5;
    
    println!("Iterations | Total Time | Avg Time per Iteration");
    println!("-----------------------------------------------");
    
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
    
    // Additional test with a fixed value
    println!("\nBenchmark with fixed value:");
    println!("Iterations | Total Time | Avg Time per Iteration");
    println!("-----------------------------------------------");
    
    let fixed_iterations = 1000;
    let mut total_duration = Duration::new(0, 0);
    
    for _ in 0..runs {
        // Use a fixed value that we know has a square root (4 as a field element)
        let mut x = Fr::from(4u64);  // 4 = 2² so it has a square root
        
        let start = Instant::now();
        
        for _ in 0..fixed_iterations {
            x = x.sqrt().unwrap();
            // Ensure the next value has a square root
            x = x * x;
        }
        
        total_duration += start.elapsed();
    }
    
    // Calculate average duration across runs
    let avg_duration = total_duration / runs;
    let avg_per_iteration = avg_duration / fixed_iterations as u32;
    
    println!(
        "{:10} | {:10?} | {:10?} (fixed value)",
        fixed_iterations,
        avg_duration,
        avg_per_iteration
    );
}
