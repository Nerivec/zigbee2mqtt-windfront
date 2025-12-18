import clamp from "lodash/clamp.js";
import type { AnyColor, ColorFormat, HexColor, HueSaturationColor, RGBColor, XYColor } from "../../types.js";

//-- Adapted from https://viereck.ch/hue-xy-rgb/

type Vector3 = [number, number, number];
type Vector2 = [number, number];
type Matrix3 = [number, number, number, number, number, number, number, number, number];

export interface ColorTransfer {
    encode: (linear: number) => number; // linear [0..1] -> non-linear
    decode: (nonLinear: number) => number; // non-linear [0..1] -> linear
}

export interface ColorSpace {
    name: string;
    red: Vector2;
    green: Vector2;
    blue: Vector2;
    white: Vector2;
    transfer: ColorTransfer;
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

const buildMatrices = (cs: ColorSpace): { toXyz: Matrix3; toRgb: Matrix3 } => {
    const [Xr, Yr, Zr] = xyToXyz(cs.red);
    const [Xg, Yg, Zg] = xyToXyz(cs.green);
    const [Xb, Yb, Zb] = xyToXyz(cs.blue);
    const [Xw, Yw, Zw] = xyToXyz(cs.white);

    const primariesMatrix: Matrix3 = [Xr, Xg, Xb, Yr, Yg, Yb, Zr, Zg, Zb];
    const primariesInv = invert3x3(primariesMatrix);
    const [Sr, Sg, Sb] = multiplyMatrix3(primariesInv, [Xw, Yw, Zw]);

    const toXyz: Matrix3 = [Xr * Sr, Xg * Sg, Xb * Sb, Yr * Sr, Yg * Sg, Yb * Sb, Zr * Sr, Zg * Sg, Zb * Sb];

    return { toXyz, toRgb: invert3x3(toXyz) };
};

const makePowerTransfer = (params: { threshold: number; slope: number; exponent: number; offset: number }): ColorTransfer => {
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

const makePQTransfer = (): ColorTransfer => {
    // ITU-R BT.2100 PQ (ST 2084) constants
    const m1 = 2610 / 16384;
    const m2 = 2523 / 32;
    const c1 = 3424 / 4096;
    const c2 = 2413 / 128;
    const c3 = 2392 / 128;

    const encode = (linear: number): number => {
        const l = Math.max(linear, 0);
        const num = c1 + c2 * l ** m1;
        const den = 1 + c3 * l ** m1;

        return (num / den) ** m2;
    };

    const decode = (nonLinear: number): number => {
        const e = Math.max(nonLinear, 0);
        const num = e ** (1 / m2) - c1;
        const den = c2 - c3 * e ** (1 / m2);

        if (den <= 0) {
            return 0;
        }

        const ratio = num / den;

        if (ratio <= 0 || !Number.isFinite(ratio)) {
            return 0;
        }

        return ratio ** (1 / m1);
    };

    return { encode, decode };
};

const makeHlgTransfer = (): ColorTransfer => {
    // ITU-R BT.2100 HLG OETF/EOTF (normalized for nominal 0-1 range)
    const a = 0.17883277;
    const b = 1 - 4 * a; // 0.28466892
    const c = 0.55991073;

    const encode = (linear: number): number => {
        const l = Math.max(linear, 0);

        if (l <= 1 / 12) {
            return Math.sqrt(3 * l);
        }

        return a * Math.log(12 * l - b) + c;
    };

    const decode = (nonLinear: number): number => {
        const e = Math.max(nonLinear, 0);

        if (e <= 0.5) {
            const v = e ** 2;
            return v / 3;
        }

        return (Math.exp((e - c) / a) + b) / 12;
    };

    return { encode, decode };
};

const TRANSFER_SRGB = makePowerTransfer({ threshold: 0.0031308, slope: 12.92, exponent: 2.4, offset: 0.055 });
const TRANSFER_REC709 = makePowerTransfer({ threshold: 0.018, slope: 4.5, exponent: 2.2222222222, offset: 0.099 });
const TRANSFER_REC2020 = makePowerTransfer({ threshold: 0.0181, slope: 4.5, exponent: 2.2222222222, offset: 0.0993 });
const TRANSFER_REC2100_PQ = makePQTransfer();
const TRANSFER_REC2100_HLG = makeHlgTransfer();

/** https://en.wikipedia.org/wiki/SRGB */
const SRGB: Readonly<ColorSpace> = {
    name: "sRGB / IEC 61966-2-1",
    red: [0.64, 0.33],
    green: [0.3, 0.6],
    blue: [0.15, 0.06],
    white: [0.3127, 0.329],
    transfer: TRANSFER_SRGB,
};
/** https://en.wikipedia.org/wiki/Rec._709 */
const REC709: Readonly<ColorSpace> = {
    name: "Rec.709 / ITU-R BT.709",
    red: [0.64, 0.33],
    green: [0.3, 0.6],
    blue: [0.15, 0.06],
    white: [0.3127, 0.329],
    transfer: TRANSFER_REC709,
};
/** https://en.wikipedia.org/wiki/Rec._2020 */
const REC2020: Readonly<ColorSpace> = {
    name: "Rec.2020 / ITU-R BT.2020",
    red: [0.708, 0.292],
    green: [0.17, 0.797],
    blue: [0.131, 0.046],
    white: [0.3127, 0.329],
    transfer: TRANSFER_REC2020,
};
/** https://en.wikipedia.org/wiki/Rec._2100 */
const REC2100_PQ: Readonly<ColorSpace> = {
    name: "Rec.2100 PQ / ITU-R BT.2100",
    red: [0.708, 0.292],
    green: [0.17, 0.797],
    blue: [0.131, 0.046],
    white: [0.3127, 0.329],
    transfer: TRANSFER_REC2100_PQ,
};
/** https://en.wikipedia.org/wiki/Rec._2100 */
const REC2100_HLG: Readonly<ColorSpace> = {
    name: "Rec.2100 HLG / ITU-R BT.2100",
    red: [0.708, 0.292],
    green: [0.17, 0.797],
    blue: [0.131, 0.046],
    white: [0.3127, 0.329],
    transfer: TRANSFER_REC2100_HLG,
};

export const SUPPORTED_COLOR_SPACES = {
    sRgb: SRGB,
    rec709: REC709,
    rec2020: REC2020,
    rec2100pq: REC2100_PQ,
    rec2100hlg: REC2100_HLG,
} as const;

const colorSpaceMatrices: Record<string, ReturnType<typeof buildMatrices>> = {};

for (const key in SUPPORTED_COLOR_SPACES) {
    const entry = SUPPORTED_COLOR_SPACES[key];

    colorSpaceMatrices[entry.name] = buildMatrices(entry);
}

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

// RGB in [0..1] range
const convertRgbToXyz = (r: number, g: number, b: number, cs: ColorSpace): Vector3 => {
    const rgb: Vector3 = [cs.transfer.decode(r), cs.transfer.decode(g), cs.transfer.decode(b)];
    const { toXyz } = colorSpaceMatrices[cs.name];

    return timesArray(rgb, toXyz);
};

// RGB in [0..1] range
const convertXyzToRgb = (x: number, y: number, z: number, cs: ColorSpace): Vector3 => {
    const { toRgb } = colorSpaceMatrices[cs.name];
    const rgb = timesArray([x, y, z], toRgb);

    return [cs.transfer.encode(rgb[0]), cs.transfer.encode(rgb[1]), cs.transfer.encode(rgb[2])];
};

// RGB in [0..1] range
const convertXyyToRgb = (x: number, y: number, Y: number, cs: ColorSpace): Vector3 => {
    const z = 1.0 - x - y;

    return convertXyzToRgb((Y / y) * x, Y, (Y / y) * z, cs);
};

const findMaximumY = (x: number, y: number, cs: ColorSpace, iterations = 10) => {
    if (y <= 0) {
        return 0;
    }

    let bri = 1;

    for (let i = 0; i < iterations; i++) {
        const max = Math.max(...convertXyyToRgb(x, y, bri, cs));

        if (max <= 0 || !Number.isFinite(max)) {
            return 0;
        }

        bri = bri / max;
    }

    return bri;
};

export const convertRgbToXyY = (r: number, g: number, b: number, cs: ColorSpace): Vector3 => {
    r /= 255;
    g /= 255;
    b /= 255;

    if (r < 1e-12 && g < 1e-12 && b < 1e-12) {
        const [x, y, z] = convertRgbToXyz(1, 1, 1, cs);
        const sum = x + y + z;

        return [x / sum, y / sum, 0];
    }

    const [x, y, z] = convertRgbToXyz(r, g, b, cs);
    const sum = x + y + z;

    return [x / sum, y / sum, y];
};

export const convertXyToRgb = (x: number, y: number, Y: number | undefined, cs: ColorSpace): Vector3 => {
    if (y <= 0) {
        return [0, 0, 0];
    }

    const luminance = Y ?? findMaximumY(x, y, cs, 10);

    if (luminance <= 0 || !Number.isFinite(luminance)) {
        return [0, 0, 0];
    }

    const [r, g, b] = convertXyyToRgb(x, y, luminance, cs);

    return [clamp(r * 255, 0, 255), clamp(g * 255, 0, 255), clamp(b * 255, 0, 255)];
};

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

export const convertRgbToHex = (r: number, g: number, b: number): string => {
    const [rr, gg, bb] = [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0"));

    return `#${rr}${gg}${bb}`;
};

export const convertHexToRgb = (hex: string): Vector3 => {
    hex = hex.slice(1);

    return Array.from({ length: 3 }).map((_, i) => Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16)) as Vector3;
};

export const convertToColor = (source: AnyColor, sourceFormat: ColorFormat, cs: ColorSpace): ZigbeeColor => {
    switch (sourceFormat) {
        case "color_xy": {
            const { x = 0.313, y = 0.329, Y = findMaximumY(x, y === 0 ? 0.329 : y, cs, 10) } = source as XYColor;
            const rgb = y === 0 ? ([255, 255, 255] as Vector3) : convertXyToRgb(x, y, Y, cs);

            return {
                color_rgb: rgb,
                color_hs: convertRgbToHsv(...rgb),
                color_xy: [x, y, Y],
                hex: convertRgbToHex(...rgb),
            };
        }

        case "color_hs": {
            const { hue = 0, saturation = 0 } = source as HueSaturationColor;
            const value = 100.0;
            const rgb = convertHsvToRgb(hue, saturation, value);

            return {
                color_rgb: rgb,
                color_hs: [hue, saturation, value],
                color_xy: convertRgbToXyY(...rgb, cs),
                hex: convertRgbToHex(...rgb),
            };
        }

        case "color_rgb": {
            const { r = 255, g = 255, b = 255 } = source as RGBColor;

            return {
                color_rgb: [r, g, b],
                color_hs: convertRgbToHsv(r, g, b),
                color_xy: convertRgbToXyY(r, g, b, cs),
                hex: convertRgbToHex(r, g, b),
            };
        }

        case "hex": {
            const hex = (source as HexColor).hex;
            const rgb = convertHexToRgb(hex);

            return {
                color_rgb: rgb,
                color_hs: convertRgbToHsv(...rgb),
                color_xy: convertRgbToXyY(...rgb, cs),
                hex,
            };
        }

        default: {
            const rgb: Vector3 = [255, 255, 255];

            return {
                color_rgb: rgb,
                color_hs: convertRgbToHsv(...rgb),
                color_xy: convertRgbToXyY(...rgb, cs),
                hex: convertRgbToHex(...rgb),
            };
        }
    }
};

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

export const convertStringToColor = (source: string, format: ColorFormat, cs: ColorSpace): ZigbeeColor => {
    switch (format) {
        case "color_xy": {
            const xyY = convertStringToXyY(source);

            return convertToColor({ x: xyY[0], y: xyY[1] }, "color_xy", cs);
        }

        case "color_hs": {
            const hsv = convertStringToHsv(source);

            return convertToColor({ hue: hsv[0], saturation: hsv[1] }, "color_hs", cs);
        }

        case "color_rgb": {
            const rgb = convertStringToRgb(source);

            return convertToColor({ r: rgb[0], g: rgb[1], b: rgb[2] }, "color_rgb", cs);
        }

        case "hex": {
            return convertToColor({ hex: source }, "hex", cs);
        }
    }
};
