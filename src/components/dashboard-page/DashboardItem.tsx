import NiceModal from "@ebay/nice-modal-react";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import type { Device, DeviceState, FeatureWithAnySubFeatures, LastSeenConfig } from "../../types.js";
import { WebSocketApiRouterContext } from "../../WebSocketApiRouterContext.js";
import Button from "../Button.js";
import DeviceCard from "../device/DeviceCard.js";
import DeviceControlEditName from "../device/DeviceControlEditName.js";
import { RemoveDeviceModal } from "../modal/components/RemoveDeviceModal.js";
import DashboardFeatureWrapper from "./DashboardFeatureWrapper.js";

export type DashboardItemProps = {
    data: {
        sourceIdx: number;
        device: Device;
        deviceState: DeviceState;
        features: FeatureWithAnySubFeatures[];
        lastSeenConfig: LastSeenConfig;
        homeassistantEnabled: boolean;
        renameDevice: (sourceIdx: number, from: string, to: string, homeassistantRename: boolean) => Promise<void>;
        removeDevice: (sourceIdx: number, id: string, force: boolean, block: boolean) => Promise<void>;
    };
};

const DashboardItem = ({
    sourceIdx,
    device,
    deviceState,
    features,
    lastSeenConfig,
    homeassistantEnabled,
    renameDevice,
    removeDevice,
}: DashboardItemProps["data"]) => {
    const { t } = useTranslation("zigbee");
    const { sendMessage } = useContext(WebSocketApiRouterContext);

    const onCardChange = useCallback(
        async (value: unknown) => {
            await sendMessage<"{friendlyNameOrId}/set">(
                sourceIdx,
                // @ts-expect-error templated API endpoint
                `${device.ieee_address}/set`,
                value,
            );
        },
        [sourceIdx, device.ieee_address, sendMessage],
    );

    return (
        <div className="mb-3 card bg-base-200 rounded-box shadow-md">
            <DeviceCard
                features={features}
                sourceIdx={sourceIdx}
                device={device}
                deviceState={deviceState}
                onChange={onCardChange}
                featureWrapperClass={DashboardFeatureWrapper}
                lastSeenConfig={lastSeenConfig}
            >
                <div className="join join-horizontal">
                    <DeviceControlEditName
                        sourceIdx={sourceIdx}
                        name={device.friendly_name}
                        renameDevice={renameDevice}
                        homeassistantEnabled={homeassistantEnabled}
                        style="btn-outline btn-primary btn-square btn-sm join-item"
                    />
                    <Button<void>
                        onClick={async () => await NiceModal.show(RemoveDeviceModal, { sourceIdx, device, removeDevice })}
                        className="btn btn-outline btn-error btn-square btn-sm join-item"
                        title={t("remove_device")}
                    >
                        <FontAwesomeIcon icon={faTrash} />
                    </Button>
                </div>
            </DeviceCard>
        </div>
    );
};

const DashboardItemGuarded = (props: DashboardItemProps) => {
    // when filtering, indexing can get "out-of-whack" it appears
    return props?.data ? <DashboardItem {...props.data} /> : null;
};

export default DashboardItemGuarded;
