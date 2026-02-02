import { faHome, faMagnifyingGlass, faPowerOff, faToggleOn } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "../../../store.js";
import { sendMessage } from "../../../websocket/WebSocketManager.js";
import CheckboxField from "../../form-fields/CheckboxField.js";
import InputField from "../../form-fields/InputField.js";
import { Section } from "../shared/index.js";

type HomeAssistantSettingsTabProps = {
    sourceIdx: number;
};

export default function HomeAssistantSettingsTab({ sourceIdx }: HomeAssistantSettingsTabProps) {
    const bridgeInfo = useAppStore(useShallow((state) => state.bridgeInfo[sourceIdx]));

    const haConfig = bridgeInfo?.config?.homeassistant as Record<string, unknown> | undefined;

    const setSettings = useCallback(
        async (options: Record<string, unknown>) => {
            await sendMessage(sourceIdx, "bridge/request/options", { options: { homeassistant: options } });
        },
        [sourceIdx],
    );

    // Extract current values
    const isEnabled = (haConfig?.enabled as boolean) ?? false;
    const discoveryTopic = (haConfig?.discovery_topic as string) ?? "homeassistant";
    const statusTopic = (haConfig?.status_topic as string) ?? "homeassistant/status";
    const legacyActionSensor = (haConfig?.legacy_action_sensor as boolean) ?? false;
    const experimentalEventEntities = (haConfig?.experimental_event_entities as boolean) ?? false;

    if (!bridgeInfo) {
        return (
            <div className="flex items-center justify-center p-8">
                <span className="loading loading-spinner loading-lg" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Section 1: Integration Toggle */}
            <Section
                title="Home Assistant Integration"
                icon={faHome}
                iconColor="text-info"
                description="Enable MQTT discovery for automatic device integration with Home Assistant"
            >
                <CheckboxField
                    name="enabled"
                    label="Enable Integration"
                    detail="When enabled, Zigbee2MQTT will publish MQTT discovery messages so Home Assistant automatically detects your Zigbee devices."
                    defaultChecked={isEnabled}
                    onChange={(e) => setSettings({ enabled: e.target.checked })}
                />
            </Section>

            {/* Section 2: Discovery Configuration (only show if enabled) */}
            {isEnabled && (
                <Section
                    title="Discovery Settings"
                    icon={faMagnifyingGlass}
                    iconColor="text-primary"
                    description="Configure MQTT topics for Home Assistant discovery"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField
                            name="discovery_topic"
                            label="Discovery Topic"
                            detail="MQTT topic where Home Assistant listens for discovery messages. Change only if you've customized Home Assistant's discovery prefix."
                            initialValue={discoveryTopic}
                            onSubmit={(value) => setSettings({ discovery_topic: value || "homeassistant" })}
                        />
                        <InputField
                            name="status_topic"
                            label="Status Topic"
                            detail="MQTT topic where Home Assistant publishes its online/offline status. Used to resend discovery messages when Home Assistant restarts."
                            initialValue={statusTopic}
                            onSubmit={(value) => setSettings({ status_topic: value || "homeassistant/status" })}
                        />
                    </div>
                </Section>
            )}

            {/* Section 3: Entity Options (only show if enabled) */}
            {isEnabled && (
                <Section
                    title="Entity Options"
                    icon={faToggleOn}
                    iconColor="text-success"
                    description="Configure how device entities appear in Home Assistant"
                >
                    <div className="space-y-4">
                        <CheckboxField
                            name="legacy_action_sensor"
                            label="Legacy Action Sensor"
                            detail="Create an 'action' sensor entity that briefly shows button press events, then resets to empty. This is the legacy behavior - consider using event entities instead."
                            defaultChecked={legacyActionSensor}
                            onChange={(e) => setSettings({ legacy_action_sensor: e.target.checked })}
                        />
                        <CheckboxField
                            name="experimental_event_entities"
                            label="Experimental Event Entities"
                            detail="Create Home Assistant event entities for button presses and other actions. This is experimental and the format may change in future versions."
                            defaultChecked={experimentalEventEntities}
                            onChange={(e) => setSettings({ experimental_event_entities: e.target.checked })}
                        />
                    </div>

                    <div className="alert alert-info mt-4">
                        <FontAwesomeIcon icon={faHome} />
                        <div>
                            <strong>Tip:</strong> Event entities provide a cleaner way to handle button presses in
                            automations compared to legacy action sensors.
                        </div>
                    </div>
                </Section>
            )}

            {/* Restart Notice */}
            <div className="alert alert-warning">
                <FontAwesomeIcon icon={faPowerOff} />
                <span>
                    <strong>Changes require restart.</strong> Enabling or disabling Home Assistant integration
                    requires restarting Zigbee2MQTT.
                </span>
            </div>
        </div>
    );
}
