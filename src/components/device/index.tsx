import genericDevice from "../../images/generic-zigbee-device.png";
import type { Device } from "../../types.js";
import { sanitizeZ2MDeviceName } from "../../utils.js";

const DEVICE_IMAGE_BASE_PATH = "https://www.zigbee2mqtt.io/images/devices/";
const VENDOR_IMAGE_BASE_PATH = "https://www.zigbee2mqtt.io/images/vendors/";

export const getZ2MDeviceImage = (device: Device): string[] => {
    const sanitizedName = sanitizeZ2MDeviceName(device.definition?.model);
    const sanitizedVendorName = sanitizeZ2MDeviceName(device.definition?.vendor);

    const srcList: string[] = [];

    if (sanitizedName !== "NA") {
        srcList.push(`${DEVICE_IMAGE_BASE_PATH}${sanitizedName}.png`);
    }

    if (sanitizedVendorName !== "NA") {
        srcList.push(`${VENDOR_IMAGE_BASE_PATH}${sanitizedVendorName}.png`);
    }

    if (sanitizedName === "NA" && sanitizedVendorName === "NA") {
        srcList.push(genericDevice);
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
