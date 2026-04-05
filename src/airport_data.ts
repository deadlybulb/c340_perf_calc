// @filename: airport_data.ts
// @description: Auto-generated from official FAA data.

export function getAirportDate() {
  return airportDataDate;
}

export function getAirportData(id: string) {
  const id_check = id.toUpperCase();
  if (id_check in airportData) { // @ts-ignore
    return airportData[id_check];
  }
  return null;
}

const airportDataDate = "2026-02-19";

// Airport data is a dictionary with the FAA name (e.g. ICAO without the K in front) mapped
// to an array with the following format:
// - airport name
// - airport elevation
// - magnetic variation (+/- degrees)
// - array of runways:
//    - runway ID (e.g. 4L)
//    - true heading (degrees) - add to variation to get magnetic heading
//    - TDZE - touchdown zone elevation
//    - TORA - takeoff runway available (feet)
//    - TODA - takeoff distance available (feet)
//    - ASDA - accelerate stop distance available (feet)
//    - LDA - landing distance available (feet)
//

export const apt_NAME_OFFSET = 0;
export const apt_ELEV_OFFSET = 1;
export const apt_MAG_VAR_OFFSET = 2;
export const apt_RUNWAYS_OFFSET = 3;
export const apt_RUNWAY_ID_OFFSET = 0;
export const apt_RUNWAY_TDZE_OFFSET = 1;
export const apt_RUNWAY_TH_OFFSET = 2;
export const apt_RUNWAY_TORA_OFFSET = 3;
export const apt_RUNWAY_TODA_OFFSET = 4;
export const apt_RUNWAY_ASDA_OFFSET = 5;
export const apt_RUNWAY_LDA_OFFSET = 6;

const airportData = {
  "CDW": [ "ESSEX COUNTY", 172, 13,
    [
      [ "4", 172, 30, 4552, 4552, 4351, 3977],
      [ "22", 172, 210, 4552, 4552, 4436, 4042],
      [ "10", 172, 83, 3719, 3719, 3519, 2822],
      [ "28", 172, 263, 3719, 3719, 3438, 2822]
    ]
  ]
};


