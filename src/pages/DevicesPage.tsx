import { faServer } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ColumnDef } from "@tanstack/react-table";
import { type JSX, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import DeviceControlGroup from "../components/device/DeviceControlGroup.js";
import DeviceImage from "../components/device/DeviceImage.js";
import SourceDot from "../components/SourceDot.js";
import Table from "../components/table/Table.js";
import Availability from "../components/value-decorators/Availability.js";
import LastSeen from "../components/value-decorators/LastSeen.js";
import Lqi from "../components/value-decorators/Lqi.js";
import ModelLink from "../components/value-decorators/ModelLink.js";
import VendorLink from "../components/value-decorators/VendorLink.js";
import { useTable } from "../hooks/useTable.js";
import { API_NAMES, API_URLS, MULTI_INSTANCE, useAppStore } from "../store.js";
import type { AvailabilityState, Device, DeviceState } from "../types.js";
import { getLastSeenEpoch, toHex } from "../utils.js";
import { sendMessage } from "../websocket/WebSocketManager.js";

type DeviceTableData = {
    sourceIdx: number;
    device: Device;
    state: DeviceState;
    availabilityState: AvailabilityState;
    availabilityEnabledForDevice: boolean | undefined;
    batteryLow?: boolean;
};

export default function DevicesPage(): JSX.Element {
    const devices = useAppStore((state) => state.devices);
    const deviceStates = useAppStore((state) => state.deviceStates);
    const bridgeInfo = useAppStore((state) => state.bridgeInfo);
    const availability = useAppStore((state) => state.availability);
    const { t } = useTranslation(["zigbee", "common", "availability"]);

    const data = useMemo((): DeviceTableData[] => {
        const renderDevices: DeviceTableData[] = [];

        for (let sourceIdx = 0; sourceIdx < API_URLS.length; sourceIdx++) {
            for (const device of devices[sourceIdx]) {
                if (device.type !== "Coordinator") {
                    const state = deviceStates[sourceIdx][device.friendly_name] ?? {};
                    const deviceAvailability = bridgeInfo[sourceIdx].config.devices[device.ieee_address]?.availability;
                    let batteryLow: boolean | undefined;

                    if (device.power_source === "Battery") {
                        batteryLow = false;

                        if ("battery" in state) {
                            if ((state.battery as number) < 20) {
                                batteryLow = true;
                            }
                        } else if ("battery_state" in state) {
                            if (state.battery_state === "low") {
                                batteryLow = true;
                            }
                        } else if ("battery_low" in state) {
                            batteryLow = Boolean(state.battery_low);
                        }
                    }

                    renderDevices.push({
                        sourceIdx,
                        device,
                        state,
                        availabilityState: availability[sourceIdx][device.friendly_name] ?? { state: "offline" },
                        availabilityEnabledForDevice: deviceAvailability != null ? !!deviceAvailability : undefined,
                        batteryLow,
                    });
                }
            }
        }

        return renderDevices;
    }, [devices, deviceStates, bridgeInfo, availability]);

    const renameDevice = useCallback(async (sourceIdx: number, from: string, to: string, homeassistantRename: boolean): Promise<void> => {
        await sendMessage(sourceIdx, "bridge/request/device/rename", {
            from,
            to,
            homeassistant_rename: homeassistantRename,
            last: undefined,
        });
    }, []);

    const configureDevice = useCallback(async ([sourceIdx, id]: [number, string]): Promise<void> => {
        await sendMessage(sourceIdx, "bridge/request/device/configure", { id });
    }, []);

    const interviewDevice = useCallback(async ([sourceIdx, id]: [number, string]): Promise<void> => {
        await sendMessage(sourceIdx, "bridge/request/device/interview", { id });
    }, []);

    const removeDevice = useCallback(async (sourceIdx: number, id: string, force: boolean, block: boolean): Promise<void> => {
        await sendMessage(sourceIdx, "bridge/request/device/remove", { id, force, block });
    }, []);

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
                accessorFn: ({ sourceIdx }) => API_NAMES[sourceIdx],
                cell: ({
                    row: {
                        original: { sourceIdx },
                    },
                }) => <SourceDot idx={sourceIdx} nameClassName="hidden md:inline-block" />,
                filterFn: "equals",
                meta: {
                    filterVariant: "select",
                    showFacetedOccurrences: true,
                },
            },
            {
                id: "friendly_name",
                size: 250,
                minSize: 175,
                header: t("common:friendly_name"),
                accessorFn: ({ device }) => `${device.friendly_name} ${device.description ?? ""}`,
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
                        </div>
                    </div>
                ),
                sortingFn: (rowA, rowB) => rowA.original.device.friendly_name.localeCompare(rowB.original.device.friendly_name),
                filterFn: "includesString",
                meta: {
                    filterVariant: "text",
                    textFaceted: true,
                },
            },
            {
                id: "ieee_address",
                minSize: 175,
                header: t("ieee_address"),
                accessorFn: ({ device }) => `${device.ieee_address} ${toHex(device.network_address, 4)} ${device.network_address}`,
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
                sortingFn: (rowA, rowB) => rowA.original.device.ieee_address.localeCompare(rowB.original.device.ieee_address),
                filterFn: "includesString",
                meta: {
                    filterVariant: "text",
                },
            },
            {
                id: "model",
                minSize: 175,
                header: t("model"),
                accessorFn: ({ device }) =>
                    `${device.definition?.model ?? ""} ${device.model_id ?? ""} ${device.definition?.vendor ?? device.manufacturer ?? ""}`,
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
                meta: {
                    filterVariant: "text",
                    textFaceted: true,
                    showFacetedOccurrences: true,
                },
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
                filterFn: "equals",
                meta: {
                    filterVariant: "select",
                    showFacetedOccurrences: true,
                },
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
                filterFn: "inNumberRange",
                meta: {
                    filterVariant: "range",
                },
            },
            {
                id: "last_seen",
                size: 120,
                header: t("last_seen"),
                accessorFn: ({ sourceIdx, state }) => {
                    const lastTs = getLastSeenEpoch(state.last_seen, bridgeInfo[sourceIdx].config.advanced.last_seen);

                    // since now (last time table updated)
                    return lastTs ? Math.round((Date.now() - lastTs) / 1000 / 60) : undefined;
                },
                cell: ({
                    row: {
                        original: { sourceIdx, state },
                    },
                }) => <LastSeen lastSeen={state.last_seen} config={bridgeInfo[sourceIdx].config.advanced.last_seen} />,
                enableGlobalFilter: false,
                filterFn: "inNumberRange",
                meta: {
                    filterVariant: "range",
                    tooltip: t("common:last_seen_filter_info"),
                },
            },
            {
                id: "availability",
                size: 125,
                header: t("availability:availability"),
                accessorFn: ({ sourceIdx, availabilityState, availabilityEnabledForDevice }) =>
                    t(
                        `availability:${(availabilityEnabledForDevice ?? bridgeInfo[sourceIdx].config.availability.enabled) ? availabilityState.state : "disabled"}`,
                    ),
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
                sortingFn: (rowA, rowB) =>
                    rowA.original.device.disabled || rowA.original.availabilityEnabledForDevice === false
                        ? 1
                        : rowB.original.device.disabled || rowB.original.availabilityEnabledForDevice === false
                          ? -1
                          : rowA.original.availabilityState.state.localeCompare(rowB.original.availabilityState.state),
                filterFn: "equals",
                meta: {
                    filterVariant: "select",
                    showFacetedOccurrences: true,
                },
            },
            {
                id: "power_source",
                size: 100,
                header: t("power_source"),
                accessorFn: ({ device }) => device.power_source,
                filterFn: "equals",
                meta: {
                    filterVariant: "select",
                    showFacetedOccurrences: true,
                },
            },
            {
                id: "battery_level",
                size: 100,
                header: t("battery_level"),
                accessorFn: ({ state }) => state.battery ?? undefined,
                cell: ({
                    row: {
                        original: { state, batteryLow },
                    },
                }) => (state.battery == null ? "N/A" : <span className={batteryLow ? "text-error" : undefined}>{String(state.battery)}%</span>),
                filterFn: "inNumberRange",
                meta: {
                    filterVariant: "range",
                },
            },
            {
                id: "battery_low",
                size: 100,
                header: t("battery_low"),
                accessorFn: ({ batteryLow }) => batteryLow,
                cell: ({
                    row: {
                        original: { batteryLow },
                    },
                }) => (batteryLow === undefined ? "N/A" : <span className={batteryLow ? "text-error" : undefined}>{String(batteryLow)}</span>),
                filterFn: "equals",
                meta: {
                    filterVariant: "boolean",
                },
            },
            {
                // allows including/excluding with string+select
                id: "disabled",
                size: 100,
                header: t("common:disabled"),
                accessorFn: ({ device }) => `${Boolean(device.disabled)}`,
                filterFn: "equals",
                meta: {
                    filterVariant: "select",
                },
            },
            {
                id: "actions",
                minSize: 130,
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
                            btnClassName="btn-sm"
                        />
                    );
                },
                enableSorting: false,
                enableColumnFilter: false,
                enableGlobalFilter: false,
            },
        ],
        [bridgeInfo, renameDevice, removeDevice, configureDevice, interviewDevice, t],
    );

    const table = useTable({
        id: "all-devices",
        columns,
        data,
        visibleColumns: { source: MULTI_INSTANCE, type: false, power_source: false, battery_level: false, battery_low: false, disabled: false },
        sorting: [{ id: "friendly_name", desc: false }],
    });

    return <Table id="all-devices" {...table} />;
}
