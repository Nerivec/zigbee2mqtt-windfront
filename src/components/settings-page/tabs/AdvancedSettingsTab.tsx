import {
    faBug,
    faCode,
    faDatabase,
    faExclamationTriangle,
    faFileLines,
    faNetworkWired,
    faPowerOff,
    faServer,
    faSliders,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "../../../store.js";
import { sendMessage } from "../../../websocket/WebSocketManager.js";
import CheckboxField from "../../form-fields/CheckboxField.js";
import InputField from "../../form-fields/InputField.js";
import NumberField from "../../form-fields/NumberField.js";
import SelectField from "../../form-fields/SelectField.js";
import { Section } from "../shared/index.js";

type AdvancedSettingsTabProps = {
    sourceIdx: number;
};

export default function AdvancedSettingsTab({ sourceIdx }: AdvancedSettingsTabProps) {
    const bridgeInfo = useAppStore(useShallow((state) => state.bridgeInfo[sourceIdx]));

    const advancedConfig = bridgeInfo?.config?.advanced as Record<string, unknown> | undefined;
    const syslogConfig = advancedConfig?.log_syslog as Record<string, unknown> | null | undefined;

    const setSettings = useCallback(
        async (options: Record<string, unknown>) => {
            await sendMessage(sourceIdx, "bridge/request/options", { options: { advanced: options } });
        },
        [sourceIdx],
    );

    // Track collapsible sections
    const [showDebug, setShowDebug] = useState(
        () => (advancedConfig?.log_debug_to_mqtt_frontend as boolean) ?? false,
    );
    const [showSyslog, setShowSyslog] = useState(() => syslogConfig !== null && syslogConfig !== undefined);
    const [showNetworkKey, setShowNetworkKey] = useState(false);

    // Logging settings
    const logLevel = (advancedConfig?.log_level as string) ?? "info";
    const logOutput = (advancedConfig?.log_output as string[]) ?? ["console", "file"];
    const logDirectory = (advancedConfig?.log_directory as string) ?? "";
    const logFile = (advancedConfig?.log_file as string) ?? "log.log";
    const logRotation = (advancedConfig?.log_rotation as boolean) ?? true;
    const logConsoleJson = (advancedConfig?.log_console_json as boolean) ?? false;
    const logSymlinkCurrent = (advancedConfig?.log_symlink_current as boolean) ?? false;
    const logDirectoriesToKeep = (advancedConfig?.log_directories_to_keep as number) ?? 10;

    // Debug logging
    const logDebugToMqttFrontend = (advancedConfig?.log_debug_to_mqtt_frontend as boolean) ?? false;
    const logDebugNamespaceIgnore = (advancedConfig?.log_debug_namespace_ignore as string) ?? "";

    // Syslog
    const syslogHost = (syslogConfig?.host as string) ?? "localhost";
    const syslogPort = (syslogConfig?.port as number) ?? 514;
    const syslogProtocol = (syslogConfig?.protocol as string) ?? "udp4";
    const syslogPath = (syslogConfig?.path as string) ?? "/dev/log";
    const syslogAppName = (syslogConfig?.app_name as string) ?? "Zigbee2MQTT";
    const syslogType = (syslogConfig?.type as string) ?? "5424";

    // Zigbee Network
    const channel = (advancedConfig?.channel as number) ?? 11;
    const panId = advancedConfig?.pan_id as number | string | undefined;
    const extPanId = advancedConfig?.ext_pan_id as number[] | string | undefined;
    const networkKey = advancedConfig?.network_key as number[] | string | undefined;

    // Adapter Tuning
    const adapterConcurrent = (advancedConfig?.adapter_concurrent as number | null) ?? null;
    const adapterDelay = (advancedConfig?.adapter_delay as number | null) ?? null;
    const transmitPower = (advancedConfig?.transmit_power as number | null) ?? null;

    // State & Caching
    const cacheState = (advancedConfig?.cache_state as boolean) ?? true;
    const cacheStatePersistent = (advancedConfig?.cache_state_persistent as boolean) ?? true;
    const cacheStateSendOnStartup = (advancedConfig?.cache_state_send_on_startup as boolean) ?? true;
    const lastSeen = (advancedConfig?.last_seen as string) ?? "disable";
    const elapsed = (advancedConfig?.elapsed as boolean) ?? false;

    // Output Format
    const timestampFormat = (advancedConfig?.timestamp_format as string) ?? "YYYY-MM-DD HH:mm:ss";

    // Format display values
    const formatPanId = () => {
        if (panId === undefined) return "";
        if (typeof panId === "number") return `0x${panId.toString(16).toUpperCase().padStart(4, "0")}`;
        return String(panId);
    };

    const formatExtPanId = () => {
        if (extPanId === undefined) return "";
        if (Array.isArray(extPanId)) return extPanId.map((n) => n.toString(16).toUpperCase().padStart(2, "0")).join("");
        return String(extPanId);
    };

    const formatNetworkKey = () => {
        if (networkKey === undefined) return "";
        if (Array.isArray(networkKey))
            return networkKey.map((n) => n.toString(16).toUpperCase().padStart(2, "0")).join("");
        return String(networkKey);
    };

    if (!bridgeInfo) {
        return (
            <div className="flex items-center justify-center p-8">
                <span className="loading loading-spinner loading-lg" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Section 1: Logging */}
            <Section
                title="Logging"
                icon={faFileLines}
                iconColor="text-info"
                description="Configure log output and retention"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SelectField
                        name="log_level"
                        label="Log Level"
                        detail="Amount of detail in logs. 'info' is recommended for normal use."
                        value={logLevel}
                        onChange={(e) => setSettings({ log_level: e.target.value })}
                    >
                        <option value="error">Error - Only errors</option>
                        <option value="warning">Warning - Errors and warnings</option>
                        <option value="info">Info - Normal operation (recommended)</option>
                        <option value="debug">Debug - Verbose troubleshooting</option>
                    </SelectField>

                    <div className="space-y-2">
                        <label className="fieldset-legend">Log Output</label>
                        <div className="flex flex-wrap gap-2">
                            <label className="label cursor-pointer gap-2">
                                <input
                                    type="checkbox"
                                    className="checkbox checkbox-sm"
                                    checked={logOutput.includes("console")}
                                    onChange={(e) => {
                                        const newOutput = e.target.checked
                                            ? [...logOutput, "console"]
                                            : logOutput.filter((o) => o !== "console");
                                        setSettings({ log_output: newOutput });
                                    }}
                                />
                                <span className="label-text">Console</span>
                            </label>
                            <label className="label cursor-pointer gap-2">
                                <input
                                    type="checkbox"
                                    className="checkbox checkbox-sm"
                                    checked={logOutput.includes("file")}
                                    onChange={(e) => {
                                        const newOutput = e.target.checked
                                            ? [...logOutput, "file"]
                                            : logOutput.filter((o) => o !== "file");
                                        setSettings({ log_output: newOutput });
                                    }}
                                />
                                <span className="label-text">File</span>
                            </label>
                            <label className="label cursor-pointer gap-2">
                                <input
                                    type="checkbox"
                                    className="checkbox checkbox-sm"
                                    checked={logOutput.includes("syslog")}
                                    onChange={(e) => {
                                        const newOutput = e.target.checked
                                            ? [...logOutput, "syslog"]
                                            : logOutput.filter((o) => o !== "syslog");
                                        setSettings({ log_output: newOutput });
                                        if (e.target.checked) setShowSyslog(true);
                                    }}
                                />
                                <span className="label-text">Syslog</span>
                            </label>
                        </div>
                        <p className="label text-xs">Where to send log messages</p>
                    </div>
                </div>

                {logOutput.includes("file") && (
                    <>
                        <div className="divider text-sm">File Logging</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField
                                name="log_directory"
                                label="Log Directory"
                                detail="Directory for log files. Use %TIMESTAMP% for date-based folders."
                                initialValue={logDirectory}
                                onSubmit={(value) => setSettings({ log_directory: value || undefined })}
                            />
                            <InputField
                                name="log_file"
                                label="Log Filename"
                                detail="Log filename. Use %TIMESTAMP% for date in filename."
                                initialValue={logFile}
                                onSubmit={(value) => setSettings({ log_file: value || "log.log" })}
                            />
                            <NumberField
                                name="log_directories_to_keep"
                                label="Log Folders to Keep"
                                detail="Number of old log directories to retain before deleting."
                                initialValue={logDirectoriesToKeep}
                                min={5}
                                max={1000}
                                onSubmit={(value, valid) =>
                                    valid && setSettings({ log_directories_to_keep: value })
                                }
                            />
                        </div>
                        <div className="space-y-2 mt-4">
                            <CheckboxField
                                name="log_rotation"
                                label="Log Rotation"
                                detail="Create new log directory for each Zigbee2MQTT start."
                                defaultChecked={logRotation}
                                onChange={(e) => setSettings({ log_rotation: e.target.checked })}
                            />
                            <CheckboxField
                                name="log_symlink_current"
                                label="Create 'current' Symlink"
                                detail="Create a symlink to the current log directory for easy access."
                                defaultChecked={logSymlinkCurrent}
                                onChange={(e) => setSettings({ log_symlink_current: e.target.checked })}
                            />
                        </div>
                    </>
                )}

                {logOutput.includes("console") && (
                    <div className="mt-4">
                        <CheckboxField
                            name="log_console_json"
                            label="Console JSON Format"
                            detail="Output console logs as JSON. Useful for log aggregation systems like Loki."
                            defaultChecked={logConsoleJson}
                            onChange={(e) => setSettings({ log_console_json: e.target.checked })}
                        />
                    </div>
                )}
            </Section>

            {/* Section 2: Debug Logging (collapsible) */}
            <Section
                title="Debug Logging"
                icon={faBug}
                iconColor="text-warning"
                description="Advanced debugging options for troubleshooting"
            >
                <div className="form-control mb-4">
                    <label className="label cursor-pointer justify-start gap-3">
                        <input
                            type="checkbox"
                            className="checkbox checkbox-warning"
                            checked={showDebug}
                            onChange={(e) => {
                                setShowDebug(e.target.checked);
                                if (!e.target.checked) {
                                    setSettings({ log_debug_to_mqtt_frontend: false });
                                }
                            }}
                        />
                        <span className="label-text font-medium">Enable Debug Options</span>
                    </label>
                </div>

                {showDebug && (
                    <div className="space-y-4">
                        <CheckboxField
                            name="log_debug_to_mqtt_frontend"
                            label="Send Debug to MQTT/Frontend"
                            detail="Send debug-level logs to MQTT and the web frontend. Warning: This can significantly impact performance."
                            defaultChecked={logDebugToMqttFrontend}
                            onChange={(e) => setSettings({ log_debug_to_mqtt_frontend: e.target.checked })}
                        />

                        <InputField
                            name="log_debug_namespace_ignore"
                            label="Ignore Namespaces (Regex)"
                            detail="Regex pattern for debug namespaces to ignore. Example: ^zhc:legacy:fz:(tuya|moes)"
                            initialValue={logDebugNamespaceIgnore}
                            onSubmit={(value) => setSettings({ log_debug_namespace_ignore: value })}
                        />

                        <div className="alert alert-warning">
                            <FontAwesomeIcon icon={faBug} />
                            <div>
                                Debug logging generates a large volume of messages. Only enable temporarily
                                when troubleshooting specific issues.
                            </div>
                        </div>
                    </div>
                )}
            </Section>

            {/* Section 3: Syslog (collapsible) */}
            {logOutput.includes("syslog") && (
                <Section
                    title="Syslog Configuration"
                    icon={faServer}
                    iconColor="text-secondary"
                    description="Configure remote syslog server"
                >
                    <div className="form-control mb-4">
                        <label className="label cursor-pointer justify-start gap-3">
                            <input
                                type="checkbox"
                                className="checkbox checkbox-secondary"
                                checked={showSyslog}
                                onChange={(e) => {
                                    setShowSyslog(e.target.checked);
                                    if (!e.target.checked) {
                                        setSettings({ log_syslog: null });
                                    }
                                }}
                            />
                            <span className="label-text font-medium">Configure Syslog Server</span>
                        </label>
                    </div>

                    {showSyslog && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField
                                name="syslog_host"
                                label="Host"
                                detail="Syslog server hostname or IP address."
                                initialValue={syslogHost}
                                onSubmit={(value) =>
                                    setSettings({ log_syslog: { ...syslogConfig, host: value || "localhost" } })
                                }
                            />
                            <NumberField
                                name="syslog_port"
                                label="Port"
                                detail="Syslog server port (default: 514)."
                                initialValue={syslogPort}
                                min={1}
                                max={65535}
                                onSubmit={(value, valid) =>
                                    valid && setSettings({ log_syslog: { ...syslogConfig, port: value } })
                                }
                            />
                            <SelectField
                                name="syslog_protocol"
                                label="Protocol"
                                detail="Network protocol for syslog transport."
                                value={syslogProtocol}
                                onChange={(e) =>
                                    setSettings({ log_syslog: { ...syslogConfig, protocol: e.target.value } })
                                }
                            >
                                <option value="udp4">UDP (udp4)</option>
                                <option value="tcp4">TCP (tcp4)</option>
                                <option value="tls4">TLS (tls4)</option>
                                <option value="unix">Unix Socket (unix)</option>
                                <option value="unix-connect">Unix Connect (unix-connect)</option>
                            </SelectField>
                            <SelectField
                                name="syslog_type"
                                label="Format"
                                detail="Syslog message format."
                                value={syslogType}
                                onChange={(e) =>
                                    setSettings({ log_syslog: { ...syslogConfig, type: e.target.value } })
                                }
                            >
                                <option value="5424">RFC 5424 (modern)</option>
                                <option value="BSD">BSD (legacy)</option>
                            </SelectField>
                            <InputField
                                name="syslog_path"
                                label="Socket Path"
                                detail="Unix socket path (only for unix protocol)."
                                initialValue={syslogPath}
                                onSubmit={(value) =>
                                    setSettings({ log_syslog: { ...syslogConfig, path: value || "/dev/log" } })
                                }
                            />
                            <InputField
                                name="syslog_app_name"
                                label="Application Name"
                                detail="App name in syslog messages."
                                initialValue={syslogAppName}
                                onSubmit={(value) =>
                                    setSettings({
                                        log_syslog: { ...syslogConfig, app_name: value || "Zigbee2MQTT" },
                                    })
                                }
                            />
                        </div>
                    )}
                </Section>
            )}

            {/* Section 4: Zigbee Network */}
            <Section
                title="Zigbee Network"
                icon={faNetworkWired}
                iconColor="text-primary"
                description="Network identifiers and encryption"
            >
                <div className="alert alert-error mb-4">
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    <div>
                        <strong>Warning:</strong> Changing network settings (channel, PAN ID, or network
                        key) will require re-pairing all your devices!
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <NumberField
                        name="channel"
                        label="Zigbee Channel"
                        detail="Radio channel (11-26). Recommended ZLL channels: 11, 15, 20, 25. Avoid 26 (some devices don't support it)."
                        initialValue={channel}
                        min={11}
                        max={26}
                        onSubmit={(value, valid) => valid && setSettings({ channel: value })}
                    />
                    <InputField
                        name="pan_id"
                        label="PAN ID"
                        detail="Personal Area Network ID (hex, e.g., 0x1A62). Used to identify your Zigbee network."
                        initialValue={formatPanId()}
                        onSubmit={(value) => {
                            if (!value) return;
                            const num = Number.parseInt(value.replace("0x", ""), 16);
                            if (!Number.isNaN(num)) setSettings({ pan_id: num });
                        }}
                    />
                    <InputField
                        name="ext_pan_id"
                        label="Extended PAN ID"
                        detail="64-bit extended PAN ID (hex string). Provides additional network identification."
                        initialValue={formatExtPanId()}
                        onSubmit={(value) => {
                            if (!value) return;
                            // Convert hex string to array of numbers
                            const bytes: number[] = [];
                            for (let i = 0; i < value.length; i += 2) {
                                bytes.push(Number.parseInt(value.substr(i, 2), 16));
                            }
                            if (bytes.length === 8 && bytes.every((b) => !Number.isNaN(b))) {
                                setSettings({ ext_pan_id: bytes });
                            }
                        }}
                    />
                </div>

                <div className="divider text-sm">Network Encryption Key</div>

                <div className="form-control mb-4">
                    <label className="label cursor-pointer justify-start gap-3">
                        <input
                            type="checkbox"
                            className="checkbox checkbox-error"
                            checked={showNetworkKey}
                            onChange={(e) => setShowNetworkKey(e.target.checked)}
                        />
                        <span className="label-text font-medium">Show Network Key</span>
                    </label>
                    <p className="text-sm opacity-70 ml-10">
                        The network key encrypts all Zigbee traffic. Keep it secret.
                    </p>
                </div>

                {showNetworkKey && (
                    <InputField
                        name="network_key"
                        label="Network Key"
                        detail="128-bit encryption key (32 hex characters). Changing this requires re-pairing all devices."
                        initialValue={formatNetworkKey()}
                        onSubmit={(value) => {
                            if (!value) return;
                            const bytes: number[] = [];
                            for (let i = 0; i < value.length; i += 2) {
                                bytes.push(Number.parseInt(value.substr(i, 2), 16));
                            }
                            if (bytes.length === 16 && bytes.every((b) => !Number.isNaN(b))) {
                                setSettings({ network_key: bytes });
                            }
                        }}
                    />
                )}
            </Section>

            {/* Section 5: Adapter Tuning */}
            <Section
                title="Adapter Tuning"
                icon={faSliders}
                iconColor="text-success"
                description="Performance settings for your Zigbee adapter"
            >
                <div className="alert alert-info mb-4">
                    <FontAwesomeIcon icon={faSliders} />
                    <div>
                        Leave these at default unless you're experiencing issues. Wrong values can cause
                        network instability.
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <NumberField
                        name="adapter_concurrent"
                        label="Concurrent Requests"
                        detail="Number of simultaneous requests to the adapter. Higher values may improve speed on powerful adapters. Leave empty for auto."
                        initialValue={adapterConcurrent ?? ""}
                        min={1}
                        max={64}
                        onSubmit={(value, valid) =>
                            valid && setSettings({ adapter_concurrent: value || null })
                        }
                    />
                    <NumberField
                        name="adapter_delay"
                        label="Request Delay (ms)"
                        detail="Delay between adapter requests. Increase if experiencing communication errors. Leave empty for auto."
                        initialValue={adapterDelay ?? ""}
                        min={0}
                        max={1000}
                        onSubmit={(value, valid) => valid && setSettings({ adapter_delay: value || null })}
                    />
                    <NumberField
                        name="transmit_power"
                        label="Transmit Power (dBm)"
                        detail="Radio transmission power. Higher values increase range but may cause interference. Leave empty for adapter default."
                        initialValue={transmitPower ?? ""}
                        min={-128}
                        max={127}
                        onSubmit={(value, valid) =>
                            valid && setSettings({ transmit_power: value || null })
                        }
                    />
                </div>
            </Section>

            {/* Section 6: State & Caching */}
            <Section
                title="State & Caching"
                icon={faDatabase}
                iconColor="text-purple-500"
                description="Device state persistence and MQTT message behavior"
            >
                <div className="space-y-4">
                    <CheckboxField
                        name="cache_state"
                        label="Cache Device State"
                        detail="Include all device attributes in MQTT messages, not just changed ones. Required for Home Assistant integration."
                        defaultChecked={cacheState}
                        onChange={(e) => setSettings({ cache_state: e.target.checked })}
                    />

                    {cacheState && (
                        <>
                            <CheckboxField
                                name="cache_state_persistent"
                                label="Persist State to Disk"
                                detail="Save device states to disk so they survive Zigbee2MQTT restarts."
                                defaultChecked={cacheStatePersistent}
                                onChange={(e) => setSettings({ cache_state_persistent: e.target.checked })}
                            />
                            <CheckboxField
                                name="cache_state_send_on_startup"
                                label="Send State on Startup"
                                detail="Publish cached device states when Zigbee2MQTT starts."
                                defaultChecked={cacheStateSendOnStartup}
                                onChange={(e) =>
                                    setSettings({ cache_state_send_on_startup: e.target.checked })
                                }
                            />
                        </>
                    )}
                </div>

                <div className="divider text-sm">Message Enrichment</div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SelectField
                        name="last_seen"
                        label="Last Seen"
                        detail="Add timestamp of last message to device state."
                        value={lastSeen}
                        onChange={(e) => setSettings({ last_seen: e.target.value })}
                    >
                        <option value="disable">Disabled</option>
                        <option value="ISO_8601">ISO 8601 (UTC)</option>
                        <option value="ISO_8601_local">ISO 8601 (Local)</option>
                        <option value="epoch">Unix Epoch (ms)</option>
                    </SelectField>
                    <div className="flex flex-col justify-center">
                        <CheckboxField
                            name="elapsed"
                            label="Include Elapsed Time"
                            detail="Add milliseconds since previous message to each device update."
                            defaultChecked={elapsed}
                            onChange={(e) => setSettings({ elapsed: e.target.checked })}
                        />
                    </div>
                </div>
            </Section>

            {/* Section 7: Output Format */}
            <Section
                title="Output Format"
                icon={faCode}
                iconColor="text-orange-500"
                description="Timestamp formatting"
            >
                <InputField
                    name="timestamp_format"
                    label="Timestamp Format"
                    detail="Format string for log timestamps. See fecha documentation for tokens (YYYY, MM, DD, HH, mm, ss, SSS)."
                    initialValue={timestampFormat}
                    onSubmit={(value) => setSettings({ timestamp_format: value || "YYYY-MM-DD HH:mm:ss" })}
                />
                <p className="text-sm opacity-70 mt-2">
                    Preview:{" "}
                    <code className="bg-base-300 px-1 rounded">
                        {new Date().toISOString().replace("T", " ").split(".")[0]}
                    </code>
                </p>
            </Section>

            {/* Restart Notice */}
            <div className="alert alert-warning">
                <FontAwesomeIcon icon={faPowerOff} />
                <span>
                    <strong>Many changes require restart.</strong> Network, logging, and adapter settings
                    take effect after restarting Zigbee2MQTT.
                </span>
            </div>
        </div>
    );
}
