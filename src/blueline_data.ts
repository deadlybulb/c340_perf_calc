// @filename: blueline_data.ts
// @description: Use POH single-engine data tables to compute blueline speed and rate of climb.
// @author:
// @date: 2025-09-18
// @version: 1.0

const bluelineSpeedData : any[] = [
    [5990, [100, 98, 97]],
    [5500, [ 97, 96, 95]],
    [5000, [ 95, 94, 93]],
    [4500, [ 93, 92, 91]]
];

const bluelineClimbData : any[] = [
    [5990, [
        [-40 , [ 600, 540, 480, 420, 380, 310, 250, 200, 140, 80, 40 ]],
        [-30 , [ 550, 490, 430, 370, 320, 260, 210, 160, 100, 50, 0 ]],
        [-20 , [ 500, 440, 380, 320, 270, 220, 160, 110, 60, 10, -30 ]],
        [-10 , [ 440, 390, 340, 280, 220, 180, 120, 70, 20, -20, -60 ]],
        [0   , [ 400, 340, 280, 230, 180, 130, 80, 30, -20, -60, -100 ]],
        [10  , [ 340, 290, 240, 180, 140, 80, 40, -10, -60, -100, -140 ]],
        [20  , [ 290, 240, 190, 140, 90, 40, 0, -50, -90, -130, -180 ]],
        [30  , [ 240, 190, 140, 90, 40, 0, -40, -90, -130, -170, -210 ]],
        [40  , [ 190, 140, 100, 40, 0, -50, -90, -130, -170, -200, -250 ]],
        [50  , [ 150, 100, 50, 0, -50, -80, -130, -170, -210, -240, -280 ]]
    ]],
    [5500, [
        [-40 , [  730, 660, 610, 540, 500, 440, 390, 330, 270, 210, 160 ]],
        [-30 , [  670, 610, 550, 500, 450, 390, 340, 280, 230, 180, 130 ]],
        [-20 , [  630, 560, 500, 450, 410, 350, 290, 240, 190, 140, 100 ]],
        [-10 , [  570, 500, 460, 410, 360, 310, 250, 200, 150, 110, 60 ]],
        [0   , [  500, 460, 400, 360, 310, 260, 210, 160, 110, 70, 20 ]],
        [10  , [  460, 410, 370, 300, 270, 220, 170, 120, 70, 30, -10 ]],
        [20  , [  410, 370, 310, 270, 220, 170, 120, 80, 30, 0, -50 ]],
        [30  , [  370, 320, 270, 220, 160, 130, 80, 40, 0, -30, -80 ]],
        [40  , [  310, 270, 230, 160, 130, 80, 40, 0, -40, -70, -120 ]],
        [50  , [  270, 230, 180, 130, 80, 40, 0, -40, -80, -100, -150]]
    ]],
    [5000, [
        [-40 , [ 850, 800, 740, 680, 640, 560, 500, 450, 390, 340, 290 ]],
        [-30 , [ 800, 750, 680, 630, 590, 510, 460, 400, 350, 300, 250 ]],
        [-20 , [ 740, 690, 630, 580, 540, 470, 410, 360, 310, 260, 220 ]],
        [-10 , [ 700, 640, 580, 540, 480, 430, 370, 320, 270, 230, 180 ]],
        [0   , [ 650, 600, 530, 490, 440, 380, 330, 280, 230, 190, 140 ]],
        [10  , [ 600, 550, 500, 440, 400, 340, 290, 240, 190, 150, 110 ]],
        [20  , [ 550, 500, 440, 400, 350, 290, 240, 200, 150, 110, 70 ]],
        [30  , [ 500, 450, 400, 340, 300, 250, 200, 160, 120, 80, 40 ]],
        [40  , [ 450, 400, 360, 290, 260, 200, 160, 120, 80, 40, 0 ]],
        [50  , [ 400, 360, 300, 260, 210, 160, 120, 80, 40, 10, -30 ]]
    ]],
    [4500, [
        [-40 , [ 960, 920, 870, 800, 760, 690, 630, 580, 520, 470, 420 ]],
        [-30 , [ 930, 880, 810, 760, 710, 640, 590, 530, 480, 430, 380 ]],
        [-20 , [ 880, 810, 750, 710, 660, 600, 540, 490, 440, 390, 350 ]],
        [-10 , [ 830, 760, 710, 670, 620, 560, 500, 450, 400, 360, 310 ]],
        [0   , [ 780, 730, 660, 620, 570, 510, 460, 410, 360, 320, 270 ]],
        [10  , [ 730, 680, 630, 560, 530, 470, 420, 370, 320, 280, 240 ]],
        [20  , [ 680, 630, 580, 530, 480, 420, 370, 330, 280, 240, 200 ]],
        [30  , [ 630, 580, 530, 480, 430, 380, 330, 290, 250, 210, 170 ]],
        [40  , [ 570, 540, 480, 420, 380, 330, 290, 250, 210, 170, 130 ]],
        [50  , [ 530, 480, 440, 380, 340, 290, 250, 210, 170, 140, 100 ]]
    ]]
];

export function computeBluelineSpeed(weight: number, pressure_altitude: number) : number {
    // Compute weight bracket.
    const src_length = bluelineSpeedData.length;
    let up_weight = 0, dn_weight = src_length - 1;
    for (let i = 0; i < src_length; i++) {
        if (bluelineSpeedData[i][0] >= weight)
            up_weight = i;
        else
            break;
    }
    for (let i = src_length - 1; i >= 0; i--) {
        if (bluelineSpeedData[i][0] <= weight)
            dn_weight = i;
        else
            break;
    }
    const weight_ratio = up_weight == dn_weight ? 0 : (weight - bluelineSpeedData[dn_weight][0]) / (bluelineSpeedData[up_weight][0] - bluelineSpeedData[dn_weight][0]);

    // Compute altitude brackets.
    let up_altitude = 2, dn_altitude = 0;
    for (let i = 2; i >= 0; i--) {
        if (i * 10000 >= pressure_altitude)
            up_altitude = i;
        else
            break;
    }
    for (let i = 0; i < 3; i++) {
        if (i * 10000 <= pressure_altitude)
            dn_altitude = i;
        else
            break;
    }
    const altitude_ratio = up_altitude == dn_altitude ? 0 : (pressure_altitude - (10000 * dn_altitude)) / (10000 * (up_altitude - dn_altitude));

    // Compute weight interpolated speeds, i.e.
    // +----------------------------------------+----------------------------------------+
    // | dn_altitude, weight interpolated speed | up_altitude, weight interpolated speed |
    // +----------------------------------------+----------------------------------------+
    let wt_mat = [];
    wt_mat[0] = bluelineSpeedData[dn_weight][1][dn_altitude] + weight_ratio * (bluelineSpeedData[up_weight][1][dn_altitude] - bluelineSpeedData[dn_weight][1][dn_altitude]);
    wt_mat[1] = bluelineSpeedData[dn_weight][1][up_altitude] + weight_ratio * (bluelineSpeedData[up_weight][1][up_altitude] - bluelineSpeedData[dn_weight][1][up_altitude]);

    // Compute and return altitude interpolated speed from the above matrix.
    return wt_mat[0] + altitude_ratio * (wt_mat[1] - wt_mat[0]);
}

function findTempBound(srcData: any, temp : number, src_index : number) {
    let temp_list_len = srcData[0][1].length;
    let tbl_set = srcData[src_index][1];
    let up_bound = tbl_set[temp_list_len - 1], dn_bound = tbl_set[0];

    // Find upper temp bound
    for (let i = temp_list_len - 1; i >= 0; i--) {
        if (tbl_set[i][0] >= temp)
            up_bound = tbl_set[i];
        else
            break;
    }

    // Find lower temp bound
    for (let i = 0; i < temp_list_len; i++) {
        if (tbl_set[i][0] <= temp)
            dn_bound = tbl_set[i];
        else
            break;
    }

    return [up_bound, dn_bound];
}

export function computeBluelineClimb(takeoff_weight : number, pressure_alt : number, temp: number) : number {

    // Find sources which bracket takeoff weight
    const source_len = bluelineClimbData.length;
    let up_bound = bluelineClimbData[0], up_bound_index = 0, dn_bound = bluelineClimbData[source_len - 1], dn_bound_index = source_len - 1;
    for (let i = 0; i < source_len; i++) {
        if (bluelineClimbData[i][0] >= takeoff_weight) {
            up_bound = bluelineClimbData[i];
            up_bound_index = i;
        } else
            break;
    }
    for (let i = source_len - 1; i >= 0; i--) {
        if (bluelineClimbData[i][0] <= takeoff_weight) {
            dn_bound = bluelineClimbData[i];
            dn_bound_index = i;
        } else
            break;
    }

    // Find temp brackets for bounds
    let temp_results = findTempBound(bluelineClimbData, temp, up_bound_index);
    // This is of the form [temp, [rates]]
    let up_uptemp_bound = temp_results[0], up_dntemp_bound = temp_results[1];
    temp_results = findTempBound(bluelineClimbData, temp, dn_bound_index);
    // This is of the form [temp, [rates]]
    let dn_uptemp_bound = temp_results[0], dn_dntemp_bound = temp_results[1];

    // Altitude interpolation computation
    let lower_altitude = 0, upper_altitude = 10;
    for (let i = 0; i < 11; i++) {
        if (i * 2000 <= pressure_alt)
            lower_altitude = i;
        else
            break;
    }
    for (let i = 11; i >= 0; i--) {
        if (i * 2000 >= pressure_alt)
            upper_altitude = i;
        else
            break;
    }
    let altitude_ratio = (pressure_alt - (lower_altitude * 2000))/2000;
    console.log("[BL] Altitude ratio: " + altitude_ratio + " pressure alt: " + pressure_alt + " lower alt: " + lower_altitude + " upper alt: " + upper_altitude);

    // Computing this matrix (pair of values in each cell)
    // +-------------------------------------------+-------------------------------------------+
    // | upper weight, lower temp, interp altitide | upper weight, upper temp, interp altitude |
    // +-------------------------------------------+-------------------------------------------+
    // | lower weight, lower temp, interp altitude | lower weight, upper temp, interp altitude |
    // +---------------------------------------------------------------------------------------+
    let comp_mat : number[][] = [[], []];
    comp_mat[0][0] = up_dntemp_bound[1][lower_altitude] + altitude_ratio * (up_dntemp_bound[1][upper_altitude] - up_dntemp_bound[1][lower_altitude]);
    comp_mat[0][1] = up_uptemp_bound[1][lower_altitude] + altitude_ratio * (up_uptemp_bound[1][upper_altitude] - up_uptemp_bound[1][lower_altitude]);
    comp_mat[1][0] = dn_dntemp_bound[1][lower_altitude] + altitude_ratio * (dn_dntemp_bound[1][upper_altitude] - dn_dntemp_bound[1][lower_altitude]);
    comp_mat[1][1] = dn_uptemp_bound[1][lower_altitude] + altitude_ratio * (dn_uptemp_bound[1][upper_altitude] - dn_uptemp_bound[1][lower_altitude]);

    // Compute this matrix (interpolate weight)
    // +--------------------------------------------+--------------------------------------------+
    // | lower temp, interp weight, interp altitude | upper temp, interp weight, interp altitude |
    // +--------------------------------------------+--------------------------------------------+
    let weight_ratio = up_bound[0] == dn_bound[0] ? 0 : (takeoff_weight - dn_bound[0])/(up_bound[0] - dn_bound[0]);
    console.log("[BL] Weight ratio: " + weight_ratio);
    let weight_matrix = [];
    weight_matrix[0] = comp_mat[1][0] + weight_ratio * (comp_mat[0][0] - comp_mat[1][0]);
    weight_matrix[1] = comp_mat[1][1] + weight_ratio * (comp_mat[0][1] - comp_mat[1][1]);

    // Finally, interpolate temperature diff
    let temp_ratio = up_uptemp_bound[0] == up_dntemp_bound[0] ? 0 : (temp - up_dntemp_bound[0])/(up_uptemp_bound[0] - up_dntemp_bound[0]);
    console.log("[BL] Temp ratio: " + temp_ratio);

    return weight_matrix[0] + temp_ratio * (weight_matrix[1] - weight_matrix[0]);
}

