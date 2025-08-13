import { useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useAppStore } from "../../../store.js";
import type { Device } from "../../../types.js";
import { WebSocketApiRouterContext } from "../../../WebSocketApiRouterContext.js";
import Feature from "../../features/Feature.js";
import FeatureWrapper from "../../features/FeatureWrapper.js";
import { getFeatureKey } from "../../features/index.js";

type DeviceSpecificSettingsProps = {
    device: Device;
};

export default function DeviceSpecificSettings({ device }: DeviceSpecificSettingsProps) {
    const { t } = useTranslation(["exposes"]);
    const bridgeInfo = useAppStore((state) => state.bridgeInfo);
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const setDeviceOptions = useCallback(
        async (options: Record<string, unknown>) => {
            await sendMessage("bridge/request/device/options", { id: device.ieee_address, options });
        },
        [sendMessage, device.ieee_address],
    );

    return device.definition?.options?.length ? (
        <div className="list bg-base-100">
            {device.definition.options.map((option) => (
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
        t("empty_exposes_definition")
    );
}
