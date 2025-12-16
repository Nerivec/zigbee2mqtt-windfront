import { describe, expect, it } from "vitest";

import {
    convertColorToString,
    convertFromColor,
    convertHexToRgb,
    convertHsvToRgb,
    convertRgbToHex,
    convertRgbToHsv,
    convertRgbToXyY,
    convertStringToColor,
    convertStringToHsv,
    convertStringToRgb,
    convertStringToXyY,
    convertToColor,
    convertXyToRgb,
    SUPPORTED_COLOR_SPACES,
} from "../src/components/editors/index.js";
import type { AnyColor, ColorFormat } from "../src/types.js";

const expectVectorCloseTo = (actual: ReadonlyArray<number>, expected: ReadonlyArray<number>, digits = 1): void => {
    actual.forEach((value, index) => {
        expect(value).toBeCloseTo(expected[index], digits);
    });
};

const SRGB_REFERENCE_XYY: Record<string, [number, number, number]> = {
    red: [0.6401, 0.33, 0.2126],
    green: [0.3, 0.6, 0.7152],
    blue: [0.15, 0.06, 0.0722],
    white: [0.3127, 0.329, 1],
};

const REC709_REFERENCE_XYY = SRGB_REFERENCE_XYY;

const REC2020_REFERENCE_XYY: Record<string, [number, number, number]> = {
    red: [0.708, 0.292, 0.2627],
    green: [0.17, 0.797, 0.678],
    blue: [0.131, 0.046, 0.0593],
    white: [0.3127, 0.329, 1],
};

const REC2100_REFERENCE_XYY = REC2020_REFERENCE_XYY; // Same primaries/whitepoint as Rec.2020

describe("Color conversions", () => {
    const roundTripPrimaries = (csKey: keyof typeof SUPPORTED_COLOR_SPACES) => {
        const primaries: Array<[number, number, number]> = [
            [255, 0, 0],
            [0, 255, 0],
            [0, 0, 255],
            [255, 255, 255],
            [0, 0, 0],
        ];

        for (const [r, g, b] of primaries) {
            const [x, y, Y] = convertRgbToXyY(r, g, b, SUPPORTED_COLOR_SPACES[csKey]);
            const [rr, gg, bb] = convertXyToRgb(x, y, Y, SUPPORTED_COLOR_SPACES[csKey]);

            expectVectorCloseTo([rr, gg, bb], [r, g, b], 0);
            expect(Number.isFinite(x)).toBe(true);
            expect(Number.isFinite(y)).toBe(true);
        }
    };

    const assertReferences = (csKey: keyof typeof SUPPORTED_COLOR_SPACES, refs: Record<string, [number, number, number]>) => {
        const cs = SUPPORTED_COLOR_SPACES[csKey];
        expectVectorCloseTo(convertRgbToXyY(255, 0, 0, cs), refs.red, 3);
        expectVectorCloseTo(convertRgbToXyY(0, 255, 0, cs), refs.green, 3);
        expectVectorCloseTo(convertRgbToXyY(0, 0, 255, cs), refs.blue, 3);
        expectVectorCloseTo(convertRgbToXyY(255, 255, 255, cs), refs.white, 3);
    };

    it("converts rgb to hex and back without losing channel values", () => {
        const rgb = [17, 34, 51] as const;
        const hex = convertRgbToHex(...rgb);
        const back = convertHexToRgb(hex);

        expect(hex).toBe("#112233");
        expectVectorCloseTo(back, rgb, 5);
    });

    it("round-trips rgb -> hsv -> rgb within tolerance", () => {
        const rgb = [12, 200, 128] as const;
        const hsv = convertRgbToHsv(...rgb);
        const back = convertHsvToRgb(...hsv);

        expectVectorCloseTo(back, rgb, 0);
        expect(hsv[0]).toBeGreaterThanOrEqual(0);
        expect(hsv[0]).toBeLessThanOrEqual(360);
    });

    it("round-trips primaries across all color spaces", () => {
        roundTripPrimaries("sRgb");
        roundTripPrimaries("rec709");
        roundTripPrimaries("rec2020");
        roundTripPrimaries("rec2100pq");
        roundTripPrimaries("rec2100hlg");
    });

    it("matches sRGB xyY reference values for primaries and white", () => {
        assertReferences("sRgb", SRGB_REFERENCE_XYY);
    });

    it("matches Rec.709 xyY reference values for primaries and white", () => {
        assertReferences("rec709", REC709_REFERENCE_XYY);
    });

    it("matches Rec.2020 xyY reference values for primaries and white", () => {
        assertReferences("rec2020", REC2020_REFERENCE_XYY);
    });

    it("matches Rec.2100 PQ xyY reference values for primaries and white", () => {
        assertReferences("rec2100pq", REC2100_REFERENCE_XYY);
    });

    it("matches Rec.2100 HLG xyY reference values for primaries and white", () => {
        assertReferences("rec2100hlg", REC2100_REFERENCE_XYY);
    });

    it("distinguishes transfer curves at mid-gray (sRGB vs Rec.709)", () => {
        const srgbMid = convertRgbToXyY(128, 128, 128, SUPPORTED_COLOR_SPACES.sRgb);
        const rec709Mid = convertRgbToXyY(128, 128, 128, SUPPORTED_COLOR_SPACES.rec709);

        // Chromaticity should match (same primaries), luminance should differ because of transfer curves.
        expectVectorCloseTo([srgbMid[0], srgbMid[1]], [rec709Mid[0], rec709Mid[1]], 3);
        expect(rec709Mid[2]).toBeGreaterThan(srgbMid[2]);
        expect(rec709Mid[2] - srgbMid[2]).toBeGreaterThan(0.02);
    });

    it("distinguishes transfer curves in the toe region (sRGB vs Rec.709)", () => {
        const srgbDark = convertRgbToXyY(16, 16, 16, SUPPORTED_COLOR_SPACES.sRgb);
        const rec709Dark = convertRgbToXyY(16, 16, 16, SUPPORTED_COLOR_SPACES.rec709);

        expectVectorCloseTo([srgbDark[0], srgbDark[1]], [rec709Dark[0], rec709Dark[1]], 3);
        expect(rec709Dark[2]).toBeGreaterThan(srgbDark[2]);
        expect(rec709Dark[2] - srgbDark[2]).toBeGreaterThan(0.001);
    });

    it("orders luminance across all transfer curves at mid-gray", () => {
        const code = 128;
        const spaces = ["rec2020", "rec709", "sRgb", "rec2100hlg", "rec2100pq"] as const;
        const lumas = spaces.map((key) => convertRgbToXyY(code, code, code, SUPPORTED_COLOR_SPACES[key])[2]);

        expect(lumas[0]).toBeGreaterThan(lumas[1]); // rec2020 > rec709
        expect(lumas[1]).toBeGreaterThan(lumas[2]); // rec709 > sRgb
        expect(lumas[2]).toBeGreaterThan(lumas[3]); // sRgb > hlg
        expect(lumas[3]).toBeGreaterThan(lumas[4]); // hlg > pq
    });

    it("orders luminance across all transfer curves in the toe", () => {
        const code = 16;
        const spaces = ["rec2020", "rec709", "sRgb", "rec2100hlg", "rec2100pq"] as const;
        const lumas = spaces.map((key) => convertRgbToXyY(code, code, code, SUPPORTED_COLOR_SPACES[key])[2]);

        expect(Math.abs(lumas[0] - lumas[1])).toBeLessThan(1e-6); // rec2020 ~ rec709
        expect(lumas[1]).toBeGreaterThan(lumas[2]); // rec709 > sRgb
        expect(lumas[2]).toBeGreaterThan(lumas[3]); // sRgb > hlg
        expect(lumas[3]).toBeGreaterThan(lumas[4]); // hlg > pq
    });

    it("returns D65 chromaticity for black while keeping luminance zero", () => {
        const [x, y, Y] = convertRgbToXyY(0, 0, 0, SUPPORTED_COLOR_SPACES.rec2020);

        expect(Y).toBe(0);
        expect(x).toBeCloseTo(0.313, 3);
        expect(y).toBeCloseTo(0.329, 3);
    });

    it("uses proper PQ transfer for Rec.2100 PQ", () => {
        const pq = SUPPORTED_COLOR_SPACES.rec2100pq;
        const xy = convertRgbToXyY(255, 0, 0, pq);
        const rgbBack = convertXyToRgb(xy[0], xy[1], xy[2], pq);

        expectVectorCloseTo(rgbBack, [255, 0, 0], 0);
        expectVectorCloseTo([xy[0], xy[1]], [0.708, 0.292], 3);
    });

    it("uses proper HLG transfer for Rec.2100 HLG", () => {
        const hlg = SUPPORTED_COLOR_SPACES.rec2100hlg;
        const xy = convertRgbToXyY(255, 0, 0, hlg);
        const rgbBack = convertXyToRgb(xy[0], xy[1], xy[2], hlg);

        expectVectorCloseTo(rgbBack, [255, 0, 0], 0);
        expectVectorCloseTo([xy[0], xy[1]], [0.708, 0.292], 3);
    });

    it("clamps parsed hsv strings to valid bounds", () => {
        const color = convertStringToColor("400°, -10%, 250%", "color_hs", SUPPORTED_COLOR_SPACES.rec2020);

        expectVectorCloseTo(color.color_hs, [360, 0, 100], 5);
        expect(color.hex.startsWith("#")).toBe(true);
    });

    it("uses full brightness when converting from hs input", () => {
        const hue = 120;
        const saturation = 50;
        const color = convertToColor({ hue, saturation }, "color_hs", SUPPORTED_COLOR_SPACES.rec2020);
        const expectedRgb = convertHsvToRgb(hue, saturation, 100);

        expect(color.color_hs[2]).toBe(100);
        expectVectorCloseTo(color.color_rgb, expectedRgb, 0);
    });

    it("converts xyY reference primaries back to rgb using provided luminance", () => {
        const red = convertXyToRgb(...SRGB_REFERENCE_XYY.red, SUPPORTED_COLOR_SPACES.sRgb);
        const green = convertXyToRgb(...SRGB_REFERENCE_XYY.green, SUPPORTED_COLOR_SPACES.sRgb);
        const blue = convertXyToRgb(...SRGB_REFERENCE_XYY.blue, SUPPORTED_COLOR_SPACES.sRgb);

        expectVectorCloseTo(red, [255, 0, 0], 0);
        expectVectorCloseTo(green, [0, 255, 0], 0);
        expectVectorCloseTo(blue, [0, 0, 255], 0);
    });

    it("parses xyY strings via convertStringToXyY", () => {
        expectVectorCloseTo(convertStringToXyY("0.1, 0.2, 0.3"), [0.1, 0.2, 0.3], 5);
    });

    it("parses hsv and rgb strings via convertString helpers", () => {
        expectVectorCloseTo(convertStringToHsv("720, -10, 150"), [360, 0, 100], 5);
        expectVectorCloseTo(convertStringToRgb("-5, 128, 999"), [0, 128, 255], 5);
    });

    it("handles invalid chromaticity input safely", () => {
        expectVectorCloseTo(convertXyToRgb(0.2, 0, undefined, SUPPORTED_COLOR_SPACES.rec2020), [0, 0, 0], 5);
    });

    it("returns zero for negative or zero y chromaticity", () => {
        expectVectorCloseTo(convertXyToRgb(0.2, -0.1, undefined, SUPPORTED_COLOR_SPACES.rec2020), [0, 0, 0], 5);
        expectVectorCloseTo(convertXyToRgb(0.2, 0, undefined, SUPPORTED_COLOR_SPACES.rec709), [0, 0, 0], 5);
    });

    it("returns zero when maximum luminance search fails", () => {
        // Invalid chromaticity (NaN) forces findMaximumY to hit a non-finite value and bail out
        expectVectorCloseTo(convertXyToRgb(Number.NaN, Number.NaN, undefined, SUPPORTED_COLOR_SPACES.rec709), [0, 0, 0], 5);
    });

    it("parses color_xy with missing luminance and zero y using fallback", () => {
        const color = convertToColor({ x: 0.1, y: 0 }, "color_xy", SUPPORTED_COLOR_SPACES.rec709);

        expect(color.color_xy[1]).toBeCloseTo(0, 5); // stored y remains zero
        expectVectorCloseTo(color.color_rgb, [255, 255, 255], 0); // white fallback for y=0
        expect(color.color_xy[0]).toBeCloseTo(0.1, 3);
        expect(color.hex).toBe("#ffffff");
    });

    it("respects provided luminance in color_xy", () => {
        const Y = 0.5;
        const color = convertToColor({ x: 0.64, y: 0.33, Y }, "color_xy", SUPPORTED_COLOR_SPACES.rec709);

        expect(color.color_xy[2]).toBeCloseTo(Y, 5);
    });

    it("uses computed luminance when Y is omitted for valid chromaticity", () => {
        const color = convertToColor({ x: 0.64, y: 0.33 }, "color_xy", SUPPORTED_COLOR_SPACES.rec709);

        expectVectorCloseTo(convertXyToRgb(color.color_xy[0], color.color_xy[1], color.color_xy[2], SUPPORTED_COLOR_SPACES.rec709), [255, 0, 0], 0);
    });

    it("parses color_xy strings through convertStringToColor", () => {
        const color = convertStringToColor("0.64, 0.33, 0.5", "color_xy", SUPPORTED_COLOR_SPACES.rec709);

        expectVectorCloseTo(convertXyToRgb(color.color_xy[0], color.color_xy[1], color.color_xy[2], SUPPORTED_COLOR_SPACES.rec709), [255, 0, 0], 0);
    });

    it("converts hex input through convertToColor", () => {
        const color = convertToColor({ hex: "#0f0f0f" }, "hex", SUPPORTED_COLOR_SPACES.sRgb);

        expect(color.color_rgb[0]).toBe(15);
        expect(color.hex).toBe("#0f0f0f");
    });

    it("parses hex input through convertStringToColor", () => {
        const color = convertStringToColor("#123abc", "hex", SUPPORTED_COLOR_SPACES.sRgb);

        expect(color.hex).toBe("#123abc");
        expectVectorCloseTo(color.color_rgb, convertHexToRgb("#123abc"), 0);
    });

    it("falls back to default when format is unknown", () => {
        const color = convertToColor({} as AnyColor, "color_xyz" as ColorFormat, SUPPORTED_COLOR_SPACES.rec709);

        expectVectorCloseTo(color.color_rgb, [255, 255, 255], 0);
        expect(color.hex).toBe("#ffffff");
    });

    it("handles PQ transfer edge cases", () => {
        const pq = SUPPORTED_COLOR_SPACES.rec2100pq.transfer;

        expect(pq.decode(1e9)).toBe(0); // denominator guard
        expect(pq.decode(Number.NaN)).toBe(0); // non-finite ratio guard
        expect(pq.encode(-1)).toBe(pq.encode(0)); // negative linear clamps to zero
    });

    it("formats color strings consistently", () => {
        const color = convertToColor({ r: 10, g: 20, b: 30 }, "color_rgb", SUPPORTED_COLOR_SPACES.rec2020);
        const formatted = convertColorToString(color);

        expect(formatted.hex).toBe("#0a141e");
        expect(formatted.color_rgb).toBe("10, 20, 30");
        expect(formatted.color_hs).toContain("°");
        expect(formatted.color_xy.split(",").length).toBe(3);
    });

    it("parses and clamps rgb strings with out-of-range values", () => {
        const color = convertStringToColor("-20, 260, 999", "color_rgb", SUPPORTED_COLOR_SPACES.rec2020);

        expectVectorCloseTo(color.color_rgb, [0, 255, 255], 0);
    });

    it("handles hex conversion case-insensitively", () => {
        const lower = convertHexToRgb("#ff00ff");
        const upper = convertHexToRgb("#FF00FF");

        expectVectorCloseTo(lower, upper, 0);
        expect(convertRgbToHex(...upper)).toBe("#ff00ff");
    });

    it("returns canonical hsv values for basic rgb colors", () => {
        expectVectorCloseTo(convertRgbToHsv(255, 0, 0), [0, 100, 100], 0);
        expectVectorCloseTo(convertRgbToHsv(0, 255, 0), [120, 100, 100], 0);
        expectVectorCloseTo(convertRgbToHsv(0, 0, 255), [240, 100, 100], 0);
        expectVectorCloseTo(convertRgbToHsv(255, 255, 255), [0, 0, 100], 0);
        expectVectorCloseTo(convertRgbToHsv(0, 0, 0), [0, 0, 0], 0);
    });

    it("returns canonical rgb values for basic hsv colors", () => {
        expectVectorCloseTo(convertHsvToRgb(0, 100, 100), [255, 0, 0], 0);
        expectVectorCloseTo(convertHsvToRgb(120, 100, 100), [0, 255, 0], 0);
        expectVectorCloseTo(convertHsvToRgb(240, 100, 100), [0, 0, 255], 0);
        expectVectorCloseTo(convertHsvToRgb(0, 0, 100), [255, 255, 255], 0);
        expectVectorCloseTo(convertHsvToRgb(42, 0, 0), [0, 0, 0], 0);
    });

    it("converts through zigbee color shapes with minimal payloads", () => {
        const rgbColor = convertToColor({ r: 1, g: 2, b: 3 }, "color_rgb", SUPPORTED_COLOR_SPACES.rec2020);
        const rgbPayload = convertFromColor(rgbColor, "color_rgb");
        const xyPayload = convertFromColor(rgbColor, "color_xy");
        const hsPayload = convertFromColor(rgbColor, "color_hs");
        const hexPayload = convertFromColor(rgbColor, "hex");

        expect(rgbPayload).toEqual({ r: 1, g: 2, b: 3 });
        expect(xyPayload).toEqual({ x: rgbColor.color_xy[0], y: rgbColor.color_xy[1] });
        expect(hsPayload).toEqual({ hue: rgbColor.color_hs[0], saturation: rgbColor.color_hs[1] });
        expect(hexPayload).toEqual({ hex: rgbColor.hex });
    });
});
