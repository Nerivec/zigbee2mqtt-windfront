import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { memo, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { AppState } from "../../store.js";
import { filterExposes } from "../../utils.js";
import ConfirmButton from "../ConfirmButton.js";
import DashboardFeatureWrapper from "../dashboard-page/DashboardFeatureWrapper.js";
import DeviceCard from "../device/DeviceCard.js";
import { isValidForScenes } from "../device-page/index.js";

interface GroupMemberProps {
    sourceIdx: number;
    device: AppState["devices"][number][number];
    deviceState: AppState["deviceStates"][number][string];
    groupMember: AppState["groups"][number][number]["members"][number];
    lastSeenConfig: AppState["bridgeInfo"][number]["config"]["advanced"]["last_seen"];
    removeDeviceFromGroup(deviceIeee: string, endpoint: number): Promise<void>;
    setDeviceState(ieee: string, value: Record<string, unknown>): Promise<void>;
}

const GroupMember = memo(
    ({ sourceIdx, device, deviceState, groupMember, lastSeenConfig, removeDeviceFromGroup, setDeviceState }: GroupMemberProps) => {
        const { endpoint } = groupMember;
        const { t } = useTranslation(["groups", "common"]);
        const filteredFeatures = useMemo(() => (device.definition ? filterExposes(device.definition.exposes, isValidForScenes) : []), [device]);

        const onCardChange = useCallback(
            async (value: Record<string, unknown>) => await setDeviceState(device.ieee_address, value),
            [device.ieee_address, setDeviceState],
        );

        const onCardRemove = useCallback(
            async () => await removeDeviceFromGroup(device.ieee_address, endpoint),
            [device.ieee_address, endpoint, removeDeviceFromGroup],
        );

        return (
            <DeviceCard
                sourceIdx={sourceIdx}
                hideSourceDot
                features={filteredFeatures}
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
                    title={t("remove_from_group")}
                    modalDescription={t("common:dialog_confirmation_prompt")}
                    modalCancelLabel={t("common:cancel")}
                >
                    <FontAwesomeIcon icon={faTrash} />
                </ConfirmButton>
            </DeviceCard>
        );
    },
);

export default GroupMember;
