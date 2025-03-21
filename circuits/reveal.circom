pragma circom 2.1.8;

include "../node_modules/circomlib/circuits/bitify.circom";
include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib/circuits/mimc.circom";
include "../node_modules/circomlib/circuits/switcher.circom";
include "./griffin/griffin.circom";

// reveal circuits
template Reveal(POINT_NUM) {
    // private input
    signal input positions[POINT_NUM][2];

    // public input
    signal input commitment;
    signal input duration;
    signal input pk; // publik key
    signal input salt;
    signal input target_occupied; // should be a bit

    signal output position_hash;
    signal output energy;

    // griffin permutation
    signal position_add_tmp[POINT_NUM];
    for (var i = 0; i < POINT_NUM; i++){
        position_add_tmp[i] <== positions[i][0] + positions[i][1];
    }

    signal position_griffin_tmp[POINT_NUM];
    component griffin_perm = GriffinPermutation(POINT_NUM);
    griffin_perm.inp <== position_add_tmp;
    griffin_perm.out ==> position_griffin_tmp;

    
    // verify the position is valid
    signal flag[POINT_NUM - 1][2];
    signal next_position_temp[POINT_NUM - 1][2][2];
    signal accum_next_position[POINT_NUM - 1][2];
    signal check_temp[POINT_NUM - 1][2];

    for (var i = 0; i < POINT_NUM - 1; i++){
        flag[i][0] <== IsZero()(positions[i][0]);
        flag[i][1] <== IsZero()(positions[i][1]);

        var accum_temp_0 = 0;
        var accum_temp_1 = 0;
        // x_{i + 1} = x_{i} + 1
        next_position_temp[i][0][0] <== IsZero()(positions[i + 1][0] - positions[i][0] - 1); 
        accum_temp_0 += next_position_temp[i][0][0];
        // x_{i + 1} = x_{i} - 1
        next_position_temp[i][0][1] <== IsZero()(positions[i + 1][0] - positions[i][0] + 1); 
        accum_temp_0 += next_position_temp[i][0][1];
        // y_{i + 1} = y_{i} + 1
        next_position_temp[i][1][0] <== IsZero()(positions[i + 1][1] - positions[i][1] - 1); 
        accum_temp_1 += next_position_temp[i][1][0];
        // y_{i + 1} = y_{i} - 1
        next_position_temp[i][1][1] <== IsZero()(positions[i + 1][1] - positions[i][1] + 1);
        accum_temp_1 += next_position_temp[i][1][1];

        accum_next_position[i][0] <== accum_temp_0;
        accum_next_position[i][1] <== accum_temp_1;

        // log("accum_next_position[i][0]:", accum_next_position[i][0]);
        // log(accum_next_position[i][1]);
        // log("accum_temp_0", accum_temp_0);
        // log(accum_temp_1);
        check_temp[i][0] <== (1 - flag[i][0]) * accum_next_position[i][0];
        check_temp[i][1] <== (1 - flag[i][1]) * accum_next_position[i][1];
        check_temp[i][0] + check_temp[i][1] === 1;

    }
}

component main {public [commitment,duration, pk, salt, target_occupied]} = Reveal(3);