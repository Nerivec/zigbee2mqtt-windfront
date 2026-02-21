import { describe, expect, it } from "vitest";
import type { BasicFeature, Device, FeatureWithSubFeatures } from "../src/types.js";
import { FeatureAccessMode } from "../src/types.js";
import { computeCommonExposes, flattenExposes } from "../src/utils.js";

// Helper to create a minimal device with exposes
const createDevice = (ieeeAddress: string, exposes: (BasicFeature | FeatureWithSubFeatures)[]): Device => ({
    ieee_address: ieeeAddress,
    friendly_name: `device_${ieeeAddress}`,
    type: "EndDevice",
    interview_state: "SUCCESSFUL",
    network_address: 12345,
    supported: true,
    endpoints: {},
    definition: {
        source: "native",
        description: "Test device",
        model: "TEST",
        vendor: "Test",
        exposes,
        options: [],
    },
});

// Helper to create a numeric feature
const createNumericFeature = (name: string, access: number = FeatureAccessMode.ALL, valueMin?: number, valueMax?: number): BasicFeature => ({
    type: "numeric",
    name,
    property: name,
    access,
    ...(valueMin !== undefined && { value_min: valueMin }),
    ...(valueMax !== undefined && { value_max: valueMax }),
});

// Helper to create an enum feature
const createEnumFeature = (name: string, values: string[], access: number = FeatureAccessMode.ALL): BasicFeature => ({
    type: "enum",
    name,
    property: name,
    access,
    values,
});

// Helper to create a binary feature
const createBinaryFeature = (
    name: string,
    valueOn: string | boolean,
    valueOff: string | boolean,
    access: number = FeatureAccessMode.ALL,
): BasicFeature => ({
    type: "binary",
    name,
    property: name,
    access,
    value_on: valueOn,
    value_off: valueOff,
});

// Helper to create a text feature
const createTextFeature = (name: string, access: number = FeatureAccessMode.ALL): BasicFeature => ({
    type: "text",
    name,
    property: name,
    access,
});

// Helper to create a feature with sub-features (like "light")
const createLightFeature = (features: BasicFeature[]): FeatureWithSubFeatures => ({
    type: "light",
    name: "light",
    features,
});

describe("flattenExposes", () => {
    it("flattens basic features with SET access", () => {
        const exposes: BasicFeature[] = [
            createNumericFeature("brightness", FeatureAccessMode.ALL, 0, 254),
            createEnumFeature("effect", ["blink", "breathe"], FeatureAccessMode.SET),
        ];

        const result = flattenExposes(exposes);

        expect(result).toHaveLength(2);
        expect(result[0].path).toEqual(["brightness"]);
        expect(result[0].feature.name).toBe("brightness");
        expect(result[1].path).toEqual(["effect"]);
        expect(result[1].feature.name).toBe("effect");
    });

    it("excludes features without SET access", () => {
        const exposes: BasicFeature[] = [
            createNumericFeature("brightness", FeatureAccessMode.ALL, 0, 254),
            createNumericFeature("linkquality", FeatureAccessMode.STATE, 0, 255), // Read-only
            createNumericFeature("battery", FeatureAccessMode.STATE_GET, 0, 100), // Read-only
        ];

        const result = flattenExposes(exposes);

        expect(result).toHaveLength(1);
        expect(result[0].feature.name).toBe("brightness");
    });

    it("flattens nested features from composite types", () => {
        const lightFeature = createLightFeature([
            createBinaryFeature("state", "ON", "OFF", FeatureAccessMode.ALL),
            createNumericFeature("brightness", FeatureAccessMode.ALL, 0, 254),
            createNumericFeature("color_temp", FeatureAccessMode.ALL, 153, 500),
        ]);

        const result = flattenExposes([lightFeature]);

        expect(result).toHaveLength(3);
        expect(result[0].path).toEqual(["light", "state"]);
        expect(result[1].path).toEqual(["light", "brightness"]);
        expect(result[2].path).toEqual(["light", "color_temp"]);
    });

    it("handles empty exposes array", () => {
        const result = flattenExposes([]);
        expect(result).toHaveLength(0);
    });
});

describe("computeCommonExposes", () => {
    it("returns empty array for empty devices array", () => {
        const result = computeCommonExposes([]);
        expect(result).toHaveLength(0);
    });

    it("returns empty array when devices have no exposes", () => {
        const device1: Device = {
            ieee_address: "0x001",
            friendly_name: "device1",
            type: "EndDevice",
            interview_state: "SUCCESSFUL",
            network_address: 12345,
            supported: true,
            endpoints: {},
            definition: null,
        };
        const device2: Device = {
            ...device1,
            ieee_address: "0x002",
            friendly_name: "device2",
        };

        const result = computeCommonExposes([device1, device2]);
        expect(result).toHaveLength(0);
    });

    it("returns all settable features for a single device", () => {
        const device = createDevice("0x001", [
            createNumericFeature("brightness", FeatureAccessMode.ALL, 0, 254),
            createNumericFeature("linkquality", FeatureAccessMode.STATE, 0, 255), // Should be excluded
        ]);

        const result = computeCommonExposes([device]);

        expect(result).toHaveLength(1);
        expect(result[0].name).toBe("brightness");
    });

    it("returns intersection of features across devices", () => {
        const device1 = createDevice("0x001", [
            createNumericFeature("brightness", FeatureAccessMode.ALL, 0, 254),
            createEnumFeature("effect", ["blink", "breathe"], FeatureAccessMode.SET),
        ]);
        const device2 = createDevice("0x002", [
            createNumericFeature("brightness", FeatureAccessMode.ALL, 0, 254),
            createNumericFeature("color_temp", FeatureAccessMode.ALL, 153, 500),
        ]);

        const result = computeCommonExposes([device1, device2]);

        expect(result).toHaveLength(1);
        expect(result[0].name).toBe("brightness");
    });

    it("computes intersection of numeric ranges", () => {
        const device1 = createDevice("0x001", [createNumericFeature("brightness", FeatureAccessMode.ALL, 0, 254)]);
        const device2 = createDevice("0x002", [createNumericFeature("brightness", FeatureAccessMode.ALL, 10, 200)]);
        const device3 = createDevice("0x003", [createNumericFeature("brightness", FeatureAccessMode.ALL, 5, 220)]);

        const result = computeCommonExposes([device1, device2, device3]);

        expect(result).toHaveLength(1);
        expect(result[0].name).toBe("brightness");
        expect((result[0] as { value_min?: number }).value_min).toBe(10);
        expect((result[0] as { value_max?: number }).value_max).toBe(200);
    });

    it("excludes features with non-overlapping numeric ranges", () => {
        const device1 = createDevice("0x001", [createNumericFeature("brightness", FeatureAccessMode.ALL, 0, 100)]);
        const device2 = createDevice("0x002", [createNumericFeature("brightness", FeatureAccessMode.ALL, 150, 254)]);

        const result = computeCommonExposes([device1, device2]);

        expect(result).toHaveLength(0);
    });

    it("requires identical enum values for compatibility", () => {
        const device1 = createDevice("0x001", [createEnumFeature("mode", ["auto", "manual"], FeatureAccessMode.SET)]);
        const device2 = createDevice("0x002", [createEnumFeature("mode", ["auto", "manual"], FeatureAccessMode.SET)]);

        const result = computeCommonExposes([device1, device2]);

        expect(result).toHaveLength(1);
        expect(result[0].name).toBe("mode");
    });

    it("excludes enums with different values", () => {
        const device1 = createDevice("0x001", [createEnumFeature("mode", ["auto", "manual"], FeatureAccessMode.SET)]);
        const device2 = createDevice("0x002", [createEnumFeature("mode", ["auto", "eco"], FeatureAccessMode.SET)]);

        const result = computeCommonExposes([device1, device2]);

        expect(result).toHaveLength(0);
    });

    it("requires identical binary on/off values", () => {
        const device1 = createDevice("0x001", [createBinaryFeature("state", "ON", "OFF", FeatureAccessMode.ALL)]);
        const device2 = createDevice("0x002", [createBinaryFeature("state", "ON", "OFF", FeatureAccessMode.ALL)]);

        const result = computeCommonExposes([device1, device2]);

        expect(result).toHaveLength(1);
        expect(result[0].name).toBe("state");
    });

    it("excludes binary features with different on/off values", () => {
        const device1 = createDevice("0x001", [createBinaryFeature("state", "ON", "OFF", FeatureAccessMode.ALL)]);
        const device2 = createDevice("0x002", [createBinaryFeature("state", true, false, FeatureAccessMode.ALL)]);

        const result = computeCommonExposes([device1, device2]);

        expect(result).toHaveLength(0);
    });

    it("handles nested features in composite types", () => {
        const lightFeature1 = createLightFeature([
            createBinaryFeature("state", "ON", "OFF", FeatureAccessMode.ALL),
            createNumericFeature("brightness", FeatureAccessMode.ALL, 0, 254),
        ]);
        const lightFeature2 = createLightFeature([
            createBinaryFeature("state", "ON", "OFF", FeatureAccessMode.ALL),
            createNumericFeature("brightness", FeatureAccessMode.ALL, 0, 254),
            createNumericFeature("color_temp", FeatureAccessMode.ALL, 153, 500),
        ]);

        const device1 = createDevice("0x001", [lightFeature1]);
        const device2 = createDevice("0x002", [lightFeature2]);

        const result = computeCommonExposes([device1, device2]);

        expect(result).toHaveLength(2);
        expect(result.map((f) => f.name).sort()).toEqual(["brightness", "state"]);
    });

    it("handles text features as compatible if name matches", () => {
        const device1 = createDevice("0x001", [createTextFeature("description", FeatureAccessMode.SET)]);
        const device2 = createDevice("0x002", [createTextFeature("description", FeatureAccessMode.SET)]);

        const result = computeCommonExposes([device1, device2]);

        expect(result).toHaveLength(1);
        expect(result[0].name).toBe("description");
    });

    it("excludes features with different types but same name", () => {
        const device1 = createDevice("0x001", [createNumericFeature("value", FeatureAccessMode.SET, 0, 100)]);
        const device2 = createDevice("0x002", [createTextFeature("value", FeatureAccessMode.SET)]);

        const result = computeCommonExposes([device1, device2]);

        expect(result).toHaveLength(0);
    });

    it("handles devices with mix of valid and invalid definitions", () => {
        const device1 = createDevice("0x001", [createNumericFeature("brightness", FeatureAccessMode.ALL, 0, 254)]);
        const device2: Device = {
            ieee_address: "0x002",
            friendly_name: "device2",
            type: "EndDevice",
            interview_state: "SUCCESSFUL",
            network_address: 12345,
            supported: true,
            endpoints: {},
            definition: null,
        };
        const device3 = createDevice("0x003", [createNumericFeature("brightness", FeatureAccessMode.ALL, 0, 254)]);

        const result = computeCommonExposes([device1, device2, device3]);

        expect(result).toHaveLength(1);
        expect(result[0].name).toBe("brightness");
    });
});
