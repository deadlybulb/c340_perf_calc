
import { setupTakeoff } from "./takeoff_computer.ts";
import { setupLanding } from "./landing_computer.ts";
import { getAirportDate } from './airport_data.ts';

export function setupComputer() {
    setupTakeoff();
    setupLanding();
}

(document.getElementById('airport_data_date') as HTMLSpanElement).innerText = getAirportDate();
setupComputer();

