import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { memo, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { RootState } from "../../store.js";
import type { FeatureWithAnySubFeatures, Group } from "../../types.js";
import ConfirmButton from "../ConfirmButton.js";
import DashboardFeatureWrapper from "../dashboard-page/DashboardFeatureWrapper.js";
import DeviceCard from "../device/DeviceCard.js";
import { getScenesFeatures } from "../device-page/index.js";

interface GroupMemberProps {
    device: RootState["devices"][number];
    deviceState: RootState["deviceStates"][string];
    groupMember: Group["members"][number];
    lastSeenConfig: RootState["bridgeInfo"]["config"]["advanced"]["last_seen"];
    removeDeviceFromGroup(deviceIeee: string, endpoint: number): Promise<void>;
    setDeviceState(ieee: string, value: Record<string, unknown>): Promise<void>;
    getDeviceState(ieee: string, value: Record<string, unknown>): Promise<void>;
}

const GroupMember = memo((props: GroupMemberProps) => {
    const { removeDeviceFromGroup, groupMember, device, deviceState, lastSeenConfig, setDeviceState, getDeviceState } = props;
    const { endpoint } = groupMember;
    const { t } = useTranslation(["groups", "common"]);

    const filteredFeatures = useMemo(() => {
        const features: FeatureWithAnySubFeatures[] = [];

        for (const feature of device.definition?.exposes ?? []) {
            const validFeature = getScenesFeatures(feature, deviceState);

            if (validFeature) {
                features.push(validFeature);

                // limit size of cards
                if (features.length === 10) {
                    break;
                }
            }
        }

        return features;
    }, [device, deviceState]);

    const onCardChange = useCallback(
        async (value: Record<string, unknown>) => await setDeviceState(device.ieee_address, value),
        [device.ieee_address, setDeviceState],
    );

    const onCardRead = useCallback(
        async (value: Record<string, unknown>) => await getDeviceState(device.ieee_address, value),
        [device.ieee_address, getDeviceState],
    );

    const onCardRemove = useCallback(
        async () => await removeDeviceFromGroup(device.ieee_address, endpoint),
        [device.ieee_address, endpoint, removeDeviceFromGroup],
    );

    return (
        <DeviceCard
            features={filteredFeatures}
            device={device}
            endpoint={endpoint}
            deviceState={deviceState}
            onChange={onCardChange}
            onRead={onCardRead}
            featureWrapperClass={DashboardFeatureWrapper}
            lastSeenConfig={lastSeenConfig}
        >
            <ConfirmButton<string>
                onClick={onCardRemove}
                className="btn btn-square btn-error btn-sm"
                title={t("remove_from_group")}
                modalDescription={t("common:dialog_confirmation_prompt")}
                modalCancelLabel={t("common:cancel")}
            >
                <FontAwesomeIcon icon={faTrash} />
            </ConfirmButton>
        </DeviceCard>
    );
});

export default GroupMember;
