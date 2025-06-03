import { type PayloadAction, configureStore, createSlice } from "@reduxjs/toolkit";
import merge from "lodash/merge.js";
import type { Zigbee2MQTTAPI } from "zigbee2mqtt";
import type { AvailabilityState, LogMessage, Message, RecursiveMutable, TouchlinkDevice } from "./types.js";
import { formatDate } from "./utils.js";

interface State {
    /** Sorted by friendlyName */
    devices: Zigbee2MQTTAPI["bridge/devices"];
    deviceStates: Record<string, Zigbee2MQTTAPI["{friendlyName}"]>;
    /** Sorted by friendlyName */
    groups: Zigbee2MQTTAPI["bridge/groups"];
    bridgeState: Zigbee2MQTTAPI["bridge/state"];
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

export const AVAILABILITY_FEATURE_TOPIC_ENDING = "/availability";

const initialState: State = {
    devices: [],
    deviceStates: {},
    groups: [],
    bridgeState: { state: "offline" },
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

export const storeSlice = createSlice({
    name: "store",
    initialState,
    reducers: {
        setExtensions: (state, action: PayloadAction<Zigbee2MQTTAPI["bridge/extensions"]>) => {
            state.extensions = action.payload;
        },
        setConverters: (state, action: PayloadAction<Zigbee2MQTTAPI["bridge/converters"]>) => {
            state.converters = action.payload;
        },
        setTouchlinkScan: (
            state,
            action: PayloadAction<{ inProgress: boolean; devices: Zigbee2MQTTAPI["bridge/response/touchlink/scan"]["found"] }>,
        ) => {
            state.touchlinkScanInProgress = action.payload.inProgress;
            state.touchlinkDevices = action.payload.devices;
        },
        setTouchlinkIdentifyInProgress: (state, action: PayloadAction<boolean>) => {
            state.touchlinkIdentifyInProgress = action.payload;
        },
        setTouchlinkResetInProgress: (state, action: PayloadAction<boolean>) => {
            state.touchlinkResetInProgress = action.payload;
        },
        clearLogs: (state) => {
            state.logs = [];
            state.lastNonDebugLog = undefined;
        },
        setLogsLimit: (state, action: PayloadAction<number>) => {
            state.logsLimit = action.payload;
            state.logs = state.logs.slice(-action.payload);
        },
        addLog: (state, action: PayloadAction<Zigbee2MQTTAPI["bridge/logging"]>) => {
            if (state.logs.length > state.logsLimit) {
                state.logs.pop();
            }

            const log = { ...action.payload, timestamp: formatDate(new Date()) };

            state.logs.push(log);

            if (log.level !== "debug") {
                state.lastNonDebugLog = log;
            }
        },
        updateDeviceStateMessage: (state, action: PayloadAction<Message<Zigbee2MQTTAPI["{friendlyName}"]>>) => {
            state.deviceStates[action.payload.topic] = merge(state.deviceStates[action.payload.topic] ?? {}, action.payload.payload);
        },
        resetDeviceState: (state, action: PayloadAction<string>) => {
            state.deviceStates[action.payload] = {};
        },
        updateAvailability: (state, action: PayloadAction<Message<Zigbee2MQTTAPI["{friendlyName}/availability"]>>) => {
            const friendlyName = action.payload.topic.split(AVAILABILITY_FEATURE_TOPIC_ENDING, 1)[0];
            state.availability[friendlyName] = action.payload.payload;
        },
        setBridgeInfo: (state, action: PayloadAction<Zigbee2MQTTAPI["bridge/info"]>) => {
            state.bridgeInfo = action.payload;
        },
        setBridgeState: (state, action: PayloadAction<Zigbee2MQTTAPI["bridge/state"]>) => {
            state.bridgeState = action.payload;
        },
        setBridgeDefinitions: (state, action: PayloadAction<RecursiveMutable<Zigbee2MQTTAPI["bridge/definitions"]>>) => {
            state.bridgeDefinitions = action.payload;
        },
        setDevices: (state, action: PayloadAction<Zigbee2MQTTAPI["bridge/devices"]>) => {
            // avoid sorting on-sites
            state.devices = action.payload.sort((a, b) => a.friendly_name.localeCompare(b.friendly_name));
        },
        setGroups: (state, action: PayloadAction<Zigbee2MQTTAPI["bridge/groups"]>) => {
            // avoid sorting on-sites
            state.groups = action.payload.sort((a, b) => a.friendly_name.localeCompare(b.friendly_name));
        },
        setNetworkMap: (state, action: PayloadAction<Zigbee2MQTTAPI["bridge/response/networkmap"] | undefined>) => {
            state.networkMapIsLoading = false;
            state.networkMap = action.payload;
        },
        setNetworkMapIsLoading: (state) => {
            state.networkMapIsLoading = true;
            state.networkMap = undefined;
        },
        setBackup: (state, action: PayloadAction<Zigbee2MQTTAPI["bridge/response/backup"]["zip"]>) => {
            state.preparingBackup = false;
            state.backup = action.payload;
        },
        setBackupPreparing: (state) => {
            state.preparingBackup = true;
        },
        addGeneratedExternalDefinition: (state, action: PayloadAction<Zigbee2MQTTAPI["bridge/response/device/generate_external_definition"]>) => {
            state.generatedExternalDefinitions[action.payload.id] = action.payload.source;
        },
    },
});

const store = configureStore<State>({
    reducer: storeSlice.reducer,
});

export const {
    setExtensions,
    setConverters,
    setTouchlinkScan,
    setTouchlinkIdentifyInProgress,
    setTouchlinkResetInProgress,
    clearLogs,
    setLogsLimit,
    addLog,
    updateDeviceStateMessage,
    resetDeviceState,
    updateAvailability,
    setBridgeInfo,
    setBridgeState,
    setBridgeDefinitions,
    setDevices,
    setGroups,
    setNetworkMap,
    setNetworkMapIsLoading,
    setBackup,
    setBackupPreparing,
    addGeneratedExternalDefinition,
} = storeSlice.actions;

export default store;

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
