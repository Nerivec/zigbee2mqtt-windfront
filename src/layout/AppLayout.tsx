import {
    faAnglesLeft,
    faBars,
    faCloudArrowUp,
    faCogs,
    faDisplay,
    faHeart,
    faHexagonNodes,
    faList,
    faMobileVibrate,
    faPlug,
    faTableCellsLarge,
    faTableColumns,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type JSX, memo, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, type NavLinkRenderProps } from "react-router";
import store2 from "store2";
import LanguageSwitcher from "../components/LanguageSwitcher.js";
import Notifications from "../components/Notifications.js";
import PermitJoinButton from "../components/PermitJoinButton.js";
import ThemeSwitcher from "../components/ThemeSwitcher.js";
import { SIDEBAR_COLLAPSED_KEY } from "../localStoreConsts.js";
import NavBar from "./NavBar.js";
import { NavBarProvider } from "./NavBarContext.js";

type AppLayoutProps = {
    children: JSX.Element;
};

// XXX: `leading-none` prevents misalignment when sidebar collapsed/not collapsed (icon/icon+text)
const isNavActive = ({ isActive }: NavLinkRenderProps) => `py-2.5 leading-none ${isActive ? "menu-active" : ""}`;

const AppLayout = memo(({ children }: AppLayoutProps) => {
    const { t } = useTranslation(["navbar", "common"]);
    const sidebarDrawerCheckboxRef = useRef<HTMLInputElement | null>(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(store2.get(SIDEBAR_COLLAPSED_KEY, false));
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        store2.set(SIDEBAR_COLLAPSED_KEY, sidebarCollapsed);
    }, [sidebarCollapsed]);

    const links = useMemo(
        () => [
            { to: "/dashboard", icon: faTableColumns, title: t("dashboard") },
            { to: "/devices", icon: faPlug, title: t("devices") },
            { to: "/groups", icon: faTableCellsLarge, title: t("groups") },
            { to: "/ota", icon: faCloudArrowUp, title: t("ota") },
            { to: "/touchlink", icon: faMobileVibrate, title: t("touchlink") },
            { to: "/network", icon: faHexagonNodes, title: t("network") },
            { to: "/logs", icon: faList, title: t("logs") },
            { to: "/settings", icon: faCogs, title: t("settings") },
            { to: "/frontend-settings", icon: faDisplay, title: t("frontend_settings") },
        ],
        [t],
    );

    const onSidebarLinkClick = () => {
        // don't change sidebar state on lg and up
        if (window.matchMedia("(min-width: 1024px)").matches) {
            return;
        }

        if (sidebarDrawerCheckboxRef.current) {
            sidebarDrawerCheckboxRef.current.checked = false;
        }
    };

    const linkLabelLargeClassName = `hidden ${sidebarCollapsed ? "lg:hidden" : "lg:inline"}`;

    return (
        <NavBarProvider>
            <div className="drawer lg:drawer-open">
                <input ref={sidebarDrawerCheckboxRef} id="sidebar-drawer" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content">
                    <div className="drawer drawer-end w-auto">
                        <input id="notifications-drawer" type="checkbox" className="drawer-toggle" />
                        <div className="drawer-content">
                            <NavBar
                                setSidebarCollapsed={setSidebarCollapsed}
                                showNotifications={showNotifications}
                                setShowNotifications={setShowNotifications}
                            />
                        </div>
                        <div className="drawer-side">
                            <label
                                htmlFor="notifications-drawer"
                                aria-label="close notifications"
                                className="drawer-overlay"
                                onClick={() => setShowNotifications(false)}
                            />
                            <aside className="bg-base-100 min-h-screen w-80">{showNotifications && <Notifications />}</aside>
                        </div>
                    </div>
                    <main className="pt-2 px-2 grow [scrollbar-gutter:stable]">{children}</main>
                </div>
                <div className="drawer-side">
                    <label
                        htmlFor="sidebar-drawer"
                        aria-label="close sidebar"
                        className="drawer-overlay lg:hidden"
                        onClick={() => setSidebarCollapsed(true)}
                    />
                    <aside className={`bg-base-200 min-h-screen ${sidebarCollapsed ? "lg:w-16" : "w-64"}`}>
                        <nav className="flex flex-col h-full w-full">
                            <ul className="menu w-full p-2">
                                <li>
                                    <button
                                        type="button"
                                        className="py-2.5 leading-none hidden lg:grid"
                                        title={
                                            sidebarCollapsed
                                                ? window.location !== window.parent.location
                                                    ? `Zigbee2MQTT@${window.location.hostname}`
                                                    : ""
                                                : ""
                                        }
                                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                                    >
                                        <FontAwesomeIcon icon={sidebarCollapsed ? faBars : faAnglesLeft} size="lg" />
                                        <span className="inline lg:hidden">Zigbee2MQTT</span>
                                        <span className={linkLabelLargeClassName}>Zigbee2MQTT</span>
                                    </button>
                                </li>
                                {links.map((link) => (
                                    <li key={link.to} title={link.title}>
                                        <NavLink to={link.to} className={isNavActive} onClick={onSidebarLinkClick}>
                                            <FontAwesomeIcon icon={link.icon} size="lg" />
                                            <span className="inline lg:hidden">{link.title}</span>
                                            <span className={linkLabelLargeClassName}>{link.title}</span>
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>

                            <div className={`menu w-full p-2 gap-2 ${sidebarCollapsed ? "hidden lg:hidden" : ""}`}>
                                <PermitJoinButton />
                            </div>

                            <div className={`menu w-full p-2 gap-2 flex-row justify-center p-2 gap-2 ${sidebarCollapsed ? "hidden lg:hidden" : ""}`}>
                                <LanguageSwitcher />
                                <ThemeSwitcher />
                            </div>

                            <ul className={`menu w-full p-2 gap-2 ${sidebarCollapsed ? "hidden lg:hidden" : ""}`}>
                                <li className="">
                                    <NavLink to="/contribute" className="btn btn-sm btn-outline btn-secondary" onClick={onSidebarLinkClick}>
                                        <FontAwesomeIcon icon={faHeart} />
                                        {t("contribute")}
                                    </NavLink>
                                </li>
                            </ul>
                        </nav>
                    </aside>
                </div>
            </div>
        </NavBarProvider>
    );
});

export default AppLayout;
