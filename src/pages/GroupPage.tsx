import { faCogs, faObjectGroup } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { lazy, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, type NavLinkRenderProps, useNavigate, useParams } from "react-router";
import HeaderGroupSelector from "../components/group-page/HeaderGroupSelector.js";
import { useAppStore } from "../store.js";

export type TabName = "devices" | "settings";

type GroupPageUrlParams = {
    groupId: string;
    tab?: TabName;
};

const DevicesTab = lazy(async () => await import("../components/group-page/tabs/Devices.js"));
const GroupSettingsTab = lazy(async () => await import("../components/group-page/tabs/GroupSettings.js"));

export default function GroupPage() {
    const navigate = useNavigate();
    const { t } = useTranslation(["groups", "common"]);
    const { groupId, tab } = useParams<GroupPageUrlParams>();
    const groups = useAppStore((state) => state.groups);
    const groupIdNum = Number.parseInt(groupId!, 10);
    const group = groupId ? groups.find((group) => group.id === groupIdNum) : undefined;

    useEffect(() => {
        if (!tab && group) {
            navigate(`/group/${group.id}/devices`, { replace: true });
        }
    }, [tab, group, navigate]);

    const isTabActive = ({ isActive }: NavLinkRenderProps) => (isActive ? "tab tab-active" : "tab");

    const content = useMemo(() => {
        if (!group) {
            return <div className="flex-auto justify-center items-center">{t("common:unknown_group")}</div>;
        }

        switch (tab) {
            case "devices":
                return <DevicesTab group={group} />;
            case "settings":
                return <GroupSettingsTab group={group} />;
        }
    }, [tab, group, t]);

    return (
        <>
            <HeaderGroupSelector groups={groups} currentGroup={group} tab={tab} />
            <div className="tabs tabs-border mt-2">
                <NavLink to={`/group/${groupId!}/devices`} className={isTabActive}>
                    <FontAwesomeIcon icon={faObjectGroup} className="me-2" />
                    {t("common:devices")}
                </NavLink>
                <NavLink to={`/group/${groupId!}/settings`} className={isTabActive}>
                    <FontAwesomeIcon icon={faCogs} className="me-2" />
                    {t("settings")}
                </NavLink>
            </div>
            <div className="tab-content block h-full bg-base-100 p-3">{content}</div>
        </>
    );
}
