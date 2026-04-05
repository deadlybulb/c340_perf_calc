// @filename: landing_data.ts
// @description: Use POH landing data tables to perform landing data computations.
// @author:
// @date: 2025-09-18
// @version: 1.0

// Input for computing landing performance requires:
//    1. takeoff weight
//    2. pressure altitude
//    3. outside temperature

// We provide a few convenient mappings to simplify the computation of performance data.  Namely:
//   landing weight -> pressure altitude -> outside temperature -> performance entry

// We provide modification functions to adjust data values according:
//
//   - headwind component
//   - tailwind component
//   - flap setting
//   - runway surface type
//
// These adjustments are in the notes section of the tables in the POH.

class LandingPerformance {
    speed: number = 0;
    distance: number = 0;
}

export class NormalLandingData {
    vref: number = 0;
    groundRoll: number = 0;
    distanceToClearObstacle: number = 0;
}

const normalLandingGroundRollData = [
    [5990, [ 94, [
        [-20 , [  680,  710,  730,  760,  790,  820,  850,  880,  910,  950,  990 ]],
        [-10 , [  710,  730,  760,  790,  820,  850,  880,  920,  950,  990, 1030 ]],
        [0   , [  730,  760,  790,  820,  850,  880,  910,  950,  990, 1030, 1070 ]],
        [10  , [  760,  790,  820,  850,  880,  910,  950,  980, 1020, 1060, 1100 ]],
        [20  , [  790,  820,  850,  880,  910,  950,  980, 1020, 1060, 1100, 1140 ]],
        [30  , [  810,  840,  880,  910,  940,  980, 1010, 1050, 1090, 1140, 1180 ]],
        [40  , [  840,  870,  900,  940,  970, 1010, 1050, 1090, 1130, 1170, 1220 ]]
    ]]],
    [5500, [ 90, [
        [-20 , [  570,  590,  610,  630,  650,  680,  700,  730,  760,  790,  820 ]],
        [-10 , [  590,  610,  630,  650,  680,  700,  730,  760,  790,  820,  850 ]],
        [0   , [  610,  630,  650,  680,  700,  730,  760,  790,  820,  850,  880 ]],
        [10  , [  630,  650,  680,  700,  730,  760,  790,  820,  850,  880,  920 ]],
        [20  , [  650,  680,  700,  730,  760,  780,  810,  850,  880,  910,  950 ]],
        [30  , [  680,  700,  730,  750,  780,  810,  840,  870,  910,  940,  980 ]],
        [40  , [  700,  720,  750,  780,  810,  840,  870,  900,  940,  970, 1010 ]]
    ]]],
    [5000, [ 85, [
        [-20 , [  460,  480,  490,  510,  530,  550,  570,  590,  620,  640,  670 ]],
        [-10 , [  480,  490,  510,  530,  550,  570,  590,  620,  640,  670,  690 ]],
        [0   , [  500,  510,  530,  550,  570,  590,  620,  640,  660,  690,  720 ]],
        [10  , [  510,  530,  550,  570,  590,  620,  640,  660,  690,  720,  740 ]],
        [20  , [  530,  550,  570,  590,  610,  640,  660,  690,  710,  740,  770 ]],
        [30  , [  550,  570,  590,  610,  630,  660,  680,  710,  740,  770,  800 ]],
        [40  , [  570,  590,  610,  630,  660,  680,  710,  730,  760,  790,  820 ]]
    ]]],
    [4500, [ 81, [
        [-20 , [  370,  380,  390,  410,  420,  440,  450,  470,  490,  510,  530 ]],
        [-10 , [  380,  390,  410,  420,  440,  460,  470,  490,  510,  530,  550 ]],
        [0   , [  390,  410,  420,  440,  460,  470,  490,  510,  530,  550,  570 ]],
        [10  , [  410,  420,  440,  450,  470,  490,  510,  530,  550,  570,  590 ]],
        [20  , [  420,  440,  450,  470,  490,  510,  530,  550,  570,  590,  610 ]],
        [30  , [  440,  450,  470,  490,  500,  520,  540,  560,  590,  610,  630 ]],
        [40  , [  450,  470,  480,  500,  520,  540,  560,  580,  600,  630,  650 ]]
    ]]]
];

const normalLandingObstClearanceData = [
    [5990, [ 94, [
        [-20 , [ 1760, 1780, 1810, 1830, 1860, 1890, 1920, 1960, 1990, 2030, 2060 ]],
        [-10 , [ 1780, 1810, 1840, 1860, 1890, 1920, 1960, 1990, 2030, 2060, 2100 ]],
        [0   , [ 1810, 1840, 1860, 1890, 1920, 1960, 1990, 2020, 2060, 2100, 2140 ]],
        [10  , [ 1840, 1860, 1890, 1920, 1960, 1990, 2020, 2060, 2100, 2140, 2180 ]],
        [20  , [ 1860, 1890, 1920, 1950, 1990, 2020, 2060, 2090, 2130, 2170, 2220 ]],
        [30  , [ 1890, 1920, 1950, 1980, 2020, 2050, 2090, 2130, 2170, 2210, 2260 ]],
        [40  , [ 1920, 1950, 1980, 2010, 2050, 2080, 2120, 2160, 2210, 2250, 2300 ]]
    ]]],
    [5500, [ 90, [
        [-20 , [ 1640, 1660, 1680, 1700, 1730, 1750, 1780, 1810, 1830, 1860, 1890 ]],
        [-10 , [ 1660, 1680, 1710, 1730, 1750, 1780, 1810, 1830, 1860, 1890, 1930 ]],
        [0   , [ 1680, 1710, 1730, 1750, 1780, 1810, 1830, 1860, 1890, 1930, 1960 ]],
        [10  , [ 1710, 1730, 1750, 1780, 1810, 1830, 1860, 1890, 1920, 1960, 1990 ]],
        [20  , [ 1730, 1750, 1780, 1800, 1830, 1860, 1890, 1920, 1950, 1990, 2020 ]],
        [30  , [ 1750, 1780, 1800, 1830, 1860, 1890, 1920, 1950, 1980, 2020, 2060 ]],
        [40  , [ 1770, 1800, 1830, 1850, 1880, 1910, 1940, 1980, 2010, 2050, 2090 ]]
    ]]],
    [5000, [ 85, [
        [-20 , [ 1530, 1550, 1570, 1590, 1610, 1630, 1650, 1670, 1690, 1720, 1740 ]],
        [-10 , [ 1550, 1570, 1590, 1610, 1630, 1650, 1670, 1690, 1720, 1740, 1770 ]],
        [0   , [ 1570, 1590, 1610, 1630, 1650, 1670, 1690, 1720, 1740, 1770, 1790 ]],
        [10  , [ 1590, 1610, 1630, 1650, 1670, 1690, 1710, 1740, 1760, 1790, 1820 ]],
        [20  , [ 1610, 1630, 1650, 1670, 1690, 1710, 1740, 1760, 1790, 1820, 1840 ]],
        [30  , [ 1620, 1640, 1660, 1690, 1710, 1730, 1760, 1780, 1810, 1840, 1870 ]],
        [40  , [ 1640, 1660, 1680, 1710, 1730, 1760, 1780, 1810, 1840, 1870, 1900 ]]
    ]]],
    [4500, [ 81, [
        [-20 , [ 1440, 1450, 1470, 1480, 1500, 1510, 1530, 1550, 1560, 1580, 1600 ]],
        [-10 , [ 1450, 1470, 1480, 1500, 1510, 1530, 1550, 1570, 1580, 1600, 1620 ]],
        [0   , [ 1470, 1480, 1500, 1510, 1530, 1550, 1560, 1580, 1600, 1620, 1650 ]],
        [10  , [ 1480, 1500, 1510, 1530, 1550, 1560, 1580, 1600, 1620, 1640, 1670 ]],
        [20  , [ 1500, 1510, 1530, 1550, 1560, 1580, 1600, 1620, 1640, 1660, 1690 ]],
        [30  , [ 1510, 1530, 1540, 1560, 1580, 1600, 1620, 1640, 1660, 1680, 1710 ]],
        [40  , [ 1530, 1540, 1560, 1580, 1600, 1620, 1640, 1660, 1680, 1700, 1730 ]]
    ]]]
];

function findTempBound(srcData: any, temp : number, src_index : number) {
    let temp_list_len = srcData[0][1][1].length;
    let tbl_set = srcData[src_index][1][1];
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

function computeLandingPerformance(srcData : any, landing_weight : number, pressure_alt : number, temp: number) : LandingPerformance {
    const result = new LandingPerformance();

    // Find sources which bracket landing weight
    const source_len = srcData.length;
    let up_bound = srcData[0], up_bound_index = 0, dn_bound = srcData[source_len - 1], dn_bound_index = source_len - 1;
    for (let i = 0; i < source_len; i++) {
        if (srcData[i][0] >= landing_weight) {
            up_bound = srcData[i];
            up_bound_index = i;
        } else
            break;
    }
    for (let i = source_len - 1; i >= 0; i--) {
        if (srcData[i][0] <= landing_weight) {
            dn_bound = srcData[i];
            dn_bound_index = i;
        } else
            break;
    }

    // Find temp brackets for bounds
    let temp_results = findTempBound(srcData, temp, up_bound_index);
    // This is of the form [temp, [distances]]
    let up_uptemp_bound = temp_results[0], up_dntemp_bound = temp_results[1];
    temp_results = findTempBound(srcData, temp, dn_bound_index);
    // This is of the form [temp, [distances]]
    let dn_uptemp_bound = temp_results[0], dn_dntemp_bound = temp_results[1];

    // Altitude interpolation computation
    let lower_altitude = 0, upper_altitude = 10;
    for (let i = 0; i < 11; i++) {
        if (i * 1000 <= pressure_alt)
            lower_altitude = i;
        else
            break;
    }
    for (let i = 11; i >= 0; i--) {
        if (i * 1000 >= pressure_alt)
            upper_altitude = i;
        else
            break;
    }
    let altitude_ratio = (pressure_alt - (lower_altitude * 1000))/1000;
    console.log("[LP] Altitude ratio: " + altitude_ratio + " pressure alt: " + pressure_alt + " lower alt: " + lower_altitude + " upper alt: " + upper_altitude);

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

    // Compute this matrix (interpolate weight) and also interpolate vref speed
    // +--------------------------------------------+--------------------------------------------+
    // | lower temp, interp weight, interp altitude | upper temp, interp weight, interp altitude |
    // +--------------------------------------------+--------------------------------------------+
    let weight_ratio = up_bound[0] == dn_bound[0] ? 0 : (landing_weight - dn_bound[0])/(up_bound[0] - dn_bound[0]);
    console.log("[LP] Weight ratio: " + weight_ratio);
    let vref_speed = dn_bound[1][0] + weight_ratio * (up_bound[1][0] - dn_bound[1][0]);
    let weight_matrix = [];
    weight_matrix[0] = comp_mat[1][0] + weight_ratio * (comp_mat[0][0] - comp_mat[1][0]);
    weight_matrix[1] = comp_mat[1][1] + weight_ratio * (comp_mat[0][1] - comp_mat[1][1]);

    // Finally, interpolate temperature diff
    let temp_ratio = up_uptemp_bound[0] == up_dntemp_bound[0] ? 0 : (temp - up_dntemp_bound[0])/(up_uptemp_bound[0] - up_dntemp_bound[0]);
    console.log("[LP] Temp ratio: " + temp_ratio);

    result.speed = vref_speed;
    result.distance = weight_matrix[0] + temp_ratio * (weight_matrix[1] - weight_matrix[0]);
    return result;
}

// Return factor to multiply by landing distances based on headwind.
// A tailwind can be specified with a negative headwind value.
export function computeLandingHeadwindCorrection(headwind : number) : number {
    if (headwind == 0) return 1;
    if (headwind > 0) return 1 - (0.03 * headwind/4);
    // Note: same sign since this is a tailwind.
    return 1 - (0.08 * headwind/3);
}

// Return factor to multiply by landing distances based on surface type.
export function computeLandingSurfaceTypeCorrection(is_sod : boolean) : number {
    if (is_sod) return 1.25;
    return 1;
}

// Return factor to multiply by landing distances based on flap setting.
// By default, POH tables assume 45 degrees flaps which will return a factor of
// 1.0 from this function.
export function computeLandingFlapsDistanceCorrection(flaps : number) : number {
    switch (flaps) {
        case 0:
            return 1.35;
        case 15:
            return 1.24;
        case 30:
            return 1.12;
        default:
            return 1.0;
    }
}

// Return correction to add to vref speed based on flap setting.
// Be default, POH tables assume 45 degrees flaps which will return a correction
// of 0 from this function.
export function computeLandingFlapsVrefCorrection(flaps : number) : number {
    switch (flaps) {
        case 0:
            return 12;
        case 15:
            return 8;
        case 30:
            return 4;
        default:
            return 0;
    }
}

// Compute landing performance data.
export function computeLandingData(landing_weight : number, pressure_alt : number, temp: number) : NormalLandingData {
    const result = new NormalLandingData();
    const ground_roll = computeLandingPerformance(normalLandingGroundRollData, landing_weight, pressure_alt, temp);
    const obst_clear = computeLandingPerformance(normalLandingObstClearanceData, landing_weight, pressure_alt, temp);

    result.vref = ground_roll.speed;
    result.groundRoll = ground_roll.distance;
    result.distanceToClearObstacle = obst_clear.distance;

    return result;
}
