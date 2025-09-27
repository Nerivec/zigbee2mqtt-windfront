import { faBars, faInbox } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { memo, type useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppStore } from "../store.js";
import { useNavBarContent } from "./NavBarContext.js";

type NavBarProps = {
    setSidebarCollapsed: ReturnType<typeof useState<boolean>>[1];
    showNotifications: boolean;
    setShowNotifications: ReturnType<typeof useState<boolean>>[1];
};

const NavBar = memo(({ setSidebarCollapsed, showNotifications, setShowNotifications }: NavBarProps) => {
    const content = useNavBarContent();
    const { t } = useTranslation("common");

    const notificationsAlert = useAppStore((state) => state.notificationsAlert);

    return (
        <div className="navbar bg-base-200 shadow w-full">
            <div className="flex flex-row items-center gap-1 w-full">
                <label
                    htmlFor="sidebar-drawer"
                    className="btn btn-ghost lg:hidden"
                    aria-label="show sidebar"
                    onClick={() => setSidebarCollapsed(false)}
                >
                    <FontAwesomeIcon icon={faBars} />
                </label>
                {content}
            </div>

            <div className="flex flex-row flex-wrap gap-1 items-center ml-auto">
                <label
                    htmlFor="notifications-drawer"
                    className="drawer-button btn btn-outline btn-primary tooltip tooltip-left"
                    data-tip={t(($) => $.notifications)}
                    aria-label="toggle notifications"
                    onClick={() => setShowNotifications(!showNotifications)}
                >
                    <FontAwesomeIcon icon={faInbox} />
                    {notificationsAlert[0] ? (
                        <span className="status status-primary animate-bounce" />
                    ) : notificationsAlert[1] ? (
                        <span className="status status-error animate-bounce" />
                    ) : null}
                </label>
            </div>
        </div>
    );
});

export default NavBar;
