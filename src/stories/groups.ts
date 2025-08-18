import type { Device, Group } from "../types.js";
import { BASIC_ENDDEVICE, BASIC_ROUTER, OTHER_ROUTER } from "./devices.js";

const getFirstEndpoint = (device: Device): number => {
    for (const endpointKey in device.endpoints) {
        return Number.parseInt(endpointKey, 10);
    }

    return 1;
};

export const EMPTY_GROUP: Group = {
    id: 1,
    friendly_name: "my group 1",
    scenes: [],
    members: [],
};

export const GROUP_WITH_MEMBERS: Group = {
    id: 2,
    friendly_name: "my group 2",
    scenes: [],
    members: [
        { ieee_address: BASIC_ROUTER.ieee_address, endpoint: getFirstEndpoint(BASIC_ROUTER) },
        { ieee_address: BASIC_ENDDEVICE.ieee_address, endpoint: getFirstEndpoint(BASIC_ENDDEVICE) },
        { ieee_address: OTHER_ROUTER.ieee_address, endpoint: getFirstEndpoint(OTHER_ROUTER) },
    ],
};

export const GROUP_WITH_MEMBERS_AND_SCENES: Group = {
    id: 3,
    friendly_name: "my group 3",
    scenes: [
        { id: 1, name: "dawn" },
        { id: 2, name: "dusk" },
    ],
    members: [
        { ieee_address: BASIC_ROUTER.ieee_address, endpoint: getFirstEndpoint(BASIC_ROUTER) },
        { ieee_address: BASIC_ENDDEVICE.ieee_address, endpoint: getFirstEndpoint(BASIC_ENDDEVICE) },
        { ieee_address: OTHER_ROUTER.ieee_address, endpoint: getFirstEndpoint(OTHER_ROUTER) },
    ],
};
