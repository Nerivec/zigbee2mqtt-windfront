import store2 from "store2";
import { DEVICE_TEMPERATURE_UNIT_KEY, TEMPERATURE_SCOPE_KEY, TEMPERATURE_UNIT_KEY } from "./localStoreConsts.js";
import type { Device, NumericFeature } from "./types.js";

export type TemperatureUnitPreference = "native" | "celsius" | "fahrenheit";
export type TemperatureScope = "climate" | "all";
export type DeviceTemperatureUnitPreference = "inherit" | TemperatureUnitPreference;
export type TemperatureSemantics = "absolute" | "delta" | "unknown";

type Expose = {
    type: string;
    unit?: string;
    features?: Expose[];
};

export const TEMPERATURE_SETTINGS_EVENT = "windfront-temperature-settings";

const CELSIUS = "°C";
const FAHRENHEIT = "°F";
const TEMPERATURE_UNITS = new Set([CELSIUS, FAHRENHEIT]);
const TEMPERATURE_UNIT_PREFERENCES = new Set<TemperatureUnitPreference>(["native", "celsius", "fahrenheit"]);
const TEMPERATURE_SCOPES = new Set<TemperatureScope>(["climate", "all"]);
const DEVICE_TEMPERATURE_UNIT_PREFERENCES = new Set<DeviceTemperatureUnitPreference>(["inherit", "native", "celsius", "fahrenheit"]);
const DELTA_MARKERS = [
    "accuracy",
    "adjustment",
    "calibration",
    "compensation",
    "correction",
    "deadband",
    "deadzone",
    "delta",
    "deviation",
    "difference",
    "eco_mode",
    "hysterersis",
    "hysteresis",
    "offset",
    "sensitivity",
    "setback",
    "variation",
    "window_detection_temperature",
    "window_open_check",
    "window_open_detection_temp",
    "window_temp",
];
const AMBIGUOUS_MARKERS = ["threshold"];
const ABSOLUTE_MARKERS = ["alarm", "frost", "limit", "protect", "setpoint", "temp"];

function roundTemperature(value: number): number {
    return Math.round((value + Number.EPSILON) * 10000) / 10000;
}

function hasExpose(exposes: Expose[] | undefined, predicate: (expose: Expose) => boolean): boolean {
    return exposes?.some((expose) => predicate(expose) || (expose.features != null && hasExpose(expose.features, predicate))) ?? false;
}

export function hasClimateExpose(device: Device): boolean {
    return hasExpose(device.definition?.exposes as Expose[] | undefined, (expose) => expose.type === "climate");
}

export function hasTemperatureExpose(device: Device): boolean {
    return hasExpose(
        device.definition?.exposes as Expose[] | undefined,
        (expose) => expose.type === "numeric" && TEMPERATURE_UNITS.has(expose.unit ?? ""),
    );
}

export function isTemperatureFeature(feature: NumericFeature): boolean {
    return TEMPERATURE_UNITS.has(feature.unit ?? "");
}

export function getTemperatureSemantics(feature: NumericFeature): TemperatureSemantics {
    if (!isTemperatureFeature(feature)) {
        return "unknown";
    }

    const identifier = `${feature.name ?? ""}_${feature.property ?? ""}`.toLowerCase();

    if (DELTA_MARKERS.some((marker) => identifier.includes(marker))) {
        return "delta";
    }

    if (AMBIGUOUS_MARKERS.some((marker) => identifier.includes(marker))) {
        return "unknown";
    }

    return ABSOLUTE_MARKERS.some((marker) => identifier.includes(marker)) ? "absolute" : "unknown";
}

export function isTemperatureDelta(feature: NumericFeature): boolean {
    return getTemperatureSemantics(feature) === "delta";
}

export function convertTemperature(value: number, fromUnit: string, toUnit: TemperatureUnitPreference, delta = false): number {
    if (toUnit === "native" || (fromUnit === CELSIUS && toUnit === "celsius") || (fromUnit === FAHRENHEIT && toUnit === "fahrenheit")) {
        return value;
    }

    if (fromUnit === CELSIUS && toUnit === "fahrenheit") {
        return roundTemperature(value * 1.8 + (delta ? 0 : 32));
    }

    if (fromUnit === FAHRENHEIT && toUnit === "celsius") {
        return roundTemperature((value - (delta ? 0 : 32)) / 1.8);
    }

    return value;
}

export function convertTemperatureToNative(value: number, nativeUnit: string, displayUnit: TemperatureUnitPreference, delta = false): number {
    if (displayUnit === "native") {
        return value;
    }

    const sourceUnit = displayUnit === "celsius" ? CELSIUS : FAHRENHEIT;
    const targetUnit = nativeUnit === CELSIUS ? "celsius" : nativeUnit === FAHRENHEIT ? "fahrenheit" : "native";

    return convertTemperature(value, sourceUnit, targetUnit, delta);
}

export function snapTemperatureToStep(value: number, step?: number, min = 0): number {
    if (step == null || step <= 0) {
        return value;
    }

    return roundTemperature(min + Math.round((value - min) / step) * step);
}

export function temperatureUnitLabel(preference: TemperatureUnitPreference, nativeUnit?: string): string | undefined {
    if (preference === "native") {
        return nativeUnit;
    }

    return preference === "celsius" ? CELSIUS : FAHRENHEIT;
}

export function getTemperatureUnitPreference(): TemperatureUnitPreference {
    const preference = store2.get(TEMPERATURE_UNIT_KEY, "native");

    return TEMPERATURE_UNIT_PREFERENCES.has(preference) ? preference : "native";
}

export function getTemperatureScope(): TemperatureScope {
    const scope = store2.get(TEMPERATURE_SCOPE_KEY, "climate");

    return TEMPERATURE_SCOPES.has(scope) ? scope : "climate";
}

export function getDeviceTemperatureUnitKey(ieeeAddress: string): string {
    return `${DEVICE_TEMPERATURE_UNIT_KEY}-${ieeeAddress}`;
}

export function getDeviceTemperatureUnitPreference(ieeeAddress: string): DeviceTemperatureUnitPreference {
    const preference = store2.get(getDeviceTemperatureUnitKey(ieeeAddress), "inherit");

    return DEVICE_TEMPERATURE_UNIT_PREFERENCES.has(preference) ? preference : "inherit";
}

export function resolveTemperatureUnitPreference(device: Device, feature: NumericFeature): TemperatureUnitPreference {
    if (getTemperatureSemantics(feature) === "unknown") {
        return "native";
    }

    const devicePreference = getDeviceTemperatureUnitPreference(device.ieee_address);

    if (devicePreference !== "inherit") {
        return devicePreference;
    }

    const preference = getTemperatureUnitPreference();

    if (preference === "native") {
        return "native";
    }

    return getTemperatureScope() === "all" || hasClimateExpose(device) ? preference : "native";
}

export function notifyTemperatureSettingsChanged(): void {
    window.dispatchEvent(new Event(TEMPERATURE_SETTINGS_EVENT));
}
