import NiceModal from "@ebay/nice-modal-react";
import { useCallback, useEffect, useRef, useState } from "react";
import useWebSocket, { type Options } from "react-use-websocket";
import store2 from "store2";
import type { Zigbee2MQTTAPI, Zigbee2MQTTRequestEndpoints, Zigbee2MQTTResponse } from "zigbee2mqtt";
import { AVAILABILITY_FEATURE_TOPIC_ENDING } from "../consts.js";
import { USE_PROXY, Z2M_API_URLS } from "../envs.js";
import { AUTH_FLAG_KEY, LAST_API_URL_KEY, TOKEN_KEY } from "../localStoreConsts.js";
import { useAppStore } from "../store.js";
import type { Message, RecursiveMutable, ResponseMessage } from "../types.js";
import { randomString, stringifyWithPreservingUndefinedAsNull } from "../utils.js";

const UNAUTHORIZED_ERROR_CODE = 4401;
// prevent stripping
const USE_PROXY_BOOL = /(yes|true|1)/.test(USE_PROXY);

// biome-ignore lint/suspicious/noExplicitAny: tmp
const pendingRequests = new Map<string, [() => void, (reason: any) => void]>();
let transactionNumber = 1;
const transactionRndPrefix = randomString(5);

// biome-ignore lint/suspicious/noExplicitAny: tmp
const resolvePendingRequests = (message: Zigbee2MQTTResponse<any>): void => {
    if (message.transaction != null) {
        const pendingRequest = pendingRequests.get(message.transaction);

        if (pendingRequest) {
            if (message.status === "ok" || message.status == null) {
                pendingRequest[0]();
            } else {
                pendingRequest[1](new Error(message.error ?? "Unknown error", { cause: message.transaction }));
            }

            pendingRequests.delete(message.transaction);
        }
    }
};

export function useApiWebSocket() {
    const unmounted = useRef(false);

    const storeReset = useAppStore((state) => state.reset);
    const addLog = useAppStore((state) => state.addLog);
    const updateAvailability = useAppStore((state) => state.updateAvailability);
    const updateDeviceStateMessage = useAppStore((state) => state.updateDeviceStateMessage);
    const setBridgeInfo = useAppStore((state) => state.setBridgeInfo);
    const setBridgeState = useAppStore((state) => state.setBridgeState);
    const setBridgeHealth = useAppStore((state) => state.setBridgeHealth);
    const setBridgeDefinitions = useAppStore((state) => state.setBridgeDefinitions);
    const setDevices = useAppStore((state) => state.setDevices);
    const setGroups = useAppStore((state) => state.setGroups);
    const setConverters = useAppStore((state) => state.setConverters);
    const setExtensions = useAppStore((state) => state.setExtensions);
    const setNetworkMap = useAppStore((state) => state.setNetworkMap);
    const setTouchlinkScan = useAppStore((state) => state.setTouchlinkScan);
    const setTouchlinkIdentifyInProgress = useAppStore((state) => state.setTouchlinkIdentifyInProgress);
    const setTouchlinkResetInProgress = useAppStore((state) => state.setTouchlinkResetInProgress);
    const setBackup = useAppStore((state) => state.setBackup);
    const addGeneratedExternalDefinition = useAppStore((state) => state.addGeneratedExternalDefinition);

    // VITE_ first (stripped accordingly during build)
    const apiUrls =
        import.meta.env.VITE_Z2M_API_URLS?.split(",").map((u) => u.trim()) ??
        (Z2M_API_URLS.startsWith("${")
            ? [`${window.location.host}${window.location.pathname}${window.location.pathname.endsWith("/") ? "" : "/"}api`] // env not replaced, use default
            : Z2M_API_URLS.split(",").map((u) => u.trim()));
    const lastApiUrl = store2.get(LAST_API_URL_KEY);
    const [apiUrl, setApiUrl] = useState(lastApiUrl && apiUrls.includes(lastApiUrl) ? lastApiUrl : apiUrls[0]);

    // biome-ignore lint/correctness/useExhaustiveDependencies: specific trigger
    useEffect(() => {
        store2.set(LAST_API_URL_KEY, apiUrl);
        storeReset();
    }, [apiUrl]);

    const getSocketUrl = useCallback(
        async () =>
            await new Promise<string>((resolve) => {
                const protocol = window.location.protocol === "https:" ? "wss" : "ws";
                let url = new URL(`${protocol}://${apiUrl}`);

                // VITE_ first (stripped accordingly during build)
                if (url.hostname !== "localhost" && (import.meta.env.VITE_USE_PROXY === "true" || USE_PROXY_BOOL)) {
                    const hostPath = url.host + (url.pathname !== "/" ? url.pathname : "");
                    url = new URL(
                        `${protocol}://${window.location.host}${window.location.pathname}${window.location.pathname.endsWith("/") ? "" : "/"}ws-proxy/${hostPath}`,
                    );
                }

                const authRequired = !!store2.get(AUTH_FLAG_KEY);

                if (authRequired) {
                    const token = new URLSearchParams(window.location.search).get("token") ?? store2.get(TOKEN_KEY);

                    if (!token) {
                        NiceModal.show("auth-form", {
                            onAuth: (token: string) => {
                                store2.set(TOKEN_KEY, token);
                                url.searchParams.append("token", token);
                                resolve(url.toString());
                            },
                        });

                        return;
                    }

                    url.searchParams.append("token", token);
                }

                resolve(url.toString());
            }),
        [apiUrl],
    );

    const options = useRef<Options>({
        disableJson: true,
        share: true,
        retryOnError: true,
        shouldReconnect: (event: WebSocketEventMap["close"]): boolean => {
            webSocketCheckUnauthorized(event);

            return unmounted.current === false;
        },
        reconnectInterval: 3000,
        reconnectAttempts: 10,
        onOpen: (e) => console.log("WebSocket opened", e),
        onClose: (e) => console.log("WebSocket closed", e),
        onError: (e) => console.log("WebSocket error", e),
        filter: (message) => {
            if (message) {
                try {
                    const jsonMessage = JSON.parse(message.data) as Message;

                    if (jsonMessage.topic.endsWith(AVAILABILITY_FEATURE_TOPIC_ENDING)) {
                        updateAvailability(jsonMessage as Message<Zigbee2MQTTAPI["{friendlyName}/availability"]>);
                    } else if (jsonMessage.topic.startsWith("bridge/")) {
                        switch (jsonMessage.topic) {
                            case "bridge/info": {
                                setBridgeInfo(jsonMessage.payload as Zigbee2MQTTAPI[typeof jsonMessage.topic]);
                                break;
                            }
                            case "bridge/state": {
                                setBridgeState(jsonMessage.payload as Zigbee2MQTTAPI[typeof jsonMessage.topic]);
                                break;
                            }
                            case "bridge/health": {
                                setBridgeHealth(jsonMessage.payload as Zigbee2MQTTAPI[typeof jsonMessage.topic]);
                                break;
                            }
                            case "bridge/definitions": {
                                setBridgeDefinitions(jsonMessage.payload as RecursiveMutable<Zigbee2MQTTAPI[typeof jsonMessage.topic]>);
                                break;
                            }
                            case "bridge/devices": {
                                setDevices(jsonMessage.payload as unknown as Zigbee2MQTTAPI[typeof jsonMessage.topic]);
                                break;
                            }
                            case "bridge/groups": {
                                setGroups(jsonMessage.payload as unknown as Zigbee2MQTTAPI[typeof jsonMessage.topic]);
                                break;
                            }
                            case "bridge/converters": {
                                setConverters(jsonMessage.payload as Zigbee2MQTTAPI[typeof jsonMessage.topic]);
                                break;
                            }
                            case "bridge/extensions": {
                                setExtensions(jsonMessage.payload as Zigbee2MQTTAPI[typeof jsonMessage.topic]);
                                break;
                            }
                            case "bridge/logging": {
                                const log = jsonMessage.payload as Zigbee2MQTTAPI[typeof jsonMessage.topic];

                                addLog(log);
                                break;
                            }
                            case "bridge/response/networkmap": {
                                const response = jsonMessage.payload as Zigbee2MQTTResponse<typeof jsonMessage.topic>;

                                setNetworkMap(response.status === "ok" ? response.data : undefined);
                                break;
                            }
                            case "bridge/response/touchlink/scan": {
                                const { status, data: payloadData } = jsonMessage.payload as Zigbee2MQTTResponse<typeof jsonMessage.topic>;

                                setTouchlinkScan(
                                    status === "ok" ? { inProgress: false, devices: payloadData.found } : { inProgress: false, devices: [] },
                                );
                                break;
                            }
                            case "bridge/response/touchlink/identify": {
                                setTouchlinkIdentifyInProgress(false);
                                break;
                            }
                            case "bridge/response/touchlink/factory_reset": {
                                setTouchlinkResetInProgress(false);
                                break;
                            }
                            case "bridge/response/backup": {
                                const backupData = jsonMessage.payload as Zigbee2MQTTResponse<typeof jsonMessage.topic>;

                                setBackup(backupData.data.zip);
                                break;
                            }
                            case "bridge/response/device/generate_external_definition": {
                                const extDef = jsonMessage.payload as Zigbee2MQTTResponse<typeof jsonMessage.topic>;

                                if (extDef.status === "ok") {
                                    addGeneratedExternalDefinition(extDef.data);
                                }
                                break;
                            }
                        }

                        if (jsonMessage.topic.startsWith("bridge/response/")) {
                            // biome-ignore lint/suspicious/noExplicitAny: tmp
                            resolvePendingRequests((jsonMessage as unknown as ResponseMessage<any>).payload);
                        }
                    } else {
                        updateDeviceStateMessage(jsonMessage as Message<Zigbee2MQTTAPI["{friendlyName}"]>);
                    }
                } catch (error) {
                    addLog({ level: "error", message: `frontend: ${error.message}`, namespace: "frontend" });
                    // console.error(error);
                }
            }

            // never rerender from websocket message
            return false;
        },
    });

    const { sendMessage: sendMessageRaw, readyState } = useWebSocket<Message | null>(getSocketUrl, options.current);

    const webSocketCheckUnauthorized = useCallback((event: WebSocketEventMap["close"]): void => {
        if (event.code === UNAUTHORIZED_ERROR_CODE) {
            store2.set(AUTH_FLAG_KEY, true);
            store2.remove(TOKEN_KEY);
        }
    }, []);

    useEffect(() => {
        return () => {
            unmounted.current = true;
        };
    }, []);

    // wrap raw sendMessage
    const sendMessage = useCallback(
        async <T extends Zigbee2MQTTRequestEndpoints>(topic: T, payload: Zigbee2MQTTAPI[T]): Promise<void> => {
            if (topic.startsWith("bridge/request/")) {
                if (payload !== "" && typeof payload === "string") {
                    console.error("Only `Record<string, unknown>` or empty string payloads allowed");
                    return;
                }

                const transaction = `${transactionRndPrefix}-${transactionNumber++}`;

                try {
                    const promise = new Promise<void>((resolve, reject) => {
                        pendingRequests.set(transaction, [resolve, reject]);
                    });
                    const finalPayload = stringifyWithPreservingUndefinedAsNull({
                        topic,
                        payload: payload === "" ? { transaction } : { ...payload, transaction },
                    });

                    console.debug("Calling Request API:", finalPayload);
                    addLog({ level: "debug", message: `frontend:api: Sending ${finalPayload}`, namespace: "frontend:api" });
                    sendMessageRaw(finalPayload);

                    await promise;
                } catch (error) {
                    addLog({ level: "error", message: `frontend:api: ${error} (transaction: ${error.cause})`, namespace: "frontend:api" });
                }
            } else {
                const finalPayload = stringifyWithPreservingUndefinedAsNull({ topic, payload });

                console.debug("Calling API:", finalPayload);
                addLog({ level: "debug", message: `frontend:api: Sending ${finalPayload}`, namespace: "frontend:api" });
                sendMessageRaw(finalPayload);
            }
        },
        [sendMessageRaw, addLog],
    );

    return { sendMessage, readyState, apiUrls, apiUrl, setApiUrl };
}
