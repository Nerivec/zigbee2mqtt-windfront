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
                    description: "thisisaverylongdescriptionforthepurposeoftestingawkwardwrapping",
                    optimistic: false,
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
                "0x44e2f8fffe0c0ea6": {
                    friendly_name: "Irrigation-back-3",
                },
                "0x94a081fffe57bbf6": {
                    friendly_name: "Détecteur_Mouvement_Bureau",
                    illuminance_calibration: 200,
                    illuminance_raw: true,
                    no_occupancy_since: [10, 60],
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
            type: "object",
            properties: {
                homeassistant: {
                    title: "Home Assistant integration",
                    description: "Home Assistant integration (MQTT discovery)",
                    type: "object",
                    properties: {
                        enabled: {
                            type: "boolean",
                            title: "Enabled",
                            description: "Enable Home Assistant integration",
                            default: false,
                            requiresRestart: true,
                        },
                        discovery_topic: {
                            type: "string",
                            title: "Homeassistant discovery topic",
                            description: "Home Assistant discovery topic",
                            default: "homeassistant",
                            requiresRestart: true,
                            examples: ["homeassistant"],
                        },
                        status_topic: {
                            type: "string",
                            title: "Home Assistant status topic",
                            description: "Home Assistant status topic",
                            default: "homeassistant/status",
                            requiresRestart: true,
                            examples: ["homeassistant/status"],
                        },
                        legacy_action_sensor: {
                            type: "boolean",
                            title: "Home Assistant legacy action sensors",
                            description:
                                "Home Assistant legacy actions sensor, when enabled a action sensor will be discoverd and an empty `action` will be send after every published action.",
                            default: false,
                        },
                        experimental_event_entities: {
                            type: "boolean",
                            title: "Home Assistant experimental event entities",
                            description:
                                "Home Assistant experimental event entities, when enabled Zigbee2MQTT will add event entities for exposed actions. The events and attributes are currently deemed experimental and subject to change.",
                            default: false,
                        },
                    },
                    required: [],
                },
                availability: {
                    type: "object",
                    title: "Availability",
                    description: "Checks whether devices are online/offline",
                    properties: {
                        enabled: {
                            type: "boolean",
                            title: "Enabled",
                            description: "Enable availability checks",
                            default: false,
                            requiresRestart: true,
                        },
                        active: {
                            type: "object",
                            title: "Active",
                            requiresRestart: true,
                            description: "Options for active devices (routers/mains powered)",
                            properties: {
                                timeout: {
                                    type: "number",
                                    title: "Timeout",
                                    requiresRestart: true,
                                    default: 10,
                                    minimum: 1,
                                    description: "Time after which an active device will be marked as offline in minutes",
                                },
                                max_jitter: {
                                    type: "number",
                                    title: "Max jitter",
                                    default: 30000,
                                    minimum: 1000,
                                    description:
                                        "Maximum jitter (in msec) allowed on timeout to avoid availability pings trying to trigger around the same time",
                                },
                                backoff: {
                                    type: "boolean",
                                    title: "Backoff",
                                    description: "Enable timeout backoff on failed availability pings (x1.5, x3, x6, x12...)",
                                    default: true,
                                },
                                pause_on_backoff_gt: {
                                    type: "number",
                                    title: "Pause on backoff greater than",
                                    default: 0,
                                    minimum: 0,
                                    description:
                                        "Pause availability pings when backoff reaches over this limit until a new Zigbee message is received from the device. A value of zero disables pausing.",
                                },
                            },
                            required: ["timeout"],
                        },
                        passive: {
                            type: "object",
                            title: "Passive",
                            requiresRestart: true,
                            description: "Options for passive devices (mostly battery powered)",
                            properties: {
                                timeout: {
                                    type: "number",
                                    title: "Timeout",
                                    requiresRestart: true,
                                    default: 1500,
                                    minimum: 1,
                                    description: "Time after which an passive device will be marked as offline in minutes",
                                },
                            },
                            required: ["timeout"],
                        },
                    },
                    required: [],
                },
                mqtt: {
                    type: "object",
                    title: "MQTT",
                    properties: {
                        base_topic: {
                            type: "string",
                            title: "Base topic",
                            default: "zigbee2mqtt",
                            requiresRestart: true,
                            description: "MQTT base topic for Zigbee2MQTT MQTT messages",
                            examples: ["zigbee2mqtt"],
                        },
                        server: {
                            type: "string",
                            title: "MQTT server",
                            requiresRestart: true,
                            description: "MQTT server URL (use mqtts:// for SSL/TLS connection)",
                            examples: ["mqtt://localhost:1883"],
                        },
                        keepalive: {
                            type: "number",
                            title: "Keepalive",
                            requiresRestart: true,
                            description: "MQTT keepalive in second",
                            default: 60,
                        },
                        ca: {
                            type: "string",
                            title: "Certificate authority",
                            requiresRestart: true,
                            description: "Absolute path to SSL/TLS certificate of CA used to sign server and client certificates",
                            examples: ["/etc/ssl/mqtt-ca.crt"],
                        },
                        key: {
                            type: "string",
                            title: "SSL/TLS key",
                            requiresRestart: true,
                            description: "Absolute path to SSL/TLS key for client-authentication",
                            examples: ["/etc/ssl/mqtt-client.key"],
                        },
                        cert: {
                            type: "string",
                            title: "SSL/TLS certificate",
                            description: "Absolute path to SSL/TLS certificate for client-authentication",
                            requiresRestart: true,
                            examples: ["/etc/ssl/mqtt-client.crt"],
                        },
                        user: {
                            type: "string",
                            title: "User",
                            requiresRestart: true,
                            description: "MQTT server authentication user",
                            examples: ["johnnysilverhand"],
                        },
                        password: {
                            type: "string",
                            title: "Password",
                            requiresRestart: true,
                            description: "MQTT server authentication password",
                            examples: ["ILOVEPELMENI"],
                        },
                        client_id: {
                            type: "string",
                            title: "Client ID",
                            requiresRestart: true,
                            description: "MQTT client ID",
                            examples: ["MY_CLIENT_ID"],
                        },
                        reject_unauthorized: {
                            type: "boolean",
                            title: "Reject unauthorized",
                            requiresRestart: true,
                            description: "Disable self-signed SSL certificate",
                            default: true,
                        },
                        include_device_information: {
                            type: "boolean",
                            title: "Include device information",
                            description: "Include device information to mqtt messages",
                            default: false,
                        },
                        version: {
                            type: ["number", "null"],
                            title: "Version",
                            requiresRestart: true,
                            description: "MQTT protocol version",
                            default: 4,
                            examples: [5],
                        },
                        force_disable_retain: {
                            type: "boolean",
                            title: "Force disable retain",
                            requiresRestart: true,
                            description:
                                "Disable retain for all send messages. ONLY enable if your MQTT broker doesn't support retained message (e.g. AWS IoT core, Azure IoT Hub, Google Cloud IoT core, IBM Watson IoT Platform). Enabling will break the Home Assistant integration",
                            default: false,
                        },
                        maximum_packet_size: {
                            type: "number",
                            title: "Maximum packet size",
                            requiresRestart: true,
                            description:
                                "Specifies the maximum allowed packet length (in bytes) that the server can send to Zigbee2MQTT. NOTE: The same value exists in your MQTT broker but for the length the client can send to it instead.",
                            default: 1048576,
                            minimum: 20,
                            maximum: 268435456,
                        },
                    },
                    required: ["server"],
                },
                serial: {
                    type: "object",
                    title: "Serial",
                    properties: {
                        port: {
                            type: ["string", "null"],
                            title: "Port",
                            requiresRestart: true,
                            description: "Location of the adapter. To autodetect the port, set null",
                            examples: ["/dev/ttyACM0"],
                        },
                        disable_led: {
                            type: "boolean",
                            title: "Disable led",
                            requiresRestart: true,
                            description: "Disable LED of the adapter if supported",
                            default: false,
                        },
                        adapter: {
                            type: "string",
                            enum: ["deconz", "zstack", "zigate", "ezsp", "ember", "zboss", "zoh"],
                            title: "Adapter",
                            requiresRestart: true,
                            description: "Adapter type, not needed unless you are experiencing problems",
                        },
                        baudrate: {
                            type: "number",
                            title: "Baudrate",
                            requiresRestart: true,
                            description:
                                "Baud rate speed for the serial port. This must match what the firmware on your adapter supports (most commonly 115200).",
                            examples: [115200, 921600, 460800, 230400, 57600, 38400],
                        },
                        rtscts: {
                            type: "boolean",
                            title: "RTS / CTS",
                            requiresRestart: true,
                            description: "RTS / CTS Hardware Flow Control for serial port",
                        },
                    },
                },
                blocklist: {
                    title: "Blocklist",
                    requiresRestart: true,
                    description: "Block devices from the network (by ieeeAddr)",
                    type: "array",
                    items: {
                        type: "string",
                    },
                },
                passlist: {
                    title: "Passlist",
                    requiresRestart: true,
                    description:
                        "Allow only certain devices to join the network (by ieeeAddr). Note that all devices not on the passlist will be removed from the network!",
                    type: "array",
                    items: {
                        type: "string",
                    },
                },
                map_options: {
                    type: "object",
                    title: "Networkmap",
                    properties: {
                        graphviz: {
                            type: "object",
                            properties: {
                                colors: {
                                    type: "object",
                                    properties: {
                                        fill: {
                                            type: "object",
                                            properties: {
                                                enddevice: {
                                                    type: "string",
                                                    default: "#fff8ce",
                                                },
                                                coordinator: {
                                                    type: "string",
                                                    default: "#e04e5d",
                                                },
                                                router: {
                                                    type: "string",
                                                    default: "#4ea3e0",
                                                },
                                            },
                                        },
                                        font: {
                                            type: "object",
                                            properties: {
                                                enddevice: {
                                                    type: "string",
                                                    default: "#000000",
                                                },
                                                coordinator: {
                                                    type: "string",
                                                    default: "#ffffff",
                                                },
                                                router: {
                                                    type: "string",
                                                    default: "#ffffff",
                                                },
                                            },
                                        },
                                        line: {
                                            type: "object",
                                            properties: {
                                                active: {
                                                    type: "string",
                                                    default: "#009900",
                                                },
                                                inactive: {
                                                    type: "string",
                                                    default: "#994444",
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                ota: {
                    type: "object",
                    title: "OTA updates",
                    properties: {
                        update_check_interval: {
                            type: "number",
                            title: "Update check interval",
                            description:
                                "Your device may request a check for a new firmware update. This value determines how frequently third party servers may actually be contacted to look for firmware updates. The value is set in minutes, and the default is 1 day.",
                            default: 1440,
                            minimum: 1,
                        },
                        disable_automatic_update_check: {
                            type: "boolean",
                            title: "Disable automatic update check",
                            description:
                                "Zigbee devices may request a firmware update, and do so frequently, causing Zigbee2MQTT to reach out to third party servers. If you disable these device initiated checks, you can still initiate a firmware update check manually.",
                            default: false,
                        },
                        zigbee_ota_override_index_location: {
                            type: ["string", "null"],
                            title: "OTA index override file name",
                            requiresRestart: true,
                            description: "Location of override OTA index file",
                            examples: ["index.json"],
                        },
                        image_block_response_delay: {
                            type: "number",
                            title: "Image block response delay",
                            description:
                                "Limits the rate of requests (in milliseconds) during OTA updates to reduce network congestion. You can increase this value if your network appears unstable during OTA.",
                            default: 250,
                            minimum: 50,
                            requiresRestart: true,
                        },
                        default_maximum_data_size: {
                            type: "number",
                            title: "Default maximum data size",
                            description:
                                "The size of file chunks sent during an update (in bytes). Note: This value may get ignored for manufacturers that require specific values.",
                            default: 50,
                            minimum: 10,
                            maximum: 100,
                            requiresRestart: true,
                        },
                    },
                },
                frontend: {
                    type: "object",
                    title: "Frontend",
                    properties: {
                        enabled: {
                            type: "boolean",
                            title: "Enabled",
                            description: "Enable frontend",
                            default: false,
                            requiresRestart: true,
                        },
                        package: {
                            type: "string",
                            enum: ["zigbee2mqtt-frontend", "zigbee2mqtt-windfront"],
                            title: "Package",
                            default: "zigbee2mqtt-frontend",
                            requiresRestart: true,
                            description: "Package used for the frontend",
                        },
                        port: {
                            type: "number",
                            title: "Port",
                            description: "Frontend binding port. Ignored when using a unix domain socket",
                            default: 8080,
                            requiresRestart: true,
                        },
                        host: {
                            type: ["string", "null"],
                            title: "Bind host",
                            description: "Frontend binding host. Binds to a unix socket when an absolute path is given instead.",
                            examples: ["127.0.0.1", "::1", "/run/zigbee2mqtt/zigbee2mqtt.sock"],
                            requiresRestart: true,
                        },
                        auth_token: {
                            type: ["string", "null"],
                            title: "Auth token",
                            description: "Enables authentication, disabled by default",
                            requiresRestart: true,
                        },
                        url: {
                            type: ["string", "null"],
                            title: "URL",
                            description:
                                "URL on which the frontend can be reached, currently only used for the Home Assistant device configuration page",
                            requiresRestart: true,
                        },
                        ssl_cert: {
                            type: ["string", "null"],
                            title: "Certificate file path",
                            description:
                                "SSL Certificate file path for exposing HTTPS. The sibling property 'ssl_key' must be set for HTTPS to be activated.",
                            requiresRestart: true,
                        },
                        ssl_key: {
                            type: ["string", "null"],
                            title: "key file path",
                            description:
                                "SSL key file path for exposing HTTPS. The sibling property 'ssl_cert' must be set for HTTPS to be activated.",
                            requiresRestart: true,
                        },
                        base_url: {
                            type: "string",
                            pattern: "^\\/.*",
                            title: "Base URL",
                            description: "Base URL for the frontend. If hosted under a subpath, e.g. 'http://localhost:8080/z2m', set this to '/z2m'",
                            default: "/",
                            requiresRestart: true,
                        },
                        notification_filter: {
                            title: "Notification Filter",
                            description: "Hide frontend notifications matching specified regex strings. Example: 'z2m: Failed to ping.*'",
                            type: "array",
                            items: {
                                type: "string",
                            },
                        },
                        disable_ui_serving: {
                            type: ["boolean", "null"],
                            title: "Disable UI serving",
                            description:
                                "If true, the frontend UI is not served, only the WebSocket is maintained by Zigbee2MQTT (you are required to serve a standalone UI yourself as needed).",
                            requiresRestart: true,
                        },
                    },
                    required: [],
                },
                devices: {
                    type: "object",
                    propertyNames: {
                        pattern: "^0x[\\d\\w]{16}$",
                    },
                    patternProperties: {
                        "^.*$": {
                            // biome-ignore lint/style/useNamingConvention: schema
                            $ref: "#/definitions/device",
                        },
                    },
                },
                groups: {
                    type: "object",
                    propertyNames: {
                        pattern: "^[\\w].*$",
                    },
                    patternProperties: {
                        "^.*$": {
                            // biome-ignore lint/style/useNamingConvention: schema
                            $ref: "#/definitions/group",
                        },
                    },
                },
                device_options: {
                    type: "object",
                    title: "Options that are applied to all devices",
                },
                advanced: {
                    type: "object",
                    title: "Advanced",
                    properties: {
                        log_rotation: {
                            type: "boolean",
                            title: "Log rotation",
                            requiresRestart: true,
                            description: "Log rotation",
                            default: true,
                        },
                        log_console_json: {
                            type: "boolean",
                            title: "Console json log",
                            requiresRestart: true,
                            description: "Console json log",
                            default: false,
                        },
                        log_symlink_current: {
                            type: "boolean",
                            title: "Log symlink current",
                            requiresRestart: true,
                            description: "Create symlink to current logs in the log directory",
                            default: false,
                        },
                        log_output: {
                            type: "array",
                            requiresRestart: true,
                            items: {
                                type: "string",
                                enum: ["console", "file", "syslog"],
                            },
                            title: "Log output",
                            description: "Output location of the log, leave empty to suppress logging",
                            default: ["console", "file"],
                        },
                        log_directory: {
                            type: "string",
                            title: "Log directory",
                            requiresRestart: true,
                            description: "Location of log directory",
                            examples: ["data/log/%TIMESTAMP%"],
                        },
                        log_file: {
                            type: "string",
                            title: "Log file",
                            requiresRestart: true,
                            description: "Log file name, can also contain timestamp",
                            examples: ["zigbee2mqtt_%TIMESTAMP%.log"],
                            default: "log.log",
                        },
                        log_level: {
                            type: "string",
                            enum: ["error", "warning", "info", "debug"],
                            title: "Log level",
                            description: "Logging level",
                            default: "info",
                        },
                        log_namespaced_levels: {
                            type: "object",
                            propertyNames: {
                                pattern: "^(z2m|zhc|zh)(:[a-z0-9]{1,})*$",
                            },
                            additionalProperties: {
                                type: "string",
                                enum: ["error", "warning", "info", "debug"],
                            },
                            title: "Log Namespaced Levels",
                            description: "Set individual log levels for certain namespaces",
                            default: {},
                            examples: [
                                {
                                    "z2m:mqtt": "warning",
                                },
                                {
                                    "zh:ember:uart:ash": "info",
                                },
                            ],
                        },
                        log_debug_to_mqtt_frontend: {
                            type: "boolean",
                            title: "Log debug to MQTT and frontend",
                            description: "Log debug level to MQTT and frontend (may decrease overall performance)",
                            requiresRestart: true,
                            default: false,
                        },
                        log_debug_namespace_ignore: {
                            type: "string",
                            title: "Log debug namespace ignore",
                            description: "Do not log these namespaces (regex-based) for debug level",
                            default: "",
                            examples: ["^zhc:legacy:fz:(tuya|moes)", "^zhc:legacy:fz:(tuya|moes)|^zh:ember:uart:|^zh:controller"],
                        },
                        log_directories_to_keep: {
                            type: "number",
                            title: "Number of past log folders to keep",
                            description: "Number of log directories to keep before deleting the oldest one",
                            default: 10,
                            minimum: 5,
                            maximum: 1000,
                        },
                        log_syslog: {
                            requiresRestart: true,
                            oneOf: [
                                {
                                    title: "syslog (disabled)",
                                    type: "null",
                                },
                                {
                                    title: "syslog (enabled)",
                                    type: "object",
                                    properties: {
                                        host: {
                                            type: "string",
                                            title: "Host",
                                            description: "The host running syslogd, defaults to localhost.",
                                            default: "localhost",
                                        },
                                        port: {
                                            type: "number",
                                            title: "Port",
                                            description: "The port on the host that syslog is running on, defaults to syslogd's default port.",
                                            default: 514,
                                        },
                                        protocol: {
                                            type: "string",
                                            title: "Protocol",
                                            description: "The network protocol to log over (e.g. tcp4, udp4, tls4, unix, unix-connect, etc).",
                                            default: "udp4",
                                            examples: ["udp4", "tls4", "unix", "unix-connect"],
                                        },
                                        path: {
                                            type: "string",
                                            title: "Path",
                                            description: "The path to the syslog dgram socket (i.e. /dev/log or /var/run/syslog for OS X).",
                                            default: "/dev/log",
                                            examples: ["/var/run/syslog"],
                                        },
                                        pid: {
                                            type: "string",
                                            title: "PID",
                                            description: "PID of the process that log messages are coming from (Default process.pid).",
                                            default: "process.pid",
                                        },
                                        localhost: {
                                            type: "string",
                                            title: "Localhost",
                                            description: "Host to indicate that log messages are coming from (Default: localhost).",
                                            default: "localhost",
                                        },
                                        type: {
                                            type: "string",
                                            title: "Type",
                                            description: "The type of the syslog protocol to use (Default: BSD, also valid: 5424).",
                                            default: "5424",
                                        },
                                        app_name: {
                                            type: "string",
                                            title: "Localhost",
                                            description: "The name of the application (Default: Zigbee2MQTT).",
                                            default: "Zigbee2MQTT",
                                        },
                                        eol: {
                                            type: "string",
                                            title: "eol",
                                            description:
                                                "The end of line character to be added to the end of the message (Default: Message without modifications).",
                                            default: "/n",
                                        },
                                    },
                                },
                            ],
                        },
                        pan_id: {
                            oneOf: [
                                {
                                    type: "string",
                                    title: "Pan ID (string)",
                                },
                                {
                                    type: "number",
                                    title: "Pan ID (number)",
                                    minimum: 1,
                                    maximum: 65534,
                                },
                            ],
                            title: "Pan ID",
                            requiresRestart: true,
                            description: "ZigBee pan ID, changing requires re-pairing all devices!",
                            default: 6754,
                        },
                        ext_pan_id: {
                            oneOf: [
                                {
                                    type: "string",
                                    title: "Extended pan ID (string)",
                                },
                                {
                                    type: "array",
                                    items: {
                                        type: "number",
                                    },
                                    title: "Extended pan ID (array)",
                                },
                            ],
                            title: "Ext Pan ID",
                            requiresRestart: true,
                            description: "Zigbee extended pan ID, changing requires re-pairing all devices!",
                            default: [221, 221, 221, 221, 221, 221, 221, 221],
                        },
                        channel: {
                            type: "number",
                            minimum: 11,
                            maximum: 26,
                            default: 11,
                            title: "ZigBee channel",
                            requiresRestart: true,
                            description:
                                "Zigbee channel, changing might require re-pairing some devices! (Note: use a ZLL channel: 11, 15, 20, or 25 to avoid problems)",
                            examples: [15, 20, 25],
                        },
                        adapter_concurrent: {
                            title: "Adapter concurrency",
                            requiresRestart: true,
                            type: ["number", "null"],
                            minimum: 1,
                            maximum: 64,
                            default: null,
                            description: "Adapter concurrency (e.g. 2 for CC2531 or 16 for CC26X2R1) (default: null, uses recommended value)",
                        },
                        adapter_delay: {
                            type: ["number", "null"],
                            requiresRestart: true,
                            title: "Adapter delay",
                            minimum: 0,
                            maximum: 1000,
                            default: null,
                            description: "Adapter delay",
                        },
                        cache_state: {
                            type: "boolean",
                            title: "Cache state",
                            description:
                                "MQTT message payload will contain all attributes, not only changed ones. Has to be true when integrating via Home Assistant",
                            default: true,
                        },
                        cache_state_persistent: {
                            type: "boolean",
                            title: "Persist cache state",
                            description: "Persist cached state, only used when cache_state: true",
                            default: true,
                        },
                        cache_state_send_on_startup: {
                            type: "boolean",
                            title: "Send cached state on startup",
                            description: "Send cached state on startup, only used when cache_state: true",
                            default: true,
                        },
                        last_seen: {
                            type: "string",
                            enum: ["disable", "ISO_8601", "ISO_8601_local", "epoch"],
                            title: "Last seen",
                            description: "Add a last_seen attribute to MQTT messages, contains date/time of last Zigbee message",
                            default: "disable",
                        },
                        elapsed: {
                            type: "boolean",
                            title: "Elapsed",
                            description: "Add an elapsed attribute to MQTT messages, contains milliseconds since the previous msg",
                            default: false,
                        },
                        network_key: {
                            oneOf: [
                                {
                                    type: "string",
                                    title: "Network key(string)",
                                },
                                {
                                    type: "array",
                                    items: {
                                        type: "number",
                                    },
                                    title: "Network key(array)",
                                },
                            ],
                            title: "Network key",
                            requiresRestart: true,
                            description: "Network encryption key, changing requires re-pairing all devices!",
                            default: [1, 3, 5, 7, 9, 11, 13, 15, 0, 2, 4, 6, 8, 10, 12, 13],
                        },
                        timestamp_format: {
                            type: "string",
                            title: "Timestamp format",
                            requiresRestart: true,
                            description: "Log timestamp format",
                            default: "YYYY-MM-DD HH:mm:ss",
                            examples: ["YYYY-MM-DD HH:mm:ss.SSS"],
                        },
                        transmit_power: {
                            type: ["number", "null"],
                            title: "Transmit power",
                            requiresRestart: true,
                            minimum: -128,
                            maximum: 127,
                            description:
                                "Transmit power of adapter, only available for Z-Stack (CC253*/CC2652/CC1352) adapters, CC2652 = 5dbm, CC1352 max is = 20dbm (5dbm default)",
                        },
                        output: {
                            type: "string",
                            enum: ["attribute_and_json", "attribute", "json"],
                            title: "MQTT output type",
                            description:
                                "Examples when 'state' of a device is published json: topic: 'zigbee2mqtt/my_bulb' payload '{\"state\": \"ON\"}' attribute: topic 'zigbee2mqtt/my_bulb/state' payload 'ON' attribute_and_json: both json and attribute (see above)",
                            default: "json",
                        },
                    },
                },
                health: {
                    title: "Health",
                    description: "Periodically check the health of Zigbee2MQTT",
                    type: "object",
                    properties: {
                        interval: {
                            type: "number",
                            title: "Interval",
                            description: "Interval between checks in minutes",
                            default: 10,
                            minimum: 1,
                            requiresRestart: true,
                        },
                        reset_on_check: {
                            type: "boolean",
                            title: "Reset on check",
                            description:
                                "If true, will reset stats every time the health check is executed (only applicable to stats that can be reset).",
                            default: false,
                        },
                    },
                    required: [],
                },
            },
            required: ["mqtt"],
            definitions: {
                device: {
                    type: "object",
                    properties: {
                        friendly_name: {
                            type: "string",
                            title: "Friendly name",
                            description: "Used in the MQTT topic of a device. By default this is the device ID",
                            readOnly: true,
                        },
                        retain: {
                            type: "boolean",
                            title: "Retain",
                            description: "Retain MQTT messages of this device",
                        },
                        disabled: {
                            type: "boolean",
                            title: "Disabled",
                            description: "Disables the device (excludes device from network scans, availability and group state updates)",
                            requiresRestart: true,
                        },
                        retention: {
                            type: "number",
                            title: "Retention",
                            description: "Sets the MQTT Message Expiry in seconds, Make sure to set mqtt.version to 5",
                        },
                        qos: {
                            type: ["number"],
                            enum: [0, 1, 2],
                            title: "QoS",
                            description: "QoS level for MQTT messages of this device",
                        },
                        throttle: {
                            type: "number",
                            title: "Throttle",
                            description:
                                "The minimum time between payloads in seconds. Payloads received whilst the device is being throttled will be discarded",
                            requiresRestart: true,
                        },
                        debounce: {
                            type: "number",
                            title: "Debounce",
                            description: "Debounces messages of this device",
                            requiresRestart: true,
                        },
                        debounce_ignore: {
                            type: "array",
                            items: {
                                type: "string",
                            },
                            examples: ["action"],
                            title: "Ignore debounce",
                            description: "Protects unique payload values of specified payload properties from overriding within debounce time",
                        },
                        optimistic: {
                            type: "boolean",
                            title: "Optimistic",
                            description: "Publish optimistic state after set",
                            default: true,
                        },
                        filtered_attributes: {
                            type: "array",
                            items: {
                                type: "string",
                            },
                            examples: ["^temperature$", "^battery$", "^action$"],
                            title: "Filtered publish attributes",
                            description: "Filter attributes with regex from published payload.",
                        },
                        filtered_cache: {
                            type: "array",
                            items: {
                                type: "string",
                            },
                            examples: ["^input_actions$"],
                            title: "Filtered attributes from cache",
                            description:
                                "Filter attributes with regex from being added to the cache, this prevents the attribute from being in the published payload when the value didn't change.",
                        },
                        filtered_optimistic: {
                            type: "array",
                            items: {
                                type: "string",
                            },
                            examples: ["^color_(mode|temp)$", "color"],
                            title: "Filtered optimistic attributes",
                            description:
                                "Filter attributes with regex from optimistic publish payload when calling /set. (This has no effect if optimistic is set to false).",
                        },
                        icon: {
                            type: "string",
                            title: "Icon",
                            description:
                                "The user-defined device icon for the frontend. It can be a full URL link to an image (e.g. https://SOME.SITE/MODEL123.jpg) or a path to a local file inside the `device_icons` directory (e.g. device_icons/MODEL123.png).",
                        },
                        homeassistant: {
                            type: ["object", "null"],
                            title: "Home Assistant",
                            properties: {
                                name: {
                                    type: "string",
                                    title: "Home Assistant name",
                                    description: "Name of the device in Home Assistant",
                                },
                            },
                        },
                    },
                    required: ["friendly_name"],
                },
                group: {
                    type: "object",
                    properties: {
                        friendly_name: {
                            type: "string",
                        },
                        retain: {
                            type: "boolean",
                        },
                        optimistic: {
                            type: "boolean",
                        },
                        qos: {
                            type: ["number"],
                            enum: [0, 1, 2],
                            title: "QoS",
                            description: "QoS level for MQTT messages of this group",
                        },
                        off_state: {
                            type: ["string"],
                            enum: ["all_members_off", "last_member_state"],
                            title: "Group off state",
                            default: "all_members_off",
                            requiresRestart: true,
                            description:
                                "Control when to publish state OFF or CLOSE for a group. 'all_members_off': only publish state OFF/CLOSE when all group members are in state OFF/CLOSE,  'last_member_state': publish state OFF whenever one of its members changes to OFF",
                        },
                        filtered_attributes: {
                            type: "array",
                            items: {
                                type: "string",
                            },
                        },
                    },
                    required: ["friendly_name"],
                },
            },
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
