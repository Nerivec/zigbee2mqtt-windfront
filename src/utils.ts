import { saveAs } from "file-saver";
import { API_URLS } from "./store.js";
import type {
    AnySubFeature,
    BasicFeature,
    Device,
    FeatureAccessMode,
    FeatureWithAnySubFeatures,
    FeatureWithSubFeatures,
    Group,
    LastSeenConfig,
} from "./types.js";

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

export const convertLastSeenToDate = (lastSeen: unknown, lastSeenConfig: LastSeenConfig): Date | undefined => {
    if (!lastSeen) {
        return undefined;
    }

    switch (lastSeenConfig) {
        case "ISO_8601":
        case "ISO_8601_local":
            return new Date(Date.parse(lastSeen as string));

        case "epoch":
            return new Date(lastSeen as number);

        case "disable":
            return undefined;

        default:
            console.error(`Unknown last_seen type ${lastSeenConfig}`);
            return undefined;
    }
};

function padTo2Digits(num: number): string {
    return num.toString().padStart(2, "0");
}

export function formatDate(date: Date): string {
    return `${[date.getFullYear(), padTo2Digits(date.getMonth() + 1), padTo2Digits(date.getDate())].join("-")} ${[padTo2Digits(date.getHours()), padTo2Digits(date.getMinutes()), padTo2Digits(date.getSeconds())].join(":")}`;
}

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

export const getEndpoints = (entity?: Device | Group): Set<string | number> => {
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

type ExposeValidateFn = (name: string | undefined, access: FeatureAccessMode) => boolean;

const parseExpose = (expose: BasicFeature | FeatureWithSubFeatures, validateFn: ExposeValidateFn): FeatureWithAnySubFeatures | undefined => {
    const { name, access } = expose;

    if (!validateFn(name, access)) {
        return undefined;
    }

    if ("features" in expose && expose.features && expose.features.length > 0) {
        const features: AnySubFeature[] = [];

        for (const subFeature of expose.features) {
            const validFeature = parseExpose(subFeature, validateFn);

            if (validFeature && !features.some((f) => f.property === validFeature.property)) {
                features.push(validFeature);
            }
        }

        return { ...expose, features };
    }

    return { ...expose };
};

export const filterExposes = (
    exposes: NonNullable<Device["definition"]>["exposes"],
    validateFn: ExposeValidateFn,
    limit = 10,
): FeatureWithAnySubFeatures[] => {
    const filteredExposes: FeatureWithAnySubFeatures[] = [];

    for (const expose of exposes) {
        const validExpose = parseExpose(expose, validateFn);

        if (validExpose) {
            filteredExposes.push(validExpose);

            if (filteredExposes.length === limit) {
                break;
            }
        }
    }

    return filteredExposes;
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
