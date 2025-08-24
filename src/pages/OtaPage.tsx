import { faServer } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import ConfirmButton from "../components/ConfirmButton.js";
import DeviceImage from "../components/device/DeviceImage.js";
import IndeterminateCheckbox from "../components/ota-page/IndeterminateCheckbox.js";
import { formatOtaFileVersion } from "../components/ota-page/index.js";
import OtaControlGroup from "../components/ota-page/OtaControlGroup.js";
import OtaFileVersion from "../components/ota-page/OtaFileVersion.js";
import OtaUpdating from "../components/ota-page/OtaUpdating.js";
import SourceDot from "../components/SourceDot.js";
import Table from "../components/table/Table.js";
import ModelLink from "../components/value-decorators/ModelLink.js";
import OtaLink from "../components/value-decorators/OtaLink.js";
import PowerSource from "../components/value-decorators/PowerSource.js";
import VendorLink from "../components/value-decorators/VendorLink.js";
import { useTable } from "../hooks/useTable.js";
import { API_NAMES, API_URLS, useAppStore } from "../store.js";
import type { Device, DeviceState } from "../types.js";
import { toHex } from "../utils.js";
import { WebSocketApiRouterContext } from "../WebSocketApiRouterContext.js";

type OtaTableData = {
    sourceIdx: number;
    device: Device;
    state: DeviceState["update"];
    batteryState?: {
        batteryPercent?: number | null;
        batteryState?: string | null;
        batteryLow?: boolean | null;
    };
};

export default function OtaPage() {
    const devices = useAppStore((state) => state.devices);
    const deviceStates = useAppStore((state) => state.deviceStates);
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const { t } = useTranslation(["ota", "zigbee", "common"]);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

    // biome-ignore lint/correctness/useExhaustiveDependencies: specific trigger
    useEffect(() => {
        setRowSelection({});
    }, [devices]);

    const otaDevices = useMemo(() => {
        const filteredDevices: OtaTableData[] = [];

        for (let sourceIdx = 0; sourceIdx < API_URLS.length; sourceIdx++) {
            for (const device of devices[sourceIdx]) {
                if (device.definition?.supports_ota && !device.disabled) {
                    const state = deviceStates[sourceIdx][device.friendly_name] ?? {};

                    filteredDevices.push({
                        sourceIdx,
                        device,
                        state: state.update,
                        batteryState:
                            device.power_source === "Battery"
                                ? {
                                      batteryPercent: state.battery as number,
                                      batteryState: state.battery_state as string,
                                      batteryLow: state.battery_low as boolean,
                                  }
                                : undefined,
                    });
                }
            }
        }

        return filteredDevices;
    }, [deviceStates, devices]);

    const rowSelectionCount = useMemo(() => Object.keys(rowSelection).length, [rowSelection]);

    // biome-ignore lint/correctness/useExhaustiveDependencies: can't dep table
    const actOnFilteredSelected = useCallback(
        async (topic: "bridge/request/device/ota_update/check" | "bridge/request/device/ota_update/update") => {
            const promises: Promise<void>[] = [];

            for (const row of table.getFilteredRowModel().rows) {
                if (row.getIsSelected()) {
                    const { sourceIdx, device } = row.original;

                    promises.push(sendMessage(sourceIdx, topic, { id: device.ieee_address }));
                }
            }

            setRowSelection({});

            if (promises.length > 0) {
                await Promise.allSettled(promises);
            }
        },
        [sendMessage],
    );

    const onCheckClick = useCallback(
        async ([sourceIdx, ieee]: [number, string]) => await sendMessage(sourceIdx, "bridge/request/device/ota_update/check", { id: ieee }),
        [sendMessage],
    );

    const onUpdateClick = useCallback(
        async ([sourceIdx, ieee]: [number, string]) => await sendMessage(sourceIdx, "bridge/request/device/ota_update/update", { id: ieee }),
        [sendMessage],
    );

    const onScheduleClick = useCallback(
        async ([sourceIdx, ieee]: [number, string]) => await sendMessage(sourceIdx, "bridge/request/device/ota_update/schedule", { id: ieee }),
        [sendMessage],
    );

    const onUnscheduleClick = useCallback(
        async ([sourceIdx, ieee]: [number, string]) => await sendMessage(sourceIdx, "bridge/request/device/ota_update/unschedule", { id: ieee }),
        [sendMessage],
    );

    const columns = useMemo<ColumnDef<OtaTableData, unknown>[]>(
        () => [
            {
                id: "select",
                size: 45,
                header: ({ table }) => (
                    <IndeterminateCheckbox
                        checked={table.getIsAllRowsSelected()}
                        indeterminate={table.getIsSomeRowsSelected()}
                        onChange={table.getToggleAllRowsSelectedHandler()}
                    />
                ),
                accessorFn: () => "",
                cell: ({ row }) => (
                    <input
                        type="checkbox"
                        className="checkbox"
                        checked={row.getIsSelected()}
                        disabled={!row.getCanSelect()}
                        onChange={row.getToggleSelectedHandler()}
                    />
                ),
                enableGlobalFilter: false,
                enableColumnFilter: false,
                enableSorting: false,
            },
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
                accessorFn: ({ device }) => `${device.friendly_name} ${device.description ?? ""} ${device.ieee_address}`,
                cell: ({
                    row: {
                        original: { sourceIdx, device, state, batteryState },
                    },
                }) => (
                    <div className="flex items-center gap-3">
                        <div className="avatar">
                            <div className="h-11 w-11" style={{ overflow: "visible" }}>
                                <DeviceImage device={device} otaState={state?.state} disabled={false} />
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
                                {batteryState && (
                                    <span className="badge badge-sm badge-soft badge-ghost cursor-default">
                                        <PowerSource device={device} {...batteryState} showLevel />
                                    </span>
                                )}
                            </div>
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
                header: t("zigbee:ieee_address"),
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
                            <span className="badge badge-ghost badge-sm cursor-default" title={t("zigbee:network_address_hex")}>
                                {toHex(device.network_address, 4)}
                            </span>
                            <span className="badge badge-ghost badge-sm cursor-default" title={t("zigbee:network_address_dec")}>
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
                header: t("zigbee:model"),
                accessorFn: ({ device }) =>
                    `${device.definition?.model ?? ""} ${device.model_id ?? ""} ${device.definition?.vendor ?? device.manufacturer ?? ""}`,
                cell: ({
                    row: {
                        original: { device },
                    },
                }) => (
                    <>
                        <ModelLink device={device} />
                        <div>
                            <span className="badge badge-sm badge-ghost" title={t("zigbee:manufacturer")}>
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
                id: "firmware_id",
                minSize: 175,
                header: t("zigbee:firmware_id"),
                accessorFn: ({ device }) => `${device.software_build_id ?? ""} ${device.date_code ?? ""}`,
                cell: ({
                    row: {
                        original: { device },
                    },
                }) => (
                    <>
                        <OtaLink device={device} />
                        {device.date_code && (
                            <div>
                                <span className="badge badge-sm badge-ghost" title={t("zigbee:firmware_build_date")}>
                                    {device.date_code}
                                </span>
                            </div>
                        )}
                    </>
                ),
                filterFn: "includesString",
                meta: {
                    filterVariant: "text",
                },
            },
            {
                id: "firmware_version",
                minSize: 175,
                header: t("firmware_version"),
                accessorFn: ({ state }) => formatOtaFileVersion(state?.installed_version)?.join(" "),
                cell: ({
                    row: {
                        original: { state },
                    },
                }) => <OtaFileVersion version={state?.installed_version} />,
                filterFn: "includesString",
                meta: {
                    filterVariant: "text",
                },
            },
            {
                id: "available_firmware_version",
                minSize: 175,
                header: t("available_firmware_version"),
                accessorFn: ({ state }) => formatOtaFileVersion(state?.latest_version)?.join(" "),
                cell: ({
                    row: {
                        original: { state },
                    },
                }) => <OtaFileVersion version={state?.latest_version} />,
                filterFn: "includesString",
                meta: {
                    filterVariant: "text",
                },
            },
            {
                id: "state",
                header: t("common:state"),
                accessorFn: ({ state }) => t(state?.state ?? "zigbee:unknown"),
                filterFn: "equals",
                meta: {
                    filterVariant: "select",
                },
            },
            {
                id: "actions",
                minSize: 130,
                accessorFn: ({ state }) => state?.state,
                cell: ({
                    row: {
                        original: { sourceIdx, device, state },
                    },
                }) =>
                    state?.state === "updating" ? (
                        <OtaUpdating label={t("remaining_time")} remaining={state.remaining} progress={state.progress} />
                    ) : (
                        <OtaControlGroup
                            sourceIdx={sourceIdx}
                            device={device}
                            state={state}
                            onCheckClick={onCheckClick}
                            onUpdateClick={onUpdateClick}
                            onScheduleClick={onScheduleClick}
                            onUnscheduleClick={onUnscheduleClick}
                        />
                    ),
                enableSorting: false,
                enableColumnFilter: false,
                enableGlobalFilter: false,
            },
        ],
        [onCheckClick, onUpdateClick, onScheduleClick, onUnscheduleClick, t],
    );

    const { table, resetFilters, globalFilter, columnFilters } = useTable({
        id: "ota-devices",
        columns,
        data: otaDevices,
        visibleColumns: { source: API_URLS.length > 1, state: false },
        sorting: [{ id: "friendly_name", desc: false }],
        rowSelection,
        onRowSelectionChange: setRowSelection,
    });

    // Automatically prune selection when filters or state/data change
    // biome-ignore lint/correctness/useExhaustiveDependencies: specific trigger
    useEffect(() => {
        const validIds = new Set<string>();

        for (const row of table.getFilteredRowModel().rows) {
            validIds.add(row.id);
        }

        let changed = false;
        const next: RowSelectionState = {};

        for (const id in rowSelection) {
            if (validIds.has(id)) {
                next[id] = true;
            } else {
                changed = true;
            }
        }

        if (changed) {
            setRowSelection(next);
        }
    }, [table, rowSelection, otaDevices, globalFilter, columnFilters]);

    return (
        <Table
            id="ota-devices"
            table={table}
            resetFilters={resetFilters}
            globalFilter={globalFilter}
            columnFilters={columnFilters}
            headerActions={
                <div className="join join-vertical">
                    <ConfirmButton
                        className="btn btn-outline btn-error btn-xs join-item"
                        onClick={async () => await actOnFilteredSelected("bridge/request/device/ota_update/check")}
                        title={t("check_selected")}
                        modalDescription={t("common:dialog_confirmation_prompt")}
                        modalCancelLabel={t("common:cancel")}
                        disabled={rowSelectionCount === 0}
                    >
                        {`${t("check_selected")} (${rowSelectionCount})`}
                    </ConfirmButton>
                    <ConfirmButton
                        className="btn btn-outline btn-error btn-xs join-item"
                        onClick={async () => await actOnFilteredSelected("bridge/request/device/ota_update/update")}
                        title={t("update_selected")}
                        modalDescription={t("update_selected_info")}
                        modalCancelLabel={t("common:cancel")}
                        disabled={rowSelectionCount === 0}
                    >
                        {`${t("update_selected")} (${rowSelectionCount})`}
                    </ConfirmButton>
                </div>
            }
        />
    );
}
