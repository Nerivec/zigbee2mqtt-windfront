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

// Mutable device state cache — updated on successful SETs, used for GET and reconnect
const deviceStateCache = new Map<string, Record<string, unknown>>();
for (const ds of DEVICE_STATES) {
    deviceStateCache.set(ds.topic, merge({}, ds.payload));
}

const cloneDeviceState = (ieee: string) => {
    const device = BRIDGE_DEVICES.payload.find((d) => d.ieee_address === ieee);

    if (device) {
        const topic = deviceStateCache.has(device.friendly_name) ? device.friendly_name : device.ieee_address;
        const cached = deviceStateCache.get(topic);

        if (cached) {
            return { topic, payload: merge({}, cached) };
        }
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

        for (const [topic, payload] of deviceStateCache) {
            ws.send(JSON.stringify({ topic, payload }));
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
                    const isDeviceSet = msg.topic.endsWith("/request/set") || msg.topic.endsWith("/set");
                    const isDeviceGet = msg.topic.endsWith("/request/get") || msg.topic.endsWith("/get");

                    if (isDeviceSet || isDeviceGet) {
                        const deviceTopic = msg.topic.replace(/\/(?:request\/)?(set|get)$/, "");
                        const commandType = isDeviceGet ? "get" : "set";

                        // SET-only special cases: command execution and attribute reading
                        if (isDeviceSet && "command" in msg.payload) {
                            setTimeout(() => {
                                ws.send(JSON.stringify(BRIDGE_LOGGING_EXECUTE_COMMAND));
                            }, 500);
                        } else if (isDeviceSet && "read" in msg.payload) {
                            setTimeout(() => {
                                ws.send(JSON.stringify(BRIDGE_LOGGING_READ_ATTR));
                            }, 500);
                        } else {
                            // Transaction Response API: Send response on {device}/response/{set|get}
                            const requestId = msg.payload?.z2m_transaction ?? msg.payload?.z2m?.request_id;

                            if (requestId) {
                                const friendlyName = resolveToFriendlyName(deviceTopic);
                                const sleepyDelays: Record<string, [number, number]> = {
                                    "test/sleepy-device-fast": [5000, 0],
                                    "test/sleepy-device-slow": [30000, 5000],
                                };
                                const sleepyDelay = sleepyDelays[friendlyName];

                                // Strip z2m_transaction from payload (real backend strips before converter processing)
                                const { z2m_transaction: _tx, z2m: _z2m, ...dataPayload } = msg.payload;

                                // Ping: no attribute keys beyond z2m_transaction
                                const isPing = Object.keys(dataPayload).length === 0;

                                /** Send state topic update after successful command */
                                const sendStateUpdate = () => {
                                    const stateTopic = resolveToFriendlyName(deviceTopic);

                                    if (!isDeviceGet) {
                                        // SET: merge set values into persistent cache
                                        const cached = deviceStateCache.get(stateTopic) || deviceStateCache.get(deviceTopic);
                                        if (cached) {
                                            merge(cached, dataPayload);
                                        }
                                    }

                                    // Send full cached state (GET or SET)
                                    const cached = deviceStateCache.get(stateTopic) || deviceStateCache.get(deviceTopic);
                                    if (cached) {
                                        cached.last_seen = new Date().toISOString();
                                        ws.send(JSON.stringify({ topic: stateTopic, payload: { ...cached } }));
                                    }
                                };

                                if (isPing) {
                                    // Ping response — immediate
                                    setTimeout(() => {
                                        ws.send(
                                            JSON.stringify({
                                                topic: `${deviceTopic}/response/${commandType}`,
                                                payload: {
                                                    data: {},
                                                    status: "ok",
                                                    z2m_transaction: requestId,
                                                },
                                            }),
                                        );
                                    }, 25);
                                } else if (sleepyDelay) {
                                    // Sleepy device: converter blocks until device wakes up.
                                    // Fast variant (~5s) responds before frontend's 10s timeout.
                                    // Slow variant (~30-35s) triggers "queued" UX after timeout.
                                    const wakeupDelay = sleepyDelay[0] + Math.random() * sleepyDelay[1];

                                    setTimeout(() => {
                                        ws.send(
                                            JSON.stringify({
                                                topic: `${deviceTopic}/response/${commandType}`,
                                                payload: {
                                                    status: "ok",
                                                    z2m_transaction: requestId,
                                                    data: isDeviceGet ? {} : dataPayload,
                                                },
                                            }),
                                        );

                                        sendStateUpdate();
                                    }, wakeupDelay);
                                } else {
                                    // Regular device: 50-200ms delay, 90% success
                                    const delay = 50 + Math.random() * 150;

                                    setTimeout(() => {
                                        const isSuccess = Math.random() > 0.1;

                                        if (isSuccess) {
                                            ws.send(
                                                JSON.stringify({
                                                    topic: `${deviceTopic}/response/${commandType}`,
                                                    payload: {
                                                        status: "ok",
                                                        z2m_transaction: requestId,
                                                        data: isDeviceGet ? {} : dataPayload,
                                                    },
                                                }),
                                            );

                                            sendStateUpdate();
                                        } else {
                                            // Error response with actual failed key names
                                            const failedKeys = Object.keys(dataPayload).join(",");

                                            ws.send(
                                                JSON.stringify({
                                                    topic: `${deviceTopic}/response/${commandType}`,
                                                    payload: {
                                                        data: {},
                                                        status: "error",
                                                        z2m_transaction: requestId,
                                                        error: `failed:${failedKeys || "unknown"}`,
                                                    },
                                                }),
                                            );
                                        }
                                    }, delay);
                                }
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
