import type { Zigbee2MQTTNetworkMap } from "zigbee2mqtt";

export type NetworkRawDisplayType = "data" | "map";
export type NetworkMapNode = Zigbee2MQTTNetworkMap["nodes"][number];
export type NetworkMapLink = Zigbee2MQTTNetworkMap["links"][number];

export const enum ZigbeeRelationship {
    NeighborIsParent = 0x00,
    NeighborIsAChild = 0x01,
    NeighborIsASibling = 0x02,
    NoneOfTheAbove = 0x03,
    NeighborIsPreviousChild = 0x04,
}
