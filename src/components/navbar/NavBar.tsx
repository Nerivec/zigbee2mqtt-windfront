import { faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link, NavLink } from "react-router";
import { WebSocketApiRouterContext } from "../../WebSocketApiRouterContext.js";
import { useAppSelector } from "../../hooks/useApp.js";
import LanguageSwitcher from "../../i18n/LanguageSwitcher.js";
import ConfirmButton from "../ConfirmButton.js";
import ThemeSwitcher from "../ThemeSwitcher.js";
import ApiUrlSwitcher from "./ApiUrlSwitcher.js";
import PermitJoinButton from "./PermitJoinButton.js";

const URLS = [
    {
        href: "/devices",
        key: "devices",
    },
    {
        href: "/dashboard",
        key: "dashboard",
    },
    {
        href: "/groups",
        key: "groups",
    },
    {
        href: "/ota",
        key: "ota",
    },
    {
        href: "/touchlink",
        key: "touchlink",
    },
    {
        href: "/network",
        key: "network",
    },
    {
        href: "/logs",
        key: "logs",
    },
    {
        href: "/settings",
        key: "settings",
    },
];

const NavBar = () => {
    const { t } = useTranslation(["navbar", "common"]);
    const restartRequired = useAppSelector((state) => state.bridgeInfo.restart_required);
    const { sendMessage } = useContext(WebSocketApiRouterContext);

    const links = useMemo(
        () => (
            <>
                {URLS.map((url) => (
                    <li key={url.href}>
                        <NavLink to={url.href} className={({ isActive }) => (isActive ? "menu-active" : "")}>
                            {t(url.key)}
                        </NavLink>
                    </li>
                ))}
            </>
        ),
        [t],
    );
    const showRestart = useMemo(
        () =>
            restartRequired ? (
                <ConfirmButton
                    className="btn btn-error me-1 animate-pulse"
                    onClick={async () => await sendMessage("bridge/request/restart", "")}
                    title={t("restart")}
                    modalDescription={t("common:dialog_confirmation_prompt")}
                    modalCancelLabel={t("common:cancel")}
                >
                    {t("restart")}
                </ConfirmButton>
            ) : null,
        [restartRequired, sendMessage, t],
    );

    return (
        <div className="navbar bg-base-200 shadow">
            <div className="navbar-start">
                <div className="dropdown">
                    {/* biome-ignore lint/a11y/noNoninteractiveTabindex: daisyui dropdown */}
                    <div className="btn btn-ghost lg:hidden" tabIndex={0}>
                        <FontAwesomeIcon icon={faBars} />
                    </div>
                    {/* biome-ignore lint/a11y/noNoninteractiveTabindex: daisyui dropdown */}
                    <ul tabIndex={0} className="menu dropdown-content bg-base-200 rounded-box z-1 mt-3 w-max p-2 shadow">
                        {links}
                    </ul>
                </div>
            </div>
            <Link
                to="/"
                className="link link-hover me-1"
                title={window.location !== window.parent.location ? `Zigbee2MQTT@${document.location.hostname}` : undefined}
            >
                Zigbee2MQTT
            </Link>
            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-1">{links}</ul>
            </div>
            <div className="navbar-end">
                <ul className="menu menu-horizontal px-1">
                    <PermitJoinButton />
                    {showRestart}
                    <LanguageSwitcher />
                    <ThemeSwitcher />
                    <ApiUrlSwitcher />
                </ul>
            </div>
        </div>
    );
};

export default NavBar;
