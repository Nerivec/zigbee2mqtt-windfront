import { faBars, faDisplay, faInbox } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link, NavLink, type NavLinkRenderProps } from "react-router";
import { useAppStore } from "../../store.js";
import LanguageSwitcher from "./LanguageSwitcher.js";
import PermitJoinButton from "./PermitJoinButton.js";
import ThemeSwitcher from "./ThemeSwitcher.js";

const NavBar = () => {
    const { t } = useTranslation(["navbar", "common"]);
    const notificationsAlert = useAppStore((state) => state.notificationsAlert);

    const onDropdownMenuClick = useCallback(() => {
        if (document.activeElement instanceof HTMLElement && document.activeElement !== document.body) {
            document.activeElement.blur();
        }
    }, []);

    const isNavActive = useCallback(({ isActive }: NavLinkRenderProps) => (isActive ? "menu-active" : ""), []);

    const links = useMemo(
        () => (
            <>
                <li key="/devices">
                    <NavLink to="/devices" className={isNavActive}>
                        {t("devices")}
                    </NavLink>
                </li>
                <li key="/dashboard">
                    <NavLink to="/dashboard" className={isNavActive}>
                        {t("dashboard")}
                    </NavLink>
                </li>
                <li key="/groups">
                    <NavLink to="/groups" className={isNavActive}>
                        {t("groups")}
                    </NavLink>
                </li>
                <li key="/ota">
                    <NavLink to="/ota" className={isNavActive}>
                        {t("ota")}
                    </NavLink>
                </li>
                <li key="/touchlink">
                    <NavLink to="/touchlink" className={isNavActive}>
                        {t("touchlink")}
                    </NavLink>
                </li>
                <li key="/network">
                    <NavLink to="/network" className={isNavActive}>
                        {t("network")}
                    </NavLink>
                </li>
                <li key="/logs">
                    <NavLink to="/logs" className={isNavActive}>
                        {t("logs")}
                    </NavLink>
                </li>
                <li key="/settings">
                    <NavLink to="/settings" className={isNavActive}>
                        {t("settings")}
                    </NavLink>
                </li>
                <li key="/frontend-settings">
                    <NavLink to="/frontend-settings" className={isNavActive}>
                        <FontAwesomeIcon icon={faDisplay} size={"xl"} />
                    </NavLink>
                </li>
            </>
        ),
        [isNavActive, t],
    );

    return (
        <div className="navbar bg-base-200 shadow">
            <div className="navbar-start">
                <div className="dropdown">
                    {/* biome-ignore lint/a11y/noNoninteractiveTabindex: daisyui dropdown */}
                    <div className="btn btn-ghost lg:hidden" tabIndex={0}>
                        <FontAwesomeIcon icon={faBars} />
                    </div>
                    <ul
                        // biome-ignore lint/a11y/noNoninteractiveTabindex: daisyui dropdown
                        tabIndex={0}
                        className="menu dropdown-content bg-base-200 rounded-box z-1 mt-3 w-max p-2 shadow"
                        onClick={onDropdownMenuClick}
                    >
                        {links}
                    </ul>
                </div>
            </div>
            <Link
                to="/"
                className="link link-hover me-1"
                title={window.location !== window.parent.location ? `Zigbee2MQTT@${window.location.hostname}` : undefined}
            >
                Zigbee2MQTT
            </Link>
            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-1">{links}</ul>
            </div>
            <div className="navbar-end">
                <ul className="menu menu-horizontal px-1 gap-0.5 md:gap-1 justify-end">
                    <PermitJoinButton />
                    <LanguageSwitcher />
                    <ThemeSwitcher />
                    <label htmlFor="notifications-drawer" className="drawer-button btn">
                        <FontAwesomeIcon icon={faInbox} />
                        {notificationsAlert[0] ? (
                            <span className="status status-primary animate-bounce" />
                        ) : notificationsAlert[1] ? (
                            <span className="status status-error animate-bounce" />
                        ) : null}
                    </label>
                </ul>
            </div>
        </div>
    );
};

export default NavBar;
