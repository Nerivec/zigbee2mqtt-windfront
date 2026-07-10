import type { Device } from "../../types.js";
import { sanitizeZ2MDeviceName } from "../../utils.js";

const DEVICE_IMAGE_BASE_PATH = "https://www.zigbee2mqtt.io/images/devices/";
const VENDOR_IMAGE_BASE_PATH = "https://www.zigbee2mqtt.io/images/vendors/";

export const getZ2MDeviceImage = (device: Device): string[] => {
    const sanitizedName = sanitizeZ2MDeviceName(device.definition?.model);
    const srcList: string[] = [];

    if (sanitizedName !== "NA") {
        srcList.push(`${DEVICE_IMAGE_BASE_PATH}${sanitizedName}.png`);
    }
    if (device.definition?.source !== "native") {
        const sanitizedVendorName = sanitizeZ2MDeviceName(device.definition?.vendor);
        if (sanitizedVendorName !== "NA") {
            srcList.push(`${VENDOR_IMAGE_BASE_PATH}${sanitizedVendorName}.png`);
        }
    }
    return srcList;
};

export const hasOtaCluster = (device: Device): boolean => {
    for (const endpointId in device.endpoints) {
        const endpoint = device.endpoints[endpointId];

        if (endpoint.clusters.output.includes("genOta")) {
            return true;
        }
    }

    return false;
};
