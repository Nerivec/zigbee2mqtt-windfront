import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { JSONSchema7 } from "json-schema";
import merge from "lodash/merge.js";
import { useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";
import { DEVICE_OPTIONS_DOCS_URL } from "../../../consts.js";
import { useAppStore } from "../../../store.js";
import type { Device } from "../../../types.js";
import { WebSocketApiRouterContext } from "../../../WebSocketApiRouterContext.js";
import SettingsList from "../../json-schema/SettingsList.js";

interface DeviceSettingsProps {
    sourceIdx: number;
    device: Device;
}

export default function DeviceSettings({ sourceIdx, device }: DeviceSettingsProps) {
    const { t } = useTranslation(["settings", "common"]);
    const bridgeInfo = useAppStore(useShallow((state) => state.bridgeInfo[sourceIdx]));
    const { sendMessage } = useContext(WebSocketApiRouterContext);

    const setDeviceOptions = useCallback(
        async (options: Record<string, unknown>) => {
            await sendMessage(sourceIdx, "bridge/request/device/options", { id: device.ieee_address, options });
        },
        [sourceIdx, device.ieee_address, sendMessage],
    );

    return (
        <>
            <div className="alert alert-info alert-soft mb-3" role="alert">
                <FontAwesomeIcon icon={faCircleInfo} size="2xl" />
                <a href={DEVICE_OPTIONS_DOCS_URL} target="_blank" rel="noreferrer" className="link link-hover">
                    {t("common:read_the_docs_info")}
                </a>
            </div>
            <SettingsList
                schema={(bridgeInfo.config_schema.definitions.device ?? { properties: {} }) as JSONSchema7}
                data={merge({}, bridgeInfo.config.device_options, bridgeInfo.config.devices[device.ieee_address])}
                set={setDeviceOptions}
                namespace="definitions-device"
            />
        </>
    );
}
