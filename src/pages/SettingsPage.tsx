import { faBug, faCode, faCogs, faHeartPulse, faInfo, faThumbsUp, faToolbox } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type JSX, lazy, memo, useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, type NavLinkRenderProps, useNavigate, useParams } from "react-router";
import SourceDot from "../components/SourceDot.js";
import { API_URLS } from "../store.js";
import { getValidSourceIdx } from "../utils.js";

type UrlParams = {
    sourceIdx: `${number}`;
    tab?: "about" | "health" | "settings" | "tools" | "bridge" | "dev-console" | "donate";
};

type SettingsPageTabProps = {
    sourceIdx: number;
    tab: UrlParams["tab"];
};

const AboutTab = lazy(async () => await import("../components/settings-page/tabs/About.js"));
const HealthTab = lazy(async () => await import("../components/settings-page/tabs/Health.js"));
const SettingsTab = lazy(async () => await import("../components/settings-page/tabs/Settings.js"));
const ToolsTab = lazy(async () => await import("../components/settings-page/tabs/Tools.js"));
const BridgeTab = lazy(async () => await import("../components/settings-page/tabs/Bridge.js"));
const DevConsoleTab = lazy(async () => await import("../components/settings-page/tabs/DevConsole.js"));
const DonateTab = lazy(async () => await import("../components/settings-page/tabs/Donate.js"));

const SettingsPageTab = memo(({ sourceIdx, tab }: SettingsPageTabProps) => {
    const { t } = useTranslation(["settings", "navbar"]);

    const isTabActive = useCallback(({ isActive }: NavLinkRenderProps) => (isActive ? "tab tab-active" : "tab"), []);

    const tabs = useMemo(
        () => (
            <>
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
            </>
        ),
        [sourceIdx, isTabActive, t],
    );

    const content = useMemo(() => {
        if (!tab) {
            return "";
        }

        switch (tab) {
            case "about":
                return <AboutTab sourceIdx={sourceIdx} />;
            case "health":
                return <HealthTab sourceIdx={sourceIdx} />;
            case "settings":
                return <SettingsTab sourceIdx={sourceIdx} />;
            case "tools":
                return <ToolsTab sourceIdx={sourceIdx} />;
            case "bridge":
                return <BridgeTab sourceIdx={sourceIdx} />;
            case "dev-console":
                return <DevConsoleTab sourceIdx={sourceIdx} />;
            case "donate":
                return <DonateTab />;
        }
    }, [tab, sourceIdx]);

    return (
        <div className="tabs tabs-border">
            {tabs}
            <div className="tab-content block h-full bg-base-100 p-3">{content}</div>
        </div>
    );
});

export default function SettingsPage() {
    const navigate = useNavigate();
    const { sourceIdx, tab } = useParams<UrlParams>();
    const [numSourceIdx, validSourceIdx] = getValidSourceIdx(sourceIdx);

    useEffect(() => {
        if (!sourceIdx || !validSourceIdx) {
            navigate(`/settings/0/${tab || "about"}`, { replace: true });
        } else if (!tab) {
            navigate(`/settings/${sourceIdx}/about`, { replace: true });
        }
    }, [sourceIdx, validSourceIdx, tab, navigate]);

    const isTabActive = useCallback(({ isActive }: NavLinkRenderProps) => (isActive ? "tab tab-active" : "tab"), []);

    const tabs = useMemo(() => {
        const elements: JSX.Element[] = [];

        for (let idx = 0; idx < API_URLS.length; idx++) {
            elements.push(
                <NavLink key={`/settings/${idx}`} to={`/settings/${idx}`} className={isTabActive}>
                    <SourceDot idx={idx} alwaysShowName />
                </NavLink>,
            );
        }

        return elements;
    }, [isTabActive]);

    return API_URLS.length > 1 ? (
        <div className="tabs tabs-border">
            {tabs}
            <div className="tab-content block h-full bg-base-100 pb-3 px-3">
                <SettingsPageTab sourceIdx={numSourceIdx} tab={tab} />
            </div>
        </div>
    ) : (
        <SettingsPageTab sourceIdx={numSourceIdx} tab={tab} />
    );
}
