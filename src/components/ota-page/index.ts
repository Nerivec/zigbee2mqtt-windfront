import type { Zigbee2MQTTAPI } from "zigbee2mqtt";

export type OnCheckClickPayload = {
    sourceIdx: number;
    ieee: string;
    downgrade: boolean;
} & Omit<Zigbee2MQTTAPI["bridge/request/device/ota_update/check"], "id">;
export type OnUpdateClickPayload = {
    sourceIdx: number;
    ieee: string;
    downgrade: boolean;
} & Omit<Zigbee2MQTTAPI["bridge/request/device/ota_update/update"], "id">;
export type OnScheduleClickPayload = {
    sourceIdx: number;
    ieee: string;
    downgrade: boolean;
} & Omit<Zigbee2MQTTAPI["bridge/request/device/ota_update/schedule"], "id">;
export type OnUnscheduleClickPayload = {
    sourceIdx: number;
    ieee: string;
} & Omit<Zigbee2MQTTAPI["bridge/request/device/ota_update/unschedule"], "id">;

export type OtaImageHeader = {
    otaUpgradeFileIdentifier: Uint8Array;
    otaHeaderVersion: number;
    otaHeaderLength: number;
    otaHeaderFieldControl: number;
    manufacturerCode: number;
    imageType: number;
    fileVersion: number;
    zigbeeStackVersion: number;
    otaHeaderString: string;
    totalImageSize: number;
    securityCredentialVersion: number | undefined;
    upgradeFileDestination: Uint8Array | undefined;
    minimumHardwareVersion: number | undefined;
    maximumHardwareVersion: number | undefined;
};

const UPGRADE_FILE_IDENTIFIER = new Uint8Array([0x1e, 0xf1, 0xee, 0x0b]);
const OTA_HEADER_MIN_LENGTH = 56;

export const formatOtaFileVersion = (version: number | null | undefined) => {
    if (version == null || version < 0) {
        return undefined;
    }

    const versionString = version.toString(16).padStart(8, "0");
    const appRelease = `${versionString[0]}.${versionString[1]}`;
    const appBuild = Number.parseInt(versionString.slice(2, 4), 16);
    const stackRelease = `${versionString[4]}.${versionString[5]}`;
    const stackBuild = Number.parseInt(versionString.slice(6), 16);

    return [appRelease, appBuild, stackRelease, stackBuild];
};

/**
 * Decode a fixed-width UTF-8 string, trimming null bytes.
 */
function decodeFixedString(buffer: ArrayBuffer | Uint8Array, start: number, end: number): string {
    const source = buffer instanceof ArrayBuffer ? buffer : buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    const slice = source.slice(start, end);

    return new TextDecoder("utf-8").decode(slice).replace(/\0+$/g, "").trimEnd();
}

/**
 * Find a subarray inside a byte buffer.
 */
function findSubarray(haystack: Uint8Array, needle: Uint8Array): number {
    if (!needle.length) {
        return 0;
    }

    for (let i = 0; i <= haystack.length - needle.length; i += 1) {
        if (bytesEqualsAt(haystack, needle, i)) {
            return i;
        }
    }

    return -1;
}

/**
 * Compare a segment of a haystack with a needle.
 */
function bytesEqualsAt(haystack: Uint8Array, needle: Uint8Array, offset: number): boolean {
    if (offset < 0 || offset + needle.length > haystack.length) {
        return false;
    }

    for (let i = 0; i < needle.length; i += 1) {
        if (haystack[offset + i] !== needle[i]) {
            return false;
        }
    }

    return true;
}

function parseImageHeader(buffer: ArrayBuffer): OtaImageHeader {
    // find the actual start of OTA data (might have padding before/after)
    const otaStartIndex = findSubarray(new Uint8Array(buffer), UPGRADE_FILE_IDENTIFIER);

    if (otaStartIndex === -1) {
        throw new Error("Invalid OTA file");
    }

    // slice buffer from the OTA start if there's padding
    const otaBuffer = otaStartIndex > 0 ? buffer.slice(otaStartIndex) : buffer;
    const view = new DataView(otaBuffer);

    if (otaBuffer.byteLength < OTA_HEADER_MIN_LENGTH) {
        throw new Error("Buffer too small to contain header");
    }

    const otaUpgradeFileIdentifier = new Uint8Array(otaBuffer.slice(0, 4));
    const otaHeaderVersion = view.getUint16(4, true);
    const otaHeaderLength = view.getUint16(6, true);
    const otaHeaderFieldControl = view.getUint16(8, true);
    const manufacturerCode = view.getUint16(10, true);
    const imageType = view.getUint16(12, true);
    const fileVersion = view.getUint32(14, true);
    const zigbeeStackVersion = view.getUint16(18, true);
    const otaHeaderString = decodeFixedString(otaBuffer, 20, 52);
    const totalImageSize = view.getUint32(52, true);

    let headerPos = OTA_HEADER_MIN_LENGTH;
    let securityCredentialVersion: number | undefined;
    let upgradeFileDestination: Uint8Array<ArrayBuffer> | undefined;
    let minimumHardwareVersion: number | undefined;
    let maximumHardwareVersion: number | undefined;

    if (otaHeaderFieldControl & 0x0001) {
        if (headerPos + 1 > otaBuffer.byteLength) {
            throw new Error("Unexpected end of buffer while reading securityCredentialVersion");
        }

        securityCredentialVersion = view.getUint8(headerPos);
        headerPos += 1;
    }

    if (otaHeaderFieldControl & 0x0002) {
        if (headerPos + 8 > otaBuffer.byteLength) {
            throw new Error("Unexpected end of buffer while reading upgradeFileDestination");
        }

        upgradeFileDestination = new Uint8Array(otaBuffer.slice(headerPos, headerPos + 8));
        headerPos += 8;
    }

    if (otaHeaderFieldControl & 0x0004) {
        if (headerPos + 4 > otaBuffer.byteLength) {
            throw new Error("Unexpected end of buffer while reading hardware versions");
        }

        minimumHardwareVersion = view.getUint16(headerPos, true);
        maximumHardwareVersion = view.getUint16(headerPos + 2, true);
    }

    return {
        otaUpgradeFileIdentifier,
        otaHeaderVersion,
        otaHeaderLength,
        otaHeaderFieldControl,
        manufacturerCode,
        imageType,
        fileVersion,
        zigbeeStackVersion,
        otaHeaderString,
        totalImageSize,
        securityCredentialVersion,
        upgradeFileDestination,
        minimumHardwareVersion,
        maximumHardwareVersion,
    };
}

export function readOtaFile(file: File): Promise<[hex: string, header: OtaImageHeader]> {
    return new Promise<[string, OtaImageHeader]>((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            if (reader.result instanceof ArrayBuffer) {
                try {
                    const otaImageHeader = parseImageHeader(reader.result);
                    let hexString = "";

                    for (const byte of new Uint8Array(reader.result)) {
                        hexString += byte.toString(16).padStart(2, "0");
                    }

                    resolve([hexString, otaImageHeader]);
                } catch (error) {
                    reject(error);
                }
            } else {
                reject(new Error("Unexpected read result"));
            }
        };
        reader.onerror = () => reject(reader.error ?? new Error("Unknown file read error"));

        reader.readAsArrayBuffer(file);
    });
}
