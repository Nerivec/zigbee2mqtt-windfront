import { faBars, faDisplay, faInbox } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { memo, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, NavLink, type NavLinkRenderProps } from "react-router";
import { useAppStore } from "../../store.js";
import Button from "../Button.js";
import Notifications from "../Notifications.js";
import LanguageSwitcher from "./LanguageSwitcher.js";
import PermitJoinButton from "./PermitJoinButton.js";
import ThemeSwitcher from "./ThemeSwitcher.js";

type NavBarProps = {
    showNotifications: boolean;
    setShowNotifications: ReturnType<typeof useState<boolean>>[1];
};

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
                <NavLink to="/network" className={isNavActive}>
                    {t("network")}
                </NavLink>
            </li>
            <li>
                <NavLink to="/logs" className={isNavActive}>
                    {t("logs")}
                </NavLink>
            </li>
            <li>
                <NavLink to="/settings" className={isNavActive}>
                    {t("settings")}
                </NavLink>
            </li>
            <li>
                <NavLink to="/frontend-settings" className={isNavActive}>
                    <FontAwesomeIcon icon={faDisplay} size={"xl"} />
                </NavLink>
            </li>
        </>
    );

    return (
        <div className="navbar bg-base-200 shadow px-1 py-1 sm:py-0 w-full">
            <div className="flex flex-row items-center">
                <div className="dropdown">
                    {/** biome-ignore lint/a11y/useSemanticElements: https://daisyui.com/components/dropdown/#method-3-css-focus */}
                    <div className="btn btn-ghost lg:hidden" role="button" tabIndex={0}>
                        <FontAwesomeIcon icon={faBars} />
                    </div>
                    <ul
                        // biome-ignore lint/a11y/noNoninteractiveTabindex: https://daisyui.com/components/dropdown/#method-3-css-focus
                        tabIndex={0}
                        className="menu dropdown-content bg-base-200 rounded-box z-1 mt-3 w-max p-2 shadow"
                        onClick={onDropdownMenuClick}
                    >
                        {links}
                    </ul>
                </div>
            </div>
            <div className="flex flex-row items-center hidden lg:flex 2xl:ml-auto">
                <Link
                    to="/"
                    className="link link-hover mx-2"
                    title={window.location !== window.parent.location ? `Zigbee2MQTT@${window.location.hostname}` : undefined}
                >
                    Zigbee2MQTT
                </Link>
                <ul className="menu menu-horizontal px-1">{links}</ul>
            </div>
            <div className="flex flex-row flex-wrap gap-1 items-center ml-auto">
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
