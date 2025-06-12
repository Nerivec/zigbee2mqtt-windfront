import clamp from "lodash/clamp.js";
import type { AnyColor, ColorFormat, HexColor, HueSaturationColor, RGBColor, XYColor } from "../../types.js";

//-- Adapted from https://viereck.ch/hue-xy-rgb/

type Vector3 = [number, number, number];
type Matrix3 = [number, number, number, number, number, number, number, number, number];

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

const SRGB_MATRIX3: Matrix3 = [0.412453, 0.35758, 0.180423, 0.212671, 0.71516, 0.072169, 0.019334, 0.119193, 0.950227];
const SRGB_MATRIX3_INVERSED: Matrix3 = [
    3.2404813432005266, -1.5371515162713183, -0.49853632616888777, -0.9692549499965684, 1.8759900014898907, 0.041555926558292815, 0.05564663913517715,
    -0.20404133836651123, 1.0573110696453443,
];

const SRGB_GAMMA = 0.42;
const SRGB_TRANSITION = 0.0031308;
const SRGB_SLOPE = 12.92;
const SRGB_OFFSET = 0.055;

const transform = (value: number) => {
    return value <= SRGB_TRANSITION ? SRGB_SLOPE * value : (1 + SRGB_OFFSET) * value ** SRGB_GAMMA - SRGB_OFFSET;
};

const SRGB_GAMMA_INV = 1 / SRGB_GAMMA;
const SRGB_TRANSITION_INV = transform(SRGB_TRANSITION);
const SRGB_SLOPE_INV = 1 / SRGB_SLOPE;

const invTransform = (value: number) => {
    return value <= SRGB_TRANSITION_INV ? value * SRGB_SLOPE_INV : ((value + SRGB_OFFSET) / (1 + SRGB_OFFSET)) ** SRGB_GAMMA_INV;
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

// RGB in [0..1] range
const convertRgbToXyz = (r: number, g: number, b: number): Vector3 => {
    const rgb: Vector3 = [invTransform(r), invTransform(g), invTransform(b)];

    return timesArray(rgb, SRGB_MATRIX3);
};

// RGB in [0..1] range
const convertXyzToRgb = (x: number, y: number, z: number): Vector3 => {
    const rgb = timesArray([x, y, z], SRGB_MATRIX3_INVERSED);

    return [transform(rgb[0]), transform(rgb[1]), transform(rgb[2])];
};

// RGB in [0..1] range
const convertXyyToRgb = (x: number, y: number, Y: number): Vector3 => {
    const z = 1.0 - x - y;

    return convertXyzToRgb((Y / y) * x, Y, (Y / y) * z);
};

const findMaximumY = (x: number, y: number, iterations = 10) => {
    let bri = 1;

    for (let i = 0; i < iterations; i++) {
        const max = Math.max(...convertXyyToRgb(x, y, bri));
        bri = bri / max;
    }

    return bri;
};

export const convertRgbToXyY = (r: number, g: number, b: number): Vector3 => {
    r /= 255;
    g /= 255;
    b /= 255;

    if (r < 1e-12 && g < 1e-12 && b < 1e-12) {
        const [x, y, z] = convertRgbToXyz(1, 1, 1);
        const sum = x + y + z;

        return [x / sum, y / sum, 0];
    }

    const [x, y, z] = convertRgbToXyz(r, g, b);
    const sum = x + y + z;

    return [x / sum, y / sum, y];
};

export const convertXyToRgb = (x: number, y: number, Y?: number): Vector3 => {
    if (Y === undefined) {
        Y = findMaximumY(x, y);
    }

    const [r, g, b] = convertXyyToRgb(x, y, Y);

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

export const convertToColor = (source: AnyColor, sourceFormat: ColorFormat): ZigbeeColor => {
    switch (sourceFormat) {
        case "color_xy": {
            const { x = 0.313, y = 0.329, Y = findMaximumY(x, y === 0 ? 0.329 : y) } = source as XYColor;
            const rgb = y === 0 ? ([255, 255, 255] as Vector3) : convertXyToRgb(x, y, Y);

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
                color_xy: convertRgbToXyY(...rgb),
                hex: convertRgbToHex(...rgb),
            };
        }

        case "color_rgb": {
            const { r = 255, g = 255, b = 255 } = source as RGBColor;

            return {
                color_rgb: [r, g, b],
                color_hs: convertRgbToHsv(r, g, b),
                color_xy: convertRgbToXyY(r, g, b),
                hex: convertRgbToHex(r, g, b),
            };
        }

        case "hex": {
            const hex = (source as HexColor).hex;
            const rgb = convertHexToRgb(hex);

            return {
                color_rgb: rgb,
                color_hs: convertRgbToHsv(...rgb),
                color_xy: convertRgbToXyY(...rgb),
                hex,
            };
        }

        default: {
            const rgb: Vector3 = [255, 255, 255];

            return {
                color_rgb: rgb,
                color_hs: convertRgbToHsv(...rgb),
                color_xy: convertRgbToXyY(...rgb),
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
    const xyY: string[] = value.match(/\d+(\.\d+)?/gu) ?? [];

    return Array.from({ length: 3 }).map((_, i) => +(xyY[i] ?? 0)) as Vector3;
};

export const convertStringToHsv = (value: string): ZigbeeColor["color_hs"] => {
    const hsv: string[] = value.match(/\d+(\.\d+)?/gu) ?? [];

    return Array.from({ length: 3 }).map((_, i) => clamp(+(hsv[i] ?? 0), 0, i ? 100 : 360)) as Vector3;
};

export const convertStringToRgb = (value: string): ZigbeeColor["color_rgb"] => {
    const rgb: string[] = value.match(/\d+(\.\d+)?/gu) ?? [];

    return Array.from({ length: 3 }).map((_, i) => clamp(+(rgb[i] ?? 0), 0, 255)) as Vector3;
};

export const convertStringToColor = (source: string, format: ColorFormat): ZigbeeColor => {
    switch (format) {
        case "color_xy": {
            const xyY = convertStringToXyY(source);

            return convertToColor({ x: xyY[0], y: xyY[1] }, "color_xy");
        }

        case "color_hs": {
            const hsv = convertStringToHsv(source);

            return convertToColor({ hue: hsv[0], saturation: hsv[1] }, "color_hs");
        }

        case "color_rgb": {
            const rgb = convertStringToRgb(source);

            return convertToColor({ r: rgb[0], g: rgb[1], b: rgb[2] }, "color_rgb");
        }

        case "hex": {
            return convertToColor({ hex: source }, "hex");
        }
    }
};
