import merge from "lodash/merge.js";
import type { Zigbee2MQTTAPI } from "zigbee2mqtt";
import { create } from "zustand";
import { AVAILABILITY_FEATURE_TOPIC_ENDING } from "./consts.js";
import type { AvailabilityState, Device, LogMessage, Message, RecursiveMutable, TouchlinkDevice } from "./types.js";
import { formatDate } from "./utils.js";

export interface AppState {
    /** Sorted by friendlyName */
    devices: Device[];
    deviceStates: Record<string, Zigbee2MQTTAPI["{friendlyName}"]>;
    /** Sorted by friendlyName */
    groups: Zigbee2MQTTAPI["bridge/groups"];
    bridgeState: Zigbee2MQTTAPI["bridge/state"];
    bridgeHealth: Zigbee2MQTTAPI["bridge/health"];
    bridgeInfo: Zigbee2MQTTAPI["bridge/info"];
    bridgeDefinitions: Zigbee2MQTTAPI["bridge/definitions"];
    availability: Record<string, AvailabilityState>;
    generatedExternalDefinitions: Record<string, string>;
    logs: LogMessage[];
    logsLimit: number;
    lastNonDebugLog: LogMessage | undefined;
    extensions: Zigbee2MQTTAPI["bridge/extensions"];
    converters: Zigbee2MQTTAPI["bridge/converters"];
    touchlinkDevices: TouchlinkDevice[];
    touchlinkScanInProgress: boolean;
    touchlinkIdentifyInProgress: boolean;
    touchlinkResetInProgress: boolean;
    networkMap: Zigbee2MQTTAPI["bridge/response/networkmap"] | undefined;
    networkMapIsLoading: boolean;
    preparingBackup: boolean;
    /** base64 */
    backup: string;
}

interface AppActions {
    setExtensions: (payload: Zigbee2MQTTAPI["bridge/extensions"]) => void;
    setConverters: (payload: Zigbee2MQTTAPI["bridge/converters"]) => void;
    setTouchlinkScan: (payload: { inProgress: boolean; devices: Zigbee2MQTTAPI["bridge/response/touchlink/scan"]["found"] }) => void;
    setTouchlinkIdentifyInProgress: (payload: boolean) => void;
    setTouchlinkResetInProgress: (payload: boolean) => void;
    clearLogs: () => void;
    setLogsLimit: (payload: number) => void;
    addLog: (payload: Zigbee2MQTTAPI["bridge/logging"]) => void;
    updateDeviceStateMessage: (payload: Message<Zigbee2MQTTAPI["{friendlyName}"]>) => void;
    resetDeviceState: (payload: string) => void;
    updateAvailability: (payload: Message<Zigbee2MQTTAPI["{friendlyName}/availability"]>) => void;
    setBridgeInfo: (payload: Zigbee2MQTTAPI["bridge/info"]) => void;
    setBridgeState: (payload: Zigbee2MQTTAPI["bridge/state"]) => void;
    setBridgeHealth: (payload: Zigbee2MQTTAPI["bridge/health"]) => void;
    setBridgeDefinitions: (payload: RecursiveMutable<Zigbee2MQTTAPI["bridge/definitions"]>) => void;
    setDevices: (payload: Zigbee2MQTTAPI["bridge/devices"]) => void;
    setGroups: (payload: Zigbee2MQTTAPI["bridge/groups"]) => void;
    setNetworkMap: (payload: Zigbee2MQTTAPI["bridge/response/networkmap"] | undefined) => void;
    setNetworkMapIsLoading: () => void;
    setBackup: (payload: Zigbee2MQTTAPI["bridge/response/backup"]["zip"]) => void;
    setBackupPreparing: () => void;
    addGeneratedExternalDefinition: (payload: Zigbee2MQTTAPI["bridge/response/device/generate_external_definition"]) => void;
    reset: () => void;
}

const initialState: AppState = {
    devices: [],
    deviceStates: {},
    groups: [],
    bridgeState: { state: "offline" },
    bridgeHealth: {
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
    },
    bridgeInfo: {
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
    },
    bridgeDefinitions: {
        // @ts-expect-error unloaded
        clusters: {},
        custom_clusters: {},
    },
    availability: {},
    generatedExternalDefinitions: {},
    logs: [],
    logsLimit: 100,
    lastNonDebugLog: undefined,
    extensions: [],
    converters: [],
    touchlinkDevices: [],
    touchlinkScanInProgress: false,
    touchlinkIdentifyInProgress: false,
    touchlinkResetInProgress: false,
    networkMap: undefined,
    networkMapIsLoading: false,
    preparingBackup: false,
    backup: "",
};

export const useAppStore = create<AppState & AppActions>((set, _get, store) => ({
    ...initialState,

    setExtensions: (payload) => set(() => ({ extensions: payload })),
    setConverters: (payload) => set(() => ({ converters: payload })),

    setTouchlinkScan: ({ inProgress, devices }) => set(() => ({ touchlinkScanInProgress: inProgress, touchlinkDevices: devices })),
    setTouchlinkIdentifyInProgress: (payload) => set(() => ({ touchlinkIdentifyInProgress: payload })),
    setTouchlinkResetInProgress: (payload) => set(() => ({ touchlinkResetInProgress: payload })),

    clearLogs: () => set(() => ({ logs: [], lastNonDebugLog: undefined })),
    setLogsLimit: (payload) => set((state) => ({ logsLimit: payload, logs: state.logs.slice(-payload) })),
    addLog: (payload) =>
        set((state) => {
            const logs = state.logs.slice(state.logs.length >= state.logsLimit ? 1 : 0);
            const log = { ...payload, timestamp: formatDate(new Date()) };

            logs.push(log);

            if (log.level !== "debug") {
                return { logs, lastNonDebugLog: log };
            }

            return { logs };
        }),

    updateDeviceStateMessage: ({ topic, payload }) =>
        set((state) => ({
            deviceStates: { ...state.deviceStates, [topic]: merge(state.deviceStates[topic] ?? {}, payload) },
        })),
    resetDeviceState: (payload) => set((state) => ({ deviceStates: { ...state.deviceStates, [payload]: {} } })),
    updateAvailability: ({ topic, payload }) =>
        set((state) => {
            // NOTE: indexOf is always valid since that's what triggers this call
            const friendlyName = topic.slice(0, topic.indexOf(AVAILABILITY_FEATURE_TOPIC_ENDING));

            return { availability: { ...state.availability, [friendlyName]: payload } };
        }),

    setBridgeInfo: (payload) => set(() => ({ bridgeInfo: payload })),
    setBridgeState: (payload) => set(() => ({ bridgeState: payload })),
    setBridgeHealth: (payload) => set(() => ({ bridgeHealth: payload })),
    setBridgeDefinitions: (payload) => set(() => ({ bridgeDefinitions: payload })),

    // sort here, avoids sorting on-sites
    setDevices: (payload) => set(() => ({ devices: payload.sort((a, b) => a.friendly_name.localeCompare(b.friendly_name)) })),
    // sort here, avoids sorting on-sites
    setGroups: (payload) => set(() => ({ groups: payload.sort((a, b) => a.friendly_name.localeCompare(b.friendly_name)) })),

    setNetworkMap: (payload) => set(() => ({ networkMapIsLoading: false, networkMap: payload })),
    setNetworkMapIsLoading: () => set(() => ({ networkMapIsLoading: true, networkMap: undefined })),

    setBackup: (payload) => set(() => ({ preparingBackup: false, backup: payload })),
    setBackupPreparing: () => set(() => ({ preparingBackup: true })),

    addGeneratedExternalDefinition: ({ id, source }) =>
        set((state) => ({ generatedExternalDefinitions: { ...state.generatedExternalDefinitions, [id]: source } })),

    reset: () => {
        set(store.getInitialState());
    },
}));
