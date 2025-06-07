import { faMicrochip } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ColumnDef } from "@tanstack/react-table";
import { type ChangeEvent, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { WebSocketApiRouterContext } from "../WebSocketApiRouterContext.js";
import ConfirmButton from "../components/ConfirmButton.js";
import DeviceImage from "../components/device/DeviceImage.js";
import OtaControlGroup from "../components/ota-page/OtaControlGroup.js";
import OtaFileVersion from "../components/ota-page/OtaFileVersion.js";
import Table from "../components/table/Table.js";
import ModelLink from "../components/value-decorators/ModelLink.js";
import OtaLink from "../components/value-decorators/OtaLink.js";
import PowerSource from "../components/value-decorators/PowerSource.js";
import VendorLink from "../components/value-decorators/VendorLink.js";
import { useAppSelector } from "../hooks/useApp.js";
import type { Device, DeviceState } from "../types.js";

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
    const devices = useAppSelector((state) => state.devices);
    const deviceStates = useAppSelector((state) => state.deviceStates);
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const { t } = useTranslation(["ota", "zigbee", "common"]);
    const [selectedDevices, setSelectedDevices] = useState<string[]>([]);

    // biome-ignore lint/correctness/useExhaustiveDependencies: specific trigger
    useEffect(() => {
        setSelectedDevices([]);
    }, [devices]);

    const otaDevices = useMemo(() => {
        const filteredDevices: OtaTableData[] = [];

        for (const device of devices) {
            if (device.definition?.supports_ota && !device.disabled) {
                const state = deviceStates[device.friendly_name] ?? {};

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

        return filteredDevices;
    }, [deviceStates, devices, selectedDevices]);

    const onSelectAllChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            if (e.target.checked) {
                setSelectedDevices(otaDevices.map(({ device }) => device.ieee_address));
            } else {
                setSelectedDevices([]);
            }
        },
        [otaDevices],
    );

    const onSelectChange = useCallback(
        (device: Device, select: boolean) => {
            if (select) {
                setSelectedDevices([...selectedDevices, device.ieee_address]);
            } else {
                setSelectedDevices(selectedDevices.filter((ieee) => ieee !== device.ieee_address));
            }
        },
        [selectedDevices],
    );

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

    // biome-ignore lint/suspicious/noExplicitAny: tmp
    const columns = useMemo<ColumnDef<OtaTableData, any>[]>(
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
                header: t("common:friendly_name"),
                accessorFn: ({ device }) => [device.friendly_name, device.description, device.ieee_address].join(" "),
                cell: ({
                    row: {
                        original: { device, state, batteryState },
                    },
                }) => (
                    <div className="flex items-center gap-3">
                        <div className="avatar">
                            <div className="h-12 w-12" style={{ overflow: "visible" }}>
                                <DeviceImage device={device} otaState={state?.state} disabled={false} />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <Link to={`/device/${device.ieee_address}/info`} className="link link-hover">
                                {device.friendly_name}
                                {device.friendly_name !== device.ieee_address ? ` (${device.ieee_address})` : ""}
                            </Link>
                            {device.description && <div className="text-xs opacity-50">{device.description}</div>}
                            <div className="flex flex-row gap-1 my-1 items-center">
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
            },
            {
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
            },
            {
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
                header: () => (
                    <div className="join join-vertical">
                        <ConfirmButton
                            className="btn btn-error btn-xs join-item"
                            onClick={checkSelected}
                            title={t("check_selected")}
                            modalDescription={t("common:dialog_confirmation_prompt")}
                            modalCancelLabel={t("common:cancel")}
                            disabled={selectedDevices.length === 0}
                        >
                            {t("check_selected")}
                        </ConfirmButton>
                        <ConfirmButton
                            className="btn btn-error btn-xs join-item"
                            onClick={updateSelected}
                            title={t("update_selected")}
                            modalDescription={t("update_selected_info")}
                            modalCancelLabel={t("common:cancel")}
                            disabled={selectedDevices.length === 0}
                        >
                            {t("update_selected")}
                        </ConfirmButton>
                    </div>
                ),
                accessorFn: ({ state }) => state?.state,
                id: "check_all",
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
            onSelectAllChange,
            onSelectChange,
            checkSelected,
            updateSelected,
            onCheckClick,
            onUpdateClick,
            onScheduleClick,
            onUnscheduleClick,
            t,
        ],
    );

    return <Table id="ota-devices" columns={columns} data={otaDevices} />;
}
