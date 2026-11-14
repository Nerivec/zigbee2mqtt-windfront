import { describe, expect, it } from "vitest";
import type { Zigbee2MQTTNetworkMap } from "zigbee2mqtt";
import { NETWORK_MAP_RESPONSE } from "../mocks/networkMapResponse.js";
import { getUnlinkedNodes } from "../src/components/network-page/index.js";

const makeNode = (ieeeAddr: string) => ({ ieeeAddr }) as Zigbee2MQTTNetworkMap["nodes"][number];
const makeLink = (source: string, target: string) =>
    ({ source: { ieeeAddr: source }, target: { ieeeAddr: target } }) as Zigbee2MQTTNetworkMap["links"][number];

describe("getUnlinkedNodes", () => {
    it("returns nodes that are neither source nor target of a link", () => {
        const map: Zigbee2MQTTNetworkMap = {
            nodes: [makeNode("0x01"), makeNode("0x02"), makeNode("0x03"), makeNode("0x04")],
            links: [makeLink("0x02", "0x01")],
        };

        expect(getUnlinkedNodes(map).map((node) => node.ieeeAddr)).toStrictEqual(["0x03", "0x04"]);
    });

    it("returns nothing when all nodes are linked", () => {
        const map: Zigbee2MQTTNetworkMap = {
            nodes: [makeNode("0x01"), makeNode("0x02"), makeNode("0x03")],
            links: [makeLink("0x02", "0x01"), makeLink("0x01", "0x03")],
        };

        expect(getUnlinkedNodes(map)).toStrictEqual([]);
    });

    it("returns all nodes when there are no links", () => {
        const map: Zigbee2MQTTNetworkMap = { nodes: [makeNode("0x01"), makeNode("0x02")], links: [] };

        expect(getUnlinkedNodes(map)).toStrictEqual(map.nodes);
    });

    it("finds the unlinked nodes of the mock network map", () => {
        const map = NETWORK_MAP_RESPONSE.payload.data.value as Zigbee2MQTTNetworkMap;

        expect(getUnlinkedNodes(map).map((node) => node.friendlyName)).toStrictEqual([
            "0xbc33acfffe17628b",
            "hue1",
            "some/lamp",
            "Irrigation-back-3",
            "Détecteur_Mouvement_Bureau",
            "Bosch thermostat",
        ]);
    });
});
