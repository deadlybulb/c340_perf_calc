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
}

function initValidators() {
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

    inputs.landingWeight = parseInt((document.getElementById('landing_weight') as HTMLInputElement).value);
    inputs.temperature = parseInt((document.getElementById('landing_temp') as HTMLInputElement).value);
    inputs.fieldElevation = parseInt((document.getElementById('landing_alt') as HTMLInputElement).value);
    inputs.altimeter = parseFloat((document.getElementById('landing_press') as HTMLInputElement).value);
    inputs.runway = parseInt((document.getElementById('landing_rwh') as HTMLInputElement).value);
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
                let next_offset = computeWindOffset(inputs.runway * 10, i);
                if (next_offset > offset) {
                    wind_cand = i;
                    offset = next_offset;
                }
            }
        } else {
            for (let i = inputs.variableStart; i <= 360; i+=10) {
                let next_offset = computeWindOffset(inputs.runway * 10, i);
                if (next_offset > offset) {
                    wind_cand = i;
                    offset = next_offset;
                }
            }
            for (let i = 0; i <= inputs.variableEnd; i+=10) {
                let next_offset = computeWindOffset(inputs.runway * 10, i);
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
}

function initPerformanceComputer() {
    let elArray = [
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
    landingWeight: number;
    temperature: number;
    fieldElevation: number;
    altimeter: number;
    runway: number;
    flaps: number;
    windDirection: number;
    windSpeed: number;
    gustSpeed: number;
    variableWinds: boolean;
    variableStart: number; // windDirection where variable winds start
    variableEnd: number; // windDirection where variable winds end
    margin: number;

    // Computed
    windComponents: WindComponents;
}

