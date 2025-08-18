import { faServer } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ColumnDef } from "@tanstack/react-table";
import { type ChangeEvent, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import ConfirmButton from "../components/ConfirmButton.js";
import DeviceImage from "../components/device/DeviceImage.js";
import CheckboxField from "../components/form-fields/CheckboxField.js";
import { formatOtaFileVersion } from "../components/ota-page/index.js";
import OtaControlGroup from "../components/ota-page/OtaControlGroup.js";
import OtaFileVersion from "../components/ota-page/OtaFileVersion.js";
import SourceDot from "../components/SourceDot.js";
import Table from "../components/table/Table.js";
import ModelLink from "../components/value-decorators/ModelLink.js";
import OtaLink from "../components/value-decorators/OtaLink.js";
import PowerSource from "../components/value-decorators/PowerSource.js";
import VendorLink from "../components/value-decorators/VendorLink.js";
import { useTable } from "../hooks/useTable.js";
import { API_URLS, useAppStore } from "../store.js";
import type { Device, DeviceState } from "../types.js";
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
    selected: boolean;
};

export default function OtaPage() {
    const devices = useAppStore((state) => state.devices);
    const deviceStates = useAppStore((state) => state.deviceStates);
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const { t } = useTranslation(["ota", "zigbee", "common"]);
    const [selectedDevices, setSelectedDevices] = useState<[number, string][]>([]);
    const [availableOnly, setAvailableOnly] = useState(false);

    // biome-ignore lint/correctness/useExhaustiveDependencies: specific trigger
    useEffect(() => {
        setSelectedDevices([]);
    }, [devices]);

    const otaDevices = useMemo(() => {
        const filteredDevices: OtaTableData[] = [];

        for (let sourceIdx = 0; sourceIdx < API_URLS.length; sourceIdx++) {
            for (const device of devices[sourceIdx]) {
                if (device.definition?.supports_ota && !device.disabled) {
                    const state = deviceStates[sourceIdx][device.friendly_name] ?? {};

                    if (!availableOnly || state.update?.state === "available" || state.update?.state === "updating") {
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
                            selected: selectedDevices.some(([idx, ieee]) => idx === sourceIdx && ieee === device.ieee_address),
                        });
                    }
                }
            }
        }

        return filteredDevices;
    }, [deviceStates, devices, selectedDevices, availableOnly]);

    // biome-ignore lint/correctness/useExhaustiveDependencies: getFilteredData does not change
    const onSelectAllChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setSelectedDevices(e.target.checked ? getFilteredData().map(({ sourceIdx, device }) => [sourceIdx, device.ieee_address]) : []);
    }, []);

    // biome-ignore lint/correctness/useExhaustiveDependencies: getFilteredData does not change
    const onSelectChange = useCallback((sourceIdx: number, device: Device, select: boolean) => {
        if (select) {
            if (getFilteredData().find((data) => data.sourceIdx === sourceIdx && data.device.ieee_address === device.ieee_address)) {
                setSelectedDevices((prev) => [...prev, [sourceIdx, device.ieee_address]]);
            }
        } else {
            setSelectedDevices((prev) => prev.filter(([idx, ieee]) => idx !== sourceIdx || ieee !== device.ieee_address));
        }
    }, []);

    // biome-ignore lint/correctness/useExhaustiveDependencies: getFilteredData does not change
    const checkSelected = useCallback(async () => {
        const promises = selectedDevices.map(([sourceIdx, ieee]) => {
            return getFilteredData().find((data) => data.sourceIdx === sourceIdx && data.device.ieee_address === ieee)
                ? sendMessage(sourceIdx, "bridge/request/device/ota_update/check", { id: ieee })
                : Promise.resolve();
        });

        setSelectedDevices([]);
        await Promise.allSettled(promises);
    }, [selectedDevices, sendMessage]);

    // biome-ignore lint/correctness/useExhaustiveDependencies: getFilteredData does not change
    const updateSelected = useCallback(async () => {
        const promises = selectedDevices.map(([sourceIdx, ieee]) => {
            return getFilteredData().find((data) => data.sourceIdx === sourceIdx && data.device.ieee_address === ieee)
                ? sendMessage(sourceIdx, "bridge/request/device/ota_update/update", { id: ieee })
                : Promise.resolve();
        });

        setSelectedDevices([]);
        await Promise.allSettled(promises);
    }, [selectedDevices, sendMessage]);

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

    const onAvailableOnlyChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setAvailableOnly(e.target.checked);
    }, []);

    // biome-ignore lint/correctness/useExhaustiveDependencies: getFilteredData does not change
    const columns = useMemo<ColumnDef<OtaTableData, unknown>[]>(
        () => [
            {
                id: "select",
                header: () => (
                    <label>
                        <input
                            type="checkbox"
                            className="checkbox"
                            onChange={onSelectAllChange}
                            checked={selectedDevices.length !== 0 && selectedDevices.length === getFilteredData().length}
                        />
                    </label>
                ),
                accessorFn: () => "",
                cell: ({
                    row: {
                        original: { sourceIdx, device, selected },
                    },
                }) => (
                    <label>
                        <input
                            type="checkbox"
                            className="checkbox"
                            onChange={(e) => onSelectChange(sourceIdx, device, e.target.checked)}
                            checked={selected}
                        />
                    </label>
                ),
                enableColumnFilter: false,
                enableSorting: false,
            },
            {
                id: "source",
                header: () => (
                    <span title={t("common:source")}>
                        <FontAwesomeIcon icon={faServer} />
                    </span>
                ),
                accessorFn: ({ sourceIdx }) => sourceIdx,
                cell: ({
                    row: {
                        original: { sourceIdx },
                    },
                }) => <SourceDot idx={sourceIdx} />,
                enableColumnFilter: false,
            },
            {
                id: "friendly_name",
                header: t("common:friendly_name"),
                accessorFn: ({ device }) => [device.friendly_name, device.description, device.ieee_address].join(" "),
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
                        <div className="flex-grow flex flex-col">
                            <Link to={`/device/${sourceIdx}/${device.ieee_address}/info`} className="link link-hover">
                                {device.friendly_name}
                                {device.friendly_name !== device.ieee_address ? ` (${device.ieee_address})` : ""}
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
                filterFn: "includesString",
                sortingFn: (rowA, rowB) => rowA.original.device.friendly_name.localeCompare(rowB.original.device.friendly_name),
            },
            {
                id: "model",
                header: t("zigbee:model"),
                accessorFn: ({ device }) => [device.definition?.model, device.model_id, device.definition?.vendor, device.manufacturer].join(" "),
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
            },
            {
                id: "firmware_id",
                header: t("zigbee:firmware_id"),
                accessorFn: ({ device }) => [device.software_build_id, device.date_code].join(" "),
                cell: ({
                    row: {
                        original: { device },
                    },
                }) => (
                    <>
                        <OtaLink device={device} />
                        {device.date_code && (
                            <div>
                                <span className="badge badge-sm badge-ghost cursor-default" title={t("zigbee:firmware_build_date")}>
                                    {device.date_code}
                                </span>
                            </div>
                        )}
                    </>
                ),
            },
            {
                id: "firmware_version",
                header: t("firmware_version"),
                accessorFn: ({ state }) => formatOtaFileVersion(state?.installed_version)?.join(" "),
                cell: ({
                    row: {
                        original: { state },
                    },
                }) => <OtaFileVersion version={state?.installed_version} />,
            },
            {
                id: "available_firmware_version",
                header: t("available_firmware_version"),
                accessorFn: ({ state }) => formatOtaFileVersion(state?.latest_version)?.join(" "),
                cell: ({
                    row: {
                        original: { state },
                    },
                }) => <OtaFileVersion version={state?.latest_version} />,
            },
            {
                id: "actions",
                header: () => (
                    <>
                        <CheckboxField
                            name="available_only"
                            detail={t("common:available_only")}
                            onChange={onAvailableOnlyChange}
                            checked={availableOnly}
                            className="checkbox checkbox-sm"
                        />
                        <div className="join join-horizontal">
                            <ConfirmButton
                                className="btn btn-outline btn-error btn-xs join-item"
                                onClick={checkSelected}
                                title={t("check_selected")}
                                modalDescription={t("common:dialog_confirmation_prompt")}
                                modalCancelLabel={t("common:cancel")}
                                disabled={selectedDevices.length === 0}
                            >
                                {`${t("check_selected")} (${selectedDevices.length})`}
                            </ConfirmButton>
                            <ConfirmButton
                                className="btn btn-outline btn-error btn-xs join-item"
                                onClick={updateSelected}
                                title={t("update_selected")}
                                modalDescription={t("update_selected_info")}
                                modalCancelLabel={t("common:cancel")}
                                disabled={selectedDevices.length === 0}
                            >
                                {`${t("update_selected")} (${selectedDevices.length})`}
                            </ConfirmButton>
                        </div>
                    </>
                ),
                accessorFn: ({ state }) => state?.state,
                cell: ({
                    row: {
                        original: { sourceIdx, device, state },
                    },
                }) => (
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
            },
        ],
        [
            selectedDevices.length,
            availableOnly,
            onSelectAllChange,
            onSelectChange,
            checkSelected,
            updateSelected,
            onCheckClick,
            onUpdateClick,
            onScheduleClick,
            onUnscheduleClick,
            onAvailableOnlyChange,
            t,
        ],
    );

    const { table, getFilteredData } = useTable({
        id: "ota-devices",
        columns,
        data: otaDevices,
        visibleColumns: { source: API_URLS.length > 1 },
        sorting: [{ id: "friendly_name", desc: false }],
    });

    return <Table id="ota-devices" table={table} />;
}
