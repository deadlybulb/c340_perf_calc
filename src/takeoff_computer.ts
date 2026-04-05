// @filename: takeoff_computer.ts
// @description: Takeoff computer functions
// @author:
// @date: 2025-09-18
// @version: 1.0

// The functions in this file compute takeoff performance.
//
// Inputs for takeoff performance are taken from the UI.  Performance data
// is taken from tables in the POH.  For variable winds, the wind direction
// used is the direction that results in the largest tailwind component.
// This is done because tailwinds have the most detrimental effect on
// takeoff performance.
//
// Takeoff performance is populated continuously as input values are chagned
// in the UI.
//

import { boundGtEqZero, boundInterval, WindComponents, computeWindComponents, computeWindOffset } from './utils';
import { computeTakeoffData, computeTakeoffHeadwindCorrection, computeAccelerateStopHeadwindCorrection, computeAccelerateGoHeadwindCorrection } from './takeoff_data';
import {
  apt_ELEV_OFFSET,
  apt_MAG_VAR_OFFSET,
  apt_NAME_OFFSET,
  apt_RUNWAY_ASDA_OFFSET,
  apt_RUNWAY_ID_OFFSET,
  apt_RUNWAY_TH_OFFSET,
  apt_RUNWAY_TODA_OFFSET,
  apt_RUNWAYS_OFFSET,
  getAirportData,
} from './airport_data.ts';

function toggleVariableWinds(show: boolean) {
    if (show) {
        (document.getElementById('var_wind_box') as HTMLElement).className = 'bordered';
        (document.getElementById('wvar-from-row') as HTMLElement).style.display = 'table-row';
        (document.getElementById('wvar-to-row') as HTMLElement).style.display = 'table-row';
    } else {
        (document.getElementById('var_wind_box') as HTMLElement).className = '';
        (document.getElementById('wvar-from-row') as HTMLElement).style.display = 'none';
        (document.getElementById('wvar-to-row') as HTMLElement).style.display = 'none';
    }
}

function initInputs() {
    (document.getElementById('takeoff_apt') as HTMLInputElement).value = '';
    (document.getElementById('takeoff_weight') as HTMLInputElement).value = '0';
    (document.getElementById('takeoff_temp') as HTMLInputElement).value = '15';
    (document.getElementById('takeoff_alt') as HTMLInputElement).value = '0';
    (document.getElementById('takeoff_press') as HTMLInputElement).value = '29.92';
    (document.getElementById('takeoff_rwh') as HTMLInputElement).value = '36';
    (document.getElementById('takeoff_wh') as HTMLInputElement).value = '0';
    (document.getElementById('takeoff_wvar') as HTMLInputElement).value = '0';
    (document.getElementById('takeoff_wvar_from') as HTMLInputElement).value = '0';
    (document.getElementById('takeoff_wvar_to') as HTMLInputElement).value = '0';
    (document.getElementById('takeoff_ws') as HTMLInputElement).value = '0';
    (document.getElementById('takeoff_wsg') as HTMLInputElement).value = '0';
    (document.getElementById('takeoff_margin') as HTMLInputElement).value = '0';
    toggleVariableWinds(false);
    updateWithTakeoffAirport();
}

function updateTakeoffAirportSelectedRunway() {
  // Connect the event handler so we populate TODA and ASDA from the selected runway.
  const el_takeoff_rwh_apt = document.getElementById('takeoff_rwh_apt') as HTMLSelectElement;
  const el_takeoff_apt = document.getElementById('takeoff_apt') as HTMLInputElement;
  const apt_code = el_takeoff_apt.value;
  const apt_data = getAirportData(apt_code);
  const rwh_sel = el_takeoff_rwh_apt.value;
  if (apt_data) {
    const rwh_data = apt_data[apt_RUNWAYS_OFFSET].find((rwh: [string, number, number, number, number, number]) => rwh[apt_RUNWAY_ID_OFFSET] == rwh_sel);
    if (rwh_data) {
      const el_to_toda = document.getElementById('to_toda');
      const el_to_asda = document.getElementById('to_asda');
      if (el_to_toda) el_to_toda.innerHTML = rwh_data[apt_RUNWAY_TODA_OFFSET].toString();
      if (el_to_asda) el_to_asda.innerHTML = rwh_data[apt_RUNWAY_ASDA_OFFSET].toString();
    }
  }
}

function updateWithTakeoffAirport() {
  // Check if entered value is an airport we have info for.
  const el_takeoff_apt = document.getElementById('takeoff_apt') as HTMLInputElement;
  el_takeoff_apt.value = el_takeoff_apt.value.toUpperCase();
  const apt_code = el_takeoff_apt.value;
  const apt_data = getAirportData(apt_code);
  const el_to_airport = document.getElementById('to_airport');
  const el_to_elevation = document.getElementById('to_elevation');
  const el_to_toda = document.getElementById('to_toda');
  const el_to_asda = document.getElementById('to_asda');
  const el_takeoff_rwh = document.getElementById('takeoff_rwh');
  const el_takeoff_rwh_apt = document.getElementById('takeoff_rwh_apt') as HTMLSelectElement;
  if (apt_data) {
    // Expose airport name and elevation
    if (el_to_airport) {
      el_to_airport.innerHTML = apt_data[apt_NAME_OFFSET];
      el_to_airport.className = 'neutral-limit';
    }
    if (el_to_elevation) {
      el_to_elevation.innerHTML = apt_data[apt_ELEV_OFFSET];
      el_to_elevation.className = 'neutral-limit';
      const el_takeoff_alt = document.getElementById('takeoff_alt') as HTMLInputElement;
      if (el_takeoff_alt) {
        el_takeoff_alt.value = apt_data[apt_ELEV_OFFSET];
      }
    }
    // Populate takeoff runway select and hide text entry
    if (el_takeoff_rwh) {
      el_takeoff_rwh.style.display = 'none';
    }
    if (el_takeoff_rwh_apt) {
      el_takeoff_rwh_apt.style.display = 'inline';
      el_takeoff_rwh_apt.innerHTML = '';
      for (let i = 0; i < apt_data[apt_RUNWAYS_OFFSET].length; i+=1) {
        const option = document.createElement('option');
        option.value = apt_data[apt_RUNWAYS_OFFSET][i][apt_RUNWAY_ID_OFFSET];
        option.innerHTML = apt_data[apt_RUNWAYS_OFFSET][i][apt_RUNWAY_ID_OFFSET];
        el_takeoff_rwh_apt.add(option);
      }
      el_takeoff_rwh_apt.value = apt_data[apt_RUNWAYS_OFFSET][0][apt_RUNWAY_ID_OFFSET];
      updateTakeoffAirportSelectedRunway();
    }
  } else {
    // Set limits to N/A
    if (el_to_airport) {
      el_to_airport.innerHTML = 'N/A';
      el_to_airport.className = 'neutral-limit';
    }
    if (el_to_elevation) {
      el_to_elevation.innerHTML = 'N/A';
      el_to_elevation.className = 'neutral-limit';
    }
    if (el_to_toda) {
      el_to_toda.innerHTML = 'N/A';
      el_to_toda.className = 'neutral-limit';
    }
    if (el_to_asda) {
      el_to_asda.innerHTML = 'N/A';
      el_to_asda.className = 'neutral-limit';
    }
    // Hide takeoff runway selector and show text entry
    if (el_takeoff_rwh) {
      el_takeoff_rwh.style.display = 'inline';
    }
    if (el_takeoff_rwh_apt) {
      el_takeoff_rwh_apt.style.display = 'none';
    }
  }
}

function initValidators() {
    const el_takeoff_apt = document.getElementById('takeoff_apt') as HTMLInputElement;
    el_takeoff_apt.addEventListener('change', () => { updateWithTakeoffAirport()});

    const el_takeoff_rwh_apt = document.getElementById('takeoff_rwh_apt') as HTMLSelectElement;
    el_takeoff_rwh_apt.addEventListener('change', () => { updateTakeoffAirportSelectedRunway()});

    const el_takeoff_weight = document.getElementById('takeoff_weight') as HTMLInputElement;
    el_takeoff_weight.addEventListener('change', () => {
        el_takeoff_weight.value = boundGtEqZero(parseInt(el_takeoff_weight.value)).toString();
    });

    const el_takeoff_temp = document.getElementById('takeoff_temp') as HTMLInputElement;
    el_takeoff_temp.addEventListener('change', () => {
        el_takeoff_temp.value = Math.round(boundInterval(parseFloat(el_takeoff_temp.value), 0, -80, 150)).toString();
    });

    const el_takeoff_alt = document.getElementById('takeoff_alt') as HTMLInputElement;
    el_takeoff_alt.addEventListener('change', () => {
        el_takeoff_alt.value = boundGtEqZero(parseInt(el_takeoff_alt.value)).toString();
    });

    const el_takeoff_press = document.getElementById('takeoff_press') as HTMLInputElement;
    el_takeoff_press.addEventListener('change', () => {
        el_takeoff_press.value = boundInterval(parseFloat(el_takeoff_press.value), 29.92, 25, 35).toFixed(2);
    });

    const el_takeoff_rwh = document.getElementById('takeoff_rwh') as HTMLInputElement;
    el_takeoff_rwh.addEventListener('change', () => {
        el_takeoff_rwh.value = boundInterval(parseInt(el_takeoff_rwh.value), 36, 1, 36).toString();
    });

    const el_takeoff_wh = document.getElementById('takeoff_wh') as HTMLInputElement;
    el_takeoff_wh.addEventListener('change', () => {
        let el_takeoff_wh_value = boundGtEqZero(parseInt(el_takeoff_wh.value));
        if (el_takeoff_wh_value > 354) el_takeoff_wh_value = 0;
        el_takeoff_wh_value = (Math.round(el_takeoff_wh_value / 10)) * 10;
        el_takeoff_wh.value = el_takeoff_wh_value.toString();
    });

    const el_takeoff_ws = document.getElementById('takeoff_ws') as HTMLInputElement;
    const el_takeoff_wsg = document.getElementById('takeoff_wsg') as HTMLInputElement;
    el_takeoff_ws.addEventListener('change', () => {
        const el_takeoff_ws_value = boundGtEqZero(parseInt(el_takeoff_ws.value))
        const el_takeoff_wsg_value = boundInterval(parseInt(el_takeoff_wsg.value), el_takeoff_ws_value, el_takeoff_ws_value, NaN);
        el_takeoff_ws.value = el_takeoff_ws_value.toString();
        el_takeoff_wsg.value = el_takeoff_wsg_value.toString();
    });
    el_takeoff_wsg.addEventListener('change', () => {
        const el_takeoff_ws_value = parseInt(el_takeoff_ws.value);
        const el_takeoff_wsg_value = boundInterval(parseInt(el_takeoff_wsg.value), el_takeoff_ws_value, el_takeoff_ws_value, NaN);
        el_takeoff_wsg.value = el_takeoff_wsg_value.toString();
    });

    const el_takeoff_margin = document.getElementById('takeoff_margin') as HTMLInputElement;
    el_takeoff_margin.addEventListener('change', () => {
        el_takeoff_margin.value = boundInterval(parseInt(el_takeoff_margin.value), 0, 0, 99).toString();
    });

    const el_takeoff_wvar_from = document.getElementById('takeoff_wvar_from') as HTMLInputElement;
    el_takeoff_wvar_from.addEventListener('change', () => {
        let wh_value = boundGtEqZero(parseInt(el_takeoff_wvar_from.value));
        if (wh_value > 354) wh_value = 0;
        wh_value = (Math.round(wh_value / 10)) * 10;
        el_takeoff_wvar_from.value = wh_value.toString();
    });

    const el_takeoff_wvar_to = document.getElementById('takeoff_wvar_to') as HTMLInputElement;
    el_takeoff_wvar_to.addEventListener('change', () => {
        let wh_value = boundGtEqZero(parseInt(el_takeoff_wvar_to.value));
        if (wh_value > 354) wh_value = 0;
        wh_value = (Math.round(wh_value / 10)) * 10;
        el_takeoff_wvar_to.value = wh_value.toString();
    });
}

function gatherInputs() : TakeoffInputs {
    const inputs = new TakeoffInputs();

    // Check whether an airport ID has been set and if so extract the selected runway info.
    const el_takeoff_apt = document.getElementById('takeoff_apt') as HTMLInputElement;
    const apt_data = getAirportData(el_takeoff_apt.value);
    let rwh_data = null;
    if (apt_data) {
      const el_takeoff_rwh_apt = document.getElementById('takeoff_rwh_apt') as HTMLSelectElement;
      const rwh_sel = el_takeoff_rwh_apt.value;
      rwh_data = apt_data[apt_RUNWAYS_OFFSET].find((rwh: [string, number, number, number, number, number]) => rwh[apt_RUNWAY_ID_OFFSET] == rwh_sel);
    }

    inputs.takeoffWeight = parseInt((document.getElementById('takeoff_weight') as HTMLInputElement).value);
    inputs.temperature = parseInt((document.getElementById('takeoff_temp') as HTMLInputElement).value);
    inputs.fieldElevation = parseInt((document.getElementById('takeoff_alt') as HTMLInputElement).value);
    inputs.altimeter = parseFloat((document.getElementById('takeoff_press') as HTMLInputElement).value);
    if (apt_data && rwh_data) {
      inputs.runway = apt_data[apt_MAG_VAR_OFFSET] + rwh_data[apt_RUNWAY_TH_OFFSET];
    } else {
      inputs.runway = parseInt((document.getElementById('takeoff_rwh') as HTMLInputElement).value) * 10;
    }
    inputs.windDirection = parseInt((document.getElementById('takeoff_wh') as HTMLInputElement).value);
    inputs.variableWinds = (document.getElementById('takeoff_wvar') as HTMLInputElement).checked;
    inputs.variableStart = parseInt((document.getElementById('takeoff_wvar_from') as HTMLInputElement).value);
    inputs.variableEnd = parseInt((document.getElementById('takeoff_wvar_to') as HTMLInputElement).value);
    inputs.windSpeed = parseInt((document.getElementById('takeoff_ws') as HTMLInputElement).value);
    inputs.gustSpeed = parseInt((document.getElementById('takeoff_wsg') as HTMLInputElement).value);
    inputs.margin = parseInt((document.getElementById('takeoff_margin') as HTMLInputElement).value);

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
    const inputs : TakeoffInputs = gatherInputs();

    // Populate wind components.
    const perf_headwind = document.getElementById('perf_headwind');
    const perf_crosswind = document.getElementById('perf_crosswind');
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
    let tkData = computeTakeoffData(inputs.takeoffWeight, presAlt, inputs.temperature);
    let hwCorr = computeTakeoffHeadwindCorrection(inputs.windComponents.headWind);
    let acStopCorr = computeAccelerateStopHeadwindCorrection(inputs.windComponents.headWind);
    let acGoCorr = computeAccelerateGoHeadwindCorrection(inputs.windComponents.headWind);
    let marginFactor = inputs.margin / 100 + 1.0;
    const perf_speed = document.getElementById('perf_speed');
    if (perf_speed) {
        perf_speed.innerHTML = Math.round(tkData.takeoffSpeed).toString();
    }
    const perf_roll = document.getElementById('perf_ground_roll');
    if (perf_roll) {
        perf_roll.innerHTML = Math.round(tkData.groundRoll * hwCorr * marginFactor).toString();
    }
    const perf_obstacle = document.getElementById('perf_obst');
    if (perf_obstacle) {
        perf_obstacle.innerHTML = Math.round(tkData.distanceToClearObstacle * hwCorr * marginFactor).toString();
    }
    const perf_ac_stop = document.getElementById('perf_ac_stop');
    if (perf_ac_stop) {
        if (tkData.accelerateStop >= 0)
            perf_ac_stop.innerHTML = Math.round(tkData.accelerateStop * acStopCorr * marginFactor).toString();
        else
            perf_ac_stop.innerHTML = 'N/A';
    }
    const perf_ac_go = document.getElementById('perf_ac_go');
    if (perf_ac_go) {
        if (tkData.accelerateGo >= 0)
            perf_ac_go.innerHTML = Math.round(tkData.accelerateGo * acGoCorr * marginFactor).toString();
        else
            perf_ac_go.innerHTML = 'N/A';
    }
    const perf_blue_line_speed = document.getElementById('perf_blue_line_speed');
    if (perf_blue_line_speed) {
        perf_blue_line_speed.innerHTML = Math.round(tkData.blueLineSpeed).toString();
    }
    const perf_blue_line_climb = document.getElementById('perf_blue_line_climb');
    if (perf_blue_line_climb) {
        perf_blue_line_climb.innerHTML = Math.round(tkData.blueLineClimb).toString();
    }

    // If a departure airport is specified, then highlight any limits which exceed as follows:
    // - If performance value exceeds the limit, then color as "bad"
    // - If performance value is within 'warning_margin' of limit, then color as "warning"
    // - Otherwise, color as "normal"
    const el_takeoff_apt = document.getElementById('takeoff_apt') as HTMLInputElement;
    const apt_data = getAirportData(el_takeoff_apt.value);
    if (apt_data) {
        const warning_margin = 0.05;
        const el_takeoff_rwh_apt = document.getElementById('takeoff_rwh_apt') as HTMLSelectElement;
        const rwh_sel = el_takeoff_rwh_apt.value;
        const rwh_data = apt_data[apt_RUNWAYS_OFFSET].find((rwh: [string, number, number, number, number, number]) => rwh[apt_RUNWAY_ID_OFFSET] == rwh_sel);
        if (rwh_data) {
          const limit_toda = rwh_data[apt_RUNWAY_TODA_OFFSET];
          const limit_asda = rwh_data[apt_RUNWAY_ASDA_OFFSET];
          const perf_obst = tkData.distanceToClearObstacle * hwCorr * marginFactor;
          const perf_asd = Math.max(tkData.accelerateStop, 0) * acStopCorr * marginFactor;
          const el_to_toda = document.getElementById('to_toda');
          const el_to_asda = document.getElementById('to_asda');
          if (el_to_toda) {
            el_to_toda.className = limit_toda < perf_obst ? 'bad-limit' :
              (limit_toda - perf_obst > limit_toda * warning_margin
                ? 'normal-limit'
                : 'warning-limit');
          }
          if (el_to_asda) {
            el_to_asda.className = limit_asda < perf_asd ? 'bad-limit' :
              (limit_asda - perf_asd > limit_asda * warning_margin
                ? 'normal-limit'
                : 'warning-limit');
          }
        }
    }
}

function initPerformanceComputer() {
    let elArray = [
        document.getElementById('takeoff_apt'),
        document.getElementById('takeoff_rwh_apt'),
        document.getElementById('takeoff_weight'),
        document.getElementById('takeoff_temp'),
        document.getElementById('takeoff_alt'),
        document.getElementById('takeoff_press'),
        document.getElementById('takeoff_rwh'),
        document.getElementById('takeoff_wh'),
        document.getElementById('takeoff_ws'),
        document.getElementById('takeoff_wsg'),
        document.getElementById('takeoff_margin'),
        document.getElementById('takeoff_wvar'),
        document.getElementById('takeoff_wvar_from'),
        document.getElementById('takeoff_wvar_to')
    ];
    for (let el of elArray) {
        if (el) {
            el.addEventListener('change', () => {
                computeAndDisplayPerformance();
            });
        }
    }
}

// Initialize takeoff computer UI and state.
export function setupTakeoff() {
    initInputs();
    initValidators();

    // Configure handlers for variable wind.
    const el_var_wind = document.getElementById('takeoff_wvar') as HTMLInputElement;
    el_var_wind.addEventListener('change', () => {
        toggleVariableWinds(el_var_wind.checked);
    });

    initPerformanceComputer();
}

class TakeoffInputs {
    // Taken from the UI.
    takeoffWeight: number = 0;
    temperature: number = 0;
    fieldElevation: number = 0;
    altimeter: number = 0;
    runway: number = 0;
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

