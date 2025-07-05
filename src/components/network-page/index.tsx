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

/**
 * Convert a CSS color using `OffscreenCanvas` to RGBA.
 * @param ctx Rendering context to convert color with.
 * @param color expect in CSS format (e.g. `oklch(25.33% 0.016 252.42);`)
 * @return rgb in CSS format (e.g. `rgba(29, 35, 42, 255);`)
 */
export function cssColorToRgba(ctx: OffscreenCanvasRenderingContext2D, color: string): string {
    ctx.fillStyle = color;

    ctx.fillRect(0, 0, 1, 1);

    return `rgba(${ctx.getImageData(0, 0, 1, 1).data.join(", ")});`;
}
