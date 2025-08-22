import { faCogs, faObjectGroup } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { lazy, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, type NavLinkRenderProps, useNavigate, useParams } from "react-router";
import { useShallow } from "zustand/react/shallow";
import HeaderGroupSelector from "../components/group-page/HeaderGroupSelector.js";
import { useAppStore } from "../store.js";
import type { Group } from "../types.js";
import { getValidSourceIdx } from "../utils.js";

export type TabName = "devices" | "settings";

type GroupPageUrlParams = {
    sourceIdx: `${number}`;
    groupId: string;
    tab?: TabName;
};

const DevicesTab = lazy(async () => await import("../components/group-page/tabs/Devices.js"));
const GroupSettingsTab = lazy(async () => await import("../components/group-page/tabs/GroupSettings.js"));

function renderTab(sourceIdx: number, tab: TabName, group: Group) {
    const key = `${sourceIdx}-${group.id}`;

    switch (tab) {
        case "devices":
            return <DevicesTab key={key} sourceIdx={sourceIdx} group={group} />;
        case "settings":
            return <GroupSettingsTab key={key} sourceIdx={sourceIdx} group={group} />;
    }
}

export default function GroupPage() {
    const navigate = useNavigate();
    const { t } = useTranslation(["groups", "common"]);
    const { sourceIdx, groupId, tab } = useParams<GroupPageUrlParams>();
    const [numSourceIdx, validSourceIdx] = getValidSourceIdx(sourceIdx);
    const groupIdNum = Number.parseInt(groupId!, 10);
    const group = useAppStore(useShallow((state) => (groupId ? state.groups[numSourceIdx].find((group) => group.id === groupIdNum) : undefined)));

    useEffect(() => {
        if (sourceIdx && validSourceIdx && group) {
            if (!tab) {
                navigate(`/group/${sourceIdx}/${group.id}/devices`, { replace: true });
            }
        } else {
            navigate("/groups", { replace: true });
        }
    }, [sourceIdx, validSourceIdx, tab, group, navigate]);

    const isTabActive = ({ isActive }: NavLinkRenderProps) => (isActive ? "tab tab-active" : "tab");

    return (
        <>
            <HeaderGroupSelector currentSourceIdx={numSourceIdx} currentGroup={group} tab={tab} />
            <div className="tabs tabs-border mt-2">
                <NavLink to={`/group/${numSourceIdx}/${groupId}/devices`} className={isTabActive}>
                    <FontAwesomeIcon icon={faObjectGroup} className="me-2" />
                    {t("common:devices")}
                </NavLink>
                <NavLink to={`/group/${numSourceIdx}/${groupId}/settings`} className={isTabActive}>
                    <FontAwesomeIcon icon={faCogs} className="me-2" />
                    {t("settings")}
                </NavLink>
            </div>
            <div className="tab-content block h-full bg-base-100 p-3">
                {tab && group ? (
                    renderTab(numSourceIdx, tab, group)
                ) : (
                    <div className="flex-auto justify-center items-center">{t("common:unknown_group")}</div>
                )}
            </div>
        </>
    );
}
