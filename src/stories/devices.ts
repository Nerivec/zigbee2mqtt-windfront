import { BRIDGE_DEVICES } from "../../mocks/bridgeDevices";

export const coordinator = BRIDGE_DEVICES.payload[0];
export const baseRouter = BRIDGE_DEVICES.payload.find((d) => d.ieee_address === "0x00124b001e73227f")!;
export const baseEndDevice = BRIDGE_DEVICES.payload.find((d) => d.ieee_address === "0x00158d000224154d")!;

export const actionDevice = BRIDGE_DEVICES.payload.find((d) => d.ieee_address === "0x00158d000224154d")!;
export const contactDevice = BRIDGE_DEVICES.payload.find((d) => d.ieee_address === "0x00158d0004261dc7")!;
export const thDevice = BRIDGE_DEVICES.payload.find((d) => d.ieee_address === "0x00158d0004866f11")!;

export const multiEndpointDevice = BRIDGE_DEVICES.payload.find((d) => d.ieee_address === "0x00abcdef12345678")!;
export const complexExposesDevice = BRIDGE_DEVICES.payload.find((d) => d.ieee_address === "0x44e2f8fffe0c0ea6")!;
