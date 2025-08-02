import type { Zigbee2MQTTAPI } from "zigbee2mqtt";
import type { Message } from "../src/types.js";

export const BRIDGE_HEALTH: Message<Zigbee2MQTTAPI["bridge/health"]> = {
    payload: {
        response_time: 0,
        os: {
            load_average: [0.14, 0.12, 0.05],
            memory_used_mb: 1023.57,
            memory_percent: 5.12,
        },
        process: { uptime_sec: 2053460, memory_used_mb: 80.43, memory_percent: 0.004 },
        mqtt: {
            connected: true,
            queued: 0,
            published: 79,
            received: 1256,
        },
        devices: {
            "0x00158d00039fe32c": {
                leave_count: 0,
                messages: 456,
                messages_per_sec: 0.0009,
                network_address_changes: 2,
            },
            "0x0017880104dfc05e": {
                leave_count: 0,
                messages: 25,
                messages_per_sec: 0.7835,
                network_address_changes: 0,
            },
            "0x00158d0002c48958": {
                leave_count: 65,
                messages: 23685,
                messages_per_sec: 15.6554,
                network_address_changes: 23,
            },
            "0x00158d0004261dc7": {
                leave_count: 3,
                messages: 2685,
                messages_per_sec: 1.6554,
                network_address_changes: 0,
            },
            "0x94a081fffe57bbf6": {
                leave_count: 0,
                messages: 50,
                messages_per_sec: 0.0172,
                network_address_changes: 0,
            },
        },
    },
    topic: "bridge/health",
};
