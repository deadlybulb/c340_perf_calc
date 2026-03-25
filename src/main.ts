
import { setupTakeoff } from "./takeoff_computer.ts";
import { setupLanding } from "./landing_computer.ts";

export function setupComputer() {
    setupTakeoff();
    setupLanding();
}

setupComputer();

