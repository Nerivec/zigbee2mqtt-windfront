import { faBug, faCode, faCogs, faDisplay, faHeartPulse, faInfo, faThumbsUp, faToolbox } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type JSX, lazy, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, type NavLinkRenderProps, useNavigate, useParams } from "react-router";

type UrlParams = {
    tab?: "about" | "health" | "frontend" | "settings" | "tools" | "bridge" | "dev-console" | "donate";
};

const AboutTab = lazy(async () => await import("../components/settings-page/tabs/About.js"));
const HealthTab = lazy(async () => await import("../components/settings-page/tabs/Health.js"));
const FrontendTab = lazy(async () => await import("../components/settings-page/tabs/Frontend.js"));
const SettingsTab = lazy(async () => await import("../components/settings-page/tabs/Settings.js"));
const ToolsTab = lazy(async () => await import("../components/settings-page/tabs/Tools.js"));
const BridgeTab = lazy(async () => await import("../components/settings-page/tabs/Bridge.js"));
const DevConsoleTab = lazy(async () => await import("../components/settings-page/tabs/DevConsole.js"));
const DonateTab = lazy(async () => await import("../components/settings-page/tabs/Donate.js"));

export default function SettingsPage() {
    const navigate = useNavigate();
    const { tab } = useParams<UrlParams>();
    const { t } = useTranslation(["settings", "navbar"]);

    useEffect(() => {
        if (!tab) {
            navigate("/settings/about", { replace: true });
        }
    }, [tab, navigate]);

    const content = useMemo((): JSX.Element => {
        switch (tab) {
            case "about":
                return <AboutTab />;
            case "health":
                return <HealthTab />;
            case "frontend":
                return <FrontendTab />;
            case "settings":
                return <SettingsTab />;
            case "tools":
                return <ToolsTab />;
            case "bridge":
                return <BridgeTab />;
            case "dev-console":
                return <DevConsoleTab />;
            case "donate":
                return <DonateTab />;
        }

        return <></>;
    }, [tab]);

    const isTabActive = ({ isActive }: NavLinkRenderProps) => (isActive ? "tab tab-active" : "tab");

    return (
        <>
            <div className="tabs tabs-border">
                <NavLink to="/settings/about" className={isTabActive}>
                    <FontAwesomeIcon icon={faInfo} className="me-2" />
                    {t("about")}
                </NavLink>
                <NavLink to="/settings/health" className={isTabActive}>
                    <FontAwesomeIcon icon={faHeartPulse} className="me-2" />
                    {t("health")}
                </NavLink>
                <NavLink to="/settings/frontend" className={isTabActive}>
                    <FontAwesomeIcon icon={faDisplay} className="me-2" />
                    {t("frontend")}
                </NavLink>
                <NavLink to="/settings/settings" className={isTabActive}>
                    <FontAwesomeIcon icon={faCogs} className="me-2" />
                    {t("settings")}
                </NavLink>
                <NavLink to="/settings/tools" className={isTabActive}>
                    <FontAwesomeIcon icon={faToolbox} className="me-2" />
                    {t("tools")}
                </NavLink>
                <NavLink to="/settings/bridge" className={isTabActive}>
                    <FontAwesomeIcon icon={faCode} className="me-2" />
                    {t("bridge")}
                </NavLink>
                <NavLink to="/settings/dev-console" className={isTabActive}>
                    <FontAwesomeIcon icon={faBug} className="me-2" />
                    {t("dev_console")}
                </NavLink>
                <NavLink to="/settings/donate" className={isTabActive}>
                    <FontAwesomeIcon icon={faThumbsUp} className="me-2" />
                    {t("donate")}
                </NavLink>
                <div className="tab-content block h-full bg-base-100 p-3">{content}</div>
            </div>
        </>
    );
}
