import merge from "lodash/merge.js";
import { WebSocketServer } from "ws";
import type { Zigbee2MQTTNetworkMap } from "zigbee2mqtt";
import type { DeviceState, Message, ResponseMessage } from "../src/types.js";
import { BRIDGE_DEFINITION } from "./bridgeDefinitions.js";
import { BRIDGE_DEVICES } from "./bridgeDevices.js";
import { BRIDGE_EXTENSIONS } from "./bridgeExtensions.js";
import { BRIDGE_GROUPS } from "./bridgeGroups.js";
import { BRIDGE_HEALTH } from "./bridgeHealth.js";
import { BRIDGE_INFO } from "./bridgeInfo.js";
import { BRIDGE_LOGGING, BRIDGE_LOGGING_EXECUTE_COMMAND, BRIDGE_LOGGING_READ_ATTR } from "./bridgeLogging.js";
import { BRIDGE_STATE } from "./bridgeState.js";
import { DEVICE_AVAILABILITY } from "./deviceAvailability.js";
import { DEVICE_STATES } from "./deviceState.js";
import { GENERATE_EXTERNAL_DEFINITION_RESPONSE } from "./generateExternalDefinitionResponse.js";
import { NETWORK_MAP_RESPONSE } from "./networkMapResponse.js";
import { PERMIT_JOIN_RESPONSE } from "./permitJoinResponse.js";
import { TOUCHLINK_RESPONSE } from "./touchlinkResponse.js";

const cloneDeviceState = (ieee: string) => {
    const device = BRIDGE_DEVICES.payload.find((d) => d.ieee_address === ieee);

    if (device) {
        const deviceState = DEVICE_STATES.find((state) => state.topic === device.friendly_name || state.topic === device.ieee_address);

        return merge({}, deviceState);
    }
};

/**
 * Resolve a topic (IEEE address or friendly name) to the friendly name.
 * In real Z2M, state updates are always published to the friendly_name topic.
 */
const resolveToFriendlyName = (topic: string): string => {
    if (topic.startsWith("0x")) {
        const device = BRIDGE_DEVICES.payload.find((d) => d.ieee_address === topic);
        if (device) {
            return device.friendly_name;
        }
    }
    return topic;
};

const randomString = (len: number): string =>
    Math.random()
        .toString(36)
        .slice(2, 2 + len);

// const randomIntInclusive = (min: number, max: number) =>  Math.floor(Math.random() * (max - min + 1)) + min;

export function startServer() {
    const port = Number.parseInt(process.env.MOCK_WS_PORT || "8579", 10);
    const wss = new WebSocketServer({
        port,
    });

    wss.on("connection", (ws) => {
        const bridgeInfo = merge({}, BRIDGE_INFO);
        bridgeInfo.payload.commit = randomString(8);
        bridgeInfo.payload.config.advanced.log_output = Math.random() < 0.25 ? ["syslog"] : Math.random() < 0.5 ? ["console", "file"] : ["console"];

        ws.send(JSON.stringify(BRIDGE_STATE));
        ws.send(JSON.stringify(bridgeInfo));
        ws.send(JSON.stringify(BRIDGE_DEVICES));
        ws.send(JSON.stringify(BRIDGE_GROUPS));
        ws.send(JSON.stringify(BRIDGE_DEFINITION));
        ws.send(JSON.stringify(BRIDGE_EXTENSIONS));

        setTimeout(() => {
            ws.send(JSON.stringify(merge({}, BRIDGE_HEALTH, { payload: { response_time: Date.now() - 3 } })));
        }, 5000);

        for (const message of DEVICE_AVAILABILITY) {
            ws.send(JSON.stringify(message));
        }

        for (const message of DEVICE_STATES) {
            ws.send(JSON.stringify(message));
        }

        for (const ds of DEVICE_STATES) {
            setInterval(
                () => {
                    const message: Message<DeviceState> = {
                        payload: {
                            last_seen: new Date().toISOString(),
                            linkquality: Math.floor(Math.random() * (254 - 1 + 1) + 1),
                        },
                        topic: ds.topic,
                    };

                    ws.send(JSON.stringify(message));
                },
                Math.floor(Math.random() * (180 - 2 + 2) + 2) * 1000,
            );
        }

        let i = 1;

        for (const message of BRIDGE_LOGGING) {
            setTimeout(() => {
                ws.send(JSON.stringify(message));
            }, i * 2000);

            i++;
        }

        ws.addEventListener("message", (message) => {
            // biome-ignore lint/suspicious/noExplicitAny: debug
            const msg: Message<any> = JSON.parse(message.data as string);

            if (msg.topic === "bridge/request/permit_join" && msg.payload.time > 0 && msg.payload.device === "0x0017880103d55d65") {
                setTimeout(() => {
                    ws.send(
                        JSON.stringify({
                            payload: {
                                status: "error",
                                error: "Failed permit join",
                                data: {},
                                transaction: msg.payload.transaction,
                            },
                            topic: msg.topic.replace("bridge/request/", "bridge/response/"),
                        } satisfies ResponseMessage<"bridge/response/permit_join">),
                    );
                }, 25);

                return;
            }

            const sendResponseOK = () => {
                ws.send(
                    JSON.stringify({
                        payload: {
                            status: "ok",
                            data: {},
                            transaction: msg.payload.transaction,
                        },
                        topic: msg.topic.replace("bridge/request/", "bridge/response/"),
                        // biome-ignore lint/suspicious/noExplicitAny: generic
                    } satisfies ResponseMessage<any>),
                );
            };

            switch (msg.topic) {
                case "bridge/request/networkmap": {
                    switch (msg.payload.type) {
                        case "raw": {
                            const response = merge({}, NETWORK_MAP_RESPONSE);
                            response.payload.transaction = msg.payload.transaction;

                            if (msg.payload.routes) {
                                response.payload.data.routes = true;

                                (response.payload.data.value as Zigbee2MQTTNetworkMap).links[0].routes.push(
                                    {
                                        destinationAddress: 0x1234,
                                        nextHopAddress: 14567,
                                        status: "ACTIVE" as const,
                                        manyToOne: 0,
                                        memoryConstrained: 0,
                                        routeRecordRequired: 0,
                                        reserved1: 0,
                                    },
                                    {
                                        destinationAddress: 0x5678,
                                        nextHopAddress: 14567,
                                        status: "DISCOVERY_UNDERWAY" as const,
                                        manyToOne: 0,
                                        memoryConstrained: 0,
                                        routeRecordRequired: 0,
                                        reserved1: 0,
                                    },
                                    {
                                        destinationAddress: 0x2345,
                                        nextHopAddress: 14567,
                                        status: "DISCOVERY_FAILED" as const,
                                        manyToOne: 0,
                                        memoryConstrained: 0,
                                        routeRecordRequired: 0,
                                        reserved1: 0,
                                    },
                                    {
                                        destinationAddress: 0x7890,
                                        nextHopAddress: 14567,
                                        status: "INACTIVE" as const,
                                        manyToOne: 0,
                                        memoryConstrained: 0,
                                        routeRecordRequired: 0,
                                        reserved1: 0,
                                    },
                                );
                            }

                            setTimeout(() => {
                                ws.send(JSON.stringify(response));
                            }, 2000);
                            break;
                        }
                        case "graphviz": {
                            setTimeout(() => {
                                ws.send(
                                    JSON.stringify({
                                        payload: {
                                            data: { routes: msg.payload.routes, type: "graphviz", value: "mock-graphviz" },
                                            status: "ok",
                                            transaction: msg.payload.transaction,
                                        },
                                        topic: "bridge/response/networkmap",
                                    }),
                                );
                            }, 2000);
                            break;
                        }
                        case "plantuml": {
                            setTimeout(() => {
                                ws.send(
                                    JSON.stringify({
                                        payload: {
                                            data: { routes: msg.payload.routes, type: "plantuml", value: "mock-plantuml" },
                                            status: "ok",
                                            transaction: msg.payload.transaction,
                                        },
                                        topic: "bridge/response/networkmap",
                                    }),
                                );
                            }, 2000);
                            break;
                        }
                    }

                    break;
                }
                case "bridge/request/touchlink/scan": {
                    setTimeout(() => {
                        ws.send(JSON.stringify(TOUCHLINK_RESPONSE));
                    }, 500);
                    break;
                }
                case "bridge/request/device/generate_external_definition": {
                    setTimeout(() => {
                        ws.send(JSON.stringify(GENERATE_EXTERNAL_DEFINITION_RESPONSE).replace("$ID", msg.payload.id));
                    }, 500);
                    break;
                }
                case "bridge/request/permit_join": {
                    setTimeout(() => {
                        if (msg.payload.time > 0) {
                            ws.send(JSON.stringify(PERMIT_JOIN_RESPONSE));

                            const permitBridgeInfo = merge({}, bridgeInfo);
                            permitBridgeInfo.payload.permit_join = true;
                            permitBridgeInfo.payload.permit_join_end = Date.now() + msg.payload.time * 1000;

                            ws.send(JSON.stringify(permitBridgeInfo));

                            setTimeout(() => {
                                ws.send(JSON.stringify(bridgeInfo));
                            }, msg.payload.time * 1000);
                        } else {
                            sendResponseOK();
                            ws.send(JSON.stringify(bridgeInfo));
                        }
                    }, 50);
                    break;
                }
                case "bridge/request/device/ota_update/update": {
                    sendResponseOK();

                    const updatedDeviceState = cloneDeviceState(msg.payload.id);

                    if (updatedDeviceState) {
                        updatedDeviceState.payload.update = {
                            progress: 0,
                            remaining: 600,
                            state: "updating",
                            installed_version: 1,
                            latest_version: 2,
                        };

                        const interval = setInterval(() => {
                            ws.send(JSON.stringify(updatedDeviceState));

                            updatedDeviceState.payload.update!.progress! += 1;
                            updatedDeviceState.payload.update!.remaining! -= 1;
                        }, 1000);

                        setTimeout(() => {
                            clearInterval(interval);
                        }, 25000);
                    }

                    break;
                }
                case "bridge/request/device/ota_update/schedule": {
                    sendResponseOK();

                    const updatedDeviceState = cloneDeviceState(msg.payload.id);

                    if (updatedDeviceState) {
                        if (!updatedDeviceState.payload.update) {
                            updatedDeviceState.payload.update = { state: "scheduled", installed_version: null, latest_version: null };
                        } else {
                            updatedDeviceState.payload.update.state = "scheduled";
                        }

                        ws.send(JSON.stringify(updatedDeviceState));
                    }

                    break;
                }
                case "bridge/request/device/ota_update/unschedule": {
                    sendResponseOK();

                    const updatedDeviceState = cloneDeviceState(msg.payload.id);

                    if (updatedDeviceState) {
                        if (!updatedDeviceState.payload.update) {
                            updatedDeviceState.payload.update = { state: "idle", installed_version: null, latest_version: null };
                        } else if (updatedDeviceState.payload.update?.state === "scheduled") {
                            updatedDeviceState.payload.update.state = "idle"; // simpler
                        }

                        ws.send(JSON.stringify(updatedDeviceState));
                    }

                    break;
                }
                case "bridge/request/converter/save":
                case "bridge/request/extension/save": {
                    if (msg.payload.code === "valid") {
                        sendResponseOK();
                    } else {
                        ws.send(
                            JSON.stringify({
                                payload: {
                                    status: "error",
                                    error: `${msg.payload.name} contains invalid code: mocked invalid code`,
                                    data: {},
                                    transaction: msg.payload.transaction,
                                },
                                topic: msg.topic.replace("bridge/request/", "bridge/response/"),
                            } satisfies ResponseMessage<"bridge/response/converter/save" | "bridge/response/extension/save">),
                        );
                    }

                    break;
                }
                default: {
                    if (msg.topic.endsWith("/set")) {
                        const deviceTopic = msg.topic.replace("/set", "");

                        if ("command" in msg.payload) {
                            setTimeout(() => {
                                ws.send(JSON.stringify(BRIDGE_LOGGING_EXECUTE_COMMAND));
                            }, 500);
                        } else if ("read" in msg.payload) {
                            setTimeout(() => {
                                ws.send(JSON.stringify(BRIDGE_LOGGING_READ_ATTR));
                            }, 500);
                        } else {
                            // Command Response API: Send response on {device}/response topic
                            const requestId = msg.payload?.z2m?.request_id;

                            if (requestId) {
                                // Check if this is the sleepy test device (resolve to friendly name first)
                                const friendlyName = resolveToFriendlyName(deviceTopic);
                                const isSleepyDevice = friendlyName === "test/sleepy-device";

                                // Simulate backend processing delay (50-200ms, realistic for Zigbee)
                                const delay = 50 + Math.random() * 150;

                                setTimeout(() => {
                                    if (isSleepyDevice) {
                                        // Sleepy device: Return "pending" with final:true
                                        // This simulates a battery-powered device that's asleep
                                        // The command is queued and will be delivered when device wakes
                                        ws.send(
                                            JSON.stringify({
                                                topic: `${deviceTopic}/response`,
                                                payload: {
                                                    status: "pending",
                                                    z2m: { request_id: requestId, final: true },
                                                    data: msg.payload,
                                                },
                                            }),
                                        );

                                        // Simulate device waking up after 30 seconds and confirming the command
                                        // This sends the state update as if the device finally received the command
                                        const wakeupDelay = 30000 + Math.random() * 5000; // 30-35 seconds
                                        setTimeout(() => {
                                            const { z2m, ...statePayload } = msg.payload;
                                            const stateTopic = resolveToFriendlyName(deviceTopic);
                                            ws.send(
                                                JSON.stringify({
                                                    topic: stateTopic,
                                                    payload: {
                                                        ...statePayload,
                                                        last_seen: new Date().toISOString(),
                                                    },
                                                }),
                                            );
                                        }, wakeupDelay);
                                    } else {
                                        // Regular device: 90% success, 10% error for realistic testing
                                        const isSuccess = Math.random() > 0.1;

                                        if (isSuccess) {
                                            // Success response
                                            ws.send(
                                                JSON.stringify({
                                                    topic: `${deviceTopic}/response`,
                                                    payload: {
                                                        status: "ok",
                                                        z2m: { request_id: requestId },
                                                        data: msg.payload,
                                                    },
                                                }),
                                            );

                                            // Also send state update (always to friendly_name topic, like real Z2M)
                                            const { z2m, ...statePayload } = msg.payload;
                                            const stateTopic = resolveToFriendlyName(deviceTopic);
                                            ws.send(
                                                JSON.stringify({
                                                    topic: stateTopic,
                                                    payload: {
                                                        ...statePayload,
                                                        last_seen: new Date().toISOString(),
                                                    },
                                                }),
                                            );
                                        } else {
                                            // Error response (simulate timeout or device error)
                                            ws.send(
                                                JSON.stringify({
                                                    topic: `${deviceTopic}/response`,
                                                    payload: {
                                                        status: "error",
                                                        z2m: { request_id: requestId },
                                                        error: {
                                                            code: "SEND_FAILED",
                                                            message: "Send failed",
                                                            zcl_status: 134,
                                                        },
                                                    },
                                                }),
                                            );
                                        }
                                    }
                                }, delay);
                            }
                        }
                    } else if (msg.topic.startsWith("bridge/request/")) {
                        sendResponseOK();
                    }

                    break;
                }
            }
        });
    });

    console.log(`Started WebSocket server on port ${port}`);
}
