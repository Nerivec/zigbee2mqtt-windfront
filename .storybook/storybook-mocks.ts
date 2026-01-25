import type { Zigbee2MQTTAPI, Zigbee2MQTTNetworkMap, Zigbee2MQTTRequest } from "zigbee2mqtt";
import { BRIDGE_DEFINITION } from "../mocks/bridgeDefinitions.js";
import { BRIDGE_DEVICES } from "../mocks/bridgeDevices.js";
import { BRIDGE_EXTENSIONS } from "../mocks/bridgeExtensions.js";
import { BRIDGE_GROUPS } from "../mocks/bridgeGroups.js";
import { BRIDGE_HEALTH } from "../mocks/bridgeHealth.js";
import { BRIDGE_INFO } from "../mocks/bridgeInfo.js";
import { BRIDGE_LOGGING, BRIDGE_LOGGING_EXECUTE_COMMAND, BRIDGE_LOGGING_READ_ATTR } from "../mocks/bridgeLogging.js";
import { BRIDGE_STATE } from "../mocks/bridgeState.js";
import { DEVICE_AVAILABILITY } from "../mocks/deviceAvailability.js";
import { DEVICE_STATES } from "../mocks/deviceState.js";
import { GENERATE_EXTERNAL_DEFINITION_RESPONSE } from "../mocks/generateExternalDefinitionResponse.js";
import { NETWORK_MAP_RESPONSE } from "../mocks/networkMapResponse.js";
import { PERMIT_JOIN_RESPONSE } from "../mocks/permitJoinResponse.js";
import { TOUCHLINK_RESPONSE } from "../mocks/touchlinkResponse.js";
import type { DeviceState, Message } from "../src/types.js";

const randomIntInclusive = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

const randomString = (len: number): string =>
    Math.random()
        .toString(36)
        .slice(2, 2 + len);

const cloneDeviceState = (ieee: string) => {
    const device = BRIDGE_DEVICES.payload.find((d) => d.ieee_address === ieee);

    if (device) {
        const deviceState = DEVICE_STATES.find((state) => state.topic === device.friendly_name || state.topic === device.ieee_address);

        return structuredClone(deviceState);
    }
};

/**
 * Resolve a topic (IEEE address or friendly name) to the friendly name.
 * In real Z2M, state updates are always published to the friendly_name topic.
 * Commands can be sent to either IEEE or friendly name, but responses go to friendly name.
 */
const resolveToFriendlyName = (topic: string): string => {
    // Check if topic looks like an IEEE address (starts with 0x)
    if (topic.startsWith("0x")) {
        const device = BRIDGE_DEVICES.payload.find((d) => d.ieee_address === topic);
        if (device) {
            return device.friendly_name;
        }
    }
    // Already a friendly name or unknown
    return topic;
};

class MockWebSocket extends EventTarget {
    static readonly CONNECTING = 0;
    static readonly OPEN = 1;
    static readonly CLOSING = 2;
    static readonly CLOSED = 3;

    binaryType: BinaryType = "blob";
    bufferedAmount = 0;
    extensions = "";
    protocol = "";
    readyState: number = MockWebSocket.CONNECTING;
    url: string;
    onclose: ((event: CloseEvent) => unknown) | null = null;
    onerror: ((event: Event) => unknown) | null = null;
    onmessage: ((event: MessageEvent) => unknown) | null = null;
    onopen: ((event: Event) => unknown) | null = null;

    #timers: number[] = [];

    // set in bootstrap
    #bridgeInfo!: Message<Zigbee2MQTTAPI["bridge/info"]>;

    constructor(url: string) {
        super();

        this.url = url;

        window.setTimeout(() => this.#open(), 10);
    }

    close(_code?: number, _reason?: string): void {
        if (this.readyState === MockWebSocket.CLOSED || this.readyState === MockWebSocket.CLOSING) {
            return;
        }

        this.readyState = MockWebSocket.CLOSING;

        for (const timer of this.#timers) {
            window.clearTimeout(timer);
        }

        this.readyState = MockWebSocket.CLOSED;

        this.dispatchEvent(new CloseEvent("close", { code: 1000 }));
    }

    send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void {
        if (this.readyState !== MockWebSocket.OPEN || typeof data !== "string") {
            return;
        }

        let parsed: Message;

        try {
            parsed = JSON.parse(data) as Message;
        } catch (error) {
            console.error("Mock WebSocket failed to parse payload", error);
            return;
        }

        this.#handleMessage(parsed);
    }

    addEventListener<T extends keyof WebSocketEventMap>(type: T, listener: (ev: WebSocketEventMap[T]) => unknown): void {
        super.addEventListener(type, listener as EventListener);
    }

    removeEventListener<T extends keyof WebSocketEventMap>(type: T, listener: (ev: WebSocketEventMap[T]) => unknown): void {
        super.removeEventListener(type, listener as EventListener);
    }

    dispatchEvent(event: Event): boolean {
        const handled = super.dispatchEvent(event);

        switch (event.type) {
            case "open":
                this.onopen?.(event as Event);
                break;
            case "message":
                this.onmessage?.(event as MessageEvent);
                break;
            case "close":
                this.onclose?.(event as CloseEvent);
                break;
            case "error":
                this.onerror?.(event as Event);
                break;
            default:
        }

        return handled;
    }

    #open(): void {
        if (this.readyState !== MockWebSocket.CONNECTING) {
            return;
        }

        this.readyState = MockWebSocket.OPEN;
        this.dispatchEvent(new Event("open"));

        this.#bootstrap();
    }

    #bootstrap(): void {
        this.#bridgeInfo = structuredClone(BRIDGE_INFO);

        this.#bridgeInfo.payload.commit = randomString(8);
        this.#bridgeInfo.payload.config.advanced.log_output =
            Math.random() < 0.25 ? ["syslog"] : Math.random() < 0.5 ? ["console", "file"] : ["console"];

        this.#emit(structuredClone(BRIDGE_STATE));
        this.#emit(this.#bridgeInfo);
        this.#emit(structuredClone(BRIDGE_DEVICES));
        this.#emit(structuredClone(BRIDGE_GROUPS));
        this.#emit(structuredClone(BRIDGE_DEFINITION));
        this.#emit(structuredClone(BRIDGE_EXTENSIONS));

        this.#emit(structuredClone(BRIDGE_HEALTH), 5000, (msg) => {
            const payload = structuredClone(msg.payload) as Zigbee2MQTTAPI["bridge/health"];

            payload.response_time = Date.now() - 3;

            return { ...msg, payload };
        });

        for (const message of DEVICE_AVAILABILITY) {
            this.#emit(structuredClone(message));
        }

        for (const message of DEVICE_STATES) {
            this.#emit(structuredClone(message));
        }

        for (const ds of DEVICE_STATES) {
            this.#timers.push(
                window.setInterval(
                    () => {
                        const message: Message<DeviceState> = {
                            payload: {
                                last_seen: new Date().toISOString(),
                                linkquality: randomIntInclusive(1, 254),
                            },
                            topic: ds.topic,
                        };

                        this.#emit(message, 0);
                    },
                    randomIntInclusive(3000, 60000),
                ),
            );
        }

        let idx = 1;

        for (const log of BRIDGE_LOGGING) {
            this.#emit(structuredClone(log), idx * 2000);

            idx++;
        }
    }

    #handleMessage(msg: Message): void {
        switch (msg.topic) {
            case "bridge/request/networkmap": {
                const payload = msg.payload as Zigbee2MQTTRequest<typeof msg.topic>;

                if (typeof payload !== "object") {
                    return;
                }

                switch (payload.type) {
                    case "raw": {
                        const response = structuredClone(NETWORK_MAP_RESPONSE);
                        response.payload.transaction = payload.transaction;

                        if (payload.routes) {
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

                        this.#emit(response, 2000);

                        break;
                    }
                    case "graphviz": {
                        this.#emit(
                            {
                                payload: {
                                    data: { routes: payload.routes, type: "graphviz", value: "mock-graphviz" },
                                    status: "ok",
                                    transaction: payload.transaction,
                                },
                                topic: "bridge/response/networkmap",
                            },
                            2000,
                        );
                        break;
                    }
                    case "plantuml": {
                        this.#emit(
                            {
                                payload: {
                                    data: { routes: payload.routes, type: "plantuml", value: "mock-plantuml" },
                                    status: "ok",
                                    transaction: payload.transaction,
                                },
                                topic: "bridge/response/networkmap",
                            },
                            2000,
                        );
                        break;
                    }
                }

                break;
            }
            case "bridge/request/touchlink/scan": {
                const payload = msg.payload as Zigbee2MQTTRequest<typeof msg.topic>;
                const response = structuredClone(TOUCHLINK_RESPONSE);
                response.payload.transaction = payload.transaction;

                this.#emit(response, 500);

                break;
            }
            case "bridge/request/device/generate_external_definition": {
                const payload = msg.payload as Zigbee2MQTTRequest<typeof msg.topic>;
                const response = structuredClone(GENERATE_EXTERNAL_DEFINITION_RESPONSE);
                response.payload.data.id = String(payload.id ?? "device-id");
                response.payload.transaction = payload.transaction;

                this.#emit(response, 300);

                break;
            }
            case "bridge/request/permit_join": {
                const payload = msg.payload as Zigbee2MQTTRequest<typeof msg.topic>;

                if (typeof payload !== "object") {
                    return;
                }

                const response = structuredClone(PERMIT_JOIN_RESPONSE);
                response.payload.transaction = payload.transaction;

                this.#emit(response);

                const info = structuredClone(this.#bridgeInfo);

                info.payload.permit_join = (payload.time as number) > 0;
                info.payload.permit_join_end = info.payload.permit_join ? Date.now() + Number(payload.time ?? 0) * 1000 : undefined;

                this.#emit(info, 120);

                this.#timers.push(
                    window.setTimeout(
                        () => {
                            this.#emit(structuredClone(this.#bridgeInfo), 120);
                        },
                        (payload.time as number) * 1000,
                    ),
                );

                break;
            }
            case "bridge/request/device/ota_update/update": {
                const payload = msg.payload as Zigbee2MQTTRequest<typeof msg.topic>;
                this.#sendResponseOK(payload.transaction!, msg.topic.replace("bridge/request/", "bridge/response/"));

                const updatedDeviceState = cloneDeviceState(String(payload.id));

                if (updatedDeviceState) {
                    updatedDeviceState.payload.update = {
                        progress: 0,
                        remaining: 100,
                        state: "updating",
                        installed_version: 1,
                        latest_version: 2,
                    };

                    const timer = window.setInterval(() => {
                        if (updatedDeviceState.payload.update!.progress! >= 100) {
                            window.clearInterval(timer);

                            updatedDeviceState.payload.update = {
                                state: "idle",
                                installed_version: 2,
                                latest_version: 2,
                            };
                        } else {
                            updatedDeviceState.payload.update!.progress! += 1;
                            updatedDeviceState.payload.update!.remaining! -= 1;
                        }

                        this.#emit(updatedDeviceState);
                    }, 1000);

                    this.#timers.push(timer);
                }

                break;
            }
            case "bridge/request/device/ota_update/schedule": {
                const payload = msg.payload as Zigbee2MQTTRequest<typeof msg.topic>;
                this.#sendResponseOK(payload.transaction!, msg.topic.replace("bridge/request/", "bridge/response/"));

                const updatedDeviceState = cloneDeviceState(String(payload.id));

                if (updatedDeviceState) {
                    if (!updatedDeviceState.payload.update) {
                        updatedDeviceState.payload.update = { state: "scheduled", installed_version: null, latest_version: null };
                    } else {
                        updatedDeviceState.payload.update.state = "scheduled";
                    }

                    this.#emit(updatedDeviceState);
                }

                break;
            }
            case "bridge/request/device/ota_update/unschedule": {
                const payload = msg.payload as Zigbee2MQTTRequest<typeof msg.topic>;
                this.#sendResponseOK(payload.transaction as string, msg.topic.replace("bridge/request/", "bridge/response/"));

                const updatedDeviceState = cloneDeviceState(String(payload.id));

                if (updatedDeviceState) {
                    if (!updatedDeviceState.payload.update) {
                        updatedDeviceState.payload.update = { state: "idle", installed_version: null, latest_version: null };
                    } else if (updatedDeviceState.payload.update?.state === "scheduled") {
                        updatedDeviceState.payload.update.state = "idle"; // simpler
                    }

                    this.#emit(updatedDeviceState);
                }

                break;
            }
            case "bridge/request/converter/save":
            case "bridge/request/extension/save": {
                const payload = msg.payload as Zigbee2MQTTRequest<typeof msg.topic>;

                if (payload.code === "valid") {
                    this.#sendResponseOK(payload.transaction as string, msg.topic.replace("bridge/request/", "bridge/response/"));
                } else {
                    this.#emit({
                        payload: {
                            status: "error",
                            data: {},
                            transaction: payload.transaction,
                            error: `${payload.name} contains invalid code: mocked invalid code`,
                        },
                        topic: msg.topic.replace("bridge/request/", "bridge/response/"),
                    });
                }

                break;
            }
            default: {
                if (msg.topic.endsWith("/set")) {
                    const payload = msg.payload as Zigbee2MQTTRequest<"{friendlyNameOrId}/set">;
                    const deviceTopic = msg.topic.replace("/set", "");

                    if ("command" in payload) {
                        this.#emit(structuredClone(BRIDGE_LOGGING_EXECUTE_COMMAND), 500);
                    } else if ("read" in payload) {
                        this.#emit(structuredClone(BRIDGE_LOGGING_READ_ATTR), 500);
                    } else {
                        // Command Response API: Send response on {device}/response topic
                        const requestId = (payload as { z2m?: { request_id?: string } })?.z2m?.request_id;

                        // Resolve to friendly name for consistent checking
                        const friendlyName = resolveToFriendlyName(deviceTopic);

                        if (requestId) {
                            // Check if this is the sleepy test device (by friendly name)
                            const isSleepyDevice = friendlyName === "test/sleepy-device";

                            // Simulate backend processing delay (50-200ms, realistic for Zigbee)
                            const delay = 50 + Math.random() * 150;

                            if (isSleepyDevice) {
                                // Sleepy device: Return "pending" with final:true
                                // This simulates a battery-powered device that's asleep
                                // The command is queued and will be delivered when device wakes
                                this.#emit(
                                    {
                                        topic: `${deviceTopic}/response`,
                                        payload: {
                                            status: "pending",
                                            z2m: { request_id: requestId, final: true },
                                            data: payload,
                                        },
                                    },
                                    delay,
                                );

                                // Simulate device waking up after 30 seconds and confirming the command
                                // This sends the state update as if the device finally received the command
                                const wakeupDelay = 30000 + Math.random() * 5000; // 30-35 seconds
                                const stateTopic = resolveToFriendlyName(deviceTopic);
                                const { z2m: _z2m, ...statePayload } = payload as Record<string, unknown>;
                                this.#emit(
                                    {
                                        topic: stateTopic,
                                        payload: {
                                            ...statePayload,
                                            last_seen: new Date().toISOString(),
                                        },
                                    },
                                    wakeupDelay,
                                );
                            } else {
                                // Regular device: 90% success, 10% error for realistic testing
                                const isSuccess = Math.random() > 0.1;

                                if (isSuccess) {
                                    // Success response
                                    this.#emit(
                                        {
                                            topic: `${deviceTopic}/response`,
                                            payload: {
                                                status: "ok",
                                                z2m: { request_id: requestId },
                                                data: payload,
                                            },
                                        },
                                        delay,
                                    );

                                    // Also send state update (always to friendly_name topic, like real Z2M)
                                    const stateTopic = resolveToFriendlyName(deviceTopic);
                                    const { z2m: _z2m, ...statePayload } = payload as Record<string, unknown>;
                                    this.#emit(
                                        {
                                            topic: stateTopic,
                                            payload: {
                                                ...statePayload,
                                                last_seen: new Date().toISOString(),
                                            },
                                        },
                                        delay + 50,
                                    );
                                } else {
                                    // Error response (simulate timeout or device error)
                                    this.#emit(
                                        {
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
                                        },
                                        delay,
                                    );
                                }
                            }
                        }
                    }
                } else if (msg.topic.startsWith("bridge/request/")) {
                    const payload = msg.payload as { transaction: string };

                    this.#sendResponseOK(payload.transaction, msg.topic.replace("bridge/request/", "bridge/response/"));
                }
            }
        }
    }

    #sendResponseOK(transaction: string, topic: string): void {
        this.#emit({
            payload: { status: "ok", data: {}, transaction },
            topic,
        });
    }

    #emit(msg: Message<unknown>, delay = 0, mutate?: (m: Message<unknown>) => Message<unknown>): void {
        const fn = () => {
            const payload = mutate ? mutate(msg) : msg;
            const raw = JSON.stringify(payload);

            this.dispatchEvent(new MessageEvent("message", { data: raw }));
        };

        if (delay > 0) {
            const timer = window.setTimeout(fn, delay);

            this.#timers.push(timer);
        } else {
            fn();
        }
    }
}

export const installStorybookMocks = (): void => {
    globalThis.WebSocket = MockWebSocket as unknown as typeof WebSocket;
};
