import store2 from "store2";
import { beforeEach, describe, expect, it } from "vitest";
import {
    convertTemperature,
    convertTemperatureToNative,
    getDeviceTemperatureUnitKey,
    getTemperatureSemantics,
    hasClimateExpose,
    hasTemperatureExpose,
    isTemperatureDelta,
    resolveTemperatureUnitPreference,
    snapTemperatureToStep,
} from "../src/temperature.js";
import type { Device, NumericFeature } from "../src/types.js";

const temperatureFeature: NumericFeature = {
    type: "numeric",
    access: 7,
    label: "Local temperature",
    name: "local_temperature",
    property: "local_temperature",
    unit: "°C",
};

const climateDevice = {
    ieee_address: "0x00124b0000000001",
    definition: {
        exposes: [
            {
                type: "climate",
                features: [temperatureFeature],
            },
            {
                type: "numeric",
                access: 7,
                label: "Away preset temperature",
                name: "away_preset_temperature",
                property: "away_preset_temperature",
                unit: "°C",
            },
        ],
    },
} as Device;

const sensorDevice = {
    ieee_address: "0x00124b0000000002",
    definition: {
        exposes: [temperatureFeature],
    },
} as Device;

describe("temperature conversion", () => {
    beforeEach(() => {
        store2.clearAll();
    });

    it("converts absolute temperatures in both directions", () => {
        expect(convertTemperature(20, "°C", "fahrenheit")).toBe(68);
        expect(convertTemperatureToNative(68, "°C", "fahrenheit")).toBe(20);
        expect(convertTemperature(68, "°F", "celsius")).toBe(20);
    });

    it("converts temperature deltas without an offset", () => {
        expect(convertTemperature(2, "°C", "fahrenheit", true)).toBe(3.6);
        expect(convertTemperatureToNative(3.6, "°C", "fahrenheit", true)).toBe(2);
    });

    it("classifies established absolute and delta temperature fields", () => {
        expect(getTemperatureSemantics(temperatureFeature)).toBe("absolute");
        expect(isTemperatureDelta({ ...temperatureFeature, name: "local_temperature_calibration" })).toBe(true);
        expect(isTemperatureDelta({ ...temperatureFeature, property: "temperature_hysteresis" })).toBe(true);
        expect(isTemperatureDelta({ ...temperatureFeature, property: "switch_sensitivity" })).toBe(true);
        expect(isTemperatureDelta({ ...temperatureFeature, property: "eco_mode" })).toBe(true);
        expect(isTemperatureDelta({ ...temperatureFeature, property: "window_open_check" })).toBe(true);
        expect(isTemperatureDelta(temperatureFeature)).toBe(false);
    });

    it("leaves ambiguous temperature fields native", () => {
        const ambiguousFeature = { ...temperatureFeature, name: "temp_threshold", property: "temp_threshold" };

        store2.set("temperature-unit", "fahrenheit");
        store2.set("temperature-scope", "all");

        expect(getTemperatureSemantics(ambiguousFeature)).toBe("unknown");
        expect(resolveTemperatureUnitPreference(sensorDevice, ambiguousFeature)).toBe("native");
    });

    it("snaps converted writes to the native step grid", () => {
        expect(snapTemperatureToStep(convertTemperatureToNative(70, "°C", "fahrenheit"), 0.5, 5)).toBe(21);
        expect(snapTemperatureToStep(convertTemperatureToNative(77, "°C", "fahrenheit"), 0.5, 5)).toBe(25);
    });

    it("finds climate and temperature exposes recursively", () => {
        expect(hasClimateExpose(climateDevice)).toBe(true);
        expect(hasClimateExpose(sensorDevice)).toBe(false);
        expect(hasTemperatureExpose(climateDevice)).toBe(true);
        expect(hasTemperatureExpose(sensorDevice)).toBe(true);
    });

    it("defaults global conversion to climate devices", () => {
        store2.set("temperature-unit", "fahrenheit");

        expect(resolveTemperatureUnitPreference(climateDevice, temperatureFeature)).toBe("fahrenheit");
        expect(resolveTemperatureUnitPreference(sensorDevice, temperatureFeature)).toBe("native");
    });

    it("can apply global conversion to all temperature values", () => {
        store2.set("temperature-unit", "fahrenheit");
        store2.set("temperature-scope", "all");

        expect(resolveTemperatureUnitPreference(sensorDevice, temperatureFeature)).toBe("fahrenheit");
    });

    it("gives per-device overrides precedence over global settings", () => {
        store2.set("temperature-unit", "fahrenheit");
        store2.set(getDeviceTemperatureUnitKey(climateDevice.ieee_address), "native");
        store2.set(getDeviceTemperatureUnitKey(sensorDevice.ieee_address), "celsius");

        expect(resolveTemperatureUnitPreference(climateDevice, temperatureFeature)).toBe("native");
        expect(resolveTemperatureUnitPreference(sensorDevice, temperatureFeature)).toBe("celsius");
    });

    it("never converts non-temperature numeric features", () => {
        store2.set("temperature-unit", "fahrenheit");
        store2.set("temperature-scope", "all");

        expect(resolveTemperatureUnitPreference(sensorDevice, { ...temperatureFeature, unit: "%" })).toBe("native");
    });
});
