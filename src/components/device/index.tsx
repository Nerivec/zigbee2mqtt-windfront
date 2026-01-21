import genericDevice from "../../images/generic-zigbee-device.png";
import type { Device } from "../../types.js";
import { sanitizeZ2MDeviceName } from "../../utils.js";

const DEVICE_IMAGE_BASE_PATH = "https://www.zigbee2mqtt.io/images/devices/";

export const getZ2MDeviceImage = (device: Device): string => {
    const sanitizedName = sanitizeZ2MDeviceName(device.definition?.model);

    return sanitizedName === "NA" ? genericDevice : `${DEVICE_IMAGE_BASE_PATH}${sanitizedName}.png`;
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
