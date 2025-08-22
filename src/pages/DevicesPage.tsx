import { faServer } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ColumnDef } from "@tanstack/react-table";
import { type ChangeEvent, type JSX, useCallback, useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import store2 from "store2";
import DeviceControlGroup from "../components/device/DeviceControlGroup.js";
import DeviceImage from "../components/device/DeviceImage.js";
import CheckboxField from "../components/form-fields/CheckboxField.js";
import SourceDot from "../components/SourceDot.js";
import Table from "../components/table/Table.js";
import Availability from "../components/value-decorators/Availability.js";
import LastSeen from "../components/value-decorators/LastSeen.js";
import Lqi from "../components/value-decorators/Lqi.js";
import ModelLink from "../components/value-decorators/ModelLink.js";
import PowerSource from "../components/value-decorators/PowerSource.js";
import VendorLink from "../components/value-decorators/VendorLink.js";
import { useTable } from "../hooks/useTable.js";
import { DEVICES_HIDE_DISABLED_KEY } from "../localStoreConsts.js";
import { API_NAMES, API_URLS, useAppStore } from "../store.js";
import type { AvailabilityState, Device, DeviceState } from "../types.js";
import { convertLastSeenToDate, toHex } from "../utils.js";
import { WebSocketApiRouterContext } from "../WebSocketApiRouterContext.js";

type DeviceTableData = {
    sourceIdx: number;
    device: Device;
    state: DeviceState;
    availabilityState: AvailabilityState;
    availabilityEnabledForDevice: boolean | undefined;
};

export default function DevicesPage(): JSX.Element {
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const devices = useAppStore((state) => state.devices);
    const deviceStates = useAppStore((state) => state.deviceStates);
    const bridgeInfo = useAppStore((state) => state.bridgeInfo);
    const availability = useAppStore((state) => state.availability);
    const [hideDisabled, setHideDisabled] = useState<boolean>(store2.get(DEVICES_HIDE_DISABLED_KEY, false));
    const [batteryLowOnly, setBatteryLowOnly] = useState(false);
    const { t } = useTranslation(["zigbee", "common", "availability"]);

    const data = useMemo((): DeviceTableData[] => {
        const renderDevices: DeviceTableData[] = [];

        for (let sourceIdx = 0; sourceIdx < API_URLS.length; sourceIdx++) {
            for (const device of devices[sourceIdx]) {
                if (device.type !== "Coordinator" && (!hideDisabled || !device.disabled)) {
                    const state = deviceStates[sourceIdx][device.friendly_name] ?? {};
                    const deviceAvailability = bridgeInfo[sourceIdx].config.devices[device.ieee_address]?.availability;

                    if (batteryLowOnly) {
                        if (device.power_source !== "Battery") {
                            continue;
                        }

                        if ("battery" in state) {
                            if ((state.battery as number) >= 20) {
                                continue;
                            }
                        } else if ("battery_state" in state) {
                            if (state.battery_state !== "low") {
                                continue;
                            }
                        } else if ("battery_low" in state) {
                            if (!state.battery_low) {
                                continue;
                            }
                        } else {
                            continue;
                        }
                    }

                    renderDevices.push({
                        sourceIdx,
                        device,
                        state,
                        availabilityState: availability[sourceIdx][device.friendly_name] ?? { state: "offline" },
                        availabilityEnabledForDevice: deviceAvailability != null ? !!deviceAvailability : undefined,
                    });
                }
            }
        }

        return renderDevices;
    }, [devices, deviceStates, bridgeInfo, availability, hideDisabled, batteryLowOnly]);

    const onHideDisabledChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        store2.set(DEVICES_HIDE_DISABLED_KEY, e.target.checked);
        setHideDisabled(e.target.checked);
    }, []);

    const onBatteryLowOnlyChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setBatteryLowOnly(e.target.checked);
    }, []);

    const renameDevice = useCallback(
        async (sourceIdx: number, from: string, to: string, homeassistantRename: boolean): Promise<void> => {
            await sendMessage(sourceIdx, "bridge/request/device/rename", {
                from,
                to,
                homeassistant_rename: homeassistantRename,
                last: undefined,
            });
        },
        [sendMessage],
    );

    const configureDevice = useCallback(
        async ([sourceIdx, id]: [number, string]): Promise<void> => {
            await sendMessage(sourceIdx, "bridge/request/device/configure", { id });
        },
        [sendMessage],
    );

    const interviewDevice = useCallback(
        async ([sourceIdx, id]: [number, string]): Promise<void> => {
            await sendMessage(sourceIdx, "bridge/request/device/interview", { id });
        },
        [sendMessage],
    );

    const removeDevice = useCallback(
        async (sourceIdx: number, id: string, force: boolean, block: boolean): Promise<void> => {
            await sendMessage(sourceIdx, "bridge/request/device/remove", { id, force, block });
        },
        [sendMessage],
    );

    const columns = useMemo<ColumnDef<DeviceTableData, unknown>[]>(
        () => [
            {
                id: "source",
                size: 60,
                header: () => (
                    <span title={t("common:source")}>
                        <FontAwesomeIcon icon={faServer} />
                    </span>
                ),
                accessorFn: ({ sourceIdx }) => `${sourceIdx} ${API_NAMES[sourceIdx]}`,
                cell: ({
                    row: {
                        original: { sourceIdx },
                    },
                }) => <SourceDot idx={sourceIdx} nameClassName="hidden md:inline-block" />,
                enableColumnFilter: false,
            },
            {
                id: "friendly_name",
                size: 250,
                minSize: 175,
                header: t("common:friendly_name"),
                accessorFn: ({ device }) => [device.friendly_name, device.description].join(" "),
                cell: ({
                    row: {
                        original: { sourceIdx, device, state },
                    },
                }) => (
                    <div className="flex items-center gap-3">
                        <div className="avatar">
                            <div className="h-11 w-11" style={{ overflow: "visible" }}>
                                <DeviceImage device={device} otaState={state.update?.state} disabled={device.disabled} />
                            </div>
                        </div>
                        {/* min-w-0 serves to properly truncate content */}
                        <div className="flex-grow flex flex-col min-w-0">
                            <Link to={`/device/${sourceIdx}/${device.ieee_address}/info`} className="link link-hover truncate">
                                {device.friendly_name}
                            </Link>
                            {device.description && (
                                <div className="max-w-3xs text-xs opacity-50 truncate" title={device.description}>
                                    {device.description}
                                </div>
                            )}
                            <div className="flex flex-row gap-1 mt-0.5 items-center">
                                <span className="badge badge-soft badge-sm badge-ghost cursor-default" title={t("power")}>
                                    <PowerSource
                                        device={device}
                                        batteryPercent={state.battery as number}
                                        batteryState={state.battery_state as string}
                                        batteryLow={state.battery_low as boolean}
                                        showLevel
                                    />
                                </span>
                            </div>
                        </div>
                    </div>
                ),
                filterFn: "includesString",
                sortingFn: (rowA, rowB) => rowA.original.device.friendly_name.localeCompare(rowB.original.device.friendly_name),
            },
            {
                id: "ieee_address",
                minSize: 175,
                header: t("ieee_address"),
                accessorFn: ({ device }) => [device.ieee_address, toHex(device.network_address, 4), device.network_address].join(" "),
                cell: ({
                    row: {
                        original: { sourceIdx, device },
                    },
                }) => (
                    <>
                        <div>
                            <Link to={`/device/${sourceIdx}/${device.ieee_address}/info`} className="link link-hover">
                                {device.ieee_address}
                            </Link>
                        </div>
                        <div className="flex flex-row gap-1">
                            <span className="badge badge-ghost badge-sm cursor-default" title={t("network_address_hex")}>
                                {toHex(device.network_address, 4)}
                            </span>
                            <span className="badge badge-ghost badge-sm cursor-default" title={t("network_address_dec")}>
                                {device.network_address}
                            </span>
                        </div>
                    </>
                ),
                filterFn: "includesString",
                sortingFn: (rowA, rowB) => rowA.original.device.ieee_address.localeCompare(rowB.original.device.ieee_address),
            },
            {
                id: "model",
                minSize: 175,
                header: t("model"),
                accessorFn: ({ device }) => [device.definition?.model, device.model_id, device.definition?.vendor, device.manufacturer].join(" "),
                cell: ({
                    row: {
                        original: { device },
                    },
                }) => (
                    <>
                        <ModelLink device={device} />
                        <div className="flex flex-row gap-1">
                            <span className="badge badge-ghost badge-sm" title={t("manufacturer")}>
                                <VendorLink device={device} />
                            </span>
                        </div>
                    </>
                ),
                filterFn: "includesString",
            },
            {
                id: "type",
                size: 100,
                header: t("type"),
                accessorFn: ({ device }) => t(device.type),
                cell: ({
                    row: {
                        original: { device },
                    },
                }) => t(device.type),
                enableColumnFilter: false,
            },
            {
                id: "lqi",
                size: 70,
                header: t("lqi"),
                accessorFn: ({ state }) => state.linkquality,
                cell: ({
                    row: {
                        original: { state },
                    },
                }) => <Lqi value={state.linkquality as number | undefined} />,
                enableColumnFilter: false,
            },
            {
                id: "last_seen",
                header: t("last_seen"),
                accessorFn: ({ sourceIdx, state }) =>
                    convertLastSeenToDate(state.last_seen, bridgeInfo[sourceIdx].config.advanced.last_seen)?.getTime(),
                cell: ({
                    row: {
                        original: { sourceIdx, state },
                    },
                }) => <LastSeen lastSeen={state.last_seen} config={bridgeInfo[sourceIdx].config.advanced.last_seen} />,
                enableColumnFilter: false,
            },
            {
                id: "availability",
                size: 125,
                header: t("availability:availability"),
                accessorFn: ({ availabilityState }) => availabilityState.state,
                cell: ({
                    row: {
                        original: { sourceIdx, device, availabilityState, availabilityEnabledForDevice },
                    },
                }) => {
                    return (
                        <Availability
                            disabled={device.disabled}
                            availability={availabilityState}
                            availabilityEnabledForDevice={availabilityEnabledForDevice}
                            availabilityFeatureEnabled={bridgeInfo[sourceIdx].config.availability.enabled}
                        />
                    );
                },
                enableColumnFilter: false,
                sortingFn: (rowA, rowB) =>
                    rowA.original.device.disabled || rowA.original.availabilityEnabledForDevice === false
                        ? 1
                        : rowB.original.device.disabled || rowB.original.availabilityEnabledForDevice === false
                          ? -1
                          : rowA.original.availabilityState.state.localeCompare(rowB.original.availabilityState.state),
            },
            {
                id: "actions",
                size: 175,
                minSize: 175,
                header: () => (
                    <div className="flex flex-col">
                        <CheckboxField
                            name="battery_low_only"
                            detail={t("common:battery_low_only")}
                            onChange={onBatteryLowOnlyChange}
                            checked={batteryLowOnly}
                            className="checkbox checkbox-sm"
                        />
                        <CheckboxField
                            name="hide_disabled"
                            detail={t("common:hide_disabled")}
                            onChange={onHideDisabledChange}
                            checked={hideDisabled}
                            className="checkbox checkbox-sm"
                        />
                    </div>
                ),
                cell: ({
                    row: {
                        original: { sourceIdx, device, state },
                    },
                }) => {
                    return (
                        <DeviceControlGroup
                            sourceIdx={sourceIdx}
                            device={device}
                            otaState={state.update?.state}
                            homeassistantEnabled={bridgeInfo[sourceIdx].config.homeassistant.enabled}
                            renameDevice={renameDevice}
                            removeDevice={removeDevice}
                            configureDevice={configureDevice}
                            interviewDevice={interviewDevice}
                        />
                    );
                },
                enableSorting: false,
                enableColumnFilter: false,
                enableGlobalFilter: false,
            },
        ],
        [
            hideDisabled,
            batteryLowOnly,
            bridgeInfo,
            onHideDisabledChange,
            onBatteryLowOnlyChange,
            renameDevice,
            removeDevice,
            configureDevice,
            interviewDevice,
            t,
        ],
    );

    const { table } = useTable({
        id: "all-devices",
        columns,
        data,
        visibleColumns: { source: API_URLS.length > 1, type: false },
        sorting: [{ id: "friendly_name", desc: false }],
    });

    return <Table id="all-devices" table={table} />;
}
