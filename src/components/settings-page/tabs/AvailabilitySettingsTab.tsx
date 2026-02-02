import {
    faBatteryFull,
    faHeartPulse,
    faPlug,
    faPowerOff,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "../../../store.js";
import { sendMessage } from "../../../websocket/WebSocketManager.js";
import CheckboxField from "../../form-fields/CheckboxField.js";
import NumberField from "../../form-fields/NumberField.js";
import { Section } from "../shared/index.js";

type AvailabilitySettingsTabProps = {
    sourceIdx: number;
};

export default function AvailabilitySettingsTab({ sourceIdx }: AvailabilitySettingsTabProps) {
    const bridgeInfo = useAppStore(useShallow((state) => state.bridgeInfo[sourceIdx]));

    const availabilityConfig = bridgeInfo?.config?.availability as Record<string, unknown> | undefined;
    const activeConfig = availabilityConfig?.active as Record<string, unknown> | undefined;
    const passiveConfig = availabilityConfig?.passive as Record<string, unknown> | undefined;

    const setSettings = useCallback(
        async (options: Record<string, unknown>) => {
            await sendMessage(sourceIdx, "bridge/request/options", { options: { availability: options } });
        },
        [sourceIdx],
    );

    const setActiveSettings = useCallback(
        async (options: Record<string, unknown>) => {
            await sendMessage(sourceIdx, "bridge/request/options", {
                options: { availability: { active: options } },
            });
        },
        [sourceIdx],
    );

    const setPassiveSettings = useCallback(
        async (options: Record<string, unknown>) => {
            await sendMessage(sourceIdx, "bridge/request/options", {
                options: { availability: { passive: options } },
            });
        },
        [sourceIdx],
    );

    // Extract current values
    const isEnabled = (availabilityConfig?.enabled as boolean) ?? false;

    // Active device settings (routers, mains-powered)
    const activeTimeout = (activeConfig?.timeout as number) ?? 10;
    const activeMaxJitter = (activeConfig?.max_jitter as number) ?? 30000;
    const activeBackoff = (activeConfig?.backoff as boolean) ?? true;
    const activePauseOnBackoffGt = (activeConfig?.pause_on_backoff_gt as number) ?? 0;

    // Passive device settings (battery-powered)
    const passiveTimeout = (passiveConfig?.timeout as number) ?? 1500;

    if (!bridgeInfo) {
        return (
            <div className="flex items-center justify-center p-8">
                <span className="loading loading-spinner loading-lg" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Section 1: Enable Availability */}
            <Section
                title="Availability Checking"
                icon={faHeartPulse}
                iconColor="text-success"
                description="Monitor device connectivity and report online/offline status via MQTT"
            >
                <CheckboxField
                    name="enabled"
                    label="Enable Availability"
                    detail="When enabled, Zigbee2MQTT will track whether devices are online or offline and publish their availability status to MQTT."
                    defaultChecked={isEnabled}
                    onChange={(e) => setSettings({ enabled: e.target.checked })}
                />

                {!isEnabled && (
                    <div className="alert alert-info mt-4">
                        <FontAwesomeIcon icon={faHeartPulse} />
                        <div>
                            <strong>Why enable availability?</strong>
                            <p className="text-sm">
                                Availability checking lets Home Assistant and other systems know when a device
                                goes offline, helping you identify network issues or dead batteries.
                            </p>
                        </div>
                    </div>
                )}
            </Section>

            {/* Section 2: Active Devices (only show if enabled) */}
            {isEnabled && (
                <Section
                    title="Active Devices (Routers)"
                    icon={faPlug}
                    iconColor="text-primary"
                    description="Settings for mains-powered devices that route Zigbee traffic"
                >
                    <div className="alert alert-info mb-4">
                        <FontAwesomeIcon icon={faPlug} />
                        <div>
                            <strong>Active devices</strong> are mains-powered devices like smart plugs, light
                            bulbs, and switches. They stay awake and can be pinged to check if they're online.
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <NumberField
                            name="timeout"
                            label="Timeout (minutes)"
                            detail="Mark a device as offline if no message is received within this time. The device will be pinged after half this time to check connectivity."
                            initialValue={activeTimeout}
                            min={1}
                            max={1440}
                            onSubmit={(value, valid) => valid && setActiveSettings({ timeout: value })}
                        />
                        <NumberField
                            name="max_jitter"
                            label="Max Jitter (ms)"
                            detail="Random delay added to ping timing to prevent all devices from being pinged simultaneously. Helps reduce network congestion."
                            initialValue={activeMaxJitter}
                            min={1000}
                            max={60000}
                            onSubmit={(value, valid) => valid && setActiveSettings({ max_jitter: value })}
                        />
                    </div>

                    <div className="divider text-sm">Backoff Settings</div>

                    <div className="space-y-4">
                        <CheckboxField
                            name="backoff"
                            label="Enable Backoff"
                            detail="When a device doesn't respond to pings, gradually increase the interval between pings (x1.5, x3, x6, x12...) to reduce network traffic."
                            defaultChecked={activeBackoff}
                            onChange={(e) => setActiveSettings({ backoff: e.target.checked })}
                        />

                        {activeBackoff && (
                            <NumberField
                                name="pause_on_backoff_gt"
                                label="Pause When Backoff Exceeds (minutes)"
                                detail="Stop pinging a device when the backoff interval exceeds this value. The device will resume being pinged when it sends a new message. Set to 0 to never pause."
                                initialValue={activePauseOnBackoffGt}
                                min={0}
                                max={1440}
                                onSubmit={(value, valid) =>
                                    valid && setActiveSettings({ pause_on_backoff_gt: value })
                                }
                            />
                        )}
                    </div>
                </Section>
            )}

            {/* Section 3: Passive Devices (only show if enabled) */}
            {isEnabled && (
                <Section
                    title="Passive Devices (Battery)"
                    icon={faBatteryFull}
                    iconColor="text-warning"
                    description="Settings for battery-powered devices that sleep most of the time"
                >
                    <div className="alert alert-info mb-4">
                        <FontAwesomeIcon icon={faBatteryFull} />
                        <div>
                            <strong>Passive devices</strong> are battery-powered devices like sensors and
                            remotes. They sleep to conserve power and can't be pinged - we simply wait for
                            their periodic reports.
                        </div>
                    </div>

                    <NumberField
                        name="timeout"
                        label="Timeout (minutes)"
                        detail="Mark a device as offline if no message is received within this time. Set this higher than your device's reporting interval (default 1500 min = ~25 hours for devices that report daily)."
                        initialValue={passiveTimeout}
                        min={1}
                        max={10080}
                        onSubmit={(value, valid) => valid && setPassiveSettings({ timeout: value })}
                    />

                    <div className="alert alert-warning mt-4">
                        <FontAwesomeIcon icon={faBatteryFull} />
                        <div>
                            <strong>Note:</strong> Battery devices report infrequently to save power. A device
                            showing "offline" may just be sleeping - check your device's typical reporting
                            interval before assuming it's failed.
                        </div>
                    </div>
                </Section>
            )}

            {/* Restart Notice */}
            <div className="alert alert-warning">
                <FontAwesomeIcon icon={faPowerOff} />
                <span>
                    <strong>Changes require restart.</strong> Availability settings take effect after
                    restarting Zigbee2MQTT.
                </span>
            </div>
        </div>
    );
}
