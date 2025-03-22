pragma circom 2.1.8;

include "../node_modules/circomlib/circuits/bitify.circom";
include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib/circuits/mimc.circom";
include "../node_modules/circomlib/circuits/switcher.circom";
include "./griffin/griffin.circom";
include "./utils/utils.circom";

// reveal circuits
template Reveal(POINT_NUM, MAP_WIDTH, MIMC_ROUND) {
    // private input
    signal input positions[POINT_NUM];

    // public input
    signal input commitment;
    signal input duration;
    signal input pk; // publik key
    signal input salt;
    signal input target_occupied; // should be a bit

    signal output position_hash;
    signal output energy;

    // ------------------------------------------------------------------------------
    // 1. verify that the commitment is valid and corresponds to the positions
    // ------------------------------------------------------------------------------

    // ------------------------------------------------------------------------------
    // concatenate the salt and pk into positions

    // convert the positions to bits
    component num2Bits_positions[POINT_NUM];
    signal positions_bits[POINT_NUM][64];
    for (var i = 0; i < POINT_NUM; i++){
        num2Bits_positions[i] = Num2Bits(64);
        num2Bits_positions[i].in <== positions[i];
        num2Bits_positions[i].out ==> positions_bits[i];
    }

    // convert the pk and salt to bits
    component num2Bits_pk = Num2Bits(160);
    component num2Bits_salt = Num2Bits(32);
    signal pk_bits[160];
    signal salt_bits[32];
    num2Bits_pk.in <== pk;
    num2Bits_pk.out ==> pk_bits;
    num2Bits_salt.in <== salt;
    num2Bits_salt.out ==> salt_bits;

    // concatenate the salt and pk into positions
    signal positions_concat[POINT_NUM][256];
    for (var i = 0; i < POINT_NUM; i++){
        for (var j = 0; j < 64; j++){
            positions_concat[i][j] <== positions_bits[i][j];
        }
        for (var j = 0; j < 160; j++){
            positions_concat[i][j + 64] <== pk_bits[j];
        }
        for (var j = 0; j < 32; j++){
            positions_concat[i][j + 224] <== salt_bits[j];
        }
    }

    // convert the positions_concat to num
    component bits2num_positions[POINT_NUM];
    signal positions_num[POINT_NUM];
    for (var i = 0; i < POINT_NUM; i++){
        bits2num_positions[i] = Bits2Num(256);
        bits2num_positions[i].in <== positions_concat[i];
        bits2num_positions[i].out ==> positions_num[i];
        log("positions_num[i]", positions_num[i]);
    }
   
    // ------------------------------------------------------------------------------
    // griffin permutation
    component griffin_perm = GriffinPermutation(POINT_NUM); 
    signal position_griffin[POINT_NUM];
    griffin_perm.inp <== positions_num;
    griffin_perm.out ==> position_griffin;

    // ------------------------------------------------------------------------------
    // get mimc hash
    component mimc[MIMC_ROUND][POINT_NUM];
    component num_truncate_bits[MIMC_ROUND][POINT_NUM];
    component bits_to_num[MIMC_ROUND][POINT_NUM];
    signal mimc_hash[POINT_NUM][MIMC_ROUND];
    signal hash_to_bits[MIMC_ROUND][POINT_NUM][8];
    signal bits_to_index[MIMC_ROUND][POINT_NUM];

    //// for test
    // var test_compute_bit_array[256];
    // for (var i = 0; i < 256; i++){
    //     test_compute_bit_array[i] = 0;
    // }

    for (var i = 0; i < POINT_NUM; i++){
        mimc[0][i] = MiMC7(91);
        mimc[0][i].x_in <== position_griffin[i];
        mimc[0][i].k <== salt;
        mimc[0][i].out ==> mimc_hash[i][0];

        // transform hash to bits
        // take the first 8 bits from the hash
        num_truncate_bits[0][i] = NumTruncateBits(8);
        num_truncate_bits[0][i].in <== mimc_hash[i][0];
        num_truncate_bits[0][i].out ==> hash_to_bits[0][i];
    
        // transform bits to index
        bits_to_num[0][i] = Bits2Num(8);
        bits_to_num[0][i].in <== hash_to_bits[0][i];
        bits_to_num[0][i].out ==> bits_to_index[0][i];

        // test_compute_bit_array[bits_to_index[0][i]] = 1;
    }

    for (var round = 1; round < MIMC_ROUND; round++){
        for (var i = 0; i < POINT_NUM; i++){
            mimc[round][i] = MiMC7(91);
            mimc[round][i].x_in <== position_griffin[i];
            mimc[round][i].k <== mimc_hash[i][round - 1];
            mimc[round][i].out ==> mimc_hash[i][round];

            // transform hash to bits
            // take the first 8 bits from the hash
            num_truncate_bits[round][i] = NumTruncateBits(8);
            num_truncate_bits[round][i].in <== mimc_hash[i][round];
            num_truncate_bits[round][i].out ==> hash_to_bits[round][i];
        
            // transform bits to index
            bits_to_num[round][i] = Bits2Num(8);
            bits_to_num[round][i].in <== hash_to_bits[round][i];
            bits_to_num[round][i].out ==> bits_to_index[round][i];

            // for test
            // test_compute_bit_array[bits_to_index[round][i]] = 1;
        }
    }

    // // ------------------------------------------------------------------------------
    // // for test
    // var test_compute_bit_array_num = 0;
    // var e2 = 1;
    // for (var i = 0; i<256; i++) {
    //     test_compute_bit_array_num += test_compute_bit_array[i] * e2;
    //     e2 = e2 + e2;
    // }
    // log("test_compute_bit_array_num", test_compute_bit_array_num);
    // // ------------------------------------------------------------------------------   

    // check the bits_to_index is corresponding to the commitment
    signal acc_bits_to_index[256][MIMC_ROUND][POINT_NUM + 1];
    signal acc_bits_to_index_temp[256][MIMC_ROUND][POINT_NUM];
    signal bit_array[256];
    signal bit_array_temp[256][MIMC_ROUND + 1];
    signal bit_array_is_zero[256];

    for (var i = 0; i < 256; i++) {
        bit_array_temp[i][0] <== 0;
        for (var round = 0; round < MIMC_ROUND; round++) {
            acc_bits_to_index[i][round][0] <== 0;
            for (var j = 0; j < POINT_NUM; j++) {
                acc_bits_to_index_temp[i][round][j] <== IsZero()(i - bits_to_index[round][j]);
                acc_bits_to_index[i][round][j + 1] <== acc_bits_to_index[i][round][j] + acc_bits_to_index_temp[i][round][j];
            }
            bit_array_temp[i][round + 1] <== bit_array_temp[i][round] + acc_bits_to_index[i][round][POINT_NUM];
        }
        bit_array_is_zero[i] <== IsZero()(bit_array_temp[i][MIMC_ROUND]);
        bit_array[i] <== 1 - bit_array_is_zero[i];
        // log("i:", i);
        // log("bit_array[i]", bit_array[i]);
    }

    signal bit_array_num;
    component bits2num = Bits2Num(256);
    bits2num.in <== bit_array;
    bits2num.out ==> bit_array_num;
    log("bit_array_num", bit_array_num);
    log("commitment", commitment);
    // check if bit_array_num is equal to commitment
    signal result <== IsZero()(bit_array_num - commitment);
    result === 0;
    // bit_array_num === commitment;


    //------------------------------------------------------------------------------
    // 2. verify the position is valid
    //------------------------------------------------------------------------------
    signal accum_sum_path[POINT_NUM - 1][5];
    signal accum_sum_path_temp[POINT_NUM - 1][4];

    for (var i = 0; i < POINT_NUM - 1; i++){
        accum_sum_path[i][0] <== 0;
        
        accum_sum_path_temp[i][0] <== IsZero()(positions[i] - positions[i + 1] + 1);
        accum_sum_path[i][1] <== accum_sum_path[i][0] + accum_sum_path_temp[i][0];

        accum_sum_path_temp[i][1] <== IsZero()(positions[i] - positions[i + 1] - 1);
        accum_sum_path[i][2] <== accum_sum_path[i][1] + accum_sum_path_temp[i][1];

        accum_sum_path_temp[i][2] <== IsZero()(positions[i] - positions[i + 1] - MAP_WIDTH);
        accum_sum_path[i][3] <== accum_sum_path[i][2] + accum_sum_path_temp[i][2];

        accum_sum_path_temp[i][3] <== IsZero()(positions[i] - positions[i + 1] + MAP_WIDTH);
        accum_sum_path[i][4] <== accum_sum_path[i][3] + accum_sum_path_temp[i][3];

        accum_sum_path[i][4] === 1;
    }

    //------------------------------------------------------------------------------
    // 3. output the correct position hash
    //------------------------------------------------------------------------------
    signal duration_flag;
    component gt = GreaterEqThan(8);
    gt.in[0] <== duration;
    // path_length = POINT_NUM - 1
    gt.in[1] <== POINT_NUM - 1;
    gt.out ==> duration_flag;

    // make sure the index is valid
    signal index_left <== duration_flag * POINT_NUM;
    signal index_right <== (1 - duration_flag) * duration;
    signal index <== index_left + index_right;

    // component mimc_hash_temp = MiMC7(91);
    // mimc_hash_temp.x_in <== positions[index];
    // mimc_hash_temp.k <== pk;
    // mimc_hash_temp.out ==> position_hash;

    //------------------------------------------------------------------------------
    // 4. output the correct energy
    //------------------------------------------------------------------------------

    // target_occupied should be a bit
    (1 - target_occupied) * target_occupied === 0;
    signal occupied_energy <== (1 - target_occupied) * (duration - POINT_NUM + 1);
    // log("occupied_energy", occupied_energy);

    signal ten_duration <== 10 * duration;
    signal ten_path_length <== 10 * (POINT_NUM - 1);

    // path_length = POINT_NUM - 1
    // duration < path_length
    signal energy_left <== (1 - duration_flag) * ten_duration;
    // log("energy_left", energy_left);
    // duration >= path_length
    signal energy_right <== duration_flag * (ten_path_length + occupied_energy);
    // log("energy_right", energy_right);
    energy <== energy_left + energy_right;
    log("energy", energy);

}

component main {public [commitment, duration, pk, salt, target_occupied]} = Reveal(3, 4, 2);