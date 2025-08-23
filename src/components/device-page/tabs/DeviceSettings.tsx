import type { JSONSchema7 } from "json-schema";
import merge from "lodash/merge.js";
import { useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";
import { DEVICE_OPTIONS_DOCS_URL } from "../../../consts.js";
import { useAppStore } from "../../../store.js";
import { WebSocketApiRouterContext } from "../../../WebSocketApiRouterContext.js";
import InfoAlert from "../../InfoAlert.js";
import SettingsList from "../../json-schema/SettingsList.js";

interface DeviceSettingsProps {
    sourceIdx: number;
    ieeeAddress: string;
}

export default function DeviceSettings({ sourceIdx, ieeeAddress }: DeviceSettingsProps) {
    const { t } = useTranslation(["settings", "common"]);
    const bridgeInfo = useAppStore(useShallow((state) => state.bridgeInfo[sourceIdx]));
    const { sendMessage } = useContext(WebSocketApiRouterContext);

    const setDeviceOptions = useCallback(
        async (options: Record<string, unknown>) => {
            await sendMessage(sourceIdx, "bridge/request/device/options", { id: ieeeAddress, options });
        },
        [sourceIdx, ieeeAddress, sendMessage],
    );

    return (
        <>
            <InfoAlert>
                <a href={DEVICE_OPTIONS_DOCS_URL} target="_blank" rel="noreferrer" className="link link-hover">
                    {t("common:read_the_docs_info")}
                </a>
            </InfoAlert>
            <SettingsList
                schema={(bridgeInfo.config_schema.definitions.device ?? { properties: {} }) as JSONSchema7}
                data={merge({}, bridgeInfo.config.device_options, bridgeInfo.config.devices[ieeeAddress])}
                set={setDeviceOptions}
                namespace="definitions-device"
            />
        </>
    );
}
