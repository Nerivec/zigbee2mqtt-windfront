import { saveAs } from "file-saver";
import type { Device, Group, LastSeenConfig } from "./types.js";

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

// #endregion

// #region Format/Convert

export const stringifyWithPreservingUndefinedAsNull = (data: Record<string, unknown>): string =>
    JSON.stringify(data, (_k, v) => (v === undefined ? null : v));

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
            console.warn(`Unknown last_seen type ${lastSeenConfig}`);
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
