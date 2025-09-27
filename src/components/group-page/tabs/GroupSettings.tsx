import type { JSONSchema7 } from "json-schema";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";
import { GROUP_OPTIONS_DOCS_URL } from "../../../consts.js";
import { useAppStore } from "../../../store.js";
import type { Group } from "../../../types.js";
import { sendMessage } from "../../../websocket/WebSocketManager.js";
import InfoAlert from "../../InfoAlert.js";
import SettingsList from "../../json-schema/SettingsList.js";

type DevicesProps = {
    sourceIdx: number;
    group: Group;
};

export default function GroupSettings({ sourceIdx, group }: DevicesProps) {
    const { t } = useTranslation(["settings", "common"]);
    const bridgeInfo = useAppStore(useShallow((state) => state.bridgeInfo[sourceIdx]));

    const setDeviceOptions = useCallback(
        async (options: Record<string, unknown>) => {
            await sendMessage(sourceIdx, "bridge/request/group/options", { id: group.id.toString(), options });
        },
        [sourceIdx, group.id],
    );

    return (
        <>
            <InfoAlert>
                <a href={GROUP_OPTIONS_DOCS_URL} target="_blank" rel="noreferrer" className="link link-hover">
                    {t(($) => $.read_the_docs_info, { ns: "common" })}
                </a>
            </InfoAlert>
            <SettingsList
                schema={(bridgeInfo.config_schema.definitions.group ?? { properties: {} }) as JSONSchema7}
                data={bridgeInfo.config.groups[group.id] ?? {}}
                set={setDeviceOptions}
                namespace="definitions-group"
            />
        </>
    );
}
