import { describe, expect, it } from "vitest";
import {
    convertColorToString,
    convertFromColor,
    convertHexToRgb,
    convertHexToString,
    convertHsvToRgb,
    convertHsvToString,
    convertRgbToHex,
    convertRgbToHsv,
    convertRgbToString,
    convertRgbToXyY,
    convertStringToColor,
    convertStringToHsv,
    convertStringToRgb,
    convertStringToXyY,
    convertToColor,
    convertXyToRgb,
    convertXyYToString,
    getDeviceGamut,
    SUPPORTED_GAMUTS,
    type Vector3,
    type ZigbeeColor,
} from "../src/components/editors/index.js";
import type { ColorFormat } from "../src/types.js";

describe("color conversions", () => {
    it("detects device gamut from Philips descriptors", () => {
        expect(getDeviceGamut("Philips", "LivingColors Bloom")).toBe("philipsLivingColors");
        expect(getDeviceGamut("Philips", "Iris strip")).toBe("philipsLivingColors");
        expect(getDeviceGamut("Philips", "Hue bulb")).toBe("philipsHue");
        expect(getDeviceGamut("Other", "anything")).toBe("cie1931");
    });

    it("converts primaries to xy correctly across gamuts", () => {
        const primaries = [
            { name: "red", rgb: [255, 0, 0] as Vector3 },
            { name: "green", rgb: [0, 255, 0] as Vector3 },
            { name: "blue", rgb: [0, 0, 255] as Vector3 },
            { name: "white", rgb: [255, 255, 255] as Vector3 },
        ];

        const expected = {
            cie1931: [
                [0.7347, 0.2653],
                [0.2738, 0.7174],
                [0.1666, 0.0089],
                [1 / 3, 1 / 3],
            ],
            philipsHue: [
                [0.675, 0.322],
                [0.4091, 0.518],
                [0.167, 0.04],
                [1 / 3, 1 / 3],
            ],
            philipsLivingColors: [
                [0.704, 0.296],
                [0.2151, 0.7106],
                [0.138, 0.08],
                [1 / 3, 1 / 3],
            ],
        } as const;

        let i = 0;

        for (const primary of primaries) {
            for (const [key, gamut] of Object.entries(SUPPORTED_GAMUTS)) {
                const xyY = convertRgbToXyY(...primary.rgb, gamut);
                const [expectedX, expectedY] = expected[key as keyof typeof expected][i];

                expect(xyY[0]).toBeCloseTo(expectedX, 3);
                expect(xyY[1]).toBeCloseTo(expectedY, 3);

                const roundTrip = convertXyToRgb(xyY[0], xyY[1], xyY[2], gamut);
                expect(roundTrip[0]).toBeCloseTo(primary.rgb[0], 1);
                expect(roundTrip[1]).toBeCloseTo(primary.rgb[1], 1);
                expect(roundTrip[2]).toBeCloseTo(primary.rgb[2], 1);
            }

            i++;
        }
    });

    it("matches reference xy for verified random vectors", () => {
        const vectors: Vector3[] = [
            [12, 200, 45],
            [210, 120, 45],
        ];

        const expected: Record<keyof typeof SUPPORTED_GAMUTS, Array<Vector3>> = {
            cie1931: [
                [0.26650550128336625, 0.5721749788539626, 0.6473982876227985],
                [0.4518410517002019, 0.40951075744006393, 0.5298799161758426],
            ],
            philipsHue: [
                [0.40254161298617874, 0.5046802767838672, 0.5263709717356333],
                [0.44893661068959984, 0.4467925096144207, 0.2021762870257196],
            ],
            philipsLivingColors: [
                [0.21369420643415807, 0.6721442878940195, 0.3696838603284343],
                [0.5775004013467272, 0.37559571854458723, 0.2959061674822272],
            ],
        };

        let i = 0;

        for (const vector of vectors) {
            for (const [key, gamut] of Object.entries(SUPPORTED_GAMUTS)) {
                const actual = convertRgbToXyY(...vector, gamut);
                const [expectedX, expectedY, expectedL] = expected[key as keyof typeof expected][i];

                expect(actual[0]).toBeCloseTo(expectedX, 6);
                expect(actual[1]).toBeCloseTo(expectedY, 6);
                expect(actual[2]).toBeCloseTo(expectedL, 6);

                const back = convertXyToRgb(actual[0], actual[1], actual[2], gamut);
                expect(back[0]).toBeCloseTo(vector[0], 1);
                expect(back[1]).toBeCloseTo(vector[1], 1);
                expect(back[2]).toBeCloseTo(vector[2], 1);
            }

            i++;
        }
    });

    it("handles xy luminance caching and fallback", () => {
        const gamut = SUPPORTED_GAMUTS.cie1931;
        const explicitY = 0.42;
        const withCachedY = convertToColor({ x: gamut.white[0], y: gamut.white[1], Y: explicitY }, "color_xy", gamut);
        expect(withCachedY.color_xy[2]).toBeCloseTo(explicitY, 6);

        const zeroY = convertToColor({ x: 0.4, y: 0 }, "color_xy", gamut);
        expect(zeroY.color_rgb).toEqual([255, 255, 255]);

        const computedY = convertToColor({ x: 0.4, y: 0.3 }, "color_xy", gamut);
        expect(computedY.color_xy[2]).toBeGreaterThan(0);
    });

    it("handles HSV caching and conversion", () => {
        const gamut = SUPPORTED_GAMUTS.cie1931;
        const cached = convertToColor({ hue: 120, saturation: 70, value: 25 }, "color_hs", gamut);
        expect(cached.color_hs[2]).toBe(25);

        const hsvRoundTrip = convertRgbToHsv(255, 255, 255);
        expect(hsvRoundTrip).toEqual([0, 0, 100]);

        const rgbRoundTrip = convertHsvToRgb(240, 100, 50);
        expect(rgbRoundTrip[0]).toBeCloseTo(0, 3);
        expect(rgbRoundTrip[1]).toBeCloseTo(0, 3);
        expect(rgbRoundTrip[2]).toBeCloseTo(127.5, 3);
    });

    it("round-trips RGB and hex conversions", () => {
        const rgb: Vector3 = [10.4, 20.5, 30.6];
        const hex = convertRgbToHex(...rgb);
        expect(hex).toBe("#0a151f");
        expect(convertHexToRgb(hex)).toEqual([10, 21, 31]);
    });

    it("supports convertFromColor mappings", () => {
        const gamut = SUPPORTED_GAMUTS.cie1931;
        const color = convertToColor({ r: 10, g: 20, b: 30 }, "color_rgb", gamut);

        expect(convertFromColor(color, "color_xy")).toEqual({ x: color.color_xy[0], y: color.color_xy[1] });
        expect(convertFromColor(color, "color_hs")).toEqual({ hue: color.color_hs[0], saturation: color.color_hs[1], value: color.color_hs[2] });
        expect(convertFromColor(color, "color_rgb")).toEqual({ r: 10, g: 20, b: 30 });
        expect(convertFromColor(color, "hex")).toEqual({ hex: color.hex });
    });

    it("formats values as strings", () => {
        const sample: ZigbeeColor = {
            color_xy: [0.1234, 0.5678, 0.9],
            color_hs: [180.1234, 50.5678, 75.9012],
            color_rgb: [10.4, 20.5, 30.6],
            hex: "#0a141f",
        } as never;

        expect(convertXyYToString(sample.color_xy)).toBe("0.123, 0.568, 0.900");
        expect(convertHsvToString(sample.color_hs)).toBe("180.12°, 50.57%, 75.90%");
        expect(convertRgbToString(sample.color_rgb)).toBe("10, 21, 31");
        expect(convertHexToString(sample.hex)).toBe("#0a141f");
        expect(convertColorToString(sample)).toEqual({
            color_xy: "0.123, 0.568, 0.900",
            color_hs: "180.12°, 50.57%, 75.90%",
            color_rgb: "10, 21, 31",
            hex: "#0a141f",
        });
    });

    it("parses strings to numeric payloads and caches format-specific values", () => {
        const gamut = SUPPORTED_GAMUTS.philipsHue;
        expect(convertStringToXyY("x=0.5 y=0.25 Y=0.1")).toEqual([0.5, 0.25, 0.1]);
        expect(convertStringToHsv("-10, 200, 150")).toEqual([0, 100, 100]);
        expect(convertStringToRgb("-1, 256, 42")).toEqual([0, 255, 42]);

        const fromStringXy = convertStringToColor("0.25, 0.4", "color_xy", gamut);
        expect(fromStringXy.color_xy[0]).toBeCloseTo(0.25, 6);
        expect(fromStringXy.color_xy[1]).toBeCloseTo(0.4, 6);

        const fromStringHs = convertStringToColor("180, 20", "color_hs", gamut);
        expect(fromStringHs.color_hs[0]).toBe(180);
        expect(fromStringHs.color_hs[1]).toBe(20);

        const fromStringRgb = convertStringToColor("10,20,30", "color_rgb", gamut);
        expect(fromStringRgb.color_rgb).toEqual([10, 20, 30]);

        const fromHex = convertStringToColor("#AaBbCc", "hex", gamut);
        expect(fromHex.color_rgb).toEqual([170, 187, 204]);
    });

    it("covers default paths and invalid inputs", () => {
        const gamut = SUPPORTED_GAMUTS.cie1931;
        const defaultColor = convertToColor({} as never, "invalid" as ColorFormat, gamut);
        expect(defaultColor.color_rgb).toEqual([255, 255, 255]);

        const negativeXy = convertToColor({ x: 0.2, y: -0.5 }, "color_xy", gamut);
        expect(negativeXy.color_rgb).toEqual([0, 0, 0]);

        const negativeY = convertXyToRgb(0.2, -0.1, 1, gamut);
        expect(negativeY).toEqual([0, 0, 0]);

        const nanY = convertXyToRgb(0.2, Number.NaN, Number.NaN, gamut);
        expect(nanY).toEqual([0, 0, 0]);

        const nonFiniteMax = convertXyToRgb(Number.NaN, 0.4, undefined, gamut);
        expect(nonFiniteMax).toEqual([0, 0, 0]);

        const normalizedY = convertXyToRgb(gamut.white[0], gamut.white[1], undefined, gamut);
        expect(normalizedY[0]).toBeGreaterThan(0);
        expect(normalizedY[1]).toBeGreaterThan(0);
        expect(normalizedY[2]).toBeGreaterThan(0);

        const blackXy = convertRgbToXyY(0, 0, 0, gamut);
        expect(blackXy[2]).toBe(0);
    });
});
