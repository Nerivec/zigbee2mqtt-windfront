import { faBug, faCode, faCogs, faHeartPulse, faInfo, faThumbsUp, faToolbox } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { lazy, memo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, type NavLinkRenderProps, useNavigate, useParams } from "react-router";
import SourceDot from "../components/SourceDot.js";
import type { TabName as DeviceConsoleTabName } from "../components/settings-page/tabs/DevConsole.js";
import type { TabName as SettingsTabName } from "../components/settings-page/tabs/Settings.js";
import { API_URLS, MULTI_INSTANCE } from "../store.js";
import { getValidSourceIdx } from "../utils.js";

type TabName = "about" | "health" | "settings" | "tools" | "bridge" | "dev-console" | "donate";

type UrlParams = {
    sourceIdx: `${number}`;
    tab?: TabName;
    subTab?: string;
};

type SettingsPageTabProps = {
    sourceIdx: number;
    tab: UrlParams["tab"];
    subTab: UrlParams["subTab"];
};

const AboutTab = lazy(async () => await import("../components/settings-page/tabs/About.js"));
const HealthTab = lazy(async () => await import("../components/settings-page/tabs/Health.js"));
const SettingsTab = lazy(async () => await import("../components/settings-page/tabs/Settings.js"));
const ToolsTab = lazy(async () => await import("../components/settings-page/tabs/Tools.js"));
const BridgeTab = lazy(async () => await import("../components/settings-page/tabs/Bridge.js"));
const DevConsoleTab = lazy(async () => await import("../components/settings-page/tabs/DevConsole.js"));
const DonateTab = lazy(async () => await import("../components/settings-page/tabs/Donate.js"));

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
        case "donate":
            return <DonateTab />;
    }
}

const SettingsPageTab = memo(({ sourceIdx, tab, subTab }: SettingsPageTabProps) => {
    const { t } = useTranslation(["settings", "navbar"]);

    const isTabActive = ({ isActive }: NavLinkRenderProps) => (isActive ? "tab tab-active" : "tab");

    return (
        <div className="tabs tabs-border">
            <NavLink to={`/settings/${sourceIdx}/about`} className={isTabActive}>
                <FontAwesomeIcon icon={faInfo} className="me-2" />
                {t("about")}
            </NavLink>
            <NavLink to={`/settings/${sourceIdx}/health`} className={isTabActive}>
                <FontAwesomeIcon icon={faHeartPulse} className="me-2" />
                {t("health")}
            </NavLink>
            <NavLink to={`/settings/${sourceIdx}/settings`} className={isTabActive}>
                <FontAwesomeIcon icon={faCogs} className="me-2" />
                {t("settings")}
            </NavLink>
            <NavLink to={`/settings/${sourceIdx}/tools`} className={isTabActive}>
                <FontAwesomeIcon icon={faToolbox} className="me-2" />
                {t("tools")}
            </NavLink>
            <NavLink to={`/settings/${sourceIdx}/bridge`} className={isTabActive}>
                <FontAwesomeIcon icon={faCode} className="me-2" />
                {t("bridge")}
            </NavLink>
            <NavLink to={`/settings/${sourceIdx}/dev-console`} className={isTabActive}>
                <FontAwesomeIcon icon={faBug} className="me-2" />
                {t("dev_console")}
            </NavLink>
            <NavLink to={`/settings/${sourceIdx}/donate`} className={isTabActive}>
                <FontAwesomeIcon icon={faThumbsUp} className="me-2" />
                {t("donate")}
            </NavLink>
            <div className="tab-content block h-full bg-base-100 p-3">{tab && renderTab(sourceIdx, tab, subTab)}</div>
        </div>
    );
});

export default function SettingsPage() {
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

    const isTabActive = ({ isActive }: NavLinkRenderProps) => (isActive ? "tab tab-active" : "tab");

    return MULTI_INSTANCE ? (
        <div className="tabs tabs-border">
            {API_URLS.map((_v, idx) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: const
                <NavLink key={idx} to={`/settings/${idx}/${tab || "about"}${subTab ? `/${subTab}` : ""}`} className={isTabActive}>
                    <SourceDot idx={idx} alwaysShowName />
                </NavLink>
            ))}
            <div className="tab-content block h-full bg-base-100 pb-3 px-3">
                <SettingsPageTab sourceIdx={numSourceIdx} tab={tab} subTab={subTab} />
            </div>
        </div>
    ) : (
        <SettingsPageTab sourceIdx={numSourceIdx} tab={tab} subTab={subTab} />
    );
}
