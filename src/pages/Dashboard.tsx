import NiceModal from "@ebay/nice-modal-react";
import { faClose, faMagnifyingGlass, faTable, faTableColumns, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type JSX, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import store2 from "store2";
import Button from "../components/Button.js";
import DashboardFeatureWrapper from "../components/dashboard-page/DashboardFeatureWrapper.js";
import { isValidForDashboard } from "../components/dashboard-page/index.js";
import DeviceCard from "../components/device/DeviceCard.js";
import DeviceControlEditName from "../components/device/DeviceControlEditName.js";
import DebouncedInput from "../components/form-fields/DebouncedInput.js";
import { RemoveDeviceModal } from "../components/modal/components/RemoveDeviceModal.js";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll.js";
import { DASHBOARD_COLUMN_DISPLAY_KEY, DASHBOARD_FILTER_KEY } from "../localStoreConsts.js";
import { API_URLS, useAppStore } from "../store.js";
import type { FeatureWithAnySubFeatures } from "../types.js";
import { filterExposes } from "../utils.js";
import { WebSocketApiRouterContext } from "../WebSocketApiRouterContext.js";

export default function Dashboard() {
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const deviceStates = useAppStore((state) => state.deviceStates);
    const bridgeInfo = useAppStore((state) => state.bridgeInfo);
    const devices = useAppStore((state) => state.devices);
    const { t } = useTranslation(["zigbee", "settings"]);
    const [filterValue, setFilterValue] = useState(store2.get(DASHBOARD_FILTER_KEY, ""));
    const [columnDisplay, setColumnDisplay] = useState<boolean>(store2.get(DASHBOARD_COLUMN_DISPLAY_KEY, false));

    useEffect(() => {
        store2.set(DASHBOARD_FILTER_KEY, filterValue);
    }, [filterValue]);

    const renameDevice = useCallback(
        async (sourceIdx: number, from: string, to: string, homeassistantRename: boolean): Promise<void> => {
            await sendMessage(sourceIdx, "bridge/request/device/rename", {
                from,
                to,
                homeassistant_rename: homeassistantRename,
                last: false,
            });
        },
        [sendMessage],
    );

    const removeDevice = useCallback(
        async (sourceIdx: number, id: string, force: boolean, block: boolean): Promise<void> => {
            await sendMessage(sourceIdx, "bridge/request/device/remove", { id, force, block });
        },
        [sendMessage],
    );

    const onDisplayClick = useCallback((value: boolean) => {
        store2.set(DASHBOARD_COLUMN_DISPLAY_KEY, value);
        setColumnDisplay(value);
    }, []);

    const filteredDevices = useMemo(() => {
        const elements: JSX.Element[] = [];

        for (let sourceIdx = 0; sourceIdx < API_URLS.length; sourceIdx++) {
            for (const device of devices[sourceIdx]) {
                if (
                    !device.disabled &&
                    device.supported &&
                    (!filterValue || device.friendly_name.toLowerCase().includes(filterValue.toLowerCase()))
                ) {
                    const deviceState = deviceStates[sourceIdx][device.friendly_name] ?? {};
                    const filteredFeatures: FeatureWithAnySubFeatures[] = device.definition
                        ? filterExposes(device.definition.exposes, isValidForDashboard)
                        : [];

                    if (filteredFeatures.length > 0) {
                        elements.push(
                            <div
                                className={`${columnDisplay ? "break-inside-avoid-column mb-3" : "w-[23rem]"} card bg-base-200 rounded-box shadow-md`}
                                key={`${device.friendly_name}-${device.ieee_address}-${sourceIdx}`}
                            >
                                <DeviceCard
                                    features={filteredFeatures}
                                    sourceIdx={sourceIdx}
                                    device={device}
                                    deviceState={deviceState}
                                    onChange={async (value) =>
                                        await sendMessage<"{friendlyNameOrId}/set">(
                                            sourceIdx,
                                            // @ts-expect-error templated API endpoint
                                            `${device.ieee_address}/set`,
                                            value,
                                        )
                                    }
                                    featureWrapperClass={DashboardFeatureWrapper}
                                    lastSeenConfig={bridgeInfo[sourceIdx].config.advanced.last_seen}
                                >
                                    <div className="join join-horizontal">
                                        <DeviceControlEditName
                                            sourceIdx={sourceIdx}
                                            name={device.friendly_name}
                                            renameDevice={renameDevice}
                                            homeassistantEnabled={bridgeInfo[sourceIdx].config.homeassistant.enabled}
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
                            </div>,
                        );
                    }
                }
            }
        }

        elements.sort((elA, elB) => elA.key!.localeCompare(elB.key!));

        return elements;
    }, [devices, deviceStates, bridgeInfo, sendMessage, removeDevice, renameDevice, t, filterValue, columnDisplay]);

    const { sentinelRef, renderItems } = useInfiniteScroll(filteredDevices, 24);

    return (
        <>
            <div className="flex flex-row justify-center items-center gap-3 mb-3">
                <div className="join">
                    {/* biome-ignore lint/a11y/noLabelWithoutControl: wrapped input */}
                    <label className="input w-64 join-item">
                        <FontAwesomeIcon icon={faMagnifyingGlass} />
                        <DebouncedInput
                            className=""
                            type="search"
                            onChange={(value) => setFilterValue(value.toString())}
                            placeholder={t("common:search")}
                            value={filterValue}
                        />
                    </label>
                    <Button item="" onClick={setFilterValue} className="btn btn-square join-item" title={t("common:clear")}>
                        <FontAwesomeIcon icon={faClose} />
                    </Button>
                </div>
                <Button<boolean>
                    className="btn btn-square"
                    item={!columnDisplay}
                    onClick={onDisplayClick}
                    title={`${t("settings:dashboard_column_display")}: ${columnDisplay}`}
                >
                    <FontAwesomeIcon icon={columnDisplay ? faTableColumns : faTable} />
                </Button>
            </div>
            <div className={`${columnDisplay ? "columns-md" : "flex flex-row flex-wrap justify-center"} gap-3 mb-3`}>{renderItems}</div>
            <div ref={sentinelRef} aria-hidden="true" style={{ height: 1, width: "100%" }} />
        </>
    );
}
