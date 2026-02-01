import { saveAs } from "file-saver";
import { API_URLS } from "./store.js";
import type {
    AnySubFeature,
    BasicFeature,
    BinaryFeature,
    Device,
    EnumFeature,
    FeatureWithAnySubFeatures,
    FeatureWithSubFeatures,
    Group,
    LastSeenConfig,
    NumericFeature,
} from "./types.js";
import { FeatureAccessMode } from "./types.js";

// #region Compute

export const scale = (inputY: number, yRange: Array<number>, xRange: Array<number>): number => {
    const [xMin, xMax] = xRange;
    const [yMin, yMax] = yRange;

    const percent = (inputY - yMin) / (yMax - yMin);
    return percent * (xMax - xMin) + xMin;
};

export const randomString = (len: number): string =>
    Math.random()
        .toString(36)
        .slice(2, 2 + len);

export const getObjectFirstKey = <T>(object: T): string | undefined => {
    for (const key in object) {
        return key;
    }
};

/**
 * For use with URL params.
 * Always return a valid numeric source index to prevent issues with shallow `useAppStore`.
 * Should `navigate` if the source index isn't actually valid
 */
export const getValidSourceIdx = (sourceIdx: string | undefined): [numSourceIdx: number, valid: boolean] => {
    if (!sourceIdx) {
        // valid here, since just falling back to default
        return [0, true];
    }

    const numSourceIdx = Number(sourceIdx);

    return Number.isNaN(numSourceIdx) || !API_URLS[numSourceIdx] ? [0, false] : [numSourceIdx, true];
};

// #endregion

// #region Format/Convert

export const stringifyWithUndefinedAsNull = (data: Record<string, unknown>): string => JSON.stringify(data, (_k, v) => (v === undefined ? null : v));

export const getLastSeenEpoch = (lastSeen: unknown, lastSeenConfig: LastSeenConfig): number | undefined => {
    if (!lastSeen) {
        return undefined;
    }

    switch (lastSeenConfig) {
        case "ISO_8601":
        case "ISO_8601_local":
            return Date.parse(lastSeen as string);

        case "epoch":
            return lastSeen as number;

        case "disable":
            return undefined;

        default:
            console.error(`Unknown last_seen type ${lastSeenConfig}`);
            return undefined;
    }
};

export const toHex = (input: number, padding = 4): string => {
    const padStr = "0".repeat(padding);
    return `0x${(padStr + input.toString(16)).slice(-1 * padding).toUpperCase()}`;
};

export const sanitizeZ2MDeviceName = (deviceName?: string): string | "NA" => (deviceName ? deviceName.replace(/:|\s|\//g, "-") : "NA");

// #endregion

// #region Device/Group

export function isDevice(entity: Device | Group): entity is Device {
    return !("members" in entity);
}

export function isGroup(entity: Device | Group): entity is Group {
    return "members" in entity;
}

export const getEndpoints = (entity?: Device | Group | null): Set<string | number> => {
    const endpoints = new Set<string | number>();

    if (!entity) {
        return endpoints;
    }

    if (isDevice(entity)) {
        for (const key in entity.endpoints) {
            endpoints.add(Number.parseInt(key, 10));
        }

        if (entity.definition?.exposes) {
            for (const expose of entity.definition.exposes) {
                if (expose.endpoint) {
                    endpoints.add(expose.endpoint);
                }
            }
        }
    } else {
        for (const member of entity.members) {
            endpoints.add(member.endpoint);
        }
    }

    return endpoints;
};

type ExposeValidateFn = (expose: BasicFeature | FeatureWithSubFeatures) => boolean;

export const parseAndCloneExpose = (
    expose: BasicFeature | FeatureWithSubFeatures,
    validateFn: ExposeValidateFn,
): FeatureWithAnySubFeatures | undefined => {
    if (!validateFn(expose)) {
        return undefined;
    }

    if ("features" in expose && expose.features && expose.features.length > 0) {
        const features: AnySubFeature[] = [];

        for (const subFeature of expose.features) {
            const validFeature = parseAndCloneExpose(subFeature, validateFn);

            if (validFeature && !features.some((f) => f.property === validFeature.property)) {
                features.push(validFeature);
            }
        }

        return { ...expose, features };
    }

    return { ...expose };
};

// #endregion

// #region Bulk Expose Computation

/**
 * Represents a flattened expose feature with its parent path for bulk operations.
 * The `path` contains the hierarchical structure for nested features (e.g., ["light", "brightness"]).
 */
export interface FlattenedExpose {
    feature: BasicFeature;
    path: string[];
}

/**
 * Check if a feature has SET access (can be written to).
 * SET bit is 0b010 = 2
 */
const hasSetAccess = (feature: BasicFeature | FeatureWithSubFeatures): boolean => {
    return feature.access !== undefined && (feature.access & FeatureAccessMode.SET) !== 0;
};

/**
 * Flattens nested expose structures into a flat array of basic features.
 * Only includes features that have SET access.
 *
 * @param exposes - Array of expose features from a device definition
 * @returns Array of flattened features with their paths
 */
export const flattenExposes = (exposes: (BasicFeature | FeatureWithSubFeatures)[]): FlattenedExpose[] => {
    const result: FlattenedExpose[] = [];

    const processExpose = (expose: BasicFeature | FeatureWithSubFeatures, path: string[]): void => {
        // Check if this is a feature with nested features
        if ("features" in expose && expose.features && expose.features.length > 0) {
            const currentPath = expose.name ? [...path, expose.name] : path;

            for (const subFeature of expose.features) {
                processExpose(subFeature, currentPath);
            }
        } else {
            // This is a basic feature - check if it has SET access
            if (hasSetAccess(expose) && expose.name) {
                result.push({
                    feature: expose as BasicFeature,
                    path: expose.name ? [...path, expose.name] : path,
                });
            }
        }
    };

    for (const expose of exposes) {
        processExpose(expose, []);
    }

    return result;
};

/**
 * Creates a unique key for a flattened expose based on its path.
 */
const getExposeKey = (flatExpose: FlattenedExpose): string => {
    return flatExpose.path.join(".");
};

/**
 * Checks if two enum features have identical allowed values.
 */
const areEnumValuesCompatible = (a: EnumFeature, b: EnumFeature): boolean => {
    if (!a.values || !b.values) {
        return false;
    }

    if (a.values.length !== b.values.length) {
        return false;
    }

    const sortedA = [...a.values].sort();
    const sortedB = [...b.values].sort();

    for (let i = 0; i < sortedA.length; i++) {
        if (sortedA[i] !== sortedB[i]) {
            return false;
        }
    }

    return true;
};

/**
 * Checks if two binary features have compatible on/off values.
 */
const areBinaryValuesCompatible = (a: BinaryFeature, b: BinaryFeature): boolean => {
    return a.value_on === b.value_on && a.value_off === b.value_off;
};

/**
 * Computes the intersection of min/max ranges for numeric features.
 * Returns undefined if ranges don't overlap.
 */
const computeNumericRangeIntersection = (a: NumericFeature, b: NumericFeature): { value_min?: number; value_max?: number } | undefined => {
    const aMin = a.value_min ?? Number.NEGATIVE_INFINITY;
    const aMax = a.value_max ?? Number.POSITIVE_INFINITY;
    const bMin = b.value_min ?? Number.NEGATIVE_INFINITY;
    const bMax = b.value_max ?? Number.POSITIVE_INFINITY;

    const intersectMin = Math.max(aMin, bMin);
    const intersectMax = Math.min(aMax, bMax);

    // Check if ranges overlap
    if (intersectMin > intersectMax) {
        return undefined;
    }

    return {
        value_min: intersectMin === Number.NEGATIVE_INFINITY ? undefined : intersectMin,
        value_max: intersectMax === Number.POSITIVE_INFINITY ? undefined : intersectMax,
    };
};

/**
 * Checks if two features are compatible for bulk operations.
 * Features must match by name and type. Additional constraints apply based on type:
 * - Enum features require identical allowed values
 * - Binary features require identical on/off values
 * - Numeric features require overlapping ranges
 */
const areFeaturesCompatible = (a: BasicFeature, b: BasicFeature): boolean => {
    // Must match by name and type
    if (a.name !== b.name || a.type !== b.type) {
        return false;
    }

    // Type-specific compatibility checks
    switch (a.type) {
        case "enum": {
            return areEnumValuesCompatible(a as EnumFeature, b as EnumFeature);
        }
        case "binary": {
            return areBinaryValuesCompatible(a as BinaryFeature, b as BinaryFeature);
        }
        case "numeric": {
            const range = computeNumericRangeIntersection(a as NumericFeature, b as NumericFeature);
            return range !== undefined;
        }
        case "text":
        case "list":
            // Text and list features are compatible if name and type match
            return true;
        default:
            return true;
    }
};

/**
 * Merges two compatible features into one with computed constraints.
 * For numeric features, computes the intersection of min/max ranges.
 */
const mergeFeatures = (a: BasicFeature, b: BasicFeature): BasicFeature => {
    if (a.type === "numeric" && b.type === "numeric") {
        const aNumeric = a as NumericFeature;
        const bNumeric = b as NumericFeature;
        const range = computeNumericRangeIntersection(aNumeric, bNumeric);

        if (range) {
            return {
                ...aNumeric,
                value_min: range.value_min,
                value_max: range.value_max,
            } as BasicFeature;
        }
    }

    // For non-numeric types, return the first feature as the template
    return { ...a };
};

/**
 * Computes the intersection of expose features across multiple devices.
 * Returns only features that are compatible across ALL selected devices.
 *
 * Features match by exact `name` AND `type`. Additional constraints:
 * - Enum features require identical allowed values
 * - Numeric features compute intersection of min/max ranges
 * - Binary features require identical on/off values
 * - Only features with SET access (access & 0b010) are included
 *
 * @param devices - Array of devices to compute common exposes for
 * @returns Array of common expose features that can be bulk-edited
 */
export const computeCommonExposes = (devices: Device[]): BasicFeature[] => {
    if (devices.length === 0) {
        return [];
    }

    // Filter devices that have expose definitions
    const devicesWithExposes = devices.filter((d) => d.definition?.exposes && d.definition.exposes.length > 0);

    if (devicesWithExposes.length === 0) {
        return [];
    }

    // If only one device, return its settable features
    if (devicesWithExposes.length === 1) {
        const flattened = flattenExposes(devicesWithExposes[0].definition!.exposes);
        return flattened.map((f) => f.feature);
    }

    // Build a map of features from the first device
    const firstDeviceExposes = flattenExposes(devicesWithExposes[0].definition!.exposes);
    const featureMap = new Map<string, BasicFeature>();

    for (const flatExpose of firstDeviceExposes) {
        featureMap.set(getExposeKey(flatExpose), flatExpose.feature);
    }

    // Iterate through remaining devices and compute intersection
    for (let i = 1; i < devicesWithExposes.length; i++) {
        const deviceExposes = flattenExposes(devicesWithExposes[i].definition!.exposes);
        const deviceFeatureMap = new Map<string, BasicFeature>();

        for (const flatExpose of deviceExposes) {
            deviceFeatureMap.set(getExposeKey(flatExpose), flatExpose.feature);
        }

        // Remove features not present in this device or not compatible
        for (const [key, feature] of featureMap) {
            const otherFeature = deviceFeatureMap.get(key);

            if (!otherFeature || !areFeaturesCompatible(feature, otherFeature)) {
                featureMap.delete(key);
            } else {
                // Merge features (compute range intersections for numeric)
                featureMap.set(key, mergeFeatures(feature, otherFeature));
            }
        }

        // Early exit if no common features
        if (featureMap.size === 0) {
            return [];
        }
    }

    return Array.from(featureMap.values());
};

// #endregion

// #region Browser

export const downloadAsZip = async (data: Record<string, unknown>, filename: string) => {
    const { default: JSZip } = await import("jszip");
    const zip = new JSZip();

    zip.file(filename, JSON.stringify(data, null, 4), { compression: "DEFLATE" });

    const content = await zip.generateAsync({ type: "blob" });

    saveAs(content, `${filename}.zip`);
};

// #endregion
