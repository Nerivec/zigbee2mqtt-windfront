import { describe, expect, it } from "vitest";
import { getDeviceDescription, getExposeDescription, getExposeLabel, getExposeValueLabel } from "../src/utils/exposeTranslations.js";

describe("getExposeLabel", () => {
    it("returns translated label for specified locale", () => {
        const feature = {
            label: "Temperature",
            translations: { ru: { label: "Температура" } },
        } as any;
        expect(getExposeLabel(feature, "ru")).toBe("Температура");
    });

    it("falls back to feature.label when no translations", () => {
        const feature = { label: "Temperature" } as any;
        expect(getExposeLabel(feature, "ru")).toBe("Temperature");
    });

    it("falls back to feature.label when locale not in translations", () => {
        const feature = {
            label: "Temperature",
            translations: { de: { label: "Temperatur" } },
        } as any;
        expect(getExposeLabel(feature, "ru")).toBe("Temperature");
    });
});

describe("getExposeDescription", () => {
    it("returns translated description for specified locale", () => {
        const feature = {
            description: "Measured temperature",
            translations: { ru: { description: "Измеренная температура" } },
        } as any;
        expect(getExposeDescription(feature, "ru")).toBe("Измеренная температура");
    });

    it("falls back to feature.description when no translations", () => {
        const feature = { description: "Measured temperature" } as any;
        expect(getExposeDescription(feature, "ru")).toBe("Measured temperature");
    });

    it("returns undefined when no description", () => {
        const feature = { label: "test" } as any;
        expect(getExposeDescription(feature, "ru")).toBeUndefined();
    });
});

describe("getExposeValueLabel", () => {
    it("returns translated value for specified locale", () => {
        const translations = {
            ru: { values: { heat: "Обогрев", cool: "Охлаждение" } },
        };
        expect(getExposeValueLabel("heat", translations, "ru")).toBe("Обогрев");
    });

    it("falls back to capitalized value when no translations", () => {
        expect(getExposeValueLabel("heat", undefined, "ru")).toBe("Heat");
    });

    it("falls back to capitalized value when value not in translations", () => {
        const translations = {
            ru: { values: { heat: "Обогрев" } },
        };
        expect(getExposeValueLabel("auto", translations, "ru")).toBe("Auto");
    });
});

describe("getDeviceDescription", () => {
    it("returns translated description for specified locale", () => {
        const device = {
            definition: {
                description: "Single relay",
                translations: { ru: { description: "Одинарное реле" } },
            },
        } as any;
        expect(getDeviceDescription(device, "ru")).toBe("Одинарное реле");
    });

    it("falls back to definition.description when no translations", () => {
        const device = {
            definition: { description: "Single relay" },
        } as any;
        expect(getDeviceDescription(device, "ru")).toBe("Single relay");
    });

    it("returns undefined when no definition", () => {
        const device = {} as any;
        expect(getDeviceDescription(device, "ru")).toBeUndefined();
    });
});
