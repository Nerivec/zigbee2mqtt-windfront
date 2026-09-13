import NiceModal from "@ebay/nice-modal-react";
import { faChevronDown, faChevronUp, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { Row } from "@tanstack/react-table";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import type { DashboardTableData } from "../../pages/Dashboard.js";
import { sendMessage } from "../../websocket/WebSocketManager.js";
import Button from "../Button.js";
import DeviceCard from "../device/DeviceCard.js";
import { RemoveDeviceModal } from "../modal/components/RemoveDeviceModal.js";
import DashboardFeatureWrapper from "./DashboardFeatureWrapper.js";

const DashboardItem = ({
    original: { sourceIdx, device, deviceState, deviceAvailability, features, lastSeenConfig, removeDevice, collapsed },
}: Row<DashboardTableData>) => {
    const { t } = useTranslation(["zigbee", "common"]);
    // tile-level expansion override on top of the page-level compact setting
    const [expanded, setExpanded] = useState(false);
    const tileCollapsed = collapsed && !expanded;

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
            className={`mb-3 card bg-base-200 rounded-box shadow-md ${tileCollapsed ? "cursor-pointer" : ""} ${deviceAvailability === "disabled" ? "card-dash border-warning/40" : deviceAvailability === "offline" ? "card-border border-error/50" : "card-border border-base-300"}`}
            title={tileCollapsed ? t(($) => $.expand, { ns: "common" }) : undefined}
            onClick={onTileClick}
        >
            <DeviceCard
                features={features}
                sourceIdx={sourceIdx}
                device={device}
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
                    <Button<void>
                        onClick={async () => await NiceModal.show(RemoveDeviceModal, { sourceIdx, device, removeDevice })}
                        className="btn btn-outline btn-error btn-square btn-sm join-item tooltip-left"
                        title={t(($) => $.remove_device)}
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
