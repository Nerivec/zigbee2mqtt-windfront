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

export function startServer() {
    const wss = new WebSocketServer({
        port: 8579,
    });

    wss.on("connection", (ws) => {
        ws.send(JSON.stringify(BRIDGE_STATE));
        ws.send(JSON.stringify(BRIDGE_INFO));
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
                                    ...[
                                        { destinationAddress: 0x1234, nextHop: 14567, status: "ACTIVE" },
                                        { destinationAddress: 0x5678, nextHop: 14567, status: "DISCOVERY_UNDERWAY" },
                                        { destinationAddress: 0x2345, nextHop: 14567, status: "DISCOVERY_FAILED" },
                                        { destinationAddress: 0x7890, nextHop: 14567, status: "INACTIVE" },
                                    ],
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

                            const permitBridgeInfo = merge({}, BRIDGE_INFO);
                            permitBridgeInfo.payload.permit_join = true;
                            permitBridgeInfo.payload.permit_join_end = Date.now() + msg.payload.time * 1000;

                            ws.send(JSON.stringify(permitBridgeInfo));

                            setTimeout(() => {
                                ws.send(JSON.stringify(BRIDGE_INFO));
                            }, msg.payload.time * 1000);
                        } else {
                            sendResponseOK();
                            ws.send(JSON.stringify(BRIDGE_INFO));
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
                default: {
                    if (msg.topic.endsWith("/set")) {
                        if ("command" in msg.payload) {
                            setTimeout(() => {
                                ws.send(JSON.stringify(BRIDGE_LOGGING_EXECUTE_COMMAND));
                            }, 500);
                        } else if ("read" in msg.payload) {
                            setTimeout(() => {
                                ws.send(JSON.stringify(BRIDGE_LOGGING_READ_ATTR));
                            }, 500);
                        }
                    } else if (msg.topic.startsWith("bridge/request/")) {
                        sendResponseOK();
                    }

                    break;
                }
            }
        });
    });

    console.log("Started WebSocket server");
}
