import { faMicrochip } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ColumnDef } from "@tanstack/react-table";
import { type ChangeEvent, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import ConfirmButton from "../components/ConfirmButton.js";
import DeviceImage from "../components/device/DeviceImage.js";
import CheckboxField from "../components/form-fields/CheckboxField.js";
import OtaControlGroup from "../components/ota-page/OtaControlGroup.js";
import OtaFileVersion from "../components/ota-page/OtaFileVersion.js";
import Table from "../components/table/Table.js";
import ModelLink from "../components/value-decorators/ModelLink.js";
import OtaLink from "../components/value-decorators/OtaLink.js";
import PowerSource from "../components/value-decorators/PowerSource.js";
import VendorLink from "../components/value-decorators/VendorLink.js";
import { useAppStore } from "../store.js";
import type { Device, DeviceState } from "../types.js";
import { WebSocketApiRouterContext } from "../WebSocketApiRouterContext.js";

type OtaTableData = {
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
    const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
    const [availableOnly, setAvailableOnly] = useState(false);

    // biome-ignore lint/correctness/useExhaustiveDependencies: specific trigger
    useEffect(() => {
        setSelectedDevices([]);
    }, [devices]);

    const otaDevices = useMemo(() => {
        const filteredDevices: OtaTableData[] = [];

        for (const device of devices) {
            if (device.definition?.supports_ota && !device.disabled) {
                const state = deviceStates[device.friendly_name] ?? {};

                if (!availableOnly || state.update?.state === "available") {
                    filteredDevices.push({
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
                        selected: selectedDevices.includes(device.ieee_address),
                    });
                }
            }
        }

        return filteredDevices;
    }, [deviceStates, devices, selectedDevices, availableOnly]);

    const onSelectAllChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            setSelectedDevices(e.target.checked ? otaDevices.map(({ device }) => device.ieee_address) : []);
        },
        [otaDevices],
    );

    const onSelectChange = useCallback((device: Device, select: boolean) => {
        setSelectedDevices((prev) => (select ? [...prev, device.ieee_address] : prev.filter((ieee) => ieee !== device.ieee_address)));
    }, []);

    const checkSelected = useCallback(async () => {
        await Promise.allSettled(selectedDevices.map((ieee) => sendMessage("bridge/request/device/ota_update/check", { id: ieee })));
    }, [sendMessage, selectedDevices]);

    const updateSelected = useCallback(async () => {
        await Promise.allSettled(selectedDevices.map((ieee) => sendMessage("bridge/request/device/ota_update/update", { id: ieee })));
    }, [sendMessage, selectedDevices]);

    const onCheckClick = useCallback(
        async (ieee: string) => await sendMessage("bridge/request/device/ota_update/check", { id: ieee }),
        [sendMessage],
    );

    const onUpdateClick = useCallback(
        async (ieee: string) => await sendMessage("bridge/request/device/ota_update/update", { id: ieee }),
        [sendMessage],
    );

    const onScheduleClick = useCallback(
        async (ieee: string) => await sendMessage("bridge/request/device/ota_update/schedule", { id: ieee }),
        [sendMessage],
    );

    const onUnscheduleClick = useCallback(
        async (ieee: string) => await sendMessage("bridge/request/device/ota_update/unschedule", { id: ieee }),
        [sendMessage],
    );

    const onAvailableOnlyChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setAvailableOnly(e.target.checked);
    }, []);

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
                            defaultChecked={selectedDevices.length === otaDevices.length}
                        />
                    </label>
                ),
                accessorFn: () => "",
                cell: ({
                    row: {
                        original: { device, selected },
                    },
                }) => (
                    <label>
                        <input
                            type="checkbox"
                            className="checkbox"
                            onChange={(e) => onSelectChange(device, e.target.checked)}
                            defaultChecked={selected}
                        />
                    </label>
                ),
                enableColumnFilter: false,
                enableSorting: false,
            },
            {
                id: "friendly_name",
                header: t("common:friendly_name"),
                accessorFn: ({ device }) => [device.friendly_name, device.description, device.ieee_address].join(" "),
                cell: ({
                    row: {
                        original: { device, state, batteryState },
                    },
                }) => (
                    <div className="flex items-center gap-3">
                        <div className="avatar">
                            <div className="h-11 w-11" style={{ overflow: "visible" }}>
                                <DeviceImage device={device} otaState={state?.state} disabled={false} />
                            </div>
                        </div>
                        <div className="flex-grow flex flex-col">
                            <Link to={`/device/${device.ieee_address}/info`} className="link link-hover">
                                {device.friendly_name}
                                {device.friendly_name !== device.ieee_address ? ` (${device.ieee_address})` : ""}
                            </Link>
                            {device.description && (
                                <div className="max-w-3xs text-xs opacity-50 truncate" title={device.description}>
                                    {device.description}
                                </div>
                            )}
                            <div className="flex flex-row gap-1 mt-0.5 items-center">
                                <span className="badge badge-sm badge-soft badge-ghost cursor-default" title={t("zigbee:firmware_id")}>
                                    {/** TODO: use releaseNotes from manifest instead of links (need API change in Z2M) */}
                                    <FontAwesomeIcon icon={faMicrochip} />
                                    <OtaLink device={device} />
                                    {device.date_code ? <span title={t("zigbee:firmware_build_date")}> ({device.date_code})</span> : undefined}
                                </span>
                                {batteryState && (
                                    <span className="badge badge-sm badge-soft badge-ghost cursor-default">
                                        <PowerSource device={device} {...batteryState} />
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ),
                filterFn: "includesString",
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
                id: "firmware_version",
                header: t("firmware_version"),
                accessorFn: ({ state }) => state?.installed_version,
                cell: ({
                    row: {
                        original: { state },
                    },
                }) => <OtaFileVersion version={state?.installed_version} />,
                enableColumnFilter: false,
            },
            {
                id: "available_firmware_version",
                header: t("available_firmware_version"),
                accessorFn: ({ state }) => state?.latest_version,
                cell: ({
                    row: {
                        original: { state },
                    },
                }) => <OtaFileVersion version={state?.latest_version} />,
                enableColumnFilter: false,
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
                                {t("check_selected")}
                            </ConfirmButton>
                            <ConfirmButton
                                className="btn btn-outline btn-error btn-xs join-item"
                                onClick={updateSelected}
                                title={t("update_selected")}
                                modalDescription={t("update_selected_info")}
                                modalCancelLabel={t("common:cancel")}
                                disabled={selectedDevices.length === 0}
                            >
                                {t("update_selected")}
                            </ConfirmButton>
                        </div>
                    </>
                ),
                accessorFn: ({ state }) => state?.state,
                cell: ({
                    row: {
                        original: { device, state },
                    },
                }) => (
                    <OtaControlGroup
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
            otaDevices.length,
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

    return <Table id="ota-devices" columns={columns} data={otaDevices} />;
}
