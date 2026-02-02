import {
    faCloudArrowDown,
    faGaugeHigh,
    faGear,
    faPowerOff,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "../../../store.js";
import { sendMessage } from "../../../websocket/WebSocketManager.js";
import CheckboxField from "../../form-fields/CheckboxField.js";
import InputField from "../../form-fields/InputField.js";
import NumberField from "../../form-fields/NumberField.js";
import { Section } from "../shared/index.js";

type OtaSettingsTabProps = {
    sourceIdx: number;
};

export default function OtaSettingsTab({ sourceIdx }: OtaSettingsTabProps) {
    const bridgeInfo = useAppStore(useShallow((state) => state.bridgeInfo[sourceIdx]));

    const otaConfig = bridgeInfo?.config?.ota as Record<string, unknown> | undefined;

    const setSettings = useCallback(
        async (options: Record<string, unknown>) => {
            await sendMessage(sourceIdx, "bridge/request/options", { options: { ota: options } });
        },
        [sourceIdx],
    );

    // Extract current values
    const updateCheckInterval = (otaConfig?.update_check_interval as number) ?? 1440;
    const disableAutomaticUpdateCheck = (otaConfig?.disable_automatic_update_check as boolean) ?? false;
    const imageBlockResponseDelay = (otaConfig?.image_block_response_delay as number) ?? 250;
    const defaultMaximumDataSize = (otaConfig?.default_maximum_data_size as number) ?? 50;
    const zigbeeOtaOverrideIndexLocation =
        (otaConfig?.zigbee_ota_override_index_location as string) ?? "";

    if (!bridgeInfo) {
        return (
            <div className="flex items-center justify-center p-8">
                <span className="loading loading-spinner loading-lg" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Intro Alert */}
            <div className="alert alert-info">
                <FontAwesomeIcon icon={faCloudArrowDown} />
                <div>
                    <strong>Over-the-Air Updates</strong>
                    <p className="text-sm">
                        Zigbee devices can receive firmware updates wirelessly. Zigbee2MQTT checks for
                        available updates from manufacturer servers and can download them to your devices.
                    </p>
                </div>
            </div>

            {/* Section 1: Update Checking */}
            <Section
                title="Update Checking"
                icon={faCloudArrowDown}
                iconColor="text-info"
                description="Control when and how firmware updates are discovered"
            >
                <div className="space-y-4">
                    <CheckboxField
                        name="disable_automatic_update_check"
                        label="Disable Automatic Update Checks"
                        detail="When enabled, devices won't automatically check for firmware updates. You can still manually check for updates from the OTA page."
                        defaultChecked={disableAutomaticUpdateCheck}
                        onChange={(e) => setSettings({ disable_automatic_update_check: e.target.checked })}
                    />

                    {!disableAutomaticUpdateCheck && (
                        <NumberField
                            name="update_check_interval"
                            label="Check Interval (minutes)"
                            detail="How often to check manufacturer servers for firmware updates. Default is 1440 minutes (24 hours). Lower values mean more frequent checks but more network traffic."
                            initialValue={updateCheckInterval}
                            min={1}
                            max={10080}
                            onSubmit={(value, valid) => valid && setSettings({ update_check_interval: value })}
                        />
                    )}
                </div>

                {disableAutomaticUpdateCheck && (
                    <div className="alert alert-warning mt-4">
                        <FontAwesomeIcon icon={faCloudArrowDown} />
                        <div>
                            Automatic checks are disabled. Visit the <strong>OTA</strong> page to manually
                            check for and apply firmware updates.
                        </div>
                    </div>
                )}
            </Section>

            {/* Section 2: Transfer Settings */}
            <Section
                title="Transfer Settings"
                icon={faGaugeHigh}
                iconColor="text-warning"
                description="Fine-tune firmware download performance"
            >
                <div className="alert alert-info mb-4">
                    <FontAwesomeIcon icon={faGaugeHigh} />
                    <div>
                        These settings control how firmware is transferred to devices. Adjust if you
                        experience network instability during OTA updates.
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <NumberField
                        name="image_block_response_delay"
                        label="Block Response Delay (ms)"
                        detail="Delay between firmware chunks sent to the device. Increase this if your network becomes unstable during OTA updates."
                        initialValue={imageBlockResponseDelay}
                        min={50}
                        max={2000}
                        onSubmit={(value, valid) =>
                            valid && setSettings({ image_block_response_delay: value })
                        }
                    />
                    <NumberField
                        name="default_maximum_data_size"
                        label="Chunk Size (bytes)"
                        detail="Size of each firmware chunk. Smaller chunks are more reliable but slower. Some manufacturers override this value."
                        initialValue={defaultMaximumDataSize}
                        min={10}
                        max={100}
                        onSubmit={(value, valid) =>
                            valid && setSettings({ default_maximum_data_size: value })
                        }
                    />
                </div>
            </Section>

            {/* Section 3: Advanced */}
            <Section
                title="Advanced"
                icon={faGear}
                iconColor="text-secondary"
                description="Custom firmware index for testing or unsupported devices"
            >
                <InputField
                    name="zigbee_ota_override_index_location"
                    label="Custom OTA Index Location"
                    detail="Path to a custom OTA index file. Use this to provide firmware for devices not in the official index, or to test pre-release firmware. Leave empty to use the official index."
                    initialValue={zigbeeOtaOverrideIndexLocation}
                    onSubmit={(value) => setSettings({ zigbee_ota_override_index_location: value || null })}
                />

                <div className="alert mt-4">
                    <FontAwesomeIcon icon={faGear} />
                    <div>
                        <strong>Custom Index Format:</strong> The override index should be a JSON file with
                        the same structure as the{" "}
                        <a
                            href="https://github.com/Koenkk/zigbee-OTA"
                            target="_blank"
                            rel="noreferrer"
                            className="link link-primary"
                        >
                            official Zigbee OTA repository
                        </a>
                        .
                    </div>
                </div>
            </Section>

            {/* Restart Notice */}
            <div className="alert alert-warning">
                <FontAwesomeIcon icon={faPowerOff} />
                <span>
                    <strong>Some changes require restart.</strong> Transfer settings and custom index
                    location take effect after restarting Zigbee2MQTT.
                </span>
            </div>
        </div>
    );
}
