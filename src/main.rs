use ark_bn254::Fr;
use ark_ff::{Field, PrimeField, SquareRootField};
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
            // Generate a random field element
            let x = Fr::rand(&mut ark_std::test_rng());
            
            // Benchmark square root calculation
            let start = Instant::now();
            let mut result = x;
            
            for _ in 0..iter {
                // Calculate square root
                result = result.sqrt().unwrap();
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
        // Use a fixed value (2 as a field element)
        let mut x = Fr::from(2u64);
        
        let start = Instant::now();
        
        for _ in 0..fixed_iterations {
            x = x.sqrt().unwrap();
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
