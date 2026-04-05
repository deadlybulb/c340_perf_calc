// @filename: takeoff_data.ts
// @description: Use POH takeoff data tables to compute takeoff speeds and distances.
// @author:
// @date: 2025-09-18
// @version: 1.0


// Input for computing takeoff performance requires:
//    1. takeoff weight
//    2. pressure altitude
//    3. outside temperature

// We provide a few convenient mappings to simplify the computation of performance data.  Namely:
//   takeoff weight -> pressure altitude -> outside temperature -> performance entry

// We provide modification functions to adjust data values according to the headwind or tailwind component.
// These adjustments are in the notes section of the tables in the POH.

import { computeBluelineSpeed, computeBluelineClimb } from "./blueline_data.ts";

class TakeoffPerformance {
    speed: number = 0;
    distance: number = 0;
}

export class NormalTakeoffData {
    takeoffSpeed: number = 0;
    groundRoll: number = 0;
    distanceToClearObstacle: number = 0;
    accelerateStop: number = 0;
    accelerateGo: number = 0;
    blueLineSpeed: number = 0;
    blueLineClimb: number = 0;
}

// TODO: Add source data for max gross up to 6390

const normalTakeoffGroundRollData : any[] = [
    [5990, [ 91, [
        [-20 , [ 1190, 1260, 1340, 1420, 1510, 1610, 1710, 1850, 1970, 2100, 2240 ]],
        [-10 , [ 1300, 1380, 1470, 1560, 1650, 1760, 1910, 2030, 2160, 2300, 2460 ]],
        [0   , [ 1420, 1510, 1600, 1700, 1810, 1960, 2090, 2220, 2370, 2520, 2690 ]],
        [10  , [ 1550, 1650, 1750, 1860, 2020, 2150, 2280, 2430, 2590, 2760, 2950 ]],
        [20  , [ 1690, 1800, 1910, 2080, 2210, 2350, 2500, 2660, 2840, 3030, 3240 ]],
        [30  , [ 1850, 1960, 2140, 2270, 2420, 2570, 2740, 2920, 3120, 3330, 3560 ]],
        [40  , [ 2020, 2210, 2340, 2490, 2650, 2820, 3010, 3210, 3430, 3670, 3930 ]]
    ]]],
    [5500, [ 87, [
        [-20 , [  980, 1040, 1100, 1170, 1240, 1320, 1410, 1500, 1600, 1720, 1830 ]],
        [-10 , [ 1070, 1130, 1200, 1280, 1360, 1440, 1540, 1640, 1770, 1880, 2010 ]],
        [0   , [ 1160, 1230, 1310, 1390, 1480, 1570, 1680, 1810, 1930, 2060, 2200 ]],
        [10  , [ 1270, 1340, 1430, 1520, 1610, 1720, 1860, 1980, 2110, 2250, 2410 ]],
        [20  , [ 1380, 1470, 1560, 1660, 1760, 1910, 2040, 2170, 2310, 2470, 2630 ]],
        [30  , [ 1510, 1600, 1700, 1810, 1970, 2090, 2230, 2370, 2530, 2700, 2890 ]],
        [40  , [ 1640, 1750, 1860, 2020, 2150, 2290, 2440, 2600, 2780, 2970, 3170 ]]
    ]]],
    [5000, [ 82, [
        [-20 , [  790,  830,  880,  940, 1000, 1060, 1130, 1200, 1280, 1370, 1460 ]],
        [-10 , [  860,  910,  960, 1020, 1090, 1150, 1230, 1310, 1400, 1490, 1590 ]],
        [0   , [  930,  990, 1050, 1110, 1180, 1260, 1340, 1430, 1530, 1630, 1750 ]],
        [10  , [ 1010, 1070, 1140, 1210, 1290, 1370, 1460, 1560, 1660, 1800, 1920 ]],
        [20  , [ 1100, 1170, 1240, 1320, 1400, 1500, 1590, 1700, 1840, 1960, 2090 ]],
        [30  , [ 1200, 1270, 1350, 1440, 1530, 1630, 1740, 1890, 2010, 2140, 2290 ]],
        [40  , [ 1310, 1390, 1480, 1570, 1670, 1780, 1930, 2060, 2200, 2350, 2510 ]]
    ]]]
];

const normalTakeoffObstClearanceData : any[] = [
    [5990, [ 91, [
        [-20 , [ 1570, 1650, 1750, 1850, 1950, 2070, 2200, 2360, 2510, 2660, 2840 ]],
        [-10 , [ 1720, 1810, 1920, 2030, 2150, 2280, 2450, 2600, 2770, 2950, 3140 ]],
        [0   , [ 1890, 1990, 2110, 2230, 2370, 2550, 2710, 2880, 3070, 3280, 3500 ]],
        [10  , [ 2070, 2200, 2330, 2470, 2660, 2830, 3010, 3210, 3430, 3670, 3930 ]],
        [20  , [ 2290, 2430, 2580, 2790, 2970, 3160, 3370, 3600, 3860, 4150, 4470 ]],
        [30  , [ 2550, 2710, 2930, 3120, 3330, 3560, 3820, 4100, 4430, 4790, 5220 ]],
        [40  , [ 2860, 3110, 3310, 3540, 3800, 4090, 4420, 4800, 5240, 5770, 6440 ]]
    ]]],
    [5500, [ 87, [
        [-20 , [ 1290, 1350, 1430, 1510, 1600, 1690, 1790, 1900, 2020, 2160, 2300 ]],
        [-10 , [ 1400, 1480, 1560, 1650, 1750, 1850, 1960, 2080, 2240, 2380, 2530 ]],
        [0   , [ 1530, 1620, 1710, 1810, 1920, 2030, 2160, 2320, 2460, 2620, 2790 ]],
        [10  , [ 1680, 1770, 1880, 1990, 2110, 2240, 2410, 2560, 2720, 2900, 3100 ]],
        [20  , [ 1840, 1950, 2060, 2190, 2320, 2510, 2670, 2840, 3030, 3230, 3460 ]],
        [30  , [ 2030, 2150, 2280, 2420, 2620, 2790, 2970, 3170, 3390, 3630, 3900 ]],
        [40  , [ 2250, 2390, 2540, 2750, 2930, 3120, 3340, 3580, 3850, 4150, 4490 ]]
    ]]],
    [5000, [ 82, [
        [-20 , [ 1040, 1090, 1150, 1210, 1280, 1350, 1430, 1520, 1610, 1710, 1820 ]],
        [-10 , [ 1130, 1190, 1250, 1320, 1400, 1480, 1570, 1660, 1760, 1880, 2000 ]],
        [0   , [ 1230, 1290, 1370, 1440, 1530, 1620, 1710, 1820, 1930, 2060, 2200 ]],
        [10  , [ 1340, 1410, 1490, 1580, 1670, 1770, 1880, 1990, 2120, 2280, 2430 ]],
        [20  , [ 1460, 1540, 1630, 1730, 1830, 1940, 2060, 2190, 2360, 2510, 2680 ]],
        [30  , [ 1600, 1690, 1790, 1900, 2010, 2140, 2270, 2450, 2610, 2790, 2980 ]],
        [40  , [ 1760, 1860, 1970, 2090, 2220, 2370, 2560, 2730, 2910, 3110, 3340 ]]
    ]]]
];

const accelStopData = [
    [5990, [ 91, [
        [-20 , [ 2590, 2680, 2780, 2880, 2990, 3110, 3220, 3350, 3480, 3610, 3760 ]],
        [-10 , [ 2690, 2790, 2890, 3000, 3110, 3230, 3350, 3480, 3620, 3760, 3910 ]],
        [0   , [ 2790, 2890, 3000, 3110, 3230, 3350, 3480, 3610, 3750, 3900, 4050 ]],
        [10  , [ 2890, 3000, 3110, 3230, 3350, 3470, 3610, 3750, 3890, 4040, 4200 ]],
        [20  , [ 2990, 3100, 3220, 3340, 3460, 3600, 3730, 3880, 4030, 4190, 4350 ]],
        [30  , [ 3090, 3210, 3330, 3450, 3580, 3720, 3860, 4010, 4160, 4330, 4500 ]],
        [40  , [ 3200, 3310, 3440, 3570, 3700, 3840, 3990, 4140, 4300, 4470, 4650 ]]
    ]]],
    [5500, [ 87, [
        [-20 , [ 2140, 2220, 2310, 2390, 2480, 2580, 2670, 2780, 2880, 3000, 3110 ]],
        [-10 , [ 2230, 2310, 2400, 2490, 2580, 2680, 2780, 2890, 3000, 3110, 3240 ]],
        [0   , [ 2310, 2400, 2490, 2580, 2680, 2780, 2880, 3000, 3110, 3230, 3360 ]],
        [10  , [ 2400, 2490, 2580, 2670, 2770, 2880, 2990, 3100, 3230, 3350, 3480 ]],
        [20  , [ 2480, 2570, 2670, 2770, 2870, 2980, 3100, 3210, 3340, 3470, 3610 ]],
        [30  , [ 2570, 2660, 2760, 2860, 2970, 3080, 3200, 3320, 3450, 3590, 3730 ]],
        [40  , [ 2650, 2750, 2850, 2960, 3070, 3180, 3310, 3430, 3570, 3710, 3850 ]]
    ]]],
    [5000, [ 82, [
        [-20 , [ 1740, 1800, 1870, 1940, 2010, 2090, 2170, 2250, 2340, 2430, 2530 ]],
        [-10 , [ 1810, 1870, 1940, 2020, 2090, 2170, 2250, 2340, 2430, 2530, 2630 ]],
        [0   , [ 1880, 1950, 2020, 2090, 2170, 2250, 2340, 2430, 2520, 2620, 2730 ]],
        [10  , [ 1940, 2020, 2090, 2170, 2250, 2340, 2430, 2520, 2620, 2720, 2830 ]],
        [20  , [ 2010, 2090, 2160, 2250, 2330, 2420, 2510, 2610, 2710, 2810, 2920 ]],
        [30  , [ 2080, 2160, 2240, 2320, 2410, 2500, 2600, 2700, 2800, 2910, 3020 ]],
        [40  , [ 2150, 2230, 2310, 2400, 2490, 2580, 2680, 2780, 2890, 3010, 3120 ]]
    ]]]
];

const accelGoData = [
    [5990, [ 91, [
        [-20 , [ 2350,  2490,  2640,  2810,  3000,  3210,  3450,  3750,  4060,  4420,  4850 ]],
        [-10 , [ 2650,  2830,  3010,  3230,  3470,  3740,  4090,  4460,  4900,  5440,  6130 ]],
        [0   , [ 3040,  3260,  3510,  3790,  4120,  4540,  5000,  5580,  6320,  7340,  8830 ]],
        [10  , [ 3570,  3870,  4210,  4620,  5170,  5800,  6630,  7800,  9600, 12840,    -1 ]],
        [20  , [ 4360,  4810,  5370,  6140,  7120,  8560, 10940, 15770,    -1,    -1,    -1 ]],
        [30  , [ 5730,  6600,  7890,  9840, 13430,    -1,    -1,    -1,    -1,    -1,    -1 ]],
        [40  , [ 9100, 12160,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1 ]]
    ]]],
    [5500, [ 87, [
        [-20 , [ 1790,  1890,  1990,  2110,  2230,  2360,  2510,  2670,  2850,  3070,  3280 ]],
        [-10 , [ 1990,  2100,  2220,  2350,  2490,  2650,  2820,  3020,  3250,  3490,  3770 ]],
        [0   , [ 2210,  2340,  2480,  2640,  2810,  3000,  3210,  3480,  3750,  4060,  4420 ]],
        [10  , [ 2480,  2640,  2810,  3000,  3210,  3450,  3760,  4070,  4440,  4870,  5410 ]],
        [20  , [ 2830,  3020,  3240,  3480,  3760,  4120,  4500,  4960,  5520,  6240,  7210 ]],
        [30  , [ 3280,  3540,  3830,  4170,  4620,  5110,  5720,  6530,  7650,  9360, 12380 ]],
        [40  , [ 3940,  4310,  4750,  5350,  6050,  7010,  8400, 10670, 15250,    -1,    -1 ]]
    ]]],
    [5000, [ 82, [
        [-20 , [ 1380,  1450,  1530,  1610,  1700,  1790,  1890,  2000,  2120,  2250,  2400 ]],
        [-10 , [ 1510,  1590,  1680,  1770,  1860,  1970,  2090,  2210,  2350,  2500,  2670 ]],
        [0   , [ 1660,  1750,  1840,  1950,  2060,  2180,  2310,  2460,  2620,  2800,  3000 ]],
        [10  , [ 1830,  1930,  2040,  2160,  2290,  2430,  2580,  2750,  2940,  3170,  3400 ]],
        [20  , [ 2030,  2150,  2270,  2410,  2560,  2730,  2910,  3120,  3370,  3630,  3920 ]],
        [30  , [ 2270,  2400,  2550,  2720,  2900,  3110,  3340,  3620,  3920,  4260,  4660 ]],
        [40  , [ 2560,  2730,  2910,  3120,  3350,  3610,  3950,  4300,  4720,  5220,  5850 ]]
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

function computeTakeoffPerformance(srcData : any, takeoff_weight : number, pressure_alt : number, temp: number) : TakeoffPerformance {
    const result = new TakeoffPerformance();

    // Find sources which bracket takeoff weight
    const source_len = srcData.length;
    let up_bound = srcData[0], up_bound_index = 0, dn_bound = srcData[source_len - 1], dn_bound_index = source_len - 1;
    for (let i = 0; i < source_len; i++) {
        if (srcData[i][0] >= takeoff_weight) {
            up_bound = srcData[i];
            up_bound_index = i;
        } else
            break;
    }
    for (let i = source_len - 1; i >= 0; i--) {
        if (srcData[i][0] <= takeoff_weight) {
            dn_bound = srcData[i];
            dn_bound_index = i;
        } else
            break;
    }

    // Find temp brackets for bounds
    let temp_results = findTempBound(srcData, temp, up_bound_index);
    // This is of the form [temp, [distances]
    let up_uptemp_bound = temp_results[0], up_dntemp_bound = temp_results[1];
    temp_results = findTempBound(srcData, temp, dn_bound_index);
    // This is of the form [temp, [distances]
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
    console.log("Altitude ratio: " + altitude_ratio + " pressure alt: " + pressure_alt + " lower alt: " + lower_altitude + " upper alt: " + upper_altitude);

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

    // Compute this matrix (interpolate weight) and also interpolate takeoff speed
    // +--------------------------------------------+--------------------------------------------+
    // | lower temp, interp weight, interp altitude | upper temp, interp weight, interp altitude |
    // +--------------------------------------------+--------------------------------------------+
    let weight_ratio = up_bound[0] == dn_bound[0] ? 0 : (takeoff_weight - dn_bound[0])/(up_bound[0] - dn_bound[0]);
    console.log("Weight ratio: " + weight_ratio);
    let takeoff_speed = dn_bound[1][0] + weight_ratio * (up_bound[1][0] - dn_bound[1][0]);
    let weight_matrix = [];
    weight_matrix[0] = comp_mat[1][0] + weight_ratio * (comp_mat[0][0] - comp_mat[1][0]);
    weight_matrix[1] = comp_mat[1][1] + weight_ratio * (comp_mat[0][1] - comp_mat[1][1]);

    // Finally, interpolate temperature diff
    let temp_ratio = up_uptemp_bound[0] == up_dntemp_bound[0] ? 0 : (temp - up_dntemp_bound[0])/(up_uptemp_bound[0] - up_dntemp_bound[0]);
    console.log("Temp ratio: " + temp_ratio);

    result.speed = takeoff_speed;
    result.distance = weight_matrix[0] + temp_ratio * (weight_matrix[1] - weight_matrix[0]);
    return result;
}


// Return factor to multiply by takeoff distances based on headwind.
// A tailwind can be specified with a negative headwind value.
export function computeTakeoffHeadwindCorrection(headwind : number) : number {
    if (headwind == 0) return 1;
    if (headwind > 0) return 1 - (0.07 * headwind/10);
    // Note: same sign since this is a tailwind.
    return 1 - (0.05 * headwind/2);
}

// Return factor to multiply by accelerate-stop distance based on headwind.
// A tailwind can be specified with a negative headwind value.
export function computeAccelerateStopHeadwindCorrection(headwind : number) : number {
    if (headwind == 0) return 1;
    if (headwind > 0) return 1 - (0.03 * headwind/4);
    // Note: same sign since this is a tailwind.
    return 1 - (0.05 * headwind/2);
}

// Return factor to multiply by accelerate-go distance based on headwind.
// A tailwind can be specified with a negative headwind value.
export function computeAccelerateGoHeadwindCorrection(headwind : number) : number {
    if (headwind == 0) return 1;
    if (headwind > 0) return 1 - (0.06 * headwind/10);
    // Note: same sign since this is a tailwind.
    return 1 - (0.02 * headwind);
}

// Compute takeoff performance data.
export function computeTakeoffData(takeoff_weight : number, pressure_alt : number, temp: number) : NormalTakeoffData {
    const result = new NormalTakeoffData();
    const ground_roll = computeTakeoffPerformance(normalTakeoffGroundRollData, takeoff_weight, pressure_alt, temp);
    const obst_clear = computeTakeoffPerformance(normalTakeoffObstClearanceData, takeoff_weight, pressure_alt, temp);
    const accel_stop = computeTakeoffPerformance(accelStopData, takeoff_weight, pressure_alt, temp);
    const accel_go = computeTakeoffPerformance(accelGoData, takeoff_weight, pressure_alt, temp);
    const blueline_speed = computeBluelineSpeed(takeoff_weight, pressure_alt);
    const blueline_climb = computeBluelineClimb(takeoff_weight, pressure_alt, temp);

    result.takeoffSpeed = ground_roll.speed;
    result.groundRoll = ground_roll.distance;
    result.distanceToClearObstacle = obst_clear.distance;
    result.accelerateStop = accel_stop.distance;
    result.accelerateGo = accel_go.distance;
    result.blueLineSpeed = blueline_speed;
    result.blueLineClimb = blueline_climb;

    return result;
}

