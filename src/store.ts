import type { Zigbee2MQTTAPI } from "zigbee2mqtt";
import { create } from "zustand";
import { isValidForDashboard } from "./components/dashboard-page/index.js";
import { isValidForScenes } from "./components/device-page/index.js";
import { AVAILABILITY_FEATURE_TOPIC_ENDING, BLACKLISTED_NOTIFICATIONS, NOTIFICATIONS_LIMIT_PER_SOURCE, PUBLISH_GET_SET_REGEX } from "./consts.js";
import { Z2M_API_NAMES, Z2M_API_URLS } from "./envs.js";
import type { AvailabilityState, Device, FeatureWithAnySubFeatures, LogMessage, Message, RecursiveMutable, Toast, TouchlinkDevice } from "./types.js";
import { parseAndCloneExpose } from "./utils.js";

export interface WebSocketMetrics {
    messagesSent: number;
    bytesSent: number;
    messagesReceived: number;
    messagesBridge: number;
    messagesDevice: number;
    bytesReceived: number;
    reconnects: number;
    lastMessageTs: number;
    pendingRequests: number;
}

export interface AppState {
    devices: Record<number, Device[]>;
    deviceStates: Record<number, Record<string, Zigbee2MQTTAPI["{friendlyName}"]>>;
    /** each mapped by IEEE */
    deviceDashboardFeatures: Record<number, Record<string, FeatureWithAnySubFeatures[]>>;
    deviceScenesFeatures: Record<number, Record<string, FeatureWithAnySubFeatures[]>>;
    groups: Record<number, Zigbee2MQTTAPI["bridge/groups"]>;
    bridgeState: Record<number, Zigbee2MQTTAPI["bridge/state"]>;
    bridgeHealth: Record<number, Zigbee2MQTTAPI["bridge/health"]>;
    bridgeInfo: Record<number, Zigbee2MQTTAPI["bridge/info"]>;
    bridgeDefinitions: Record<number, Zigbee2MQTTAPI["bridge/definitions"]>;
    availability: Record<number, Record<string, AvailabilityState>>;
    generatedExternalDefinitions: Record<number, Record<string, string>>;
    logs: Record<number, LogMessage[]>;
    notifications: Record<number, LogMessage[]>;
    extensions: Record<number, Zigbee2MQTTAPI["bridge/extensions"]>;
    converters: Record<number, Zigbee2MQTTAPI["bridge/converters"]>;
    touchlinkDevices: Record<number, TouchlinkDevice[]>;
    touchlinkScanInProgress: Record<number, boolean>;
    touchlinkIdentifyInProgress: Record<number, boolean>;
    touchlinkResetInProgress: Record<number, boolean>;
    networkMap: Record<number, Zigbee2MQTTAPI["bridge/response/networkmap"] | undefined>;
    networkMapIsLoading: Record<number, boolean>;
    preparingBackup: Record<number, boolean>;
    /** base64 */
    backup: Record<number, string>;

    //-- WebSocket
    /** idx is API_URLS/source idx */
    authRequired: boolean[];
    /** idx is API_URLS/source idx */
    readyStates: number[];
    webSocketMetrics: Record<number, WebSocketMetrics>;

    //-- non source dependent
    logsLimit: number;
    /** [bridge indicates restart required, error level log present] */
    notificationsAlert: [boolean, boolean];
    toasts: Toast[];
}

interface AppActions {
    setExtensions: (sourceIdx: number, newExtensions: Zigbee2MQTTAPI["bridge/extensions"]) => void;
    setConverters: (sourceIdx: number, newConverters: Zigbee2MQTTAPI["bridge/converters"]) => void;
    setTouchlinkScan: (
        sourceIdx: number,
        payload: { inProgress: boolean; devices: Zigbee2MQTTAPI["bridge/response/touchlink/scan"]["found"] },
    ) => void;
    setTouchlinkIdentifyInProgress: (sourceIdx: number, inProgress: boolean) => void;
    setTouchlinkResetInProgress: (sourceIdx: number, inProgress: boolean) => void;
    clearLogs: (sourceIdx: number) => void;
    clearAllLogs: () => void;
    setLogsLimit: (newLimit: number) => void;
    addLogs: (sourceIdx: number, newEntries: LogMessage[]) => void;
    clearNotifications: (sourceIdx: number) => void;
    clearAllNotifications: () => void;
    updateDeviceStates: (sourceIdx: number, newEntries: Message<Zigbee2MQTTAPI["{friendlyName}"]>[]) => void;
    resetDeviceState: (sourceIdx: number, friendlyName: string) => void;
    updateAvailability: (sourceIdx: number, payload: Message<Zigbee2MQTTAPI["{friendlyName}/availability"]>) => void;
    setBridgeInfo: (sourceIdx: number, bridgeInfo: Zigbee2MQTTAPI["bridge/info"]) => void;
    setBridgeState: (sourceIdx: number, bridgeState: Zigbee2MQTTAPI["bridge/state"]) => void;
    setBridgeHealth: (sourceIdx: number, bridgeHealth: Zigbee2MQTTAPI["bridge/health"]) => void;
    setBridgeDefinitions: (sourceIdx: number, bridgeDefinitions: RecursiveMutable<Zigbee2MQTTAPI["bridge/definitions"]>) => void;
    setDevices: (sourceIdx: number, devices: Zigbee2MQTTAPI["bridge/devices"]) => void;
    setGroups: (sourceIdx: number, groups: Zigbee2MQTTAPI["bridge/groups"]) => void;
    setNetworkMap: (sourceIdx: number, networkMap: Zigbee2MQTTAPI["bridge/response/networkmap"] | undefined) => void;
    setNetworkMapIsLoading: (sourceIdx: number) => void;
    setBackup: (sourceIdx: number, backupZipBase64: Zigbee2MQTTAPI["bridge/response/backup"]["zip"]) => void;
    setBackupPreparing: (sourceIdx: number) => void;
    addGeneratedExternalDefinition: (sourceIdx: number, payload: Zigbee2MQTTAPI["bridge/response/device/generate_external_definition"]) => void;

    //-- WebSocket
    setAuthRequired: (sourceIdx: number, required: boolean) => void;
    setReadyState: (sourceIdx: number, readyState: number) => void;
    /** @see setPendingRequestsCount for `pendingRequests` */
    updateWebSocketMetrics: (sourceIdx: number, delta: Omit<WebSocketMetrics, "pendingRequests">) => void;
    resetWebSocketMetrics: (sourceIdx: number) => void;
    setPendingRequestsCount: (sourceIdx: number, pending: number) => void;

    //-- non source dependent
    addToast: (toast: Toast) => void;
    removeToast: (idx: number) => void;
    reset: () => void;
}

// VITE_ first (stripped accordingly during build)
export const API_URLS =
    import.meta.env.VITE_Z2M_API_URLS?.split(",").map((u) => u.trim()) ??
    (Z2M_API_URLS.startsWith("${")
        ? [`${window.location.host}${window.location.pathname}${window.location.pathname.endsWith("/") ? "" : "/"}api`] // env not replaced, use default
        : Z2M_API_URLS.split(",").map((u) => u.trim()));
// VITE_ first (stripped accordingly during build)
export const API_NAMES =
    import.meta.env.VITE_Z2M_API_NAMES?.split(",") ??
    (Z2M_API_NAMES.startsWith("${") ? API_URLS.map((_v, idx) => `${idx}`) : Z2M_API_NAMES.split(","));

export const MULTI_INSTANCE = API_URLS.length > 1;

const makeInitialState = (): AppState => {
    const devices: AppState["devices"] = {};
    const deviceStates: AppState["deviceStates"] = {};
    const deviceDashboardFeatures: AppState["deviceDashboardFeatures"] = {};
    const deviceScenesFeatures: AppState["deviceScenesFeatures"] = {};
    const groups: AppState["groups"] = {};
    const bridgeState: AppState["bridgeState"] = {};
    const bridgeHealth: AppState["bridgeHealth"] = {};
    const bridgeInfo: AppState["bridgeInfo"] = {};
    const bridgeDefinitions: AppState["bridgeDefinitions"] = {};
    const availability: AppState["availability"] = {};
    const generatedExternalDefinitions: AppState["generatedExternalDefinitions"] = {};
    const logs: AppState["logs"] = {};
    const notifications: AppState["notifications"] = {};
    const extensions: AppState["extensions"] = {};
    const converters: AppState["converters"] = {};
    const touchlinkDevices: AppState["touchlinkDevices"] = {};
    const touchlinkScanInProgress: AppState["touchlinkScanInProgress"] = {};
    const touchlinkIdentifyInProgress: AppState["touchlinkIdentifyInProgress"] = {};
    const touchlinkResetInProgress: AppState["touchlinkResetInProgress"] = {};
    const networkMap: AppState["networkMap"] = {};
    const networkMapIsLoading: AppState["networkMapIsLoading"] = {};
    const preparingBackup: AppState["preparingBackup"] = {};
    const backup: AppState["backup"] = {};
    const authRequired: AppState["authRequired"] = [];
    const readyStates: AppState["readyStates"] = [];
    const webSocketMetrics: AppState["webSocketMetrics"] = {};

    for (let idx = 0; idx < API_URLS.length; idx++) {
        devices[idx] = [];
        deviceStates[idx] = {};
        deviceDashboardFeatures[idx] = {};
        deviceScenesFeatures[idx] = {};
        groups[idx] = [];
        bridgeState[idx] = { state: "offline" };
        bridgeHealth[idx] = {
            response_time: 0,
            os: {
                load_average: [0, 0, 0],
                memory_used_mb: 0,
                memory_percent: 0,
            },
            process: {
                uptime_sec: 0,
                memory_used_mb: 0,
                memory_percent: 0,
            },
            mqtt: {
                connected: false,
                queued: 0,
                received: 0,
                published: 0,
            },
            devices: {},
        };
        bridgeInfo[idx] = {
            config_schema: {
                // @ts-expect-error unloaded
                properties: {},
                required: [],
                // @ts-expect-error unloaded
                definitions: {},
            },
            config: {
                advanced: {
                    elapsed: false,
                    last_seen: "disable",
                    log_level: "info",
                    log_rotation: false,
                    log_console_json: false,
                    log_symlink_current: false,
                    log_output: [],
                    log_directory: "",
                    log_file: "",
                    log_namespaced_levels: {},
                    log_syslog: {},
                    log_debug_to_mqtt_frontend: false,
                    log_debug_namespace_ignore: "",
                    log_directories_to_keep: 0,
                    pan_id: 0,
                    ext_pan_id: [],
                    channel: 0,
                    cache_state: false,
                    cache_state_persistent: false,
                    cache_state_send_on_startup: false,
                    network_key: [],
                    timestamp_format: "",
                    output: "json",
                },
                devices: {},
                device_options: {},
                frontend: {
                    enabled: true,
                    package: "zigbee2mqtt-windfront",
                    port: 8080,
                    base_url: "/",
                },
                homeassistant: {
                    enabled: false,
                    discovery_topic: "",
                    status_topic: "",
                    experimental_event_entities: false,
                    legacy_action_sensor: false,
                },
                availability: {
                    enabled: false,
                    active: {
                        timeout: 0,
                        max_jitter: 0,
                        backoff: false,
                        pause_on_backoff_gt: 0,
                    },
                    passive: {
                        timeout: 0,
                    },
                },
                mqtt: {
                    base_topic: "",
                    include_device_information: false,
                    force_disable_retain: false,
                    server: "",
                    maximum_packet_size: 0,
                },
                serial: {
                    disable_led: false,
                },
                passlist: [],
                blocklist: [],
                map_options: {
                    // @ts-expect-error not needed
                    graphviz: {},
                },
                ota: {
                    update_check_interval: 0,
                    disable_automatic_update_check: false,
                    zigbee_ota_override_index_location: undefined,
                    image_block_response_delay: undefined,
                    default_maximum_data_size: undefined,
                },
                groups: {},
                health: {
                    interval: 10,
                    reset_on_check: false,
                },
            },
            permit_join: false,
            permit_join_end: undefined,
            zigbee_herdsman_converters: {
                version: "",
            },
            zigbee_herdsman: {
                version: "",
            },
            device_options: {},
            restart_required: false,
            version: "",
            coordinator: {
                meta: {},
                type: "",
                ieee_address: "",
            },
            os: {
                version: "",
                node_version: "",
                cpus: "",
                memory_mb: 0,
            },
            mqtt: {
                server: "",
                version: 0,
            },
        };
        bridgeDefinitions[idx] = {
            // @ts-expect-error unloaded
            clusters: {},
            custom_clusters: {},
        };
        availability[idx] = {};
        generatedExternalDefinitions[idx] = {};
        logs[idx] = [];
        notifications[idx] = [];
        extensions[idx] = [];
        converters[idx] = [];
        touchlinkDevices[idx] = [];
        touchlinkScanInProgress[idx] = false;
        touchlinkIdentifyInProgress[idx] = false;
        touchlinkResetInProgress[idx] = false;
        networkMap[idx] = undefined;
        networkMapIsLoading[idx] = false;
        preparingBackup[idx] = false;
        backup[idx] = "";
        authRequired[idx] = false;
        readyStates[idx] = WebSocket.CLOSED;
        webSocketMetrics[idx] = {
            messagesSent: 0,
            bytesSent: 0,
            messagesReceived: 0,
            messagesBridge: 0,
            messagesDevice: 0,
            bytesReceived: 0,
            reconnects: 0,
            lastMessageTs: 0,
            pendingRequests: 0,
        };
    }

    return {
        devices,
        deviceStates,
        deviceDashboardFeatures,
        deviceScenesFeatures,
        groups,
        bridgeState,
        bridgeHealth,
        bridgeInfo,
        bridgeDefinitions,
        availability,
        generatedExternalDefinitions,
        logs,
        notifications,
        extensions,
        converters,
        touchlinkDevices,
        touchlinkScanInProgress,
        touchlinkIdentifyInProgress,
        touchlinkResetInProgress,
        networkMap,
        networkMapIsLoading,
        preparingBackup,
        backup,
        logsLimit: 100,
        notificationsAlert: [false, false],
        toasts: [],
        authRequired,
        readyStates,
        webSocketMetrics,
    };
};

export const useAppStore = create<AppState & AppActions>((set, _get, store) => ({
    ...makeInitialState(),

    setExtensions: (sourceIdx, newExtensions) => set((state) => ({ extensions: { ...state.extensions, [sourceIdx]: newExtensions } })),
    setConverters: (sourceIdx, newConverters) => set((state) => ({ converters: { ...state.converters, [sourceIdx]: newConverters } })),

    setTouchlinkScan: (sourceIdx, { inProgress, devices }) =>
        set((state) => ({
            touchlinkScanInProgress: { ...state.touchlinkScanInProgress, [sourceIdx]: inProgress },
            touchlinkDevices: { ...state.touchlinkDevices, [sourceIdx]: devices },
        })),
    setTouchlinkIdentifyInProgress: (sourceIdx, inProgress) =>
        set((state) => ({ touchlinkIdentifyInProgress: { ...state.touchlinkIdentifyInProgress, [sourceIdx]: inProgress } })),
    setTouchlinkResetInProgress: (sourceIdx, inProgress) =>
        set((state) => ({ touchlinkResetInProgress: { ...state.touchlinkResetInProgress, [sourceIdx]: inProgress } })),

    clearLogs: (sourceIdx) =>
        set((state) => ({
            logs: { ...state.logs, [sourceIdx]: [] },
        })),
    clearAllLogs: () =>
        set(() => {
            const logs: AppState["logs"] = {};

            for (let idx = 0; idx < API_URLS.length; idx++) {
                logs[idx] = [];
            }

            return { logs };
        }),
    setLogsLimit: (newLimit) =>
        set((state) => {
            if (state.logsLimit === newLimit) {
                return state;
            }

            const trimmedLogs: AppState["logs"] = {};

            for (const key in state.logs) {
                const idx = Number(key);
                const idxLogs = state.logs[idx];

                trimmedLogs[idx] = idxLogs.length > newLimit ? idxLogs.slice(-newLimit) : idxLogs;
            }

            return { logsLimit: newLimit, logs: trimmedLogs };
        }),
    addLogs: (sourceIdx, newEntries) =>
        set((state) => {
            if (newEntries.length === 0) {
                return state;
            }

            const notificationFilter = state.bridgeInfo[sourceIdx].config.frontend.notification_filter;
            const prevNotifications = state.notifications[sourceIdx];
            const prev = state.logs[sourceIdx];
            const total = prev.length + newEntries.length;
            const limitDrop = total > state.logsLimit ? total - state.logsLimit : 0;
            const newLogs = prev.slice(limitDrop > 0 ? limitDrop : 0);
            const newNotifications = Array.from(prevNotifications);
            const newToasts = Array.from(state.toasts);
            let addedToasts = false;

            for (const newEntry of newEntries) {
                newLogs.push(newEntry);

                if (newEntry.level === "debug") {
                    continue;
                }

                const notifBlacklisted = (notificationFilter ? BLACKLISTED_NOTIFICATIONS.concat(notificationFilter) : BLACKLISTED_NOTIFICATIONS).some(
                    (val) => new RegExp(val).test(newEntry.message),
                );

                if (!notifBlacklisted) {
                    if (newNotifications.length >= NOTIFICATIONS_LIMIT_PER_SOURCE) {
                        newNotifications.shift();
                    }

                    newNotifications.push(newEntry);
                }

                if (newEntry.level === "error") {
                    const match = newEntry.message.match(PUBLISH_GET_SET_REGEX);

                    if (match) {
                        addedToasts = true;
                        const [, type, key, name, error] = match;

                        newToasts.push({
                            sourceIdx,
                            topic: `${name}/${type}(${key})`,
                            status: "error",
                            error,
                        });
                    }
                }
            }

            if (newNotifications.length === 0) {
                return addedToasts
                    ? { logs: { ...state.logs, [sourceIdx]: newLogs }, toasts: newToasts }
                    : { logs: { ...state.logs, [sourceIdx]: newLogs } };
            }

            let notifAlert = newNotifications.some((n) => n.level === "error");

            // if should turn on alert for this source idx, no point in checking others
            if (!notifAlert) {
                for (let idx = 0; idx < API_URLS.length; idx++) {
                    if (sourceIdx === idx) {
                        continue;
                    }

                    if (state.notifications[idx].some((n) => n.level === "error")) {
                        notifAlert = true;
                        break;
                    }
                }
            }

            return state.notificationsAlert[1] !== notifAlert
                ? addedToasts
                    ? {
                          logs: { ...state.logs, [sourceIdx]: newLogs },
                          notifications: { ...state.notifications, [sourceIdx]: newNotifications },
                          notificationsAlert: [state.notificationsAlert[0], notifAlert],
                          toasts: newToasts,
                      }
                    : {
                          logs: { ...state.logs, [sourceIdx]: newLogs },
                          notifications: { ...state.notifications, [sourceIdx]: newNotifications },
                          notificationsAlert: [state.notificationsAlert[0], notifAlert],
                      }
                : addedToasts
                  ? {
                        logs: { ...state.logs, [sourceIdx]: newLogs },
                        notifications: { ...state.notifications, [sourceIdx]: newNotifications },
                        toasts: newToasts,
                    }
                  : {
                        logs: { ...state.logs, [sourceIdx]: newLogs },
                        notifications: { ...state.notifications, [sourceIdx]: newNotifications },
                    };
        }),

    clearNotifications: (sourceIdx) =>
        set((state) => {
            let notifAlert = false;

            for (let idx = 0; idx < API_URLS.length; idx++) {
                if (sourceIdx === idx) {
                    continue;
                }

                if (state.notifications[idx].some((n) => n.level === "error")) {
                    notifAlert = true;
                    break;
                }
            }

            return state.notificationsAlert[1] !== notifAlert
                ? { notifications: { ...state.notifications, [sourceIdx]: [] }, notificationsAlert: [state.notificationsAlert[0], notifAlert] }
                : { notifications: { ...state.notifications, [sourceIdx]: [] } };
        }),
    clearAllNotifications: () =>
        set((state) => {
            const notifications: AppState["notifications"] = {};

            for (let idx = 0; idx < API_URLS.length; idx++) {
                notifications[idx] = [];
            }

            return { notifications, notificationsAlert: [state.notificationsAlert[0], false] };
        }),

    updateDeviceStates: (sourceIdx, newEntries) =>
        set((state) => {
            if (newEntries.length === 0) {
                return state;
            }

            const newDeviceStates: AppState["deviceStates"][number] = { ...state.deviceStates[sourceIdx] };

            for (const { topic, payload } of newEntries) {
                newDeviceStates[topic] = { ...newDeviceStates[topic], ...payload };
            }

            return { deviceStates: { ...state.deviceStates, [sourceIdx]: newDeviceStates } };
        }),
    resetDeviceState: (sourceIdx, friendlyName) =>
        set((state) => {
            const prev = state.deviceStates[sourceIdx];

            return { deviceStates: { ...state.deviceStates, [sourceIdx]: { ...prev, [friendlyName]: {} } } };
        }),

    updateAvailability: (sourceIdx, { topic, payload }) =>
        set((state) => {
            const prev = state.availability[sourceIdx];
            // NOTE: indexOf is always valid since that's what triggers this call
            const friendlyName = topic.slice(0, topic.indexOf(AVAILABILITY_FEATURE_TOPIC_ENDING));

            return {
                availability: {
                    ...state.availability,
                    [sourceIdx]: { ...prev, [friendlyName]: payload },
                },
            };
        }),

    setBridgeInfo: (sourceIdx, bridgeInfo) =>
        set((state) => {
            return state.bridgeInfo[sourceIdx].restart_required === bridgeInfo.restart_required
                ? { bridgeInfo: { ...state.bridgeInfo, [sourceIdx]: bridgeInfo } }
                : {
                      bridgeInfo: { ...state.bridgeInfo, [sourceIdx]: bridgeInfo },
                      notificationsAlert: [bridgeInfo.restart_required, state.notificationsAlert[1]],
                  };
        }),
    setBridgeState: (sourceIdx, bridgeState) => set((state) => ({ bridgeState: { ...state.bridgeState, [sourceIdx]: bridgeState } })),
    setBridgeHealth: (sourceIdx, bridgeHealth) => set((state) => ({ bridgeHealth: { ...state.bridgeHealth, [sourceIdx]: bridgeHealth } })),
    setBridgeDefinitions: (sourceIdx, bridgeDefinitions) =>
        set((state) => ({ bridgeDefinitions: { ...state.bridgeDefinitions, [sourceIdx]: bridgeDefinitions } })),

    setDevices: (sourceIdx, devices) =>
        set((state) => {
            const newDeviceDashboardFeatures: AppState["deviceDashboardFeatures"][number] = {};
            const newDeviceScenesFeatures: AppState["deviceScenesFeatures"][number] = {};

            for (const device of devices) {
                if (device.disabled || !device.definition || device.definition.exposes.length === 0) {
                    continue;
                }

                const dashboardExposes: FeatureWithAnySubFeatures[] = [];
                const scenesExposes: FeatureWithAnySubFeatures[] = [];

                for (const expose of device.definition.exposes) {
                    const validDashboardExpose = parseAndCloneExpose(expose, isValidForDashboard);
                    const validScenesExpose = parseAndCloneExpose(expose, isValidForScenes);

                    if (validDashboardExpose) {
                        dashboardExposes.push(validDashboardExpose);
                    }

                    if (validScenesExpose) {
                        scenesExposes.push(validScenesExpose);
                    }
                }

                newDeviceDashboardFeatures[device.ieee_address] = dashboardExposes;
                newDeviceScenesFeatures[device.ieee_address] = scenesExposes;
            }

            return {
                devices: { ...state.devices, [sourceIdx]: devices },
                deviceDashboardFeatures: { ...state.deviceDashboardFeatures, [sourceIdx]: newDeviceDashboardFeatures },
                deviceScenesFeatures: { ...state.deviceScenesFeatures, [sourceIdx]: newDeviceScenesFeatures },
            };
        }),
    setGroups: (sourceIdx, groups) => set((state) => ({ groups: { ...state.groups, [sourceIdx]: groups } })),

    setNetworkMap: (sourceIdx, networkMap) =>
        set((state) => ({
            networkMapIsLoading: { ...state.networkMapIsLoading, [sourceIdx]: false },
            networkMap: { ...state.networkMap, [sourceIdx]: networkMap },
        })),
    setNetworkMapIsLoading: (sourceIdx) =>
        set((state) => ({
            networkMapIsLoading: { ...state.networkMapIsLoading, [sourceIdx]: true },
            networkMap: { ...state.networkMap, [sourceIdx]: undefined },
        })),

    setBackup: (sourceIdx, backupZipBase64) =>
        set((state) => ({
            preparingBackup: { ...state.preparingBackup, [sourceIdx]: false },
            backup: { ...state.backup, [sourceIdx]: backupZipBase64 },
        })),
    setBackupPreparing: (sourceIdx) => set((state) => ({ preparingBackup: { ...state.preparingBackup, [sourceIdx]: true } })),

    addGeneratedExternalDefinition: (sourceIdx, { id, source }) =>
        set((state) => ({
            generatedExternalDefinitions: {
                ...state.generatedExternalDefinitions,
                [sourceIdx]: { ...state.generatedExternalDefinitions[sourceIdx], [id]: source },
            },
        })),

    //-- WebSocket
    setAuthRequired: (sourceIdx, required) =>
        set((state) => {
            const authRequired = Array.from(state.authRequired);
            authRequired[sourceIdx] = required;

            return { authRequired };
        }),
    setReadyState: (sourceIdx, readyState) =>
        set((state) => {
            const readyStates = Array.from(state.readyStates);
            readyStates[sourceIdx] = readyState;

            return { readyStates };
        }),
    updateWebSocketMetrics: (sourceIdx, delta) =>
        set((state) => {
            const current = state.webSocketMetrics[sourceIdx];
            const updated: WebSocketMetrics = {
                messagesSent: current.messagesSent + delta.messagesSent,
                bytesSent: current.bytesSent + delta.bytesSent,
                messagesReceived: current.messagesReceived + delta.messagesReceived,
                messagesBridge: current.messagesBridge + delta.messagesBridge,
                messagesDevice: current.messagesDevice + delta.messagesDevice,
                bytesReceived: current.bytesReceived + delta.bytesReceived,
                reconnects: current.reconnects + delta.reconnects,
                /** 0 means unchanged, fallback to existing */
                lastMessageTs: delta.lastMessageTs || current.lastMessageTs,
                pendingRequests: current.pendingRequests,
            };

            return { webSocketMetrics: { ...state.webSocketMetrics, [sourceIdx]: updated } };
        }),
    resetWebSocketMetrics: (sourceIdx) =>
        set((state) => ({
            webSocketMetrics: {
                ...state.webSocketMetrics,
                [sourceIdx]: {
                    messagesSent: 0,
                    bytesSent: 0,
                    messagesReceived: 0,
                    messagesBridge: 0,
                    messagesDevice: 0,
                    bytesReceived: 0,
                    reconnects: 0,
                    lastMessageTs: 0,
                    pendingRequests: 0,
                },
            },
        })),
    setPendingRequestsCount: (sourceIdx, pending) =>
        set((state) => ({
            webSocketMetrics: {
                ...state.webSocketMetrics,
                [sourceIdx]: {
                    ...state.webSocketMetrics[sourceIdx],
                    pendingRequests: pending,
                },
            },
        })),

    //-- non source dependent

    addToast: (toast) => set((state) => ({ toasts: [...state.toasts, toast] })),
    removeToast: (idx) =>
        set((state) => {
            const prev = Array.from(state.toasts);

            prev.splice(idx, 1);

            return { toasts: prev };
        }),

    reset: () => {
        set(store.getInitialState());
    },
}));
