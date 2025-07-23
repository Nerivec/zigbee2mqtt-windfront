import type { Group, Message } from "../src/types.js";

export const BRIDGE_GROUPS: Message<Group[]> = {
    payload: [
        {
            description: "Test group description",
            friendly_name: "hue lights",
            id: 1,
            members: [
                {
                    endpoint: 11,
                    ieee_address: "0x0017880104292f0a",
                },
                {
                    endpoint: 11,
                    ieee_address: "0x0017880104dfc05e",
                },
                {
                    endpoint: 11,
                    ieee_address: "0x0017880103d55d65",
                },
            ],
            scenes: [
                {
                    id: 2,
                    name: "Scene 2",
                },
                {
                    id: 5,
                    name: "Scene 5",
                },
                {
                    id: 7,
                    name: "Scene 7",
                },
                {
                    id: 55,
                    name: "Scene 55",
                },
            ],
        },
        {
            description: "Test multi-endpoint",
            friendly_name: "Multi-endpoint",
            id: 2,
            members: [
                {
                    endpoint: 11,
                    ieee_address: "0x00abcdef12345678",
                },
            ],
            scenes: [],
        },
        {
            friendly_name: "default_bind_group",
            id: 901,
            members: [],
            scenes: [],
            description: null,
        },
    ],
    topic: "bridge/groups",
};
