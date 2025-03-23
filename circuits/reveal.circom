pragma circom 2.1.8;

include "../node_modules/circomlib/circuits/bitify.circom";
include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib/circuits/mimc.circom";
include "../node_modules/circomlib/circuits/switcher.circom";
include "./griffin/griffin.circom";
include "./utils/utils.circom";
// include "./slot/slot.circom";

// reveal circuits
template Reveal(POINT_NUM, MAP_WIDTH, MIMC_ROUND) {
    // private input
    signal input positions[POINT_NUM];
    // signal input point_length; // valid point length

    // public input
    signal input commitment;
    signal input duration;
    signal input pk; // publik key
    signal input salt;
    signal input target_occupied; // should be a bit

    signal output position_hash;
    signal output energy;

    // generate the positions selector
    signal positions_mask[POINT_NUM];
    signal positions_mask_temp[POINT_NUM];
    for (var i = 0; i < POINT_NUM; i++){
        positions_mask_temp[i] <== IsZero()(positions[i]);
        positions_mask[i] <== 1 - positions_mask_temp[i];
    }

    // verfiy positions_mask is valid
    signal accumPositionsMaskZero[POINT_NUM];
    accumPositionsMaskZero[0] <== 0;
    positions_mask[0] === 1; // constraint the first element is 1
    for (var i = 1; i < POINT_NUM; i++) {
        // // constraint every element is zero or one
        // positions_mask[i] * (1 - positions_mask[i]) === 0;

        // avoid [... 0 1 ...]
        accumPositionsMaskZero[i] <== accumPositionsMaskZero[i - 1] + (1 - positions_mask[i - 1]) * positions_mask[i];
    }
    accumPositionsMaskZero[POINT_NUM - 1] === 0;

    // verifiy the point_length is valid
    signal accum_point_length[POINT_NUM + 1];
    accum_point_length[0] <== 0;
    for (var i = 0; i < POINT_NUM; i++){
        accum_point_length[i + 1] <== accum_point_length[i] + positions_mask[i];
    }
    var point_length = accum_point_length[POINT_NUM];
    // accum_point_length[POINT_NUM] === point_length;


    // // get valid positions
    // signal valid_positions[POINT_NUM];
    // for (var i = 0; i < POINT_NUM; i++){
    //     valid_positions[i] <== positions[i];
    // }

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
    signal positions_concat[POINT_NUM][254];
    for (var i = 0; i < POINT_NUM; i++){
        for (var j = 0; j < 64; j++){
            positions_concat[i][j] <== positions_mask[i] * positions_bits[i][j];
        }
        for (var j = 0; j < 160; j++){
            positions_concat[i][j + 64] <== positions_mask[i] * pk_bits[j];
        }
        for (var j = 0; j < 30; j++){
            positions_concat[i][j + 224] <== positions_mask[i] * salt_bits[j];
        }
    }

    // convert the positions_concat to num
    component bits2num_positions[POINT_NUM];
    signal positions_num[POINT_NUM];
    for (var i = 0; i < POINT_NUM; i++){
        bits2num_positions[i] = Bits2Num(254);
        bits2num_positions[i].in <== positions_concat[i];
        bits2num_positions[i].out ==> positions_num[i];
        // log("positions_num[i]", positions_num[i]);
    }
   
    // ------------------------------------------------------------------------------
    // griffin permutation
    component griffin_perm = GriffinPermutation(POINT_NUM); 
    signal position_griffin[POINT_NUM];
    griffin_perm.inp <== positions_num;
    griffin_perm.out ==> position_griffin;

    // for (var i = 0; i < POINT_NUM; i++){
    //     log("position_griffin[i]", position_griffin[i]);
    // }

    // // ------------------------------------------------------------------------------
    // // test slot hash
    // component slot_test = slot();
    // signal slot_test_result;
    // slot_test.x <== -1;
    // slot_test.result ==> slot_test_result;
    // log("slot_test_result", slot_test_result);

    // // ------------------------------------------------------------------------------
    // // get slot hash
    // component slot[MIMC_ROUND][POINT_NUM];
    // component num_truncate_bits[MIMC_ROUND][POINT_NUM];
    // component bits_to_num[MIMC_ROUND][POINT_NUM];
    // signal slot_hash[POINT_NUM][MIMC_ROUND];
    // signal hash_to_bits[MIMC_ROUND][POINT_NUM][8];
    // signal bits_to_index[MIMC_ROUND][POINT_NUM];

    // for (var i = 0; i < POINT_NUM; i++){
    //     log("i", i);
    //     log("position_griffin[i]", position_griffin[i]);
    //     slot[0][i] = slot();
    //     slot[0][i].x <== position_griffin[i];
    //     slot[0][i].result ==> slot_hash[i][0];

    //     // transform hash to bits
    //     // take the first 8 bits from the hash
    //     num_truncate_bits[0][i] = NumTruncateBits(8);
    //     num_truncate_bits[0][i].in <== slot_hash[i][0];
    //     num_truncate_bits[0][i].out ==> hash_to_bits[0][i];
    
    //     // transform bits to index
    //     bits_to_num[0][i] = Bits2Num(8);
    //     bits_to_num[0][i].in <== hash_to_bits[0][i];
    //     bits_to_num[0][i].out ==> bits_to_index[0][i];

    //     // test_compute_bit_array[bits_to_index[0][i]] = 1;
    // }

    // for (var round = 1; round < MIMC_ROUND; round++){
    //     for (var i = 0; i < POINT_NUM; i++){
    //         slot[round][i] = slot();
    //         slot[round][i].x <== slot_hash[i][round - 1];
    //         slot[round][i].result ==> slot_hash[i][round];

    //         // transform hash to bits
    //         // take the first 8 bits from the hash
    //         num_truncate_bits[round][i] = NumTruncateBits(8);
    //         num_truncate_bits[round][i].in <== slot_hash[i][round];
    //         num_truncate_bits[round][i].out ==> hash_to_bits[round][i];

    //         // transform bits to index
    //         bits_to_num[round][i] = Bits2Num(8);
    //         bits_to_num[round][i].in <== hash_to_bits[round][i];
    //         bits_to_num[round][i].out ==> bits_to_index[round][i];

    //         // for test
    //         // test_compute_bit_array[bits_to_index[round][i]] = 1;
    //     }
    // }

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

        // log("bits_to_index[0][i]", bits_to_index[0][i]);

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

            // log("bits_to_index[round][i]", bits_to_index[round][i]);
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

    signal bits_to_index_zero[256][MIMC_ROUND][POINT_NUM];

    // signal bits_to_index_mask_left[MIMC_ROUND][POINT_NUM];
    // signal bits_to_index_mask_right[MIMC_ROUND][POINT_NUM];

    for (var i = 0; i < 256; i++) {
        bit_array_temp[i][0] <== 0;
        for (var round = 0; round < MIMC_ROUND; round++) {
            acc_bits_to_index[i][round][0] <== 0;
            for (var j = 0; j < POINT_NUM; j++) {
                bits_to_index_zero[i][round][j] <== IsZero()(i - bits_to_index[round][j]);
                acc_bits_to_index_temp[i][round][j] <== positions_mask[j] * bits_to_index_zero[i][round][j];

                // acc_bits_to_index_temp[i][round][j] <== IsZero()(i - bits_to_index[round][j]);
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
    // log("bit_array_num", bit_array_num - 21888242871839275222246405745257275088548364400416034343698204186575808495617);
    // check if bit_array_num is equal to commitment
    // signal result <== IsZero()(bit_array_num - commitment);
    // result === 0;
    bit_array_num === commitment;


    //------------------------------------------------------------------------------
    // 2. verify the position is valid
    //------------------------------------------------------------------------------
    signal accum_sum_path[POINT_NUM][5];
    // signal accum_sum_path_temp_temp[POINT_NUM - 1][4];
    signal accum_sum_path_temp[POINT_NUM][4];
    signal temp[POINT_NUM];
    signal temp_temp[POINT_NUM];

    signal length_temp[POINT_NUM];
    for (var i = 0; i < POINT_NUM; i++){
        length_temp[i] <== IsZero()(point_length - i - 1);
    }

    for (var i = 0; i < POINT_NUM - 1; i++){
        accum_sum_path[i][0] <== 0;

        // temp[i] <== IsZero()(point_length - i - 1);

        // accum_sum_path_temp_temp[i][0] <== IsZero()(positions[i] - positions[i + 1] + 1);
        accum_sum_path_temp[i][0] <== IsZero()(positions[i] - positions[i + 1] + 1);
        accum_sum_path[i][1] <== accum_sum_path[i][0] + accum_sum_path_temp[i][0];

        // accum_sum_path_temp_temp[i][1] <== IsZero()(positions[i] - positions[i + 1] - 1);
        accum_sum_path_temp[i][1] <== IsZero()(positions[i] - positions[i + 1] - 1);
        accum_sum_path[i][2] <== accum_sum_path[i][1] + accum_sum_path_temp[i][1];

        // accum_sum_path_temp_temp[i][2] <== IsZero()(positions[i] - positions[i + 1] - MAP_WIDTH);
        accum_sum_path_temp[i][2] <== IsZero()(positions[i] - positions[i + 1] - MAP_WIDTH);
        accum_sum_path[i][3] <== accum_sum_path[i][2] + accum_sum_path_temp[i][2];

        // accum_sum_path_temp_temp[i][3] <== IsZero()(positions[i] - positions[i + 1] + MAP_WIDTH);
        accum_sum_path_temp[i][3] <== IsZero()(positions[i] - positions[i + 1] + MAP_WIDTH);
        accum_sum_path[i][4] <== accum_sum_path[i][3] + accum_sum_path_temp[i][3];

        // log("i:", i);
        // log("length_temp[i]", length_temp[i]);
        temp_temp[i] <== (1 - length_temp[i]) * positions_mask[i];
        // log("temp_temp[i]", temp_temp[i]);
        // log("accum_sum_path[i][4]", accum_sum_path[i][4]);
        // log("positions_mask[i]", positions_mask[i]);
        accum_sum_path[i][4] === temp_temp[i];
        // positions_mask[i] * accum_sum_path[i][4] + 1 - positions_mask[i] === 1;
    }

    //------------------------------------------------------------------------------
    // 3. output the correct position hash
    //------------------------------------------------------------------------------
    
    // if duration < POINT_NUM - 1: duration_flag = 0
    // if duration >= POINT_NUM - 1: duration_flag = 1
    signal duration_flag;
    component gt = GreaterEqThan(8);
    gt.in[0] <== duration;
    // path_length = POINT_NUM - 1
    gt.in[1] <== point_length - 1;
    gt.out ==> duration_flag;

    // if duration < POINT_NUM - 1 : hash_duration = position_griffin[duration]
    signal hash_duration[POINT_NUM + 1];
    signal index_flag[POINT_NUM];
    hash_duration[0] <== 0;
    for (var i = 0; i < POINT_NUM; i++){
        index_flag[i] <== IsZero()(duration - i);
        hash_duration[i + 1] <== hash_duration[i] + index_flag[i] * position_griffin[i];
        // log("position_griffin[i]", position_griffin[i]);
    }
    signal hash_duration_temp <== hash_duration[POINT_NUM];

    // if duration < POINT_NUM - 1: position_hash =  position_griffin[duration]
    // if duration >= POINT_NUM - 1: position_hash =  position_griffin[POINT_NUM - 1]
    signal position_griffin_temp[POINT_NUM + 1];
    position_griffin_temp[0] <== 0;
    for (var i = 0; i < POINT_NUM; i++){
        position_griffin_temp[i + 1] <== position_griffin_temp[i] + length_temp[i] * position_griffin[i];
    }

    signal position_hash_left <== duration_flag * position_griffin_temp[POINT_NUM];  
    signal position_hash_right <== (1 - duration_flag) * hash_duration_temp;
    position_hash <== position_hash_left + position_hash_right;
    log("position_hash", position_hash);

    //------------------------------------------------------------------------------
    // 4. output the correct energy
    //------------------------------------------------------------------------------

    // target_occupied should be a bit
    (1 - target_occupied) * target_occupied === 0;
    signal occupied_energy <== (1 - target_occupied) * (duration - point_length + 1);
    // log("occupied_energy", occupied_energy);

    signal ten_duration <== 10 * duration;
    signal ten_path_length <== 10 * (point_length - 1);

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

component main {public [commitment, duration, pk, salt, target_occupied]} = Reveal(9, 20, 2);
