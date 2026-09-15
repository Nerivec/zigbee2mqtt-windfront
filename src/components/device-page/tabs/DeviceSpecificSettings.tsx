import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import store2 from "store2";
import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "../../../store.js";
import {
    type DeviceTemperatureUnitPreference,
    getDeviceTemperatureUnitKey,
    getDeviceTemperatureUnitPreference,
    hasTemperatureExpose,
    notifyTemperatureSettingsChanged,
} from "../../../temperature.js";
import type { Device } from "../../../types.js";
import { sendMessage } from "../../../websocket/WebSocketManager.js";
import Feature from "../../features/Feature.js";
import FeatureWrapper from "../../features/FeatureWrapper.js";
import { getFeatureKey } from "../../features/index.js";
import SelectField from "../../form-fields/SelectField.js";

type DeviceSpecificSettingsProps = {
    sourceIdx: number;
    device: Device;
};

export default function DeviceSpecificSettings({ sourceIdx, device }: DeviceSpecificSettingsProps) {
    const { t } = useTranslation(["common", "settings"]);
    const bridgeInfo = useAppStore(useShallow((state) => state.bridgeInfo[sourceIdx]));
    const [temperatureUnit, setTemperatureUnit] = useState<DeviceTemperatureUnitPreference>(getDeviceTemperatureUnitPreference(device.ieee_address));

    useEffect(() => {
        setTemperatureUnit(getDeviceTemperatureUnitPreference(device.ieee_address));
    }, [device.ieee_address]);

    const setTemperatureUnitOverride = useCallback(
        (preference: DeviceTemperatureUnitPreference) => {
            const key = getDeviceTemperatureUnitKey(device.ieee_address);

            if (preference === "inherit") {
                store2.remove(key);
            } else {
                store2.set(key, preference);
            }

            setTemperatureUnit(preference);
            notifyTemperatureSettingsChanged();
        },
        [device.ieee_address],
    );

    const setDeviceOptions = useCallback(
        async (options: Record<string, unknown>) => {
            await sendMessage(sourceIdx, "bridge/request/device/options", { id: device.ieee_address, options });
        },
        [sourceIdx, device.ieee_address],
    );

    const hasOptions = Boolean(device.definition?.options?.length);
    const hasTemperature = hasTemperatureExpose(device);

    return (
        <>
            {hasTemperature && (
                <div className="mb-4">
                    <SelectField
                        name="temperature_unit_override"
                        label={t(($) => $.temperature_unit_override, { ns: "settings" })}
                        value={temperatureUnit}
                        onChange={(event) => setTemperatureUnitOverride(event.target.value as DeviceTemperatureUnitPreference)}
                    >
                        <option value="inherit">{t(($) => $.temperature_unit_inherit, { ns: "settings" })}</option>
                        <option value="native">{t(($) => $.temperature_unit_native, { ns: "settings" })}</option>
                        <option value="celsius">{t(($) => $.temperature_unit_celsius, { ns: "settings" })}</option>
                        <option value="fahrenheit">{t(($) => $.temperature_unit_fahrenheit, { ns: "settings" })}</option>
                    </SelectField>
                </div>
            )}
            {hasOptions ? (
                <div className="list bg-base-100">
                    {device.definition?.options?.map((option) => (
                        <Feature
                            key={getFeatureKey(option)}
                            feature={option}
                            device={device}
                            deviceState={bridgeInfo.config.devices[device.ieee_address] ?? {}}
                            onChange={setDeviceOptions}
                            featureWrapperClass={FeatureWrapper}
                            parentFeatures={[]}
                        />
                    ))}
                </div>
            ) : (
                !hasTemperature && t(($) => $.empty_exposes_definition)
            )}
        </>
    );
}
