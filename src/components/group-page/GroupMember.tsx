import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";
import { type AppState, useAppStore } from "../../store.js";
import type { AvailabilityState } from "../../types.js";
import ConfirmButton from "../ConfirmButton.js";
import DashboardFeatureWrapper from "../dashboard-page/DashboardFeatureWrapper.js";
import DeviceCard from "../device/DeviceCard.js";

export type GroupMemberProps = {
    data: {
        sourceIdx: number;
        device: AppState["devices"][number][number];
        deviceState: AppState["deviceStates"][number][string];
        deviceAvailability: AvailabilityState["state"] | "disabled";
        groupMember: AppState["groups"][number][number]["members"][number];
        lastSeenConfig: AppState["bridgeInfo"][number]["config"]["advanced"]["last_seen"];
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
    removeDeviceFromGroup,
    setDeviceState,
}: GroupMemberProps["data"]) => {
    const { endpoint } = groupMember;
    const { t } = useTranslation(["groups", "common"]);
    const scenesFeatures = useAppStore(useShallow((state) => state.deviceScenesFeatures[sourceIdx][device.ieee_address] ?? []));

    const onCardChange = useCallback(
        async (value: Record<string, unknown>) => await setDeviceState(device.ieee_address, value),
        [device.ieee_address, setDeviceState],
    );

    const onCardRemove = useCallback(
        async () => await removeDeviceFromGroup(device.ieee_address, endpoint),
        [device.ieee_address, endpoint, removeDeviceFromGroup],
    );

    return (
        <div
            className={`mb-3 card card-border bg-base-200 rounded-box shadow-md ${deviceAvailability === "offline" ? "border-error/50" : "border-base-300"}`}
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
            >
                <ConfirmButton<string>
                    onClick={onCardRemove}
                    className="btn btn-square btn-outline btn-error btn-sm"
                    title={t(($) => $.remove_from_group)}
                    modalDescription={t(($) => $.dialog_confirmation_prompt, { ns: "common" })}
                    modalCancelLabel={t(($) => $.cancel, { ns: "common" })}
                >
                    <FontAwesomeIcon icon={faTrash} />
                </ConfirmButton>
            </DeviceCard>
        </div>
    );
};

const GroupMemberGuarded = (props: GroupMemberProps) => {
    // when filtering, indexing can get "out-of-whack" it appears
    return props?.data ? <GroupMember {...props.data} /> : null;
};

export default GroupMemberGuarded;
