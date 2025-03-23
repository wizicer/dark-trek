// use dep::std::convert::TryInto;
// use dep::std::array;
// use dep::mimc::mimc;
// use dep::std::assert;

fn main(positions: [Field; 9], commitment: pub Field, duration: pub Field, pk: pub Field, salt: pub Field, target_occupied: pub Field, mimc_round: pub u32, map_width: pub u32) -> pub Output {
    let mut point_length: u64 = 0;
    // check the positions are correct
    for i in 0..8 {
        if is_zero(positions[i]) {
            assert(is_zero(positions[i + 1]))
        }
    }

    for i in 0..9 {
        if !is_zero(positions[i]) {
            point_length += 1;
        }
    }

    // ------------------------------------------------------------------------------
    // concatenate the salt and pk into positions

    // convert the positions to bits
    let mut positions_bits = [[0; 64]; 9];
    for i in 0..9 {
        positions_bits[i] = num_to_bits(positions[i], 64);
    }

    // convert the pk and salt to bits
    let pk_bits = num_to_bits(pk, 160);
    let salt_bits = num_to_bits(salt, 32);

    // concatenate the salt and pk into positions
    let mut positions_concat = [[0; 254]; 9];
    for i in 0..9 {
        for j in 0..64 {
            positions_concat[i][j] = positions_bits[i][j];
        }
        for j in 0..160 {
            positions_concat[i][j + 64] = pk_bits[j];
        }
        for j in 0..30 {
            positions_concat[i][j + 224] = salt_bits[j];
        }
    }

    // convert the positions_concat to num
    let mut positions_num = [0; 9];
    for i in 0..9 {
        positions_num[i] = bits_to_num(positions_concat[i]);
    }

    // ------------------------------------------------------------------------------
    // griffin permutation
    let position_griffin = griffin_permutation(positions_num);


    // ------------------------------------------------------------------------------
    // get MiMC hash
    let mut mimc_hash = [0; 9];
    // for i in 0..9 {
    //     // mimc_hash[i] = mimc(position_griffin[i], salt, mimc_round);
    // }

    // ------------------------------------------------------------------------------
    // convert the mimc_hash to bits
    let mut mimc_hash_bits = [[0; 8]; 9];
    // for i in 0..9 {
    //     let num = mimc_hash[i] as u64;
    //     // mimc_hash_bits[i] = num_to_bits(num, 8);
    // }

    let position_hash = positions[0];
    let energy = positions[1];

    let output = Output {
        position_hash: position_hash,
        energy: energy,
    };
    output
}

struct Output {
    position_hash: Field,
    energy: Field,
}

fn is_zero(x: Field) -> bool {
    x == 0
}

fn bits_to_num(bits: [u1; 254]) -> Field {
    let mut num = 0;
    let mut multiplier = 1;
    
    for i in 0..254 {
        num = num + (bits[i] as Field) * multiplier;
        multiplier = multiplier * 2;
    }
    
    num
}


fn num_to_bits(num: Field, len: u32) -> [u1; 64] {
    let mut bits = [0; 64];
    let mut temp = num;
    
    for i in 0..len {
        bits[i as u32] = ((temp as u64) % 2) as u1;
        temp = temp / 2;
    }

    bits
}

// griffin permutation
fn griffin_permutation(positions_num: [Field; 9]) -> [Field; 9] {
    let mut position_griffin = [0; 9];

    for i in 0..9 {
        position_griffin[i] = positions_num[i];
    }

    position_griffin
}

#[test]
fn test_main() {

}