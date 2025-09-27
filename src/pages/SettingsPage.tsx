import { faBug, faCode, faCogs, faHeartPulse, faInfo, faToolbox } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { lazy, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, type NavLinkRenderProps, useNavigate, useParams } from "react-router";
import SourceDot from "../components/SourceDot.js";
import type { TabName as DeviceConsoleTabName } from "../components/settings-page/tabs/DevConsole.js";
import type { TabName as SettingsTabName } from "../components/settings-page/tabs/Settings.js";
import { NavBarContent } from "../layout/NavBarContext.js";
import { API_URLS, MULTI_INSTANCE } from "../store.js";
import { getValidSourceIdx } from "../utils.js";

type TabName = "about" | "health" | "settings" | "tools" | "bridge" | "dev-console";

type UrlParams = {
    sourceIdx: `${number}`;
    tab?: TabName;
    subTab?: string;
};

const AboutTab = lazy(async () => await import("../components/settings-page/tabs/About.js"));
const HealthTab = lazy(async () => await import("../components/settings-page/tabs/Health.js"));
const SettingsTab = lazy(async () => await import("../components/settings-page/tabs/Settings.js"));
const ToolsTab = lazy(async () => await import("../components/settings-page/tabs/Tools.js"));
const BridgeTab = lazy(async () => await import("../components/settings-page/tabs/Bridge.js"));
const DevConsoleTab = lazy(async () => await import("../components/settings-page/tabs/DevConsole.js"));

function renderTab(sourceIdx: number, tab: TabName, subTab: string | undefined) {
    switch (tab) {
        case "about":
            return <AboutTab key={sourceIdx} sourceIdx={sourceIdx} />;
        case "health":
            return <HealthTab key={sourceIdx} sourceIdx={sourceIdx} />;
        case "settings":
            return <SettingsTab key={sourceIdx} sourceIdx={sourceIdx} tab={(subTab as SettingsTabName) ?? "main"} />;
        case "tools":
            return <ToolsTab key={sourceIdx} sourceIdx={sourceIdx} />;
        case "bridge":
            return <BridgeTab key={sourceIdx} sourceIdx={sourceIdx} />;
        case "dev-console":
            return <DevConsoleTab key={sourceIdx} sourceIdx={sourceIdx} tab={(subTab as DeviceConsoleTabName) ?? "mqtt"} />;
    }
}

const isNavActive = ({ isActive }: NavLinkRenderProps) => (isActive ? "menu-active" : undefined);

export default function SettingsPage() {
    const { t } = useTranslation("settings");
    const navigate = useNavigate();
    const { sourceIdx, tab, subTab } = useParams<UrlParams>();
    const [numSourceIdx, validSourceIdx] = getValidSourceIdx(sourceIdx);

    useEffect(() => {
        if (!sourceIdx || !validSourceIdx) {
            navigate(`/settings/0/${tab || "about"}`, { replace: true });
        } else if (!tab) {
            navigate(`/settings/${sourceIdx}/about`, { replace: true });
        } else if (!subTab) {
            if (tab === "settings") {
                navigate(`/settings/${sourceIdx}/settings/main`, { replace: true });
            } else if (tab === "dev-console") {
                navigate(`/settings/${sourceIdx}/dev-console/mqtt`, { replace: true });
            }
        }
    }, [sourceIdx, validSourceIdx, tab, subTab, navigate]);

    const links = useMemo(
        () => [
            { to: `/settings/${sourceIdx}/about`, icon: faInfo, title: t(($) => $.about) },
            { to: `/settings/${sourceIdx}/health`, icon: faHeartPulse, title: t(($) => $.health) },
            { to: `/settings/${sourceIdx}/settings`, icon: faCogs, title: t(($) => $.settings) },
            { to: `/settings/${sourceIdx}/tools`, icon: faToolbox, title: t(($) => $.tools) },
            { to: `/settings/${sourceIdx}/bridge`, icon: faCode, title: t(($) => $.bridge) },
            { to: `/settings/${sourceIdx}/dev-console`, icon: faBug, title: t(($) => $.dev_console) },
        ],
        [sourceIdx, t],
    );

    const tabs = (
        <div className="menu menu-horizontal flex-1">
            {links.map((link) => (
                <li key={link.to} className="tooltip tooltip-bottom" data-tip={link.title}>
                    <NavLink to={link.to} className={isNavActive}>
                        <FontAwesomeIcon icon={link.icon} size="lg" />
                        <span className="hidden lg:inline">{link.title}</span>
                    </NavLink>
                </li>
            ))}
        </div>
    );

    return (
        <>
            <NavBarContent>
                {MULTI_INSTANCE ? (
                    <div className="flex-1 flex flex-col">
                        <div className="menu menu-horizontal flex-1 pb-0">
                            {API_URLS.map((v, idx) => (
                                <li key={v}>
                                    <NavLink to={`/settings/${idx}/${tab || "about"}${subTab ? `/${subTab}` : ""}`} className={isNavActive}>
                                        <SourceDot idx={idx} alwaysShowName />
                                    </NavLink>
                                </li>
                            ))}
                        </div>
                        {tabs}
                    </div>
                ) : (
                    tabs
                )}
            </NavBarContent>

            {tab && renderTab(numSourceIdx, tab, subTab)}
        </>
    );
}
