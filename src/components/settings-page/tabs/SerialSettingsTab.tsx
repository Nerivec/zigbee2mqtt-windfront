import {
    faMicrochip,
    faPowerOff,
    faWaveSquare,
} from "@fortawesome/free-solid-svg-icons";
import { faUsb } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "../../../store.js";
import { sendMessage } from "../../../websocket/WebSocketManager.js";
import CheckboxField from "../../form-fields/CheckboxField.js";
import InputField from "../../form-fields/InputField.js";
import NumberField from "../../form-fields/NumberField.js";
import SelectField from "../../form-fields/SelectField.js";
import { Section } from "../shared/index.js";

type SerialSettingsTabProps = {
    sourceIdx: number;
};

export default function SerialSettingsTab({ sourceIdx }: SerialSettingsTabProps) {
    const bridgeInfo = useAppStore(useShallow((state) => state.bridgeInfo[sourceIdx]));

    const serialConfig = bridgeInfo?.config?.serial as Record<string, unknown> | undefined;

    const setSettings = useCallback(
        async (options: Record<string, unknown>) => {
            await sendMessage(sourceIdx, "bridge/request/options", { options: { serial: options } });
        },
        [sourceIdx],
    );

    // Extract current values
    const port = (serialConfig?.port as string | null) ?? "";
    const adapter = (serialConfig?.adapter as string) ?? "";
    const baudrate = (serialConfig?.baudrate as number) ?? "";
    const rtscts = (serialConfig?.rtscts as boolean | undefined);
    const disableLed = (serialConfig?.disable_led as boolean) ?? false;

    if (!bridgeInfo) {
        return (
            <div className="flex items-center justify-center p-8">
                <span className="loading loading-spinner loading-lg" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Section 1: Adapter Connection */}
            <Section
                title="Adapter Connection"
                icon={faUsb}
                iconColor="text-primary"
                description="Configure your Zigbee adapter connection"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                        name="port"
                        label="Serial Port"
                        detail="Path to your Zigbee adapter. Examples: /dev/ttyUSB0, /dev/ttyACM0, /dev/serial/by-id/usb-... Leave empty to auto-detect."
                        initialValue={port ?? ""}
                        onSubmit={(value) => setSettings({ port: value || null })}
                    />
                    <SelectField
                        name="adapter"
                        label="Adapter Type"
                        detail="Your adapter's chipset type. Leave on 'Auto-detect' unless you're having connection issues."
                        value={adapter}
                        onChange={(e) => setSettings({ adapter: e.target.value || undefined })}
                    >
                        <option value="">Auto-detect</option>
                        <option value="zstack">zStack (CC2530, CC2531, CC2538, CC26X2R1, CC1352P)</option>
                        <option value="ember">Ember (EFR32MG1x, EFR32MG2x, EZSP v8+)</option>
                        <option value="ezsp">EZSP (Legacy Ember, EZSP v4-v7)</option>
                        <option value="deconz">deCONZ (ConBee, ConBee II, RaspBee)</option>
                        <option value="zigate">ZiGate</option>
                        <option value="zboss">ZBOSS (Nordic nRF52)</option>
                        <option value="zoh">ZoH (Zigbee-on-Host)</option>
                    </SelectField>
                </div>

                <div className="alert alert-info mt-4">
                    <FontAwesomeIcon icon={faUsb} />
                    <div>
                        <strong>Tip:</strong> Use the full path from <code>/dev/serial/by-id/</code> for
                        reliable device identification. The ttyUSB numbering can change between reboots.
                    </div>
                </div>
            </Section>

            {/* Section 2: Communication */}
            <Section
                title="Communication Settings"
                icon={faWaveSquare}
                iconColor="text-info"
                description="Serial port communication parameters"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <NumberField
                        name="baudrate"
                        label="Baud Rate"
                        detail="Serial port speed. Most adapters use 115200. Only change if your adapter requires a different speed (check documentation)."
                        initialValue={baudrate === "" ? "" : baudrate as number}
                        min={9600}
                        max={921600}
                        onSubmit={(value, valid) =>
                            valid && setSettings({ baudrate: value || undefined })
                        }
                    />
                    <div className="flex flex-col justify-center">
                        <CheckboxField
                            name="rtscts"
                            label="Hardware Flow Control (RTS/CTS)"
                            detail="Enable hardware flow control. Only enable if your adapter requires it and your hardware supports it."
                            defaultChecked={rtscts ?? false}
                            onChange={(e) => setSettings({ rtscts: e.target.checked })}
                        />
                    </div>
                </div>

                {/* Adapter-specific tips */}
                {adapter && (
                    <div className="alert mt-4">
                        <FontAwesomeIcon icon={faMicrochip} />
                        <div>
                            {adapter === "zstack" && (
                                <>
                                    <strong>zStack Adapter:</strong> Works with Texas Instruments chips.
                                    CC2531 uses 115200 baud, CC26X2R1 and CC1352P can use higher speeds.
                                </>
                            )}
                            {adapter === "ember" && (
                                <>
                                    <strong>Ember Adapter:</strong> Silicon Labs EFR32 chips. Typically
                                    uses 115200 baud. EZSP version 8+ is recommended.
                                </>
                            )}
                            {adapter === "ezsp" && (
                                <>
                                    <strong>EZSP Legacy:</strong> For older Silicon Labs adapters
                                    (EZSP v4-v7). Consider upgrading to Ember for better performance.
                                </>
                            )}
                            {adapter === "deconz" && (
                                <>
                                    <strong>deCONZ Adapter:</strong> Dresden Elektronik ConBee/RaspBee.
                                    Firmware updates available through the Phoscon app.
                                </>
                            )}
                            {adapter === "zigate" && (
                                <>
                                    <strong>ZiGate Adapter:</strong> Flash with PDM firmware for best
                                    results. Supports PiZiGate and USB versions.
                                </>
                            )}
                            {adapter === "zboss" && (
                                <>
                                    <strong>ZBOSS Adapter:</strong> Nordic nRF52 series. Used in some
                                    commercial coordinators.
                                </>
                            )}
                            {adapter === "zoh" && (
                                <>
                                    <strong>Zigbee-on-Host:</strong> Experimental direct USB connection
                                    without external coordinator.
                                </>
                            )}
                        </div>
                    </div>
                )}
            </Section>

            {/* Section 3: Hardware */}
            <Section
                title="Hardware Options"
                icon={faMicrochip}
                iconColor="text-secondary"
                description="Physical adapter settings"
            >
                <CheckboxField
                    name="disable_led"
                    label="Disable Adapter LED"
                    detail="Turn off the LED on your Zigbee adapter. Useful if the blinking light is distracting or for power saving. Not all adapters support this."
                    defaultChecked={disableLed}
                    onChange={(e) => setSettings({ disable_led: e.target.checked })}
                />
            </Section>

            {/* Restart Notice */}
            <div className="alert alert-warning">
                <FontAwesomeIcon icon={faPowerOff} />
                <span>
                    <strong>Changes require restart.</strong> All serial port settings take effect after
                    restarting Zigbee2MQTT.
                </span>
            </div>
        </div>
    );
}
