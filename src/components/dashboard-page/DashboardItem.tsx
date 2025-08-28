import NiceModal from "@ebay/nice-modal-react";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { Row } from "@tanstack/react-table";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import type { DashboardTableData } from "../../pages/Dashboard.js";
import { sendMessage } from "../../websocket/WebSocketManager.js";
import Button from "../Button.js";
import DeviceCard from "../device/DeviceCard.js";
import { RemoveDeviceModal } from "../modal/components/RemoveDeviceModal.js";
import DashboardFeatureWrapper from "./DashboardFeatureWrapper.js";

const DashboardItem = ({ original: { sourceIdx, device, deviceState, features, lastSeenConfig, removeDevice } }: Row<DashboardTableData>) => {
    const { t } = useTranslation("zigbee");

    const onCardChange = useCallback(
        async (value: unknown) => {
            await sendMessage<"{friendlyNameOrId}/set">(
                sourceIdx,
                // @ts-expect-error templated API endpoint
                `${device.ieee_address}/set`,
                value,
            );
        },
        [sourceIdx, device.ieee_address],
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

const DashboardItemGuarded = (props: { data: Row<DashboardTableData> }) => {
    // when filtering, indexing can get "out-of-whack" it appears
    return props?.data ? <DashboardItem {...props.data} /> : null;
};

export default DashboardItemGuarded;
