import type { JSONSchema7 } from "json-schema";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, type NavLinkRenderProps } from "react-router";
import { useShallow } from "zustand/react/shallow";
import { CONFIGURATION_DOCS_URL } from "../../../consts.js";
import { useAppStore } from "../../../store.js";
import { sendMessage } from "../../../websocket/WebSocketManager.js";
import InfoAlert from "../../InfoAlert.js";
import SettingsList from "../../json-schema/SettingsList.js";

export type TabName = "main" | "frontend" | "mqtt" | "serial" | "availability" | "ota" | "advanced" | "homeassistant";

const isTabActive = ({ isActive }: NavLinkRenderProps) => (isActive ? "tab tab-active" : "tab");

type SettingsProps = { sourceIdx: number; tab: TabName };

export default function Settings({ sourceIdx, tab }: SettingsProps) {
    const bridgeInfo = useAppStore(useShallow((state) => state.bridgeInfo[sourceIdx]));
    const { t } = useTranslation(["settings", "common"]);

    const setSettings = useCallback(
        async (options: Record<string, unknown>) => {
            if (tab === "main") {
                await sendMessage(sourceIdx, "bridge/request/options", { options });
            } else {
                await sendMessage(sourceIdx, "bridge/request/options", { options: { [tab]: options } });
            }
        },
        [sourceIdx, tab],
    );

    return (
        <>
            <InfoAlert>
                <a href={CONFIGURATION_DOCS_URL} target="_blank" rel="noreferrer" className="link link-hover">
                    {t(($) => $.read_the_docs_info, { ns: "common" })}
                </a>
            </InfoAlert>
            <div className="tabs tabs-border">
                <NavLink to={`/settings/${sourceIdx}/settings/main`} className={isTabActive}>
                    {t(($) => $.main)}
                </NavLink>
                <NavLink to={`/settings/${sourceIdx}/settings/frontend`} className={isTabActive}>
                    {t(($) => $.frontend)}
                </NavLink>
                <NavLink to={`/settings/${sourceIdx}/settings/mqtt`} className={isTabActive}>
                    {t(($) => $.mqtt)}
                </NavLink>
                <NavLink to={`/settings/${sourceIdx}/settings/serial`} className={isTabActive}>
                    {t(($) => $.serial)}
                </NavLink>
                <NavLink to={`/settings/${sourceIdx}/settings/availability`} className={isTabActive}>
                    {t(($) => $.availability)}
                </NavLink>
                <NavLink to={`/settings/${sourceIdx}/settings/ota`} className={isTabActive}>
                    {t(($) => $.ota)}
                </NavLink>
                <NavLink to={`/settings/${sourceIdx}/settings/advanced`} className={isTabActive}>
                    {t(($) => $.advanced)}
                </NavLink>
                <NavLink to={`/settings/${sourceIdx}/settings/homeassistant`} className={isTabActive}>
                    {t(($) => $.homeassistant)}
                </NavLink>
                <div className="tab-content block h-full bg-base-100 p-3">
                    {tab === "main" ? (
                        <SettingsList
                            schema={bridgeInfo.config_schema as unknown as JSONSchema7}
                            data={bridgeInfo.config as unknown as Record<string, unknown>}
                            set={setSettings}
                            rootOnly
                            namespace=""
                        />
                    ) : bridgeInfo.config_schema.properties[tab] ? (
                        <SettingsList
                            schema={bridgeInfo.config_schema.properties[tab] as unknown as JSONSchema7}
                            data={bridgeInfo.config[tab]}
                            set={setSettings}
                            namespace={tab}
                        />
                    ) : null}
                </div>
            </div>
        </>
    );
}
