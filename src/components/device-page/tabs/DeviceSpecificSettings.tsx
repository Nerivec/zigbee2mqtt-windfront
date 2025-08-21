import { useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "../../../store.js";
import type { Device } from "../../../types.js";
import { WebSocketApiRouterContext } from "../../../WebSocketApiRouterContext.js";
import Feature from "../../features/Feature.js";
import FeatureWrapper from "../../features/FeatureWrapper.js";
import { getFeatureKey } from "../../features/index.js";

type DeviceSpecificSettingsProps = {
    sourceIdx: number;
    device: Device;
};

export default function DeviceSpecificSettings({ sourceIdx, device }: DeviceSpecificSettingsProps) {
    const { t } = useTranslation("common");
    const bridgeInfo = useAppStore(useShallow((state) => state.bridgeInfo[sourceIdx]));
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const setDeviceOptions = useCallback(
        async (options: Record<string, unknown>) => {
            await sendMessage(sourceIdx, "bridge/request/device/options", { id: device.ieee_address, options });
        },
        [sourceIdx, device.ieee_address, sendMessage],
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
