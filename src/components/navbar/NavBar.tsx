import { faBars, faDisplay, faInbox } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type MouseEvent, memo, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, NavLink, type NavLinkRenderProps } from "react-router";
import { API_NAMES, useAppStore } from "../../store.js";
import Button from "../Button.js";
import Notifications from "../Notifications.js";
import LanguageSwitcher from "./LanguageSwitcher.js";
import PermitJoinButton from "./PermitJoinButton.js";
import ThemeSwitcher from "./ThemeSwitcher.js";

type NavBarProps = {
    showNotifications: boolean;
    setShowNotifications: ReturnType<typeof useState<boolean>>[1];
};

type NavBarSubMenuProps = {
    name: string;
    navPath: string;
    isNavActive: (props: NavLinkRenderProps) => string;
};

const NavBarSubMenu = memo(({ name, navPath, isNavActive }: NavBarSubMenuProps) => {
    const onSubMenuClick = useCallback((event: MouseEvent<HTMLUListElement>) => {
        (event.currentTarget.parentElement as HTMLDetailsElement).open = false;
    }, []);

    return (
        <details>
            <summary>
                <NavLink to={navPath} className={isNavActive}>
                    {name}
                </NavLink>
            </summary>
            <ul className="z-98 p-2" onClick={onSubMenuClick}>
                {API_NAMES.map((apiName, idx) => (
                    <li key={`${idx}-${apiName}`}>
                        <NavLink to={`${navPath}/${idx}`} className={isNavActive}>
                            {apiName}
                        </NavLink>
                    </li>
                ))}
            </ul>
        </details>
    );
});

const NavBar = memo(({ showNotifications, setShowNotifications }: NavBarProps) => {
    const { t } = useTranslation(["navbar", "common"]);
    const notificationsAlert = useAppStore((state) => state.notificationsAlert);

    const onDropdownMenuClick = useCallback(() => {
        if (document.activeElement instanceof HTMLElement && document.activeElement !== document.body) {
            document.activeElement.blur();
        }
    }, []);

    const isNavActive = ({ isActive }: NavLinkRenderProps) => (isActive ? "menu-active" : "");

    const links = (
        <>
            <li>
                <NavLink to="/devices" className={isNavActive}>
                    {t("devices")}
                </NavLink>
            </li>
            <li>
                <NavLink to="/dashboard" className={isNavActive}>
                    {t("dashboard")}
                </NavLink>
            </li>
            <li>
                <NavLink to="/groups" className={isNavActive}>
                    {t("groups")}
                </NavLink>
            </li>
            <li>
                <NavLink to="/ota" className={isNavActive}>
                    {t("ota")}
                </NavLink>
            </li>
            <li>
                <NavLink to="/touchlink" className={isNavActive}>
                    {t("touchlink")}
                </NavLink>
            </li>
            <li>
                {API_NAMES.length > 1 ? (
                    <NavBarSubMenu name={t("network")} navPath="/network" isNavActive={isNavActive} />
                ) : (
                    <NavLink to="/network" className={isNavActive}>
                        {t("network")}
                    </NavLink>
                )}
            </li>
            <li>
                {API_NAMES.length > 1 ? (
                    <NavBarSubMenu name={t("logs")} navPath="/logs" isNavActive={isNavActive} />
                ) : (
                    <NavLink to="/logs" className={isNavActive}>
                        {t("logs")}
                    </NavLink>
                )}
            </li>
            <li>
                {API_NAMES.length > 1 ? (
                    <NavBarSubMenu name={t("settings")} navPath="/settings" isNavActive={isNavActive} />
                ) : (
                    <NavLink to="/settings" className={isNavActive}>
                        {t("settings")}
                    </NavLink>
                )}
            </li>
            <li>
                <NavLink to="/frontend-settings" className={isNavActive}>
                    <FontAwesomeIcon icon={faDisplay} size={"xl"} />
                </NavLink>
            </li>
        </>
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
                    <Button<boolean> className="drawer-button btn" item={!showNotifications} onClick={setShowNotifications}>
                        <FontAwesomeIcon icon={faInbox} />
                        {notificationsAlert[0] ? (
                            <span className="status status-primary animate-bounce" />
                        ) : notificationsAlert[1] ? (
                            <span className="status status-error animate-bounce" />
                        ) : null}
                    </Button>
                </ul>
            </div>
        </div>
    );
});

const NavBarWithNotifications = memo(() => {
    const [showNotifications, setShowNotifications] = useState(false);

    return (
        <>
            <NavBar showNotifications={showNotifications} setShowNotifications={setShowNotifications} />
            {showNotifications && <Notifications setShowNotifications={setShowNotifications} />}
        </>
    );
});

export default NavBarWithNotifications;
