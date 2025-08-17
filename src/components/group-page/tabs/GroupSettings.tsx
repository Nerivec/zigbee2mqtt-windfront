import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { JSONSchema7 } from "json-schema";
import { useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";
import { GROUP_OPTIONS_DOCS_URL } from "../../../consts.js";
import { useAppStore } from "../../../store.js";
import type { Group } from "../../../types.js";
import { WebSocketApiRouterContext } from "../../../WebSocketApiRouterContext.js";
import SettingsList from "../../json-schema/SettingsList.js";

type DevicesProps = {
    sourceIdx: number;
    group: Group;
};

export default function GroupSettings({ sourceIdx, group }: DevicesProps) {
    const { t } = useTranslation(["settings", "common"]);
    const bridgeInfo = useAppStore(useShallow((state) => state.bridgeInfo[sourceIdx]));
    const { sendMessage } = useContext(WebSocketApiRouterContext);

    const setDeviceOptions = useCallback(
        async (options: Record<string, unknown>) => {
            await sendMessage(sourceIdx, "bridge/request/group/options", { id: group.id.toString(), options });
        },
        [sourceIdx, group.id, sendMessage],
    );

    return (
        <>
            <div className="alert alert-info alert-soft mb-3" role="alert">
                <FontAwesomeIcon icon={faCircleInfo} size="2xl" />
                <a href={GROUP_OPTIONS_DOCS_URL} target="_blank" rel="noreferrer" className="link link-hover">
                    {t("common:read_the_docs_info")}
                </a>
            </div>
            <SettingsList
                schema={(bridgeInfo.config_schema.definitions.group ?? { properties: {} }) as JSONSchema7}
                data={bridgeInfo.config.groups[group.id] ?? {}}
                set={setDeviceOptions}
            />
        </>
    );
}
