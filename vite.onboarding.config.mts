import type { IncomingMessage, ServerResponse } from "node:http";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import { compression, defineAlgorithm } from "vite-plugin-compression2";

function onboardingMockPlugin(mode: string): Plugin {
    const failurePage = mode === "ob-failure-page";
    const failSubmit = mode.includes("ob-fail-submit");
    const withoutDevices = mode.includes("ob-without-devices");
    const withNetwork = mode.includes("ob-with-network");
    const settingsSchemaUrl = "https://github.com/Koenkk/zigbee2mqtt/raw/refs/heads/dev/lib/util/settings.schema.json";
    const defaultZ2MConfig = {
        homeassistant: {
            enabled: false,
            discovery_topic: "homeassistant",
            status_topic: "homeassistant/status",
            legacy_action_sensor: false,
            experimental_event_entities: false,
        },
        availability: {
            enabled: false,
            active: { timeout: 10, max_jitter: 30000, backoff: true, pause_on_backoff_gt: 0 },
            passive: { timeout: 1500 },
        },
        frontend: {
            enabled: false,
            package: "zigbee2mqtt-windfront",
            port: 8080,
            base_url: "/",
        },
        mqtt: {
            base_topic: "zigbee2mqtt",
            server: "mqtt://localhost:1883",
            include_device_information: false,
            force_disable_retain: false,
            // 1MB = roughly 3.5KB per device * 300 devices for `/bridge/devices`
            maximum_packet_size: 1048576,
            keepalive: 60,
            reject_unauthorized: true,
            version: 4,
        },
        serial: {
            disable_led: false,
        },
        passlist: [],
        blocklist: [],
        map_options: {
            graphviz: {
                colors: {
                    fill: {
                        enddevice: "#fff8ce",
                        coordinator: "#e04e5d",
                        router: "#4ea3e0",
                    },
                    font: {
                        coordinator: "#ffffff",
                        router: "#ffffff",
                        enddevice: "#000000",
                    },
                    line: {
                        active: "#009900",
                        inactive: "#994444",
                    },
                },
            },
        },
        ota: {
            update_check_interval: 24 * 60,
            disable_automatic_update_check: false,
            image_block_request_timeout: 150000,
            image_block_response_delay: 250,
            default_maximum_data_size: 50,
        },
        device_options: {},
        advanced: {
            log_rotation: true,
            log_console_json: false,
            log_symlink_current: false,
            log_output: ["console", "file"],
            log_directory: "log/%TIMESTAMP%",
            log_file: "log.log",
            log_level: "info",
            log_namespaced_levels: {},
            log_syslog: {},
            log_debug_to_mqtt_frontend: false,
            log_debug_namespace_ignore: "",
            log_directories_to_keep: 10,
            pan_id: withNetwork ? 0x2134 : 0x1a62,
            ext_pan_id: withNetwork ? [0xfe, 0xfe, 0xfe, 0xfe, 0xfe, 0xfe, 0xfe, 0xfe] : [0xdd, 0xdd, 0xdd, 0xdd, 0xdd, 0xdd, 0xdd, 0xdd],
            channel: withNetwork ? 20 : 11,
            adapter_concurrent: undefined,
            adapter_delay: undefined,
            cache_state: true,
            cache_state_persistent: true,
            cache_state_send_on_startup: true,
            last_seen: "disable",
            elapsed: false,
            network_key: withNetwork
                ? [1, 2, 3, 4, 5, 6, 7, 8, 11, 12, 13, 14, 15, 16, 17, 18]
                : [1, 3, 5, 7, 9, 11, 13, 15, 0, 2, 4, 6, 8, 10, 12, 13],
            timestamp_format: "YYYY-MM-DD HH:mm:ss",
            output: "json",
        },
        health: {
            interval: 10,
            reset_on_check: false,
        },
        version: 5,
        onboarding: true,
    };
    const mockDevices = withoutDevices
        ? ([] as const)
        : ([
              { name: "My Device", path: "/dev/serial/by-id/my-device-001", adapter: "ember" },
              { name: "My Device 2", path: "/dev/serial/by-id/my-device-002", adapter: undefined },
              { name: "My Device 3", path: "/dev/serial/by-id/my-device-003", adapter: "zstack", baudRate: 115200 },
              { name: "My Device 4", path: "/dev/serial/by-id/my-device-004", adapter: "ember", rtscts: true },
              { name: "My Device 5", path: "/dev/serial/by-id/my-device-005", adapter: "ember", baudRate: 460800, rtscts: true },
          ] as const);
    const mockFailureErrors = ["mqtt.server is required", "serial.port is required", "advanced.channel must be one of: 11, 15, 20, 25"] as const;
    let settingsSchema: Record<string, unknown> | undefined;

    async function getSettingsSchema(): Promise<Record<string, unknown>> {
        if (!settingsSchema) {
            const response = await fetch(settingsSchemaUrl);

            if (!response.ok) {
                throw new Error(`Could not load settings schema (${response.status})`);
            }

            settingsSchema = (await response.json()) as Record<string, unknown>;
        }

        return settingsSchema;
    }

    function sendJson(res: ServerResponse<IncomingMessage>, status: number, payload: Record<string, unknown>): void {
        res.statusCode = status;

        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(payload));
    }

    return {
        name: "onboarding-mock-api",
        apply: "serve",
        configureServer(server) {
            server.middlewares.use((req, res, next) => {
                const pathname = new URL(req.url ?? "/", "http://localhost").pathname;

                if (req.method === "GET" && pathname === "/data") {
                    void (async () => {
                        if (failurePage) {
                            sendJson(res, 200, { page: "failure", errors: mockFailureErrors });
                        } else {
                            sendJson(res, 200, {
                                page: "form",
                                settings: defaultZ2MConfig,
                                settingsSchema: await getSettingsSchema(),
                                devices: mockDevices,
                            });
                        }
                    })();

                    return;
                }

                if (req.method === "POST") {
                    if (pathname === "/submit") {
                        if (failurePage) {
                            res.statusCode = 200;

                            res.end();
                        } else {
                            sendJson(res, 200, failSubmit ? { success: false, error: mockFailureErrors[0] } : { success: true, frontendUrl: null });
                        }

                        return;
                    }

                    if (pathname === "/submit-zip") {
                        sendJson(res, 200, failSubmit ? { success: false, error: mockFailureErrors[0] } : { success: true, frontendUrl: null });

                        return;
                    }
                }

                next();
            });
        },
    };
}

export default defineConfig(({ mode }) => ({
    root: "src/onboarding",
    base: "",
    build: {
        outDir: "../../dist/onboarding",
        emptyOutDir: true,
    },
    plugins: [react(), tailwindcss(), onboardingMockPlugin(mode), compression({ algorithms: [defineAlgorithm("brotliCompress")] })],
}));
