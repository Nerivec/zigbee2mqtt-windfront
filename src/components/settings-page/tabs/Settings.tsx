import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { JSONSchema7 } from "json-schema";
import { useCallback, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { CONFIGURATION_DOCS_URL } from "../../../consts.js";
import { useAppStore } from "../../../store.js";
import { WebSocketApiRouterContext } from "../../../WebSocketApiRouterContext.js";
import Button from "../../Button.js";
import SettingsList from "../../json-schema/SettingsList.js";

const ROOT_TAB = "main";
const TABS = [ROOT_TAB, "frontend", "mqtt", "serial", "availability", "ota", "advanced", "homeassistant"];

export default function Settings() {
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const bridgeInfo = useAppStore((state) => state.bridgeInfo);
    const [currentTab, setCurrentTab] = useState<string>(ROOT_TAB);
    const { t } = useTranslation("settings");

    const setSettings = useCallback(
        async (options: Record<string, unknown>) => {
            if (currentTab === ROOT_TAB) {
                await sendMessage("bridge/request/options", { options });
            } else {
                await sendMessage("bridge/request/options", { options: { [currentTab]: options } });
            }
        },
        [sendMessage, currentTab],
    );

    return (
        <>
            <div className="alert alert-info alert-soft mb-3" role="alert">
                <FontAwesomeIcon icon={faCircleInfo} size="2xl" />
                <a href={CONFIGURATION_DOCS_URL} target="_blank" rel="noreferrer" className="link link-hover">
                    {t("common:read_the_docs_info")}
                </a>
            </div>
            <div className="tabs tabs-border">
                {TABS.map((tab) => (
                    <Button
                        key={tab}
                        className={`tab${currentTab === tab ? " tab-active" : ""}`}
                        aria-current="page"
                        item={tab}
                        onClick={setCurrentTab}
                    >
                        {t(tab)}
                    </Button>
                ))}
                <div className="tab-content block h-full bg-base-100 p-3">
                    {currentTab === ROOT_TAB ? (
                        <SettingsList
                            schema={bridgeInfo.config_schema as unknown as JSONSchema7}
                            data={bridgeInfo.config as unknown as Record<string, unknown>}
                            set={setSettings}
                            rootOnly
                        />
                    ) : (
                        <SettingsList
                            schema={bridgeInfo.config_schema.properties[currentTab]}
                            data={bridgeInfo.config[currentTab]}
                            set={setSettings}
                        />
                    )}
                </div>
            </div>
        </>
    );
}
