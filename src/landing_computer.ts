// @filename: landing_computer.ts
// @description: Computes landing performance from UI entries.
// @author:
// @date: 2025-09-18
// @version: 1.0

// Inputs for landing performance are taken from the UI.  Performance data
// is taken from tables in the POH.  For variable winds, the wind direction
// used is the direction that results in the largest tailwind component.
// This is done because tailwinds have the most detrimental effect on
// landing performance.
//

import { boundGtEqZero, boundInterval, WindComponents, computeWindComponents, computeWindOffset } from './utils';
import { computeLandingData, computeLandingHeadwindCorrection, computeLandingFlapsDistanceCorrection, computeLandingFlapsVrefCorrection} from './landing_data.ts';
import {
  apt_ELEV_OFFSET,
  apt_MAG_VAR_OFFSET,
  apt_NAME_OFFSET,
  apt_RUNWAY_ID_OFFSET,
  apt_RUNWAY_LDA_OFFSET,
  apt_RUNWAY_TH_OFFSET,
  apt_RUNWAYS_OFFSET,
  getAirportData,
} from './airport_data.ts';

function toggleVariableWinds(show: boolean) {
    if (show) {
        (document.getElementById('ldg_var_wind_box') as HTMLElement).className = 'bordered';
        (document.getElementById('ldg-wvar-from-row') as HTMLElement).style.display = 'table-row';
        (document.getElementById('ldg-wvar-to-row') as HTMLElement).style.display = 'table-row';
    } else {
        (document.getElementById('ldg_var_wind_box') as HTMLElement).className = '';
        (document.getElementById('ldg-wvar-from-row') as HTMLElement).style.display = 'none';
        (document.getElementById('ldg-wvar-to-row') as HTMLElement).style.display = 'none';
    }
}

function initInputs() {
    (document.getElementById('landing_apt') as HTMLInputElement).value = '';
    (document.getElementById('landing_weight') as HTMLInputElement).value = '0';
    (document.getElementById('landing_temp') as HTMLInputElement).value = '15';
    (document.getElementById('landing_alt') as HTMLInputElement).value = '0';
    (document.getElementById('landing_press') as HTMLInputElement).value = '29.92';
    (document.getElementById('landing_rwh') as HTMLInputElement).value = '36';
    (document.getElementById('landing_flaps') as HTMLSelectElement).value = '0';
    (document.getElementById('landing_wh') as HTMLInputElement).value = '0';
    (document.getElementById('landing_wvar') as HTMLInputElement).value = '0';
    (document.getElementById('landing_wvar_from') as HTMLInputElement).value = '0';
    (document.getElementById('landing_wvar_to') as HTMLInputElement).value = '0';
    (document.getElementById('landing_ws') as HTMLInputElement).value = '0';
    (document.getElementById('landing_wsg') as HTMLInputElement).value = '0';
    (document.getElementById('landing_margin') as HTMLInputElement).value = '0';
    toggleVariableWinds(false);
    updateWithLandingAirport();
}

function updateLandingAirportSelectedRunway() {
  // Connect the event handler so we populate LDA from the selected runway.
  const el_landing_rwh_apt = document.getElementById('landing_rwh_apt') as HTMLSelectElement;
  const el_landing_apt = document.getElementById('landing_apt') as HTMLInputElement;
  const apt_code = el_landing_apt.value;
  const apt_data = getAirportData(apt_code);
  const rwh_sel = el_landing_rwh_apt.value;
  if (apt_data) {
    const rwh_data = apt_data[apt_RUNWAYS_OFFSET].find((rwh: [string, number, number, number, number, number]) => rwh[apt_RUNWAY_ID_OFFSET] == rwh_sel);
    if (rwh_data) {
      const el_to_lda = document.getElementById('ldg_lda');
      if (el_to_lda) el_to_lda.innerHTML = rwh_data[apt_RUNWAY_LDA_OFFSET].toString();
    }
  }
}

function updateWithLandingAirport() {
  // Check if entered value is an airport we have info for.
  const el_landing_apt = document.getElementById('landing_apt') as HTMLInputElement;
  el_landing_apt.value = el_landing_apt.value.toUpperCase();
  const apt_code = el_landing_apt.value;
  const apt_data = getAirportData(apt_code);
  const el_ldg_airport = document.getElementById('ldg_airport');
  const el_ldg_elevation = document.getElementById('ldg_elevation');
  const el_ldg_lda = document.getElementById('ldg_lda');
  const el_landing_rwh = document.getElementById('landing_rwh');
  const el_landing_rwh_apt = document.getElementById('landing_rwh_apt') as HTMLSelectElement;
  if (apt_data) {
    // Expose airport name and elevation
    if (el_ldg_airport) {
      el_ldg_airport.innerHTML = apt_data[apt_NAME_OFFSET];
      el_ldg_airport.className = 'neutral-limit';
    }
    if (el_ldg_elevation) {
      el_ldg_elevation.innerHTML = apt_data[apt_ELEV_OFFSET];
      el_ldg_elevation.className = 'neutral-limit';
      const el_landing_alt = document.getElementById('landing_alt') as HTMLInputElement;
      if (el_landing_alt) {
        el_landing_alt.value = apt_data[apt_ELEV_OFFSET];
      }
    }
    // Populate takeoff runway select and hide text entry
    if (el_landing_rwh) {
      el_landing_rwh.style.display = 'none';
    }
    if (el_landing_rwh_apt) {
      el_landing_rwh_apt.style.display = 'inline';
      el_landing_rwh_apt.innerHTML = '';
      for (let i = 0; i < apt_data[apt_RUNWAYS_OFFSET].length; i+=1) {
        const option = document.createElement('option');
        option.value = apt_data[apt_RUNWAYS_OFFSET][i][apt_RUNWAY_ID_OFFSET];
        option.innerHTML = apt_data[apt_RUNWAYS_OFFSET][i][apt_RUNWAY_ID_OFFSET];
        el_landing_rwh_apt.add(option);
      }
      el_landing_rwh_apt.value = apt_data[apt_RUNWAYS_OFFSET][0][apt_RUNWAY_ID_OFFSET];
      updateLandingAirportSelectedRunway();
    }
  } else {
    // Set limits to N/A
    if (el_ldg_airport) {
      el_ldg_airport.innerHTML = 'N/A';
      el_ldg_airport.className = 'neutral-limit';
    }
    if (el_ldg_elevation) {
      el_ldg_elevation.innerHTML = 'N/A';
      el_ldg_elevation.className = 'neutral-limit';
    }
    if (el_ldg_lda) {
      el_ldg_lda.innerHTML = 'N/A';
      el_ldg_lda.className = 'neutral-limit';
    }
    // Hide takeoff runway selector and show text entry
    if (el_landing_rwh) {
      el_landing_rwh.style.display = 'inline';
    }
    if (el_landing_rwh_apt) {
      el_landing_rwh_apt.style.display = 'none';
    }
  }
}

function initValidators() {
    const el_landing_apt = document.getElementById('landing_apt') as HTMLInputElement;
    el_landing_apt.addEventListener('change', () => { updateWithLandingAirport()});

    const el_landing_rwh_apt = document.getElementById('landing_rwh_apt') as HTMLSelectElement;
    el_landing_rwh_apt.addEventListener('change', () => { updateLandingAirportSelectedRunway()});

    const el_landing_weight = document.getElementById('landing_weight') as HTMLInputElement;
    el_landing_weight.addEventListener('change', () => {
        el_landing_weight.value = boundGtEqZero(parseInt(el_landing_weight.value)).toString();
    });

    const el_landing_temp = document.getElementById('landing_temp') as HTMLInputElement;
    el_landing_temp.addEventListener('change', () => {
        el_landing_temp.value = Math.round(boundInterval(parseFloat(el_landing_temp.value), 0, -80, 150)).toString();
    });

    const el_landing_alt = document.getElementById('landing_alt') as HTMLInputElement;
    el_landing_alt.addEventListener('change', () => {
        el_landing_alt.value = boundGtEqZero(parseInt(el_landing_alt.value)).toString();
    });

    const el_landing_press = document.getElementById('landing_press') as HTMLInputElement;
    el_landing_press.addEventListener('change', () => {
        el_landing_press.value = boundInterval(parseFloat(el_landing_press.value), 29.92, 25, 35).toFixed(2);
    });

    const el_landing_rwh = document.getElementById('landing_rwh') as HTMLInputElement;
    el_landing_rwh.addEventListener('change', () => {
        el_landing_rwh.value = boundInterval(parseInt(el_landing_rwh.value), 36, 1, 36).toString();
    });

    const el_landing_wh = document.getElementById('landing_wh') as HTMLInputElement;
    el_landing_wh.addEventListener('change', () => {
        let el_landing_wh_value = boundGtEqZero(parseInt(el_landing_wh.value));
        if (el_landing_wh_value > 354) el_landing_wh_value = 0;
        el_landing_wh_value = (Math.round(el_landing_wh_value / 10)) * 10;
        el_landing_wh.value = el_landing_wh_value.toString();
    });

    const el_landing_ws = document.getElementById('landing_ws') as HTMLInputElement;
    const el_landing_wsg = document.getElementById('landing_wsg') as HTMLInputElement;
    el_landing_ws.addEventListener('change', () => {
        const el_landing_ws_value = boundGtEqZero(parseInt(el_landing_ws.value))
        const el_landing_wsg_value = boundInterval(parseInt(el_landing_wsg.value), el_landing_ws_value, el_landing_ws_value, NaN);
        el_landing_ws.value = el_landing_ws_value.toString();
        el_landing_wsg.value = el_landing_wsg_value.toString();
    });
    el_landing_wsg.addEventListener('change', () => {
        const el_landing_ws_value = parseInt(el_landing_ws.value);
        const el_landing_wsg_value = boundInterval(parseInt(el_landing_wsg.value), el_landing_ws_value, el_landing_ws_value, NaN);
        el_landing_wsg.value = el_landing_wsg_value.toString();
    });

    const el_landing_margin = document.getElementById('landing_margin') as HTMLInputElement;
    el_landing_margin.addEventListener('change', () => {
        el_landing_margin.value = boundInterval(parseInt(el_landing_margin.value), 0, 0, 99).toString();
    });

    const el_landing_wvar_from = document.getElementById('landing_wvar_from') as HTMLInputElement;
    el_landing_wvar_from.addEventListener('change', () => {
        let wh_value = boundGtEqZero(parseInt(el_landing_wvar_from.value));
        if (wh_value > 354) wh_value = 0;
        wh_value = (Math.round(wh_value / 10)) * 10;
        el_landing_wvar_from.value = wh_value.toString();
    });

    const el_landing_wvar_to = document.getElementById('landing_wvar_to') as HTMLInputElement;
    el_landing_wvar_to.addEventListener('change', () => {
        let wh_value = boundGtEqZero(parseInt(el_landing_wvar_to.value));
        if (wh_value > 354) wh_value = 0;
        wh_value = (Math.round(wh_value / 10)) * 10;
        el_landing_wvar_to.value = wh_value.toString();
    });
}

function gatherInputs() : LandingInputs {
    const inputs = new LandingInputs();

    // Check whether an airport ID has been set and if so extract the selected runway info.
    const el_landing_apt = document.getElementById('landing_apt') as HTMLInputElement;
    const apt_data = getAirportData(el_landing_apt.value);
    let rwh_data = null;
    if (apt_data) {
      const el_landing_rwh_apt = document.getElementById('landing_rwh_apt') as HTMLSelectElement;
      const rwh_sel = el_landing_rwh_apt.value;
      rwh_data = apt_data[apt_RUNWAYS_OFFSET].find((rwh: [string, number, number, number, number, number]) => rwh[apt_RUNWAY_ID_OFFSET] == rwh_sel);
    }

    inputs.landingWeight = parseInt((document.getElementById('landing_weight') as HTMLInputElement).value);
    inputs.temperature = parseInt((document.getElementById('landing_temp') as HTMLInputElement).value);
    inputs.fieldElevation = parseInt((document.getElementById('landing_alt') as HTMLInputElement).value);
    inputs.altimeter = parseFloat((document.getElementById('landing_press') as HTMLInputElement).value);
    if (apt_data && rwh_data) {
      inputs.runway = apt_data[apt_MAG_VAR_OFFSET] + rwh_data[apt_RUNWAY_TH_OFFSET];
    } else {
      inputs.runway = parseInt((document.getElementById('landing_rwh') as HTMLInputElement).value) * 10;
    }
    inputs.flaps = parseInt((document.getElementById('landing_flaps') as HTMLSelectElement).value);
    inputs.windDirection = parseInt((document.getElementById('landing_wh') as HTMLInputElement).value);
    inputs.variableWinds = (document.getElementById('landing_wvar') as HTMLInputElement).checked;
    inputs.variableStart = parseInt((document.getElementById('landing_wvar_from') as HTMLInputElement).value);
    inputs.variableEnd = parseInt((document.getElementById('landing_wvar_to') as HTMLInputElement).value);
    inputs.windSpeed = parseInt((document.getElementById('landing_ws') as HTMLInputElement).value);
    inputs.gustSpeed = parseInt((document.getElementById('landing_wsg') as HTMLInputElement).value);
    inputs.margin = parseInt((document.getElementById('landing_margin') as HTMLInputElement).value);

    // Compute wind components.  If winds are variable, use the wind direction in the from->to range that gives
    // the largest tailwind.
    if (inputs.variableWinds) {
        let wind_cand = inputs.variableStart;
        let offset = 0;
        if (inputs.variableEnd >= inputs.variableStart) {
            for (let i = inputs.variableStart; i <= inputs.variableEnd; i+=10) {
                let next_offset = computeWindOffset(inputs.runway, i);
                if (next_offset > offset) {
                    wind_cand = i;
                    offset = next_offset;
                }
            }
        } else {
            for (let i = inputs.variableStart; i <= 360; i+=10) {
                let next_offset = computeWindOffset(inputs.runway, i);
                if (next_offset > offset) {
                    wind_cand = i;
                    offset = next_offset;
                }
            }
            for (let i = 0; i <= inputs.variableEnd; i+=10) {
                let next_offset = computeWindOffset(inputs.runway, i);
                if (next_offset > offset) {
                    wind_cand = i;
                    offset = next_offset;
                }
            }
        }
        inputs.windComponents = computeWindComponents(inputs.runway, wind_cand, inputs.windSpeed, inputs.gustSpeed);
    } else {
        inputs.windComponents = computeWindComponents(inputs.runway, inputs.windDirection, inputs.windSpeed, inputs.gustSpeed);
    }

    return inputs;
}

function computeAndDisplayPerformance() {
    const inputs : LandingInputs = gatherInputs();

    // Populate wind components.
    const perf_headwind = document.getElementById('ldg_perf_headwind');
    const perf_crosswind = document.getElementById('ldg_perf_crosswind');
    if (perf_headwind) {
        const headwind = Math.round(inputs.windComponents.headWind);
        const headwind_g = Math.round(inputs.windComponents.headWindGust);
        let inner = headwind.toString();
        if (headwind != headwind_g) {
            inner += ' (gust ' + headwind_g.toString() + ')';
        }
        perf_headwind.innerHTML = inner;
    }
    if (perf_crosswind) {
        const crosswind = Math.round(inputs.windComponents.crossWind);
        const crosswind_g = Math.round(inputs.windComponents.crossWindGust);
        let inner = crosswind.toString();
        if (crosswind != crosswind_g) {
            inner += ' (gust ' + crosswind_g.toString() + ')';
        }
        perf_crosswind.innerHTML = inner;
    }

    let presAlt = inputs.fieldElevation - ((inputs.altimeter - 29.92) * 1000);
    let ldgData = computeLandingData(inputs.landingWeight, presAlt, inputs.temperature);
    let hwCorr = computeLandingHeadwindCorrection(inputs.windComponents.headWind);
    let flapsDistCorr = computeLandingFlapsDistanceCorrection(inputs.flaps);
    let flapsSpeedCorr = computeLandingFlapsVrefCorrection(inputs.flaps);
    let marginFactor = inputs.margin / 100 + 1.0;
    const perf_speed = document.getElementById('ldg_perf_speed');
    if (perf_speed) {
        perf_speed.innerHTML = Math.round(ldgData.vref + flapsSpeedCorr).toString();
    }
    const perf_roll = document.getElementById('ldg_perf_ground_roll');
    if (perf_roll) {
        perf_roll.innerHTML = Math.round(ldgData.groundRoll * hwCorr * flapsDistCorr * marginFactor).toString();
    }
    const perf_obstacle = document.getElementById('ldg_perf_obst');
    if (perf_obstacle) {
        perf_obstacle.innerHTML = Math.round(ldgData.distanceToClearObstacle * hwCorr * flapsDistCorr * marginFactor).toString();
    }

    // If a landing airport is specified, then highlight any limits which exceed as follows:
    // - If performance value exceeds the limit, then color as "bad"
    // - If performance value is within 'warning_margin' of limit, then color as "warning"
    // - Otherwise, color as "normal"
    const el_landing_apt = document.getElementById('landing_apt') as HTMLInputElement;
    const apt_data = getAirportData(el_landing_apt.value);
    if (apt_data) {
      const warning_margin = 0.05;
      const el_landing_rwh_apt = document.getElementById('landing_rwh_apt') as HTMLSelectElement;
      const rwh_sel = el_landing_rwh_apt.value;
      const rwh_data = apt_data[apt_RUNWAYS_OFFSET].find((rwh: [string, number, number, number, number, number]) => rwh[apt_RUNWAY_ID_OFFSET] == rwh_sel);
      if (rwh_data) {
        const limit_lda = rwh_data[apt_RUNWAY_LDA_OFFSET];
        const perf_obst = ldgData.distanceToClearObstacle * hwCorr * flapsDistCorr * marginFactor;
        const el_ldg_lda = document.getElementById('ldg_lda');
        if (el_ldg_lda) {
          el_ldg_lda.className = limit_lda < perf_obst ? 'bad-limit' :
            (limit_lda - perf_obst > limit_lda * warning_margin
              ? 'normal-limit'
              : 'warning-limit');
        }
      }
    }

}

function initPerformanceComputer() {
    let elArray = [
        document.getElementById('landing_apt'),
        document.getElementById('landing_rwh_apt'),
        document.getElementById('landing_weight'),
        document.getElementById('landing_temp'),
        document.getElementById('landing_alt'),
        document.getElementById('landing_press'),
        document.getElementById('landing_rwh'),
        document.getElementById('landing_flaps'),
        document.getElementById('landing_wh'),
        document.getElementById('landing_ws'),
        document.getElementById('landing_wsg'),
        document.getElementById('landing_margin'),
        document.getElementById('landing_wvar'),
        document.getElementById('landing_wvar_from'),
        document.getElementById('landing_wvar_to')
    ];
    for (let el of elArray) {
        if (el) {
            el.addEventListener('change', () => {
                computeAndDisplayPerformance();
            });
        }
    }
}

// Initialize landing computer UI and state.
export function setupLanding() {
    initInputs();
    initValidators();

    // Configure handlers for variable wind.
    const el_var_wind = document.getElementById('landing_wvar') as HTMLInputElement;
    el_var_wind.addEventListener('change', () => {
        toggleVariableWinds(el_var_wind.checked);
    });

    initPerformanceComputer();
}

class LandingInputs {
    // Taken from the UI.
    landingWeight: number = 0;
    temperature: number = 0;
    fieldElevation: number = 0;
    altimeter: number = 0;
    runway: number = 0;
    flaps: number = 0;
    windDirection: number = 0;
    windSpeed: number = 0;
    gustSpeed: number = 0;
    variableWinds: boolean = false;
    variableStart: number = 0; // windDirection where variable winds start
    variableEnd: number = 0; // windDirection where variable winds end
    margin: number = 0;

    // Computed
    windComponents: WindComponents = new WindComponents();
}

