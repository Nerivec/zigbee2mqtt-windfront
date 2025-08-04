import NiceModal from "@ebay/nice-modal-react";
import { faEraser, faMagnifyingGlass, faTable, faTableColumns, faTrash } from "@fortawesome/free-solid-svg-icons";
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
import { useAppSelector } from "../hooks/useApp.js";
import { DASHBOARD_COLUMN_DISPLAY_KEY, DASHBOARD_FILTER_KEY } from "../localStoreConsts.js";
import type { FeatureWithAnySubFeatures } from "../types.js";
import { filterExposes } from "../utils.js";
import { WebSocketApiRouterContext } from "../WebSocketApiRouterContext.js";

export default function Dashboard() {
    const deviceStates = useAppSelector((state) => state.deviceStates);
    const bridgeConfig = useAppSelector((state) => state.bridgeInfo.config);
    const devices = useAppSelector((state) => state.devices);
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const { t } = useTranslation(["zigbee", "settings"]);
    const [filterValue, setFilterValue] = useState(store2.get(DASHBOARD_FILTER_KEY, ""));
    const [columnDisplay, setColumnDisplay] = useState<boolean>(store2.get(DASHBOARD_COLUMN_DISPLAY_KEY, false));

    useEffect(() => {
        store2.set(DASHBOARD_FILTER_KEY, filterValue);
    }, [filterValue]);

    const renameDevice = useCallback(
        async (from: string, to: string, homeassistantRename: boolean): Promise<void> => {
            await sendMessage("bridge/request/device/rename", {
                from,
                to,
                homeassistant_rename: homeassistantRename,
                last: false,
            });
        },
        [sendMessage],
    );

    const removeDevice = useCallback(
        async (id: string, force: boolean, block: boolean): Promise<void> => {
            await sendMessage("bridge/request/device/remove", { id, force, block });
        },
        [sendMessage],
    );

    const onDisplayClick = useCallback((value: boolean) => {
        store2.set(DASHBOARD_COLUMN_DISPLAY_KEY, value);
        setColumnDisplay(value);
    }, []);

    const filteredDevices = useMemo(() => {
        const filteredDevices: JSX.Element[] = [];

        for (const device of devices) {
            if (!device.disabled && device.supported && (!filterValue || device.friendly_name.toLowerCase().includes(filterValue.toLowerCase()))) {
                const deviceState = deviceStates[device.friendly_name] ?? {};
                const filteredFeatures: FeatureWithAnySubFeatures[] = device.definition
                    ? filterExposes(device.definition.exposes, isValidForDashboard)
                    : [];

                if (filteredFeatures.length > 0) {
                    filteredDevices.push(
                        <div
                            className={`${columnDisplay ? "break-inside-avoid-column mb-3" : "w-[23rem]"} card bg-base-200 rounded-box shadow-md`}
                            key={device.ieee_address}
                        >
                            <DeviceCard
                                features={filteredFeatures}
                                device={device}
                                deviceState={deviceState}
                                onChange={async (value) =>
                                    await sendMessage<"{friendlyNameOrId}/set">(
                                        // @ts-expect-error templated API endpoint
                                        `${device.ieee_address}/set`,
                                        value,
                                    )
                                }
                                onRead={async (value) =>
                                    await sendMessage<"{friendlyNameOrId}/get">(
                                        // @ts-expect-error templated API endpoint
                                        `${device.ieee_address}/get`,
                                        value,
                                    )
                                }
                                featureWrapperClass={DashboardFeatureWrapper}
                                lastSeenConfig={bridgeConfig.advanced.last_seen}
                            >
                                <div className="join join-horizontal">
                                    <DeviceControlEditName
                                        name={device.friendly_name}
                                        renameDevice={renameDevice}
                                        homeassistantEnabled={bridgeConfig.homeassistant.enabled}
                                        style="btn-outline btn-primary btn-square btn-sm join-item"
                                    />
                                    <Button<void>
                                        onClick={async () => await NiceModal.show(RemoveDeviceModal, { device, removeDevice })}
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

        return filteredDevices;
    }, [
        devices,
        deviceStates,
        bridgeConfig.advanced.last_seen,
        bridgeConfig.homeassistant.enabled,
        sendMessage,
        removeDevice,
        renameDevice,
        t,
        filterValue,
        columnDisplay,
    ]);

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
                        <FontAwesomeIcon icon={faEraser} />
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
            <div className={`${columnDisplay ? "columns-md" : "flex flex-row flex-wrap justify-center"} gap-3 mb-3`}>{filteredDevices}</div>
        </>
    );
}
