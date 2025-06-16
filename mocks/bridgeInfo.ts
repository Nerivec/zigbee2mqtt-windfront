import type { Zigbee2MQTTAPI } from "zigbee2mqtt";
import type { Message } from "../src/types.js";

export const BRIDGE_INFO: Message<Zigbee2MQTTAPI["bridge/info"]> = {
    payload: {
        commit: "3ad20ddc",
        config: {
            advanced: {
                cache_state: true,
                cache_state_persistent: true,
                cache_state_send_on_startup: true,
                channel: 15,
                elapsed: true,
                ext_pan_id: [170, 187, 204, 221, 238, 255, 0, 0],
                last_seen: "ISO_8601_local",
                log_console_json: false,
                log_debug_namespace_ignore: "",
                log_debug_to_mqtt_frontend: false,
                log_directories_to_keep: 10,
                log_directory: "/config/zigbee2mqtt/log/%TIMESTAMP%",
                log_file: "log.log",
                log_level: "debug",
                log_namespaced_levels: {},
                log_output: ["console"],
                log_rotation: true,
                log_symlink_current: false,
                log_syslog: {
                    app_name: "Zigbee2MQTT",
                    eol: "/n",
                    host: "localhost",
                    localhost: "localhost",
                    path: "/dev/log",
                    pid: "process.pid",
                    port: 514,
                    protocol: "udp4",
                    type: "5424",
                },
                network_key: [],
                output: "json",
                pan_id: 2345,
                timestamp_format: "YYYY-MM-DD HH:mm:ss",
                transmit_power: 20,
            },
            availability: {
                active: {
                    backoff: true,
                    max_jitter: 30000,
                    pause_on_backoff_gt: 0,
                    timeout: 10,
                },
                enabled: true,
                passive: {
                    timeout: 1500,
                },
            },
            blocklist: [],
            device_options: {},
            devices: {
                "0x00124b001e73227f": {
                    description: "wqewqe",
                    friendly_name: "0x00124b001e73227f1",
                },
                "0x00124b001fb59621": {
                    friendly_name: "livingroom/co2233",
                },
                "0x00158d0001e1a85a": {
                    friendly_name: "livingroom/window",
                },
                "0x00158d0001fa4f2f": {
                    friendly_name: "livingroom/temp_humidity",
                },
                "0x00158d000224154d": {
                    friendly_name: "0x00158d000224154d",
                },
                "0x00158d0002c48958": {
                    availability: false,
                    description: "датчик прикрепленный к рабочему стулу",
                    friendly_name: "work/nur/jopa",
                },
                "0x00158d00039fe32c": {
                    description: "это любой текст",
                    friendly_name: "dining room/ac power",
                },
                "0x00158d0004261dc7": {
                    friendly_name: "livingroom/ac power",
                },
                "0x00158d0004866f11": {
                    friendly_name: "0x00158d0004866f11",
                    temperature_calibration: 6,
                    temperature_precision: 1,
                },
                "0x0017880103d55d65": {
                    friendly_name: "0x0017880103d55d65",
                },
                "0x0017880104292f0a": {
                    description: "descr",
                    friendly_name: "hue1",
                    homeassistant: {
                        name: "HA name",
                    },
                    optimistic: true,
                },
                "0x0017880104dfc05e": {
                    friendly_name: "hue_back_tv",
                },
                "0x804b50fffe5d11ea": {
                    friendly_name: "0x804b50fffe5d11ea",
                },
                "0x847127fffeacff97": {
                    friendly_name: "0x847127fffeacff97",
                },
                "0xbc33acfffe17628b": {
                    friendly_name: "0xbc33acfffe17628b",
                },
                "0xbc33acfffe17628a": {
                    friendly_name: "0xbc33acfffe17628a",
                },
            },
            frontend: {
                package: "zigbee2mqtt-windfront",
                base_url: "/",
                enabled: true,
                port: 8099,
            },
            groups: {
                "1": {
                    description: "Test group description",
                    friendly_name: "hue lights",
                },
            },
            homeassistant: {
                discovery_topic: "homeassistant",
                enabled: true,
                experimental_event_entities: false,
                legacy_action_sensor: false,
                status_topic: "homeassistant/status",
            },
            map_options: {
                graphviz: {
                    colors: {
                        fill: {
                            coordinator: "#e04e5d",
                            enddevice: "#fff8ce",
                            router: "#4ea3e0",
                        },
                        font: {
                            coordinator: "#ffffff",
                            enddevice: "#000000",
                            router: "#ffffff",
                        },
                        line: {
                            active: "#009900",
                            inactive: "#994444",
                        },
                    },
                },
            },
            mqtt: {
                base_topic: "zigbee2mqtt",
                force_disable_retain: false,
                include_device_information: false,
                maximum_packet_size: 1048576,
                server: "mqtt://core-mosquitto:1883",
                user: "zeigbeegw",
            },
            ota: {
                default_maximum_data_size: 50,
                disable_automatic_update_check: false,
                image_block_response_delay: 250,
                update_check_interval: 1440,
            },
            passlist: [],
            serial: {
                adapter: "zstack",
                disable_led: false,
                port: "/dev/ttyS1",
            },
            version: 4,
        },
        config_schema: {
            definitions: {
                device: {
                    properties: {
                        debounce: {
                            description: "Debounces messages of this device",
                            requiresRestart: true,
                            title: "Debounce",
                            type: "number",
                        },
                        debounce_ignore: {
                            description: "Protects unique payload values of specified payload properties from overriding within debounce time",
                            examples: ["action"],
                            items: {
                                type: "string",
                            },
                            title: "Ignore debounce",
                            type: "array",
                        },
                        disabled: {
                            description: "Disables the device (excludes device from network scans, availability and group state updates)",
                            requiresRestart: true,
                            title: "Disabled",
                            type: "boolean",
                        },
                        filtered_attributes: {
                            description: "Filter attributes with regex from published payload.",
                            examples: ["^temperature$", "^battery$", "^action$"],
                            items: {
                                type: "string",
                            },
                            title: "Filtered publish attributes",
                            type: "array",
                        },
                        filtered_cache: {
                            description:
                                "Filter attributes with regex from being added to the cache, this prevents the attribute from being in the published payload when the value didn't change.",
                            examples: ["^input_actions$"],
                            items: {
                                type: "string",
                            },
                            title: "Filtered attributes from cache",
                            type: "array",
                        },
                        filtered_optimistic: {
                            description:
                                "Filter attributes with regex from optimistic publish payload when calling /set. (This has no effect if optimistic is set to false).",
                            examples: ["^color_(mode|temp)$", "color"],
                            items: {
                                type: "string",
                            },
                            title: "Filtered optimistic attributes",
                            type: "array",
                        },
                        friendly_name: {
                            description: "Used in the MQTT topic of a device. By default this is the device ID",
                            readOnly: true,
                            title: "Friendly name",
                            type: "string",
                        },
                        homeassistant: {
                            properties: {
                                name: {
                                    description: "Name of the device in Home Assistant",
                                    title: "Home Assistant name",
                                    type: "string",
                                },
                            },
                            title: "Home Assistant",
                            type: ["object", "null"],
                        },
                        icon: {
                            description:
                                "The user-defined device icon for the frontend. It can be a full URL link to an image (e.g. https://SOME.SITE/MODEL123.jpg) or a path to a local file inside the `device_icons` directory.",
                            title: "Icon",
                            type: "string",
                        },
                        optimistic: {
                            default: true,
                            description: "Publish optimistic state after set",
                            title: "Optimistic",
                            type: "boolean",
                        },
                        qos: {
                            description: "QoS level for MQTT messages of this device",
                            title: "QoS",
                            type: "number",
                        },
                        retain: {
                            description: "Retain MQTT messages of this device",
                            title: "Retain",
                            type: "boolean",
                        },
                        retention: {
                            description: "Sets the MQTT Message Expiry in seconds, Make sure to set mqtt.version to 5",
                            title: "Retention",
                            type: "number",
                        },
                        throttle: {
                            description:
                                "The minimum time between payloads in seconds. Payloads received whilst the device is being throttled will be discarded",
                            requiresRestart: true,
                            title: "Throttle",
                            type: "number",
                        },
                    },
                    required: ["friendly_name"],
                    type: "object",
                },
                group: {
                    properties: {
                        filtered_attributes: {
                            items: {
                                type: "string",
                            },
                            type: "array",
                        },
                        friendly_name: {
                            type: "string",
                        },
                        off_state: {
                            default: "auto",
                            description:
                                "Control when to publish state OFF or CLOSE for a group. 'all_members_off': only publish state OFF/CLOSE when all group members are in state OFF/CLOSE,  'last_member_state': publish state OFF whenever one of its members changes to OFF",
                            enum: ["all_members_off", "last_member_state"],
                            requiresRestart: true,
                            title: "Group off state",
                            type: ["string"],
                        },
                        optimistic: {
                            type: "boolean",
                        },
                        qos: {
                            type: "number",
                        },
                        retain: {
                            type: "boolean",
                        },
                    },
                    required: ["friendly_name"],
                    type: "object",
                },
            },
            properties: {
                advanced: {
                    properties: {
                        adapter_concurrent: {
                            description: "Adapter concurrency (e.g. 2 for CC2531 or 16 for CC26X2R1) (default: null, uses recommended value)",
                            maximum: 64,
                            minimum: 1,
                            requiresRestart: true,
                            title: "Adapter concurrency",
                            type: ["number", "null"],
                        },
                        adapter_delay: {
                            description: "Adapter delay",
                            maximum: 1000,
                            minimum: 0,
                            requiresRestart: true,
                            title: "Adapter delay",
                            type: ["number", "null"],
                        },
                        cache_state: {
                            default: true,
                            description:
                                "MQTT message payload will contain all attributes, not only changed ones. Has to be true when integrating via Home Assistant",
                            title: "Cache state",
                            type: "boolean",
                        },
                        cache_state_persistent: {
                            default: true,
                            description: "Persist cached state, only used when cache_state: true",
                            title: "Persist cache state",
                            type: "boolean",
                        },
                        cache_state_send_on_startup: {
                            default: true,
                            description: "Send cached state on startup, only used when cache_state: true",
                            title: "Send cached state on startup",
                            type: "boolean",
                        },
                        channel: {
                            default: 11,
                            description:
                                "Zigbee channel, changing might require re-pairing some devices! (Note: use a ZLL channel: 11, 15, 20, or 25 to avoid problems)",
                            examples: [15, 20, 25],
                            maximum: 26,
                            minimum: 11,
                            requiresRestart: true,
                            title: "ZigBee channel",
                            type: "number",
                        },
                        elapsed: {
                            default: false,
                            description: "Add an elapsed attribute to MQTT messages, contains milliseconds since the previous msg",
                            title: "Elapsed",
                            type: "boolean",
                        },
                        ext_pan_id: {
                            description: "Zigbee extended pan ID, changing requires re-pairing all devices!",
                            oneOf: [
                                {
                                    title: "Extended pan ID (string)",
                                    type: "string",
                                },
                                {
                                    items: {
                                        type: "number",
                                    },
                                    title: "Extended pan ID (array)",
                                    type: "array",
                                },
                            ],
                            requiresRestart: true,
                            title: "Ext Pan ID",
                        },
                        last_seen: {
                            default: "disable",
                            description: "Add a last_seen attribute to MQTT messages, contains date/time of last Zigbee message",
                            enum: ["disable", "ISO_8601", "ISO_8601_local", "epoch"],
                            title: "Last seen",
                            type: "string",
                        },
                        log_console_json: {
                            default: false,
                            description: "Console json log",
                            requiresRestart: true,
                            title: "Console json log",
                            type: "boolean",
                        },
                        log_debug_namespace_ignore: {
                            default: "",
                            description: "Do not log these namespaces (regex-based) for debug level",
                            examples: ["^zhc:legacy:fz:(tuya|moes)", "^zhc:legacy:fz:(tuya|moes)|^zh:ember:uart:|^zh:controller"],
                            title: "Log debug namespace ignore",
                            type: "string",
                        },
                        log_debug_to_mqtt_frontend: {
                            default: false,
                            description: "Log debug level to MQTT and frontend (may decrease overall performance)",
                            requiresRestart: true,
                            title: "Log debug to MQTT and frontend",
                            type: "boolean",
                        },
                        log_directories_to_keep: {
                            default: 10,
                            description: "Number of log directories to keep before deleting the oldest one",
                            maximum: 1000,
                            minimum: 5,
                            title: "Number of past log folders to keep",
                            type: "number",
                        },
                        log_directory: {
                            description: "Location of log directory",
                            examples: ["data/log/%TIMESTAMP%"],
                            requiresRestart: true,
                            title: "Log directory",
                            type: "string",
                        },
                        log_file: {
                            default: "log.txt",
                            description: "Log file name, can also contain timestamp",
                            examples: ["zigbee2mqtt_%TIMESTAMP%.log"],
                            requiresRestart: true,
                            title: "Log file",
                            type: "string",
                        },
                        log_level: {
                            default: "info",
                            description: "Logging level",
                            enum: ["error", "warning", "info", "debug"],
                            title: "Log level",
                            type: "string",
                        },
                        log_namespaced_levels: {
                            additionalProperties: {
                                enum: ["error", "warning", "info", "debug"],
                                type: "string",
                            },
                            default: {},
                            description: "Set individual log levels for certain namespaces",
                            examples: [
                                {
                                    "z2m:mqtt": "warning",
                                },
                                {
                                    "zh:ember:uart:ash": "info",
                                },
                            ],
                            propertyNames: {
                                pattern: "^(z2m|zhc|zh)(:[a-z0-9]{1,})*$",
                            },
                            title: "Log Namespaced Levels",
                            type: "object",
                        },
                        log_output: {
                            description: "Output location of the log, leave empty to suppress logging",
                            items: {
                                enum: ["console", "file", "syslog"],
                                type: "string",
                            },
                            requiresRestart: true,
                            title: "Log output",
                            type: "array",
                        },
                        log_rotation: {
                            default: true,
                            description: "Log rotation",
                            requiresRestart: true,
                            title: "Log rotation",
                            type: "boolean",
                        },
                        log_symlink_current: {
                            default: false,
                            description: "Create symlink to current logs in the log directory",
                            requiresRestart: true,
                            title: "Log symlink current",
                            type: "boolean",
                        },
                        log_syslog: {
                            oneOf: [
                                {
                                    title: "syslog (disabled)",
                                    type: "null",
                                },
                                {
                                    properties: {
                                        app_name: {
                                            default: "Zigbee2MQTT",
                                            description: "The name of the application (Default: Zigbee2MQTT).",
                                            title: "Localhost",
                                            type: "string",
                                        },
                                        eol: {
                                            default: "/n",
                                            description:
                                                "The end of line character to be added to the end of the message (Default: Message without modifications).",
                                            title: "eol",
                                            type: "string",
                                        },
                                        host: {
                                            default: "localhost",
                                            description: "The host running syslogd, defaults to localhost.",
                                            title: "Host",
                                            type: "string",
                                        },
                                        localhost: {
                                            default: "localhost",
                                            description: "Host to indicate that log messages are coming from (Default: localhost).",
                                            title: "Localhost",
                                            type: "string",
                                        },
                                        path: {
                                            default: "/dev/log",
                                            description: "The path to the syslog dgram socket (i.e. /dev/log or /var/run/syslog for OS X).",
                                            examples: ["/var/run/syslog"],
                                            title: "Path",
                                            type: "string",
                                        },
                                        pid: {
                                            default: "process.pid",
                                            description: "PID of the process that log messages are coming from (Default process.pid).",
                                            title: "PID",
                                            type: "string",
                                        },
                                        port: {
                                            default: 514,
                                            description: "The port on the host that syslog is running on, defaults to syslogd's default port.",
                                            title: "Port",
                                            type: "number",
                                        },
                                        protocol: {
                                            default: "udp4",
                                            description: "The network protocol to log over (e.g. tcp4, udp4, tls4, unix, unix-connect, etc).",
                                            examples: ["udp4", "tls4", "unix", "unix-connect"],
                                            title: "Protocol",
                                            type: "string",
                                        },
                                        type: {
                                            default: "5424",
                                            description: "The type of the syslog protocol to use (Default: BSD, also valid: 5424).",
                                            title: "Type",
                                            type: "string",
                                        },
                                    },
                                    title: "syslog (enabled)",
                                    type: "object",
                                },
                            ],
                            requiresRestart: true,
                        },
                        network_key: {
                            description: "Network encryption key, changing requires re-pairing all devices!",
                            oneOf: [
                                {
                                    title: "Network key(string)",
                                    type: "string",
                                },
                                {
                                    items: {
                                        type: "number",
                                    },
                                    title: "Network key(array)",
                                    type: "array",
                                },
                            ],
                            requiresRestart: true,
                            title: "Network key",
                        },
                        output: {
                            description:
                                "Examples when 'state' of a device is published json: topic: 'zigbee2mqtt/my_bulb' payload '{\"state\": \"ON\"}' attribute: topic 'zigbee2mqtt/my_bulb/state' payload 'ON' attribute_and_json: both json and attribute (see above)",
                            enum: ["attribute_and_json", "attribute", "json"],
                            title: "MQTT output type",
                            type: "string",
                        },
                        pan_id: {
                            description: "ZigBee pan ID, changing requires re-pairing all devices!",
                            oneOf: [
                                {
                                    title: "Pan ID (string)",
                                    type: "string",
                                },
                                {
                                    title: "Pan ID (number)",
                                    type: "number",
                                },
                            ],
                            requiresRestart: true,
                            title: "Pan ID",
                        },
                        timestamp_format: {
                            description: "Log timestamp format",
                            examples: ["YYYY-MM-DD HH:mm:ss"],
                            requiresRestart: true,
                            title: "Timestamp format",
                            type: "string",
                        },
                        transmit_power: {
                            description:
                                "Transmit power of adapter, only available for Z-Stack (CC253*/CC2652/CC1352) adapters, CC2652 = 5dbm, CC1352 max is = 20dbm (5dbm default)",
                            maximum: 127,
                            minimum: -128,
                            requiresRestart: true,
                            title: "Transmit power",
                            type: ["number", "null"],
                        },
                    },
                    title: "Advanced",
                    type: "object",
                },
                availability: {
                    description: "Checks whether devices are online/offline",
                    properties: {
                        active: {
                            description: "Options for active devices (routers/mains powered)",
                            properties: {
                                backoff: {
                                    default: true,
                                    description: "Enable timeout backoff on failed availability pings (x1.5, x3, x6, x12...)",
                                    title: "Enabled",
                                    type: "boolean",
                                },
                                max_jitter: {
                                    default: 30000,
                                    description:
                                        "Maximum jitter (in msec) allowed on timeout to avoid availability pings trying to trigger around the same time",
                                    minimum: 1000,
                                    title: "Max jitter",
                                    type: "number",
                                },
                                pause_on_backoff_gt: {
                                    default: 0,
                                    description:
                                        "Pause availability pings when backoff reaches over this limit until a new Zigbee message is received from the device. A value of zero disables pausing.",
                                    minimum: 0,
                                    title: "Pause on backoff greater than",
                                    type: "number",
                                },
                                timeout: {
                                    default: 10,
                                    description: "Time after which an active device will be marked as offline in minutes",
                                    requiresRestart: true,
                                    title: "Timeout",
                                    type: "number",
                                },
                            },
                            required: ["timeout"],
                            requiresRestart: true,
                            title: "Active",
                            type: "object",
                        },
                        enabled: {
                            default: false,
                            description: "Enable availability checks",
                            requiresRestart: true,
                            title: "Enabled",
                            type: "boolean",
                        },
                        passive: {
                            description: "Options for passive devices (mostly battery powered)",
                            properties: {
                                timeout: {
                                    default: 1500,
                                    description: "Time after which an passive device will be marked as offline in minutes",
                                    requiresRestart: true,
                                    title: "Timeout",
                                    type: "number",
                                },
                            },
                            required: ["timeout"],
                            requiresRestart: true,
                            title: "Passive",
                            type: "object",
                        },
                    },
                    required: [],
                    title: "Availability",
                    type: "object",
                },
                blocklist: {
                    description: "Block devices from the network (by ieeeAddr)",
                    items: {
                        type: "string",
                    },
                    requiresRestart: true,
                    title: "Blocklist",
                    type: "array",
                },
                device_options: {
                    title: "Options that are applied to all devices",
                    type: "object",
                },
                devices: {
                    patternProperties: {
                        "^.*$": {
                            // biome-ignore lint/style/useNamingConvention: mock
                            $ref: "#/definitions/device",
                        },
                    },
                    propertyNames: {
                        pattern: "^0x[\\d\\w]{16}$",
                    },
                    type: "object",
                },
                frontend: {
                    properties: {
                        auth_token: {
                            description: "Enables authentication, disabled by default",
                            requiresRestart: true,
                            title: "Auth token",
                            type: ["string", "null"],
                        },
                        base_url: {
                            default: "/",
                            description: "Base URL for the frontend. If hosted under a subpath, e.g. 'http://localhost:8080/z2m', set this to '/z2m'",
                            pattern: "^\\/.*",
                            requiresRestart: true,
                            title: "Base URL",
                            type: "string",
                        },
                        enabled: {
                            default: false,
                            description: "Enable frontend",
                            requiresRestart: true,
                            title: "Enabled",
                            type: "boolean",
                        },
                        host: {
                            description: "Frontend binding host. Binds to a unix socket when an absolute path is given instead.",
                            examples: ["127.0.0.1", "::1", "/run/zigbee2mqtt/zigbee2mqtt.sock"],
                            requiresRestart: true,
                            title: "Bind host",
                            type: ["string", "null"],
                        },
                        notification_filter: {
                            description: "Hide frontend notifications matching specified regex strings. Example: 'z2m: Failed to ping.*'",
                            items: {
                                type: "string",
                            },
                            title: "Notification Filter",
                            type: "array",
                        },
                        port: {
                            default: 8080,
                            description: "Frontend binding port. Ignored when using a unix domain socket",
                            requiresRestart: true,
                            title: "Port",
                            type: "number",
                        },
                        ssl_cert: {
                            description:
                                "SSL Certificate file path for exposing HTTPS. The sibling property 'ssl_key' must be set for HTTPS to be activated.",
                            requiresRestart: true,
                            title: "Certificate file path",
                            type: ["string", "null"],
                        },
                        ssl_key: {
                            description:
                                "SSL key file path for exposing HTTPS. The sibling property 'ssl_cert' must be set for HTTPS to be activated.",
                            requiresRestart: true,
                            title: "key file path",
                            type: ["string", "null"],
                        },
                        url: {
                            description:
                                "URL on which the frontend can be reached, currently only used for the Home Assistant device configuration page",
                            requiresRestart: true,
                            title: "URL",
                            type: ["string", "null"],
                        },
                    },
                    required: [],
                    title: "Frontend",
                    type: "object",
                },
                groups: {
                    patternProperties: {
                        "^.*$": {
                            // biome-ignore lint/style/useNamingConvention: mock
                            $ref: "#/definitions/group",
                        },
                    },
                    propertyNames: {
                        pattern: "^[\\w].*$",
                    },
                    type: "object",
                },
                homeassistant: {
                    description: "Home Assistant integration (MQTT discovery)",
                    properties: {
                        discovery_topic: {
                            default: "homeassistant",
                            description: "Home Assistant discovery topic",
                            examples: ["homeassistant"],
                            requiresRestart: true,
                            title: "Homeassistant discovery topic",
                            type: "string",
                        },
                        enabled: {
                            default: false,
                            description: "Enable Home Assistant integration",
                            requiresRestart: true,
                            title: "Enabled",
                            type: "boolean",
                        },
                        experimental_event_entities: {
                            default: false,
                            description:
                                "Home Assistant experimental event entities, when enabled Zigbee2MQTT will add event entities for exposed actions. The events and attributes are currently deemed experimental and subject to change.",
                            title: "Home Assistant experimental event entities",
                            type: "boolean",
                        },
                        legacy_action_sensor: {
                            default: false,
                            description:
                                "Home Assistant legacy actions sensor, when enabled a action sensor will be discoverd and an empty `action` will be send after every published action.",
                            title: "Home Assistant legacy action sensors",
                            type: "boolean",
                        },
                        status_topic: {
                            default: "homeassistant/status",
                            description: "Home Assistant status topic",
                            examples: ["homeassistant/status"],
                            requiresRestart: true,
                            title: "Home Assistant status topic",
                            type: "string",
                        },
                    },
                    required: [],
                    title: "Home Assistant integration",
                    type: "object",
                },
                map_options: {
                    properties: {
                        graphviz: {
                            properties: {
                                colors: {
                                    properties: {
                                        fill: {
                                            properties: {
                                                coordinator: {
                                                    type: "string",
                                                },
                                                enddevice: {
                                                    type: "string",
                                                },
                                                router: {
                                                    type: "string",
                                                },
                                            },
                                            type: "object",
                                        },
                                        font: {
                                            properties: {
                                                coordinator: {
                                                    type: "string",
                                                },
                                                enddevice: {
                                                    type: "string",
                                                },
                                                router: {
                                                    type: "string",
                                                },
                                            },
                                            type: "object",
                                        },
                                        line: {
                                            properties: {
                                                active: {
                                                    type: "string",
                                                },
                                                inactive: {
                                                    type: "string",
                                                },
                                            },
                                            type: "object",
                                        },
                                    },
                                    type: "object",
                                },
                            },
                            type: "object",
                        },
                    },
                    title: "Networkmap",
                    type: "object",
                },
                mqtt: {
                    properties: {
                        base_topic: {
                            default: "zigbee2mqtt",
                            description: "MQTT base topic for Zigbee2MQTT MQTT messages",
                            examples: ["zigbee2mqtt"],
                            requiresRestart: true,
                            title: "Base topic",
                            type: "string",
                        },
                        ca: {
                            description: "Absolute path to SSL/TLS certificate of CA used to sign server and client certificates",
                            examples: ["/etc/ssl/mqtt-ca.crt"],
                            requiresRestart: true,
                            title: "Certificate authority",
                            type: "string",
                        },
                        cert: {
                            description: "Absolute path to SSL/TLS certificate for client-authentication",
                            examples: ["/etc/ssl/mqtt-client.crt"],
                            requiresRestart: true,
                            title: "SSL/TLS certificate",
                            type: "string",
                        },
                        client_id: {
                            description: "MQTT client ID",
                            examples: ["MY_CLIENT_ID"],
                            requiresRestart: true,
                            title: "Client ID",
                            type: "string",
                        },
                        force_disable_retain: {
                            default: false,
                            description:
                                "Disable retain for all send messages. ONLY enable if your MQTT broker doesn't support retained message (e.g. AWS IoT core, Azure IoT Hub, Google Cloud IoT core, IBM Watson IoT Platform). Enabling will break the Home Assistant integration",
                            requiresRestart: true,
                            title: "Force disable retain",
                            type: "boolean",
                        },
                        include_device_information: {
                            default: false,
                            description: "Include device information to mqtt messages",
                            title: "Include device information",
                            type: "boolean",
                        },
                        keepalive: {
                            default: 60,
                            description: "MQTT keepalive in second",
                            requiresRestart: true,
                            title: "Keepalive",
                            type: "number",
                        },
                        key: {
                            description: "Absolute path to SSL/TLS key for client-authentication",
                            examples: ["/etc/ssl/mqtt-client.key"],
                            requiresRestart: true,
                            title: "SSL/TLS key",
                            type: "string",
                        },
                        maximum_packet_size: {
                            default: 1048576,
                            description:
                                "Specifies the maximum allowed packet length (in bytes) that the server can send to Zigbee2MQTT. NOTE: The same value exists in your MQTT broker but for the length the client can send to it instead.",
                            maximum: 268435456,
                            minimum: 20,
                            requiresRestart: true,
                            title: "Maximum packet size",
                            type: "number",
                        },
                        password: {
                            description: "MQTT server authentication password",
                            examples: ["ILOVEPELMENI"],
                            requiresRestart: true,
                            title: "Password",
                            type: "string",
                        },
                        reject_unauthorized: {
                            default: true,
                            description: "Disable self-signed SSL certificate",
                            requiresRestart: true,
                            title: "Reject unauthorized",
                            type: "boolean",
                        },
                        server: {
                            description: "MQTT server URL (use mqtts:// for SSL/TLS connection)",
                            examples: ["mqtt://localhost:1883"],
                            requiresRestart: true,
                            title: "MQTT server",
                            type: "string",
                        },
                        user: {
                            description: "MQTT server authentication user",
                            examples: ["johnnysilverhand"],
                            requiresRestart: true,
                            title: "User",
                            type: "string",
                        },
                        version: {
                            default: 4,
                            description: "MQTT protocol version",
                            examples: [5],
                            requiresRestart: true,
                            title: "Version",
                            type: ["number", "null"],
                        },
                    },
                    required: ["server"],
                    title: "MQTT",
                    type: "object",
                },
                ota: {
                    properties: {
                        default_maximum_data_size: {
                            default: 50,
                            description:
                                "The size of file chunks sent during an update (in bytes). Note: This value may get ignored for manufacturers that require specific values.",
                            maximum: 100,
                            minimum: 10,
                            requiresRestart: true,
                            title: "Default maximum data size",
                            type: "number",
                        },
                        disable_automatic_update_check: {
                            default: false,
                            description:
                                "Zigbee devices may request a firmware update, and do so frequently, causing Zigbee2MQTT to reach out to third party servers. If you disable these device initiated checks, you can still initiate a firmware update check manually.",
                            title: "Disable automatic update check",
                            type: "boolean",
                        },
                        image_block_response_delay: {
                            default: 250,
                            description:
                                "Limits the rate of requests (in milliseconds) during OTA updates to reduce network congestion. You can increase this value if your network appears unstable during OTA.",
                            minimum: 50,
                            requiresRestart: true,
                            title: "Image block response delay",
                            type: "number",
                        },
                        update_check_interval: {
                            default: 1440,
                            description:
                                "Your device may request a check for a new firmware update. This value determines how frequently third party servers may actually be contacted to look for firmware updates. The value is set in minutes, and the default is 1 day.",
                            title: "Update check interval",
                            type: "number",
                        },
                        zigbee_ota_override_index_location: {
                            description: "Location of override OTA index file",
                            examples: ["index.json"],
                            requiresRestart: true,
                            title: "OTA index override file name",
                            type: ["string", "null"],
                        },
                    },
                    title: "OTA updates",
                    type: "object",
                },
                passlist: {
                    description:
                        "Allow only certain devices to join the network (by ieeeAddr). Note that all devices not on the passlist will be removed from the network!",
                    items: {
                        type: "string",
                    },
                    requiresRestart: true,
                    title: "Passlist",
                    type: "array",
                },
                serial: {
                    properties: {
                        adapter: {
                            description: "Adapter type, not needed unless you are experiencing problems",
                            enum: ["deconz", "zstack", "zigate", "ezsp", "ember", "zboss", "zoh"],
                            requiresRestart: true,
                            title: "Adapter",
                            type: ["string"],
                        },
                        baudrate: {
                            description:
                                "Baud rate speed for serial port, this can be anything firmware support but default is 115200 for Z-Stack and EZSP, 38400 for Deconz, however note that some EZSP firmware need 57600",
                            examples: [38400, 57600, 115200],
                            requiresRestart: true,
                            title: "Baudrate",
                            type: "number",
                        },
                        disable_led: {
                            default: false,
                            description: "Disable LED of the adapter if supported",
                            requiresRestart: true,
                            title: "Disable led",
                            type: "boolean",
                        },
                        port: {
                            description: "Location of the adapter. To autodetect the port, set null",
                            examples: ["/dev/ttyACM0"],
                            requiresRestart: true,
                            title: "Port",
                            type: ["string", "null"],
                        },
                        rtscts: {
                            description: "RTS / CTS Hardware Flow Control for serial port",
                            requiresRestart: true,
                            title: "RTS / CTS",
                            type: "boolean",
                        },
                    },
                    title: "Serial",
                    type: "object",
                },
            },
            required: ["mqtt"],
            type: "object",
        },
        coordinator: {
            ieee_address: "0x00124b0022813501",
            meta: {
                maintrel: 1,
                majorrel: 2,
                minorrel: 7,
                product: 1,
                revision: "20210319",
                transportrev: 2,
            },
            type: "zStack3x0",
        },
        log_level: "debug",
        network: {
            channel: 15,
            extended_pan_id: "0xaabbccddeeff0000",
            pan_id: 2345,
        },
        permit_join: false,
        restart_required: false,
        version: "2.2.1-dev",
        zigbee_herdsman_converters: {
            version: "23.32.0",
        },
        zigbee_herdsman: {
            version: "4.0.0",
        },
        os: {
            version: "Linux - 6.15.2 - x64",
            node_version: "v22.11.0",
            cpus: "Intel(R) Core(TM) i7-6700HQ CPU @ 2.60GHz (x8)",
            memory_mb: 24475,
        },
        mqtt: {
            server: "mqtt://localhost:1883",
            version: 5,
        },
    },
    topic: "bridge/info",
};
