import NiceModal from "@ebay/nice-modal-react";
import { useCallback, useEffect, useRef, useState } from "react";
import useWebSocket, { type Options } from "react-use-websocket";
import store2 from "store2";
import type { Zigbee2MQTTAPI, Zigbee2MQTTRequestEndpoints, Zigbee2MQTTResponse } from "zigbee2mqtt";
import { USE_PROXY, Z2M_API_URLS } from "../envs.js";
import { AUTH_FLAG_KEY, TOKEN_KEY } from "../localStoreConsts.js";
import * as store from "../store.js";
import type { Message, RecursiveMutable, ResponseMessage } from "../types.js";
import { randomString, stringifyWithPreservingUndefinedAsNull } from "../utils.js";
import { useAppDispatch } from "./useApp.js";

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

const processDeviceStateMessage = (message: Message<Zigbee2MQTTAPI["{friendlyName}"]>, dispatch: ReturnType<typeof useAppDispatch>): void => {
    dispatch(store.updateDeviceStateMessage(message));
};

const processDeviceAvailabilityMessage = (
    message: Message<Zigbee2MQTTAPI["{friendlyName}/availability"]>,
    dispatch: ReturnType<typeof useAppDispatch>,
): void => {
    dispatch(store.updateAvailability(message));
};

const processBridgeMessage = (data: Message, dispatch: ReturnType<typeof useAppDispatch>): void => {
    switch (data.topic) {
        case "bridge/info": {
            dispatch(store.setBridgeInfo(data.payload as Zigbee2MQTTAPI[typeof data.topic]));
            break;
        }
        case "bridge/state": {
            dispatch(store.setBridgeState(data.payload as Zigbee2MQTTAPI[typeof data.topic]));
            break;
        }
        case "bridge/health": {
            dispatch(store.setBridgeHealth(data.payload as Zigbee2MQTTAPI[typeof data.topic]));
            break;
        }
        case "bridge/definitions": {
            dispatch(store.setBridgeDefinitions(data.payload as RecursiveMutable<Zigbee2MQTTAPI[typeof data.topic]>));
            break;
        }
        case "bridge/devices": {
            dispatch(store.setDevices(data.payload as unknown as Zigbee2MQTTAPI[typeof data.topic]));
            break;
        }
        case "bridge/groups": {
            dispatch(store.setGroups(data.payload as unknown as Zigbee2MQTTAPI[typeof data.topic]));
            break;
        }
        case "bridge/converters": {
            dispatch(store.setConverters(data.payload as Zigbee2MQTTAPI[typeof data.topic]));
            break;
        }
        case "bridge/extensions": {
            dispatch(store.setExtensions(data.payload as Zigbee2MQTTAPI[typeof data.topic]));
            break;
        }
        case "bridge/logging": {
            const log = data.payload as Zigbee2MQTTAPI[typeof data.topic];

            dispatch(store.addLog(log));

            break;
        }
        case "bridge/response/networkmap": {
            const response = data.payload as Zigbee2MQTTResponse<typeof data.topic>;

            dispatch(store.setNetworkMap(response.status === "ok" ? response.data : undefined));

            break;
        }
        case "bridge/response/touchlink/scan": {
            const { status, data: payloadData } = data.payload as Zigbee2MQTTResponse<typeof data.topic>;

            dispatch(
                store.setTouchlinkScan(status === "ok" ? { inProgress: false, devices: payloadData.found } : { inProgress: false, devices: [] }),
            );

            break;
        }
        case "bridge/response/touchlink/identify": {
            dispatch(store.setTouchlinkIdentifyInProgress(false));
            break;
        }
        case "bridge/response/touchlink/factory_reset": {
            dispatch(store.setTouchlinkResetInProgress(false));
            break;
        }
        case "bridge/response/backup": {
            const backupData = data.payload as Zigbee2MQTTResponse<typeof data.topic>;

            dispatch(store.setBackup(backupData.data.zip));
            break;
        }
        case "bridge/response/device/generate_external_definition": {
            const extDef = data.payload as Zigbee2MQTTResponse<typeof data.topic>;

            if (extDef.status === "ok") {
                dispatch(store.addGeneratedExternalDefinition(extDef.data));
            }
            break;
        }
    }

    if (data.topic.startsWith("bridge/response/")) {
        // biome-ignore lint/suspicious/noExplicitAny: tmp
        resolvePendingRequests((data as unknown as ResponseMessage<any>).payload);
    }
};

export function useApiWebSocket() {
    const unmounted = useRef(false);
    const dispatch = useAppDispatch();
    // VITE_ first (stripped accordingly during build)
    const apiUrls =
        import.meta.env.VITE_Z2M_API_URLS?.split(",").map((u) => u.trim()) ??
        (Z2M_API_URLS.startsWith("${")
            ? [`${window.location.host}${window.location.pathname}${window.location.pathname.endsWith("/") ? "" : "/"}api`] // env not replaced, use default
            : Z2M_API_URLS.split(",").map((u) => u.trim()));
    const [apiUrl, setApiUrl] = useState(apiUrls[0]);

    // biome-ignore lint/correctness/useExhaustiveDependencies: specific trigger
    useEffect(() => {
        dispatch(store.reset());
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

                    if (jsonMessage.topic.endsWith(store.AVAILABILITY_FEATURE_TOPIC_ENDING)) {
                        processDeviceAvailabilityMessage(jsonMessage as Message<Zigbee2MQTTAPI["{friendlyName}/availability"]>, dispatch);
                    } else if (jsonMessage.topic.startsWith("bridge/")) {
                        processBridgeMessage(jsonMessage, dispatch);
                    } else {
                        processDeviceStateMessage(jsonMessage as Message<Zigbee2MQTTAPI["{friendlyName}"]>, dispatch);
                    }
                } catch (error) {
                    dispatch(store.addLog({ level: "error", message: `frontend: ${error.message}`, namespace: "frontend" }));
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
                    dispatch(store.addLog({ level: "debug", message: `frontend:api: Sending ${finalPayload}`, namespace: "frontend:api" }));
                    sendMessageRaw(finalPayload);

                    await promise;
                } catch (error) {
                    dispatch(
                        store.addLog({ level: "error", message: `frontend:api: ${error} (transaction: ${error.cause})`, namespace: "frontend:api" }),
                    );
                }
            } else {
                const finalPayload = stringifyWithPreservingUndefinedAsNull({ topic, payload });

                console.debug("Calling API:", finalPayload);
                dispatch(store.addLog({ level: "debug", message: `frontend:api: Sending ${finalPayload}`, namespace: "frontend:api" }));
                sendMessageRaw(finalPayload);
            }
        },
        [sendMessageRaw, dispatch],
    );

    return { sendMessage, readyState, apiUrls, apiUrl, setApiUrl };
}
