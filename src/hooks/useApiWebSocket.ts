import NiceModal from "@ebay/nice-modal-react";
import { useCallback, useEffect, useRef } from "react";
import useWebSocket, { type Options, ReadyState } from "react-use-websocket";
import store2 from "store2";
import type { Zigbee2MQTTAPI, Zigbee2MQTTRequestEndpoints, Zigbee2MQTTResponse } from "zigbee2mqtt";
import { AVAILABILITY_FEATURE_TOPIC_ENDING } from "../consts.js";
import { USE_PROXY } from "../envs.js";
import { AUTH_FLAG_KEY, TOKEN_KEY } from "../localStoreConsts.js";
import { API_NAMES, API_URLS, useAppStore } from "../store.js";
import type { Message, RecursiveMutable, ResponseMessage } from "../types.js";
import { randomString, stringifyWithUndefinedAsNull } from "../utils.js";

const UNAUTHORIZED_ERROR_CODE = 4401;
// prevent stripping
const USE_PROXY_BOOL = /(yes|true|1)/.test(USE_PROXY);

type ApiWebSocket = {
    sendMessage: (payload: string) => void;
    readyState: ReadyState;
};

export function useApiWebSocket() {
    const unmounted = useRef(false);
    const webSockets = useRef<ApiWebSocket[]>([]);
    // biome-ignore lint/suspicious/noExplicitAny: Promise API
    const pendingRequestsRef = useRef(API_URLS.map(() => new Map<string, [() => void, (reason: any) => void]>()));
    const transactionNumberRef = useRef(API_URLS.map(() => 1));
    const transactionPrefixRef = useRef(API_URLS.map(() => randomString(5)));

    const updateAvailability = useAppStore((state) => state.updateAvailability);
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
    const addLogs = useAppStore((state) => state.addLogs);
    const addToast = useAppStore((state) => state.addToast);
    const updateDeviceStates = useAppStore((state) => state.updateDeviceStates);

    const deviceStatesPatchesRef = useRef<Message<Zigbee2MQTTAPI["{friendlyName}"]>[][]>(API_URLS.map(() => []));
    const logsPatchesRef = useRef<Zigbee2MQTTAPI["bridge/logging"][][]>(API_URLS.map(() => []));
    const rafHandleRef = useRef<number | null>(null);
    const flushScheduledRef = useRef(false);

    const scheduleFlush = useCallback(() => {
        if (flushScheduledRef.current) {
            return;
        }

        flushScheduledRef.current = true;

        rafHandleRef.current = requestAnimationFrame(() => {
            flushScheduledRef.current = false;
            rafHandleRef.current = null;

            // flush all sources in one store commit per batch type per source
            for (let sourceIdx = 0; sourceIdx < API_URLS.length; sourceIdx++) {
                const statePatches = deviceStatesPatchesRef.current[sourceIdx];

                if (statePatches.length) {
                    updateDeviceStates(sourceIdx, statePatches.splice(0, statePatches.length));
                }

                const logs = logsPatchesRef.current[sourceIdx];

                if (logs.length) {
                    addLogs(sourceIdx, logs.splice(0, logs.length));
                }
            }
        });
    }, [updateDeviceStates, addLogs]);

    useEffect(() => {
        return () => {
            if (rafHandleRef.current != null) cancelAnimationFrame(rafHandleRef.current);
        };
    }, []);

    // biome-ignore lint/suspicious/noExplicitAny: generic
    const resolvePendingRequests = useCallback((idx: number, message: Zigbee2MQTTResponse<any>): void => {
        if (message.transaction != null) {
            const pendingRequest = pendingRequestsRef.current[idx].get(message.transaction);

            if (pendingRequest) {
                if (message.status === "ok" || message.status == null) {
                    pendingRequest[0]();
                } else {
                    pendingRequest[1](new Error(message.error ?? "Unknown error", { cause: message.transaction }));
                }

                pendingRequestsRef.current[idx].delete(message.transaction);
            }
        }
    }, []);

    let i = 0;

    for (const apiUrl of API_URLS) {
        const apiUrlIdx = i;
        // biome-ignore lint/correctness/useHookAtTopLevel: static `API_URLS`
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
            [],
        );

        // biome-ignore lint/correctness/useHookAtTopLevel: static `API_URLS`
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
            onError: (e) => {
                console.error("WebSocket error", e);

                logsPatchesRef.current[apiUrlIdx].push({
                    level: "error",
                    message: `frontend:ws: Could not connect to WebSocket ${apiUrl}`,
                    namespace: "frontend:ws",
                });
                scheduleFlush();
            },
            filter: (message) => {
                if (message) {
                    try {
                        const jsonMessage = JSON.parse(message.data) as Message;

                        if (jsonMessage.topic.endsWith(AVAILABILITY_FEATURE_TOPIC_ENDING)) {
                            updateAvailability(apiUrlIdx, jsonMessage as Message<Zigbee2MQTTAPI["{friendlyName}/availability"]>);
                        } else if (jsonMessage.topic.startsWith("bridge/")) {
                            switch (jsonMessage.topic) {
                                case "bridge/info": {
                                    setBridgeInfo(apiUrlIdx, jsonMessage.payload as Zigbee2MQTTAPI[typeof jsonMessage.topic]);
                                    break;
                                }
                                case "bridge/state": {
                                    setBridgeState(apiUrlIdx, jsonMessage.payload as Zigbee2MQTTAPI[typeof jsonMessage.topic]);
                                    break;
                                }
                                case "bridge/health": {
                                    setBridgeHealth(apiUrlIdx, jsonMessage.payload as Zigbee2MQTTAPI[typeof jsonMessage.topic]);
                                    break;
                                }
                                case "bridge/definitions": {
                                    setBridgeDefinitions(
                                        apiUrlIdx,
                                        jsonMessage.payload as RecursiveMutable<Zigbee2MQTTAPI[typeof jsonMessage.topic]>,
                                    );
                                    break;
                                }
                                case "bridge/devices": {
                                    setDevices(apiUrlIdx, jsonMessage.payload as unknown as Zigbee2MQTTAPI[typeof jsonMessage.topic]);
                                    break;
                                }
                                case "bridge/groups": {
                                    setGroups(apiUrlIdx, jsonMessage.payload as unknown as Zigbee2MQTTAPI[typeof jsonMessage.topic]);
                                    break;
                                }
                                case "bridge/converters": {
                                    setConverters(apiUrlIdx, jsonMessage.payload as Zigbee2MQTTAPI[typeof jsonMessage.topic]);
                                    break;
                                }
                                case "bridge/extensions": {
                                    setExtensions(apiUrlIdx, jsonMessage.payload as Zigbee2MQTTAPI[typeof jsonMessage.topic]);
                                    break;
                                }
                                case "bridge/logging": {
                                    const log = jsonMessage.payload as Zigbee2MQTTAPI[typeof jsonMessage.topic];

                                    logsPatchesRef.current[apiUrlIdx].push(log);
                                    scheduleFlush();
                                    break;
                                }
                                case "bridge/response/networkmap": {
                                    const response = jsonMessage.payload as Zigbee2MQTTResponse<typeof jsonMessage.topic>;

                                    setNetworkMap(apiUrlIdx, response.status === "ok" ? response.data : undefined);
                                    break;
                                }
                                case "bridge/response/touchlink/scan": {
                                    const { status, data: payloadData } = jsonMessage.payload as Zigbee2MQTTResponse<typeof jsonMessage.topic>;

                                    setTouchlinkScan(
                                        apiUrlIdx,
                                        status === "ok" ? { inProgress: false, devices: payloadData.found } : { inProgress: false, devices: [] },
                                    );
                                    break;
                                }
                                case "bridge/response/touchlink/identify": {
                                    setTouchlinkIdentifyInProgress(apiUrlIdx, false);
                                    break;
                                }
                                case "bridge/response/touchlink/factory_reset": {
                                    setTouchlinkResetInProgress(apiUrlIdx, false);
                                    break;
                                }
                                case "bridge/response/backup": {
                                    const backupData = jsonMessage.payload as Zigbee2MQTTResponse<typeof jsonMessage.topic>;

                                    setBackup(apiUrlIdx, backupData.data.zip);
                                    break;
                                }
                                case "bridge/response/device/generate_external_definition": {
                                    const extDef = jsonMessage.payload as Zigbee2MQTTResponse<typeof jsonMessage.topic>;

                                    if (extDef.status === "ok") {
                                        addGeneratedExternalDefinition(apiUrlIdx, extDef.data);
                                    }
                                    break;
                                }
                            }

                            if (jsonMessage.topic.startsWith("bridge/response/")) {
                                // biome-ignore lint/suspicious/noExplicitAny: generic
                                const { topic, payload } = jsonMessage as unknown as ResponseMessage<any>;

                                resolvePendingRequests(apiUrlIdx, payload);
                                addToast({
                                    sourceIdx: apiUrlIdx,
                                    topic: topic.replace("bridge/response/", ""),
                                    status: payload.status,
                                    error: "error" in payload ? payload.error : undefined,
                                    transaction: payload.transaction,
                                });
                            }
                        } else {
                            deviceStatesPatchesRef.current[apiUrlIdx].push(jsonMessage as Message<Zigbee2MQTTAPI["{friendlyName}"]>);
                            scheduleFlush();
                        }
                    } catch (error) {
                        logsPatchesRef.current[apiUrlIdx].push({ level: "error", message: `frontend: ${error.message}`, namespace: "frontend" });
                        scheduleFlush();
                        // console.error(error);
                    }
                }

                // never rerender from websocket message
                return false;
            },
        });

        // biome-ignore lint/correctness/useHookAtTopLevel: static `API_URLS`
        const { sendMessage, readyState } = useWebSocket<Message | null>(getSocketUrl, options.current);

        // biome-ignore lint/correctness/useHookAtTopLevel: static `API_URLS`
        const webSocketCheckUnauthorized = useCallback((event: WebSocketEventMap["close"]): void => {
            if (event.code === UNAUTHORIZED_ERROR_CODE) {
                store2.set(AUTH_FLAG_KEY, true);
                store2.remove(TOKEN_KEY);
            }
        }, []);

        webSockets.current[apiUrlIdx] = {
            sendMessage,
            readyState,
        };

        i++;
    }

    useEffect(() => {
        return () => {
            unmounted.current = true;
        };
    }, []);

    // wrap raw sendMessage
    const sendMessage = useCallback(
        async <T extends Zigbee2MQTTRequestEndpoints>(sourceIdx: number, topic: T, payload: Zigbee2MQTTAPI[T]): Promise<void> => {
            const webSocket = webSockets.current[sourceIdx];

            if (!webSocket) {
                console.error(`Unknown source index ${sourceIdx}`);

                return;
            }

            if (webSocket.readyState !== ReadyState.OPEN) {
                console.error(`Cannot send to ${API_NAMES[sourceIdx]} (${sourceIdx}), WebSocket not open`);
                addToast({
                    sourceIdx,
                    topic,
                    status: "error",
                    error: `Cannot send to ${API_NAMES[sourceIdx]} (${sourceIdx}), WebSocket not open`,
                });

                return;
            }

            if (topic.startsWith("bridge/request/")) {
                if (payload !== "" && typeof payload === "string") {
                    console.error("Only `Record<string, unknown>` or empty string payloads allowed");
                    return;
                }

                const transaction = `${transactionPrefixRef.current[sourceIdx]}-${transactionNumberRef.current[sourceIdx]++}`;

                try {
                    const promise = new Promise<void>((resolve, reject) => {
                        pendingRequestsRef.current[sourceIdx].set(transaction, [resolve, reject]);
                    });
                    const finalPayload = stringifyWithUndefinedAsNull({
                        topic,
                        payload: payload === "" ? { transaction } : { ...payload, transaction },
                    });

                    console.log(`Calling Request API (${API_NAMES[sourceIdx]} | ${sourceIdx}):`, finalPayload);
                    logsPatchesRef.current[sourceIdx].push({
                        level: "debug",
                        message: `frontend:api: Sending ${finalPayload}`,
                        namespace: "frontend:api",
                    });
                    scheduleFlush();
                    webSocket.sendMessage(finalPayload);

                    await promise;
                } catch (error) {
                    console.error(`Failed request API call (${API_NAMES[sourceIdx]} | ${sourceIdx})`, error.message, error.cause);
                }
            } else {
                const finalPayload = stringifyWithUndefinedAsNull({ topic, payload });

                console.log(`Calling API (${API_NAMES[sourceIdx]} | ${sourceIdx}):`, finalPayload);
                logsPatchesRef.current[sourceIdx].push({
                    level: "debug",
                    message: `frontend:api: Sending ${finalPayload}`,
                    namespace: "frontend:api",
                });
                scheduleFlush();
                webSocket.sendMessage(finalPayload);
            }
        },
        [scheduleFlush, addToast],
    );

    return { sendMessage, transactionPrefixes: transactionPrefixRef.current, readyStates: webSockets.current.map((u) => u.readyState) };
}
