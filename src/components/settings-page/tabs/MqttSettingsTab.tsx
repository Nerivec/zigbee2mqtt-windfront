import {
    faEnvelope,
    faLock,
    faPowerOff,
    faServer,
    faShieldAlt,
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

type MqttSettingsTabProps = {
    sourceIdx: number;
};

export default function MqttSettingsTab({ sourceIdx }: MqttSettingsTabProps) {
    const bridgeInfo = useAppStore(useShallow((state) => state.bridgeInfo[sourceIdx]));

    const mqttConfig = bridgeInfo?.config?.mqtt as Record<string, unknown> | undefined;

    const setSettings = useCallback(
        async (options: Record<string, unknown>) => {
            await sendMessage(sourceIdx, "bridge/request/options", { options: { mqtt: options } });
        },
        [sourceIdx],
    );

    // Track if TLS section should be expanded
    const [showTls, setShowTls] = useState(() => {
        const ca = mqttConfig?.ca as string | undefined;
        const key = mqttConfig?.key as string | undefined;
        const cert = mqttConfig?.cert as string | undefined;
        return !!(ca || key || cert);
    });

    // Extract current values - Broker Connection
    const server = (mqttConfig?.server as string) ?? "";
    const baseTopic = (mqttConfig?.base_topic as string) ?? "zigbee2mqtt";
    const keepalive = (mqttConfig?.keepalive as number) ?? 60;
    const clientId = (mqttConfig?.client_id as string) ?? "";
    const version = (mqttConfig?.version as number | null) ?? 4;

    // Authentication
    const user = (mqttConfig?.user as string) ?? "";
    const password = (mqttConfig?.password as string) ?? "";

    // TLS/SSL
    const ca = (mqttConfig?.ca as string) ?? "";
    const key = (mqttConfig?.key as string) ?? "";
    const cert = (mqttConfig?.cert as string) ?? "";
    const rejectUnauthorized = (mqttConfig?.reject_unauthorized as boolean) ?? true;

    // Message Options
    const forceDisableRetain = (mqttConfig?.force_disable_retain as boolean) ?? false;
    const includeDeviceInformation = (mqttConfig?.include_device_information as boolean) ?? false;
    const maximumPacketSize = (mqttConfig?.maximum_packet_size as number) ?? 1048576;

    if (!bridgeInfo) {
        return (
            <div className="flex items-center justify-center p-8">
                <span className="loading loading-spinner loading-lg" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Section 1: Broker Connection */}
            <Section
                title="Broker Connection"
                icon={faServer}
                iconColor="text-primary"
                description="Configure connection to your MQTT broker"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                        name="server"
                        label="Server URL"
                        detail="MQTT broker URL. Use mqtt:// for unencrypted, mqtts:// for TLS. Examples: mqtt://localhost:1883, mqtts://broker.example.com:8883"
                        initialValue={server}
                        required
                        onSubmit={(value) => setSettings({ server: value })}
                    />
                    <InputField
                        name="base_topic"
                        label="Base Topic"
                        detail="Root MQTT topic for all Zigbee2MQTT messages. Devices will publish to {base_topic}/{device_name}."
                        initialValue={baseTopic}
                        onSubmit={(value) => setSettings({ base_topic: value || "zigbee2mqtt" })}
                    />
                    <NumberField
                        name="keepalive"
                        label="Keepalive (seconds)"
                        detail="How often to send keepalive pings to the broker. Lower values detect disconnections faster but increase network traffic."
                        initialValue={keepalive}
                        min={10}
                        max={3600}
                        onSubmit={(value, valid) => valid && setSettings({ keepalive: value })}
                    />
                    <InputField
                        name="client_id"
                        label="Client ID"
                        detail="Unique identifier for this MQTT client. Leave empty for auto-generated ID. Must be unique if running multiple Zigbee2MQTT instances."
                        initialValue={clientId}
                        onSubmit={(value) => setSettings({ client_id: value || null })}
                    />
                    <SelectField
                        name="version"
                        label="MQTT Protocol Version"
                        detail="MQTT protocol version. Most brokers support version 4 (3.1.1). Use version 5 for enhanced features like message expiry."
                        value={version ?? 4}
                        onChange={(e) => setSettings({ version: e.target.value ? Number(e.target.value) : null })}
                    >
                        <option value={3}>3 (MQTT 3.1)</option>
                        <option value={4}>4 (MQTT 3.1.1)</option>
                        <option value={5}>5 (MQTT 5.0)</option>
                    </SelectField>
                </div>
            </Section>

            {/* Section 2: Authentication */}
            <Section
                title="Authentication"
                icon={faLock}
                iconColor="text-warning"
                description="Credentials for MQTT broker authentication"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                        name="user"
                        label="Username"
                        detail="MQTT broker username. Leave empty if your broker doesn't require authentication."
                        initialValue={user}
                        onSubmit={(value) => setSettings({ user: value || null })}
                    />
                    <InputField
                        name="password"
                        label="Password"
                        type="password"
                        detail="MQTT broker password."
                        initialValue={password}
                        onSubmit={(value) => setSettings({ password: value || null })}
                    />
                </div>
            </Section>

            {/* Section 3: TLS/SSL */}
            <Section
                title="TLS/SSL Security"
                icon={faShieldAlt}
                iconColor="text-success"
                description="Configure encrypted connections and client certificates"
            >
                <div className="form-control mb-4">
                    <label className="label cursor-pointer justify-start gap-3">
                        <input
                            type="checkbox"
                            className="checkbox checkbox-primary"
                            checked={showTls}
                            onChange={(e) => setShowTls(e.target.checked)}
                        />
                        <span className="label-text">Configure TLS certificates</span>
                    </label>
                    <p className="text-sm opacity-70 ml-10">
                        Enable to configure custom CA certificates or client authentication. Not needed for most setups using mqtts:// with public CAs.
                    </p>
                </div>

                {showTls && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField
                                name="ca"
                                label="CA Certificate Path"
                                detail="Path to Certificate Authority file for verifying the broker's certificate. Use for self-signed broker certificates."
                                initialValue={ca}
                                onSubmit={(value) => setSettings({ ca: value || null })}
                            />
                            <InputField
                                name="cert"
                                label="Client Certificate Path"
                                detail="Path to client certificate for mutual TLS (mTLS) authentication."
                                initialValue={cert}
                                onSubmit={(value) => setSettings({ cert: value || null })}
                            />
                            <InputField
                                name="key"
                                label="Client Key Path"
                                detail="Path to client private key for mutual TLS (mTLS) authentication."
                                initialValue={key}
                                onSubmit={(value) => setSettings({ key: value || null })}
                            />
                        </div>

                        <div className="mt-4">
                            <CheckboxField
                                name="reject_unauthorized"
                                label="Verify Server Certificate"
                                detail="Verify the broker's TLS certificate against the CA. Disable only for testing with self-signed certificates - not recommended for production."
                                defaultChecked={rejectUnauthorized}
                                onChange={(e) => setSettings({ reject_unauthorized: e.target.checked })}
                            />
                        </div>
                    </>
                )}
            </Section>

            {/* Section 4: Message Options */}
            <Section
                title="Message Options"
                icon={faEnvelope}
                iconColor="text-info"
                description="Configure MQTT message behavior"
            >
                <div className="space-y-4">
                    <CheckboxField
                        name="force_disable_retain"
                        label="Disable Message Retain"
                        detail="Disable the MQTT retain flag on all messages. Only enable this if your broker doesn't support retained messages (AWS IoT, Azure IoT Hub, Google Cloud IoT). Warning: This will break Home Assistant integration."
                        defaultChecked={forceDisableRetain}
                        onChange={(e) => setSettings({ force_disable_retain: e.target.checked })}
                    />
                    <CheckboxField
                        name="include_device_information"
                        label="Include Device Information"
                        detail="Add device metadata (model, manufacturer, firmware) to every MQTT message. Increases message size but useful for debugging."
                        defaultChecked={includeDeviceInformation}
                        onChange={(e) => setSettings({ include_device_information: e.target.checked })}
                    />
                </div>

                <div className="mt-4">
                    <NumberField
                        name="maximum_packet_size"
                        label="Maximum Packet Size (bytes)"
                        detail="Maximum allowed MQTT packet size. Increase if you see 'packet too large' errors. Your broker must also allow this size."
                        initialValue={maximumPacketSize}
                        min={20}
                        max={268435456}
                        onSubmit={(value, valid) => valid && setSettings({ maximum_packet_size: value })}
                    />
                </div>

                {forceDisableRetain && (
                    <div className="alert alert-error mt-4">
                        <FontAwesomeIcon icon={faShieldAlt} />
                        <div>
                            <strong>Warning:</strong> Disabling message retain will prevent Home Assistant from
                            receiving device states after restart. Only use this with cloud IoT brokers that
                            don't support retain.
                        </div>
                    </div>
                )}
            </Section>

            {/* Restart Notice */}
            <div className="alert alert-warning">
                <FontAwesomeIcon icon={faPowerOff} />
                <span>
                    <strong>Changes require restart.</strong> MQTT connection settings take effect after
                    restarting Zigbee2MQTT.
                </span>
            </div>
        </div>
    );
}
