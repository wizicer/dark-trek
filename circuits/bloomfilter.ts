// Import griffinPermutation from griffin.ts
import { griffinPermutation } from './griffin';
import { Mimc7 } from "scrypt-ts-lib";

// copy from ui/src/components/PathEditor.tsx
interface MyPoint {
    x: number;
    y: number;
}

interface BloomFilterPathPoint {
    points: MyPoint[];
    pk: bigint;
    salt: bigint;
    mapWidth: number;
    mmic_round: number;
}

// Convert array of BloomFilterPathPoint to array of bigint
function pathPoints2U64Array(pathPoints: MyPoint[], mapWidth: number): bigint[] {
    return pathPoints.map(point => PathPoint2U64(point, mapWidth));
}

// return a u64 number
function PathPoint2U64(pathPoint: MyPoint, mapWidth: number): bigint {
    return BigInt(pathPoint.x) + BigInt(pathPoint.y) * BigInt(mapWidth);
}


// Convert a number to binary array of specified length
function numToBits(num: bigint, length: number): number[] {
    const bits: number[] = new Array(length).fill(0);
    let temp = num;
    for (let i = 0; i < length && temp > 0n; i++) {
        bits[i] = Number(temp & 1n);
        temp = temp >> 1n;
    }
    return bits;
}

// Convert binary array back to number
function bitsToNum(bits: number[]): number {
    let num = 0;
    for (let i = bits.length - 1; i >= 0; i--) {
        num = (num << 1) + bits[i];
    }
    return num;
}

function bitsToBigNum(bits: number[]): bigint {
    let num = 0n;
    for (let i = bits.length - 1; i >= 0; i--) {
        num = (num << 1n) + BigInt(bits[i]); 
    }
    return num;
}


function getPositionsNum(positions: bigint[], pk: bigint, salt: bigint): bigint[] {
    // Convert positions to bits
    const positionsBits: number[][] = positions.map(pos => numToBits(pos, 64));
    
    // Convert pk and salt to bits
    const pkBits = numToBits(pk, 160);
    const saltBits = numToBits(salt, 32);
    
    // Concatenate bits for each position
    const positionsConcat: number[][] = positions.map((_pos, i) => {
        const concat = new Array(254).fill(0);
        
        // Copy position bits
        for (let j = 0; j < 64; j++) {
            concat[j] = positionsBits[i][j];
        }
        
        // Copy pk bits
        for (let j = 0; j < 160; j++) {
            concat[j + 64] = pkBits[j];
        }
        
        // Copy salt bits
        for (let j = 0; j < 30; j++) {
            concat[j + 224] = saltBits[j];
        }
        
        return concat;
    });
    
    // Convert concatenated bits back to numbers
    const positionsNum = positionsConcat.map(bits => bitsToBigNum(bits));
    console.log("positionsNum", positionsNum);
    
    return positionsNum;
}

function bloom_filter(bloom_filter: BloomFilterPathPoint): bigint {
    // First convert points to positions array
    const positions = pathPoints2U64Array(bloom_filter.points, bloom_filter.mapWidth);
    
    // Get pk and salt from first point (they should be same for all points)
    const pk = bloom_filter.pk;
    const salt = bloom_filter.salt;
    const POINT_NUM = bloom_filter.points.length;
    const MIMC_ROUND = bloom_filter.mmic_round;

    // Convert to position numbers using getPositionsNum
    let positions_num = getPositionsNum(positions, pk, salt);

    // Call griffinPermutation with the positions array length
    const griffin_output = griffinPermutation(positions_num, POINT_NUM);
    console.log("griffin_output", griffin_output);
    
    // Create 2D arrays to store hashes and indices
    const mimc_hash: bigint[][] = Array(POINT_NUM).fill(0).map(() => Array(MIMC_ROUND).fill(0n));
    const bits_to_index: number[][] = Array(MIMC_ROUND).fill(0).map(() => Array(POINT_NUM).fill(0));

    // First round of hashing
    for (let i = 0; i < POINT_NUM; i++) {
        // Calculate initial mimc hash using griffin output and salt
        mimc_hash[i][0] = Mimc7.hash(griffin_output[i], salt);
        
        // Get first 8 bits of hash for index
        const hashBits = numToBits(mimc_hash[i][0], 8);
        bits_to_index[0][i] = bitsToNum(hashBits);
    }

    // Subsequent rounds
    for (let round = 1; round < MIMC_ROUND; round++) {
        for (let i = 0; i < POINT_NUM; i++) {
            // Use previous round's hash as key
            mimc_hash[i][round] = Mimc7.hash(griffin_output[i], mimc_hash[i][round - 1]);
            
            // Get first 8 bits of hash for index
            const hashBits = numToBits(mimc_hash[i][round], 8);
            bits_to_index[round][i] = bitsToNum(hashBits);
        }
    }

    
    // Initialize bit array with zeros
    const bit_array = new Array(256).fill(0);

    // For each index i in bit_array
    for (let i = 0; i < 256; i++) {
        // For each round of hashing
        for (let round = 0; round < MIMC_ROUND; round++) {
            // For each point
            for (let j = 0; j < POINT_NUM; j++) {
                // If bits_to_index matches current index i, set bit to 1
                if (bits_to_index[round][j] === i) {
                    bit_array[i] = 1;
                }
            }
        }
    }

    let commitment = bitsToBigNum(bit_array);
    console.log("commitment", commitment);

    return  commitment;
}

// Test example for bloom filter
function testBloomFilter() {
    // Create test points
    const testPoints: BloomFilterPathPoint = {
        points: [{x: 1, y: 0}, {x: 2, y: 0}, {x: 3, y: 0}],
        pk: 2n,
        salt: 1n,
        mapWidth: 3,
        mmic_round: 2
    };

    // Create test bloom filter input
    const testInput: BloomFilterPathPoint = {
        points: testPoints.points,
        pk: testPoints.pk,
        salt: testPoints.salt, 
        mapWidth: testPoints.mapWidth,
        mmic_round: testPoints.mmic_round
    };

    console.log("Test input:", testInput);

    // Run bloom filter
    const output = bloom_filter(testInput);

    console.log("Test output:", output);

    // Verify output is bigint
    if (typeof output !== 'bigint') {
        throw new Error("Output should be bigint");
    }

    console.log("Test completed successfully");
    return output;
}

// Run test
try {
    testBloomFilter();
} catch (error) {
    console.error("Test failed:", error);
}

