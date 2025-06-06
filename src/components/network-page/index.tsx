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

export const NODE_TYPE_FILL_COLORS = {
    Coordinator: "#ffff00",
    Router: "#0000ff",
    EndDevice: "#00ff00",
};

export const EDGE_RELATIONSHIP_FILL_COLORS = {
    [ZigbeeRelationship.NeighborIsParent]: "#ff0000",
    [ZigbeeRelationship.NeighborIsAChild]: "#44ff88",
    [ZigbeeRelationship.NeighborIsASibling]: "#8888ff",
    // others ignored by Z2M
};
