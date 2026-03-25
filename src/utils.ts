// @filename: utils.ts
// @description: Utility functions.
// @author:
// @date: 2025-09-18
// @version: 1.0

// This class stores all wind components as computed by computeWindComponents.
// Headwind and crosswind values are relative to a departure on the runway
// heading passed to computeWindComponents.  Gust variants are populated if a
// gust factor was specified beyond the wind speed.  Note that headwind components
// can be negative if the given wind direction results in a tailwind component.
export class WindComponents {
    headWind: number;
    crossWind: number;
    headWindGust: number;
    crossWindGust: number;

    constructor(headWind = 0, crossWind= 0, headWindGust = 0, crossWindGust = 0) {
        this.headWind = headWind;
        this.crossWind = crossWind;
        this.headWindGust = headWindGust;
        this.crossWindGust = crossWindGust;
    }
}

// Compute the offset angle between runway heading and wind direction.
// Max result is 180 degrees (i.e. a perfect tailwind).
export function computeWindOffset(runway_heading: number, windDirection: number) {
    let offset = Math.abs(runway_heading - windDirection);
    if (offset > 180) offset = 360 - offset;
    return offset;
}

// Compute wind components based on runway heading and wind.
// This function does not validate input parameters.
export function computeWindComponents(runway: number, windDirection: number, windSpeed: number, gustSpeed: number) {
    const runway_heading = runway * 10;
    const offset = computeWindOffset(runway_heading, windDirection);
    const headwind = windSpeed * Math.cos(offset * Math.PI / 180);
    const crosswind = windSpeed * Math.sin(offset * Math.PI / 180);
    const headwind_gust = gustSpeed * Math.cos(offset * Math.PI / 180);
    const crosswind_gust = gustSpeed * Math.sin(offset * Math.PI / 180);
    return new WindComponents(headwind, crosswind, headwind_gust, crosswind_gust);
}

export function boundInterval(value: number, def: number, min: number, max: number) : number {
    if (isNaN(value)) return def;
    if (!isNaN(min) && value < min) return min;
    if (!isNaN(max) && value > max) return max;
    return value;
}

export function boundGtEqZero(value: number) : number {
    if (isNaN(value) || value < 0) return 0;
    return value;
}
