import type { Device } from "../../types.js";

const DEVICE_IMAGE_BASE_PATH = "https://www.zigbee2mqtt.io/images/devices/";
const VENDOR_IMAGE_BASE_PATH = "https://www.zigbee2mqtt.io/images/vendors/";

export const getZ2MDeviceImage = (device: Device): string[] => {
    const modelFilename = device.definition?.model.replace(/:|\s|\//g, "-");
    const srcList: string[] = modelFilename ? [`${DEVICE_IMAGE_BASE_PATH}${modelFilename}.png`] : [];

    if (device.definition && device.definition.source !== "native") {
        const vendorFilename = device.definition.vendor.replace(/:|\s|\//g, "-");

        srcList.push(`${VENDOR_IMAGE_BASE_PATH}${vendorFilename}.png`);
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
