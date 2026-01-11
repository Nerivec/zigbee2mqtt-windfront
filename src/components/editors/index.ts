/**
 * Adapted from: https://viereck.ch/hue-xy-rgb/
 */
import clamp from "lodash/clamp.js";
import type { AnyColor, ColorFormat, HexColor, HueSaturationColor, RGBColor, XYColor } from "../../types.js";

export type Vector3 = [number, number, number];
type Vector2 = [number, number];
type Matrix3 = [number, number, number, number, number, number, number, number, number];

export interface GammaCorrection {
    encode: (linear: number) => number; // linear [0..1] -> non-linear
    decode: (nonLinear: number) => number; // non-linear [0..1] -> linear
}

export interface Gamut {
    name: string;
    red: Vector2;
    green: Vector2;
    blue: Vector2;
    white: Vector2;
    gammaCorrection: Readonly<GammaCorrection>;
}

export interface ZigbeeColor extends Record<ColorFormat, Vector3 | string> {
    color_rgb: Vector3;
    color_hs: Vector3;
    color_xy: Vector3;
    hex: string;
}

export interface ZigbeeColorString extends Record<ColorFormat, string> {
    color_rgb: string;
    color_hs: string;
    color_xy: string;
    hex: string;
}

const clampMatrixValue = (value: number): number => {
    return Number.isFinite(value) ? value : 0;
};

const xyToXyz = ([x, y]: Vector2): Vector3 => {
    const z = 1 - x - y;
    const Y = 1;

    return [x / y, Y, z / y];
};

const invert3x3 = (m: Matrix3): Matrix3 => {
    const [a, b, c, d, e, f, g, h, i] = m;
    const A = e * i - f * h;
    const B = -(d * i - f * g);
    const C = d * h - e * g;
    const det = a * A + b * B + c * C;

    if (Math.abs(det) < 1e-9 || !Number.isFinite(det)) {
        return [0, 0, 0, 0, 0, 0, 0, 0, 0];
    }

    const invDet = 1 / det;

    return [
        clampMatrixValue(A * invDet),
        clampMatrixValue((c * h - b * i) * invDet),
        clampMatrixValue((b * f - c * e) * invDet),
        clampMatrixValue(B * invDet),
        clampMatrixValue((a * i - c * g) * invDet),
        clampMatrixValue((c * d - a * f) * invDet),
        clampMatrixValue(C * invDet),
        clampMatrixValue((b * g - a * h) * invDet),
        clampMatrixValue((a * e - b * d) * invDet),
    ];
};

const multiplyMatrix3 = (m: Matrix3, v: Vector3): Vector3 => {
    return [m[0] * v[0] + m[1] * v[1] + m[2] * v[2], m[3] * v[0] + m[4] * v[1] + m[5] * v[2], m[6] * v[0] + m[7] * v[1] + m[8] * v[2]];
};

const buildMatrices = (gamut: Gamut): { toXyz: Matrix3; toRgb: Matrix3 } => {
    const [Xr, Yr, Zr] = xyToXyz(gamut.red);
    const [Xg, Yg, Zg] = xyToXyz(gamut.green);
    const [Xb, Yb, Zb] = xyToXyz(gamut.blue);
    const [Xw, Yw, Zw] = xyToXyz(gamut.white);

    const primariesMatrix: Matrix3 = [Xr, Xg, Xb, Yr, Yg, Yb, Zr, Zg, Zb];
    const primariesInv = invert3x3(primariesMatrix);
    const [Sr, Sg, Sb] = multiplyMatrix3(primariesInv, [Xw, Yw, Zw]);

    const toXyz: Matrix3 = [Xr * Sr, Xg * Sg, Xb * Sb, Yr * Sr, Yg * Sg, Yb * Sb, Zr * Sr, Zg * Sg, Zb * Sb];

    return { toXyz, toRgb: invert3x3(toXyz) };
};

const makeGammaCorrection = (params: { threshold: number; slope: number; exponent: number; offset: number }): Readonly<GammaCorrection> => {
    const { threshold, slope, exponent, offset } = params;

    const encode = (linear: number): number => {
        if (linear <= threshold) {
            return slope * linear;
        }

        return (1 + offset) * linear ** (1 / exponent) - offset;
    };

    const thresholdEnc = encode(threshold);

    const decode = (nonLinear: number): number => {
        if (nonLinear <= thresholdEnc) {
            return nonLinear / slope;
        }

        return ((nonLinear + offset) / (1 + offset)) ** exponent;
    };

    return { encode, decode };
};

const GAMMA_CORRECTION_LINEAR: Readonly<GammaCorrection> = {
    encode: (linear: number): number => clamp(linear, 0, 1),
    decode: (nonLinear: number): number => clamp(nonLinear, 0, 1),
};

const GAMMA_CORRECTION_SRGB = makeGammaCorrection({ threshold: 0.0031308, slope: 12.92, exponent: 2.4, offset: 0.055 });

/** https://en.wikipedia.org/wiki/CIE_1931_color_space */
const CIE1931: Readonly<Gamut> = {
    name: "Zigbee / CIE 1931",
    red: [0.7347, 0.2653],
    green: [0.2738, 0.7174],
    blue: [0.1666, 0.0089],
    white: [1 / 3, 1 / 3],
    gammaCorrection: GAMMA_CORRECTION_LINEAR,
};
/** https://developers.meethue.com/develop/application-design-guidance/color-conversion-formulas-rgb-to-xy-and-back/ */
const PHILIPS_HUE: Readonly<Gamut> = {
    name: "Philips Hue",
    red: [0.675, 0.322],
    green: [0.4091, 0.518],
    blue: [0.167, 0.04],
    white: [1 / 3, 1 / 3],
    gammaCorrection: GAMMA_CORRECTION_SRGB,
};
/** https://developers.meethue.com/develop/application-design-guidance/color-conversion-formulas-rgb-to-xy-and-back/ */
const PHILIPS_HUE_LIVING_COLORS: Readonly<Gamut> = {
    name: "Philips Hue Living Colors",
    red: [0.704, 0.296],
    green: [0.2151, 0.7106],
    blue: [0.138, 0.08],
    white: [1 / 3, 1 / 3],
    gammaCorrection: GAMMA_CORRECTION_SRGB,
};

export const SUPPORTED_GAMUTS = {
    cie1931: CIE1931,
    philipsHue: PHILIPS_HUE,
    philipsLivingColors: PHILIPS_HUE_LIVING_COLORS,
} as const;

const gamutMatrices: Record<string, ReturnType<typeof buildMatrices>> = {};

for (const key in SUPPORTED_GAMUTS) {
    const entry = SUPPORTED_GAMUTS[key as keyof typeof SUPPORTED_GAMUTS];

    gamutMatrices[entry.name] = buildMatrices(entry);
}

/**
 * Use vendor and description from device definition to determine the proper gamut.
 * This can be easily expanded by added entries to @see SUPPORTED_GAMUTS and by refining checks in this function as appropriate.
 */
export const getDeviceGamut = (vendor: string, description: string): keyof typeof SUPPORTED_GAMUTS => {
    if (vendor === "Philips") {
        if (description.includes("LivingColors") || description.includes("Bloom") || description.includes("Aura") || description.includes("Iris")) {
            return "philipsLivingColors";
        }

        return "philipsHue";
    }

    return "cie1931";
};

const timesArray = (array: Vector3, matrix: Matrix3): Vector3 => {
    const result: Vector3 = [0, 0, 0];

    for (let i = 0; i < 3; i++) {
        result[i] = 0;

        for (let n = 0; n < 3; n++) {
            result[i] += matrix[i * 3 + n] * array[n];
        }
    }

    return result;
};

const findMaximumY = (x: number, y: number, gamut: Gamut, iterations = 10) => {
    if (y <= 0) {
        return 0;
    }

    let bri = 1;

    for (let i = 0; i < iterations; i++) {
        const max = Math.max(...convertXyYToRgb(x, y, bri, gamut));

        if (max <= 0 || !Number.isFinite(max)) {
            return 0;
        }

        bri = bri / max;
    }

    return bri;
};

/** Expects RGB in [0..1] range */
const convertRgbToXyz = (r: number, g: number, b: number, gamut: Gamut): Vector3 => {
    const rgb: Vector3 = [gamut.gammaCorrection.decode(r), gamut.gammaCorrection.decode(g), gamut.gammaCorrection.decode(b)];
    const { toXyz } = gamutMatrices[gamut.name];

    return timesArray(rgb, toXyz);
};

/** Return RGB in [0..1] range */
const convertXyzToRgb = (x: number, y: number, z: number, gamut: Gamut): Vector3 => {
    const { toRgb } = gamutMatrices[gamut.name];
    const rgb = timesArray([x, y, z], toRgb);

    return [gamut.gammaCorrection.encode(rgb[0]), gamut.gammaCorrection.encode(rgb[1]), gamut.gammaCorrection.encode(rgb[2])];
};

/** Returns RGB in [0..1] range */
export const convertXyYToRgb = (x: number, y: number, Y: number, gamut: Gamut): Vector3 => {
    const z = 1.0 - x - y;

    return convertXyzToRgb((Y / y) * x, Y, (Y / y) * z, gamut);
};

/** Expects RGB in [0..255] range */
export const convertRgbToXyY = (r: number, g: number, b: number, gamut: Gamut): Vector3 => {
    r /= 255;
    g /= 255;
    b /= 255;

    if (r < 1e-12 && g < 1e-12 && b < 1e-12) {
        const [x, y, z] = convertRgbToXyz(1, 1, 1, gamut);
        const sum = x + y + z;

        return [x / sum, y / sum, 0];
    }

    const [x, y, z] = convertRgbToXyz(r, g, b, gamut);
    const sum = x + y + z;

    return [x / sum, y / sum, y];
};

/** Returns RGB in [0..255] range */
export const convertXyToRgb = (x: number, y: number, Y: number | undefined, gamut: Gamut): Vector3 => {
    if (y <= 0) {
        return [0, 0, 0];
    }

    const luminance = Y ?? findMaximumY(x, y, gamut, 10);

    if (luminance <= 0 || !Number.isFinite(luminance)) {
        return [0, 0, 0];
    }

    const [r, g, b] = convertXyYToRgb(x, y, luminance, gamut);

    return [clamp(r * 255, 0, 255), clamp(g * 255, 0, 255), clamp(b * 255, 0, 255)];
};

/** Expects RGB in [0..255] range */
export const convertRgbToHsv = (r: number, g: number, b: number): Vector3 => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const d = max - Math.min(r, g, b);

    const h = d ? (max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? 2 + (b - r) / d : 4 + (r - g) / d) * 60 : 0;
    const s = max ? (d / max) * 100 : 0;
    const v = max * 100;

    return [clamp(h, 0, 360), clamp(s, 0, 100), clamp(v, 0, 100)];
};

/** Returns RGB in [0..255] range */
export const convertHsvToRgb = (h: number, s: number, v: number): Vector3 => {
    s /= 100;
    v /= 100;

    const i = ~~(h / 60);
    const f = h / 60 - i;
    const p = v * (1 - s);
    const q = v * (1 - s * f);
    const t = v * (1 - s * (1 - f));
    const index = i % 6;

    const r = [v, q, p, p, t, v][index] * 255;
    const g = [t, v, v, q, p, p][index] * 255;
    const b = [p, p, t, v, v, q][index] * 255;

    return [clamp(r, 0, 255), clamp(g, 0, 255), clamp(b, 0, 255)];
};

/** Expects RGB in [0..255] range */
export const convertRgbToHex = (r: number, g: number, b: number): string => {
    return `#${Math.round(r).toString(16).padStart(2, "0")}${Math.round(g).toString(16).padStart(2, "0")}${Math.round(b).toString(16).padStart(2, "0")}`;
};

/** Returns RGB in [0..255] range */
export const convertHexToRgb = (hex: string): Vector3 => {
    const hexNum = Number.parseInt(hex.slice(1), 16);

    return [(hexNum >> 16) & 255, (hexNum >> 8) & 255, hexNum & 255];
};

export const convertToColor = (source: AnyColor, sourceFormat: ColorFormat, gamut: Gamut): ZigbeeColor => {
    switch (sourceFormat) {
        case "color_xy": {
            const { x = gamut.white[0], y = gamut.white[1], Y = findMaximumY(x, y === 0 ? gamut.white[1] : y, gamut, 10) } = source as XYColor;
            const rgb = y === 0 ? ([255, 255, 255] as Vector3) : convertXyToRgb(x, y, Y, gamut);

            return {
                color_rgb: rgb,
                color_hs: convertRgbToHsv(...rgb),
                color_xy: [x, y, Y],
                hex: convertRgbToHex(...rgb),
            };
        }

        case "color_hs": {
            const { hue = 0, saturation = 0, value = 100.0 } = source as HueSaturationColor;
            const rgb = convertHsvToRgb(hue, saturation, value);

            return {
                color_rgb: rgb,
                color_hs: [hue, saturation, value],
                color_xy: convertRgbToXyY(...rgb, gamut),
                hex: convertRgbToHex(...rgb),
            };
        }

        case "color_rgb": {
            const { r = 255, g = 255, b = 255 } = source as RGBColor;

            return {
                color_rgb: [r, g, b],
                color_hs: convertRgbToHsv(r, g, b),
                color_xy: convertRgbToXyY(r, g, b, gamut),
                hex: convertRgbToHex(r, g, b),
            };
        }

        case "hex": {
            const hex = (source as HexColor).hex;
            const rgb = convertHexToRgb(hex);

            return {
                color_rgb: rgb,
                color_hs: convertRgbToHsv(...rgb),
                color_xy: convertRgbToXyY(...rgb, gamut),
                hex,
            };
        }

        default: {
            const rgb: Vector3 = [255, 255, 255];

            return {
                color_rgb: rgb,
                color_hs: convertRgbToHsv(...rgb),
                color_xy: convertRgbToXyY(...rgb, gamut),
                hex: convertRgbToHex(...rgb),
            };
        }
    }
};

/** Convert to payloads expected by ZH/ZHC for each format */
export const convertFromColor = (source: ZigbeeColor, targetFormat: ColorFormat): AnyColor => {
    switch (targetFormat) {
        case "color_xy": {
            return { x: source.color_xy[0], y: source.color_xy[1] };
        }

        case "color_hs": {
            return { hue: source.color_hs[0], saturation: source.color_hs[1] };
        }

        case "color_rgb": {
            return { r: source.color_rgb[0], g: source.color_rgb[1], b: source.color_rgb[2] };
        }

        case "hex": {
            return { hex: source.hex };
        }
    }
};

export const convertXyYToString = (source: ZigbeeColor["color_xy"]): ZigbeeColorString["color_xy"] => {
    return `${source[0].toFixed(3)}, ${source[1].toFixed(3)}, ${source[2].toFixed(3)}`;
};

export const convertHsvToString = (source: ZigbeeColor["color_hs"]): ZigbeeColorString["color_hs"] => {
    return `${source[0].toFixed(2)}°, ${source[1].toFixed(2)}%, ${source[2].toFixed(2)}%`;
};

export const convertRgbToString = (source: ZigbeeColor["color_rgb"]): ZigbeeColorString["color_rgb"] => {
    return `${source[0].toFixed(0)}, ${source[1].toFixed(0)}, ${source[2].toFixed(0)}`;
};

export const convertHexToString = (source: ZigbeeColor["hex"]): ZigbeeColorString["hex"] => {
    return source;
};

export const convertColorToString = (source: ZigbeeColor): ZigbeeColorString => {
    return {
        color_xy: convertXyYToString(source.color_xy),
        color_hs: convertHsvToString(source.color_hs),
        color_rgb: convertRgbToString(source.color_rgb),
        hex: convertHexToString(source.hex),
    };
};

export const convertStringToXyY = (value: string): ZigbeeColor["color_xy"] => {
    const xyY: string[] = value.match(/-?\d+(?:\.\d+)?/gu) ?? [];

    return Array.from({ length: 3 }).map((_, i) => +(xyY[i] ?? 0)) as Vector3;
};

export const convertStringToHsv = (value: string): ZigbeeColor["color_hs"] => {
    const hsv: string[] = value.match(/-?\d+(?:\.\d+)?/gu) ?? [];

    return Array.from({ length: 3 }).map((_, i) => clamp(+(hsv[i] ?? 0), 0, i ? 100 : 360)) as Vector3;
};

export const convertStringToRgb = (value: string): ZigbeeColor["color_rgb"] => {
    const rgb: string[] = value.match(/-?\d+(?:\.\d+)?/gu) ?? [];

    return Array.from({ length: 3 }).map((_, i) => clamp(+(rgb[i] ?? 0), 0, 255)) as Vector3;
};

export const convertStringToColor = (source: string, format: ColorFormat, gamut: Gamut): ZigbeeColor => {
    switch (format) {
        case "color_xy": {
            const xyY = convertStringToXyY(source);

            return convertToColor({ x: xyY[0], y: xyY[1] }, "color_xy", gamut);
        }

        case "color_hs": {
            const hsv = convertStringToHsv(source);

            return convertToColor({ hue: hsv[0], saturation: hsv[1] }, "color_hs", gamut);
        }

        case "color_rgb": {
            const rgb = convertStringToRgb(source);

            return convertToColor({ r: rgb[0], g: rgb[1], b: rgb[2] }, "color_rgb", gamut);
        }

        case "hex": {
            return convertToColor({ hex: source }, "hex", gamut);
        }
    }
};
