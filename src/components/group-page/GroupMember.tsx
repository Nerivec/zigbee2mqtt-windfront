import { faChevronDown, faChevronUp, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";
import { type AppState, useAppStore } from "../../store.js";
import type { DeviceAvailability } from "../../types.js";
import Button from "../Button.js";
import ConfirmButton from "../ConfirmButton.js";
import DashboardFeatureWrapper from "../dashboard-page/DashboardFeatureWrapper.js";
import DeviceCard from "../device/DeviceCard.js";

export type GroupMemberProps = {
    data: {
        sourceIdx: number;
        device: AppState["devices"][number][number];
        deviceState: AppState["deviceStates"][number][string];
        deviceAvailability: DeviceAvailability;
        groupMember: AppState["groups"][number][number]["members"][number];
        lastSeenConfig: AppState["bridgeInfo"][number]["config"]["advanced"]["last_seen"];
        collapsed: boolean;
        removeDeviceFromGroup(deviceIeee: string, endpoint: number): Promise<void>;
        setDeviceState(ieee: string, value: Record<string, unknown>): Promise<void>;
    };
};

const GroupMember = ({
    sourceIdx,
    device,
    deviceState,
    deviceAvailability,
    groupMember,
    lastSeenConfig,
    collapsed,
    removeDeviceFromGroup,
    setDeviceState,
}: GroupMemberProps["data"]) => {
    const { endpoint } = groupMember;
    const { t } = useTranslation(["groups", "common"]);
    const scenesFeatures = useAppStore(useShallow((state) => state.deviceScenesFeatures[sourceIdx][device.ieee_address] ?? []));
    // tile-level expansion override on top of the page-level compact setting
    const [expanded, setExpanded] = useState(false);
    const tileCollapsed = collapsed && !expanded;

    const onCardChange = useCallback(
        async (value: Record<string, unknown>) => await setDeviceState(device.ieee_address, value),
        [device.ieee_address, setDeviceState],
    );

    const onCardRemove = useCallback(
        async () => await removeDeviceFromGroup(device.ieee_address, endpoint),
        [device.ieee_address, endpoint, removeDeviceFromGroup],
    );

    const onTileClick = tileCollapsed
        ? (e: React.MouseEvent<HTMLDivElement>) => {
              // ignore clicks on interactive elements inside the tile
              if (!(e.target as HTMLElement).closest("a, button, input, select, textarea, label")) {
                  setExpanded(true);
              }
          }
        : undefined;

    return (
        <div
            className={`mb-3 card card-border bg-base-200 rounded-box shadow-md ${tileCollapsed ? "cursor-pointer" : ""} ${deviceAvailability === "offline" ? "border-error/50" : "border-base-300"}`}
            title={tileCollapsed ? t(($) => $.expand, { ns: "common" }) : undefined}
            onClick={onTileClick}
        >
            <DeviceCard
                sourceIdx={sourceIdx}
                hideSourceDot
                features={scenesFeatures}
                device={device}
                endpoint={endpoint}
                deviceState={deviceState}
                onChange={onCardChange}
                featureWrapperClass={DashboardFeatureWrapper}
                lastSeenConfig={lastSeenConfig}
                collapsed={tileCollapsed}
                headerAction={
                    collapsed ? (
                        <Button
                            onClick={() => setExpanded(!expanded)}
                            className="btn btn-ghost btn-square btn-xs"
                            title={expanded ? t(($) => $.collapse, { ns: "common" }) : t(($) => $.expand, { ns: "common" })}
                            aria-label={expanded ? t(($) => $.collapse, { ns: "common" }) : t(($) => $.expand, { ns: "common" })}
                        >
                            <FontAwesomeIcon icon={expanded ? faChevronUp : faChevronDown} />
                        </Button>
                    ) : undefined
                }
            >
                <div className="join join-horizontal">
                    <ConfirmButton<string>
                        onClick={onCardRemove}
                        className="btn btn-square btn-outline btn-error btn-sm join-item"
                        title={t(($) => $.remove_from_group)}
                        modalDescription={t(($) => $.dialog_confirmation_prompt, { ns: "common" })}
                        modalCancelLabel={t(($) => $.cancel, { ns: "common" })}
                    >
                        <FontAwesomeIcon icon={faTrash} />
                    </ConfirmButton>
                </div>
            </DeviceCard>
        </div>
    );
};

const GroupMemberGuarded = (props: GroupMemberProps) => {
    // when filtering, indexing can get "out-of-whack" it appears
    return props?.data ? <GroupMember {...props.data} /> : null;
};

export default GroupMemberGuarded;
