import type { ColumnDef } from "@tanstack/react-table";
import { type ChangeEvent, type JSX, useCallback, useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import store2 from "store2";
import { WebSocketApiRouterContext } from "../WebSocketApiRouterContext.js";
import DeviceControlGroup from "../components/device/DeviceControlGroup.js";
import DeviceImage from "../components/device/DeviceImage.js";
import CheckboxField from "../components/form-fields/CheckboxField.js";
import Table from "../components/table/Table.js";
import Availability from "../components/value-decorators/Availability.js";
import LastSeen from "../components/value-decorators/LastSeen.js";
import Lqi from "../components/value-decorators/Lqi.js";
import ModelLink from "../components/value-decorators/ModelLink.js";
import PowerSource from "../components/value-decorators/PowerSource.js";
import VendorLink from "../components/value-decorators/VendorLink.js";
import { useAppSelector } from "../hooks/useApp.js";
import { DEVICES_HIDE_DISABLED_KEY } from "../localStoreConsts.js";
import type { AvailabilityState, Device, DeviceState } from "../types.js";
import { convertLastSeenToDate, toHex } from "../utils.js";

type DeviceTableData = {
    device: Device;
    state: DeviceState;
    availabilityState: AvailabilityState;
    availabilityEnabledForDevice: boolean | undefined;
};

export default function DevicesPage(): JSX.Element {
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const devices = useAppSelector((state) => state.devices);
    const deviceStates = useAppSelector((state) => state.deviceStates);
    const bridgeConfig = useAppSelector((state) => state.bridgeInfo.config);
    const availability = useAppSelector((state) => state.availability);
    const [hideDisabled, setHideDisabled] = useState<boolean>(store2.get(DEVICES_HIDE_DISABLED_KEY, false));
    const [batteryLowOnly, setBatteryLowOnly] = useState(false);
    const { t } = useTranslation(["zigbee", "common", "availability"]);

    const data = useMemo((): DeviceTableData[] => {
        const renderDevices: DeviceTableData[] = [];

        for (const device of devices) {
            if (device.type !== "Coordinator" && (!hideDisabled || !device.disabled)) {
                const state = deviceStates[device.friendly_name] ?? {};
                const deviceAvailability = bridgeConfig.devices[device.ieee_address]?.availability;

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
                    device,
                    state,
                    availabilityState: availability[device.friendly_name] ?? { state: "offline" },
                    availabilityEnabledForDevice: deviceAvailability != null ? !!deviceAvailability : undefined,
                });
            }
        }

        return renderDevices;
    }, [devices, deviceStates, bridgeConfig.devices, availability, hideDisabled, batteryLowOnly]);

    const onHideDisabledChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        store2.set(DEVICES_HIDE_DISABLED_KEY, e.target.checked);
        setHideDisabled(e.target.checked);
    }, []);

    const onBatteryLowOnlyChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setBatteryLowOnly(e.target.checked);
    }, []);

    const renameDevice = useCallback(
        async (from: string, to: string, homeassistantRename: boolean): Promise<void> => {
            await sendMessage("bridge/request/device/rename", {
                from,
                to,
                homeassistant_rename: homeassistantRename,
                last: undefined,
            });
        },
        [sendMessage],
    );

    const configureDevice = useCallback(
        async (id: string): Promise<void> => {
            await sendMessage("bridge/request/device/configure", { id });
        },
        [sendMessage],
    );

    const removeDevice = useCallback(
        async (id: string, force: boolean, block: boolean): Promise<void> => {
            await sendMessage("bridge/request/device/remove", { id, force, block });
        },
        [sendMessage],
    );

    const interviewDevice = useCallback(
        async (id: string): Promise<void> => {
            await sendMessage("bridge/request/device/interview", { id });
        },
        [sendMessage],
    );

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const columns = useMemo<ColumnDef<DeviceTableData, any>[]>(
        () => [
            {
                id: "friendly_name",
                header: t("common:friendly_name"),
                accessorFn: ({ device }) => [device.friendly_name, device.description].join(" "),
                cell: ({
                    row: {
                        original: { device, state },
                    },
                }) => (
                    <div className="flex items-center gap-3">
                        <div className="avatar">
                            <div className="h-11 w-11" style={{ overflow: "visible" }}>
                                <DeviceImage device={device} otaState={state.update?.state} disabled={device.disabled} />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <Link to={`/device/${device.ieee_address}/info`} className="link link-hover">
                                {device.friendly_name}
                            </Link>
                            {device.description && <div className="text-xs opacity-50">{device.description}</div>}
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
            },
            {
                id: "ieee_address",
                header: t("ieee_address"),
                accessorFn: ({ device }) => [device.ieee_address, toHex(device.network_address, 4), device.network_address].join(" "),
                cell: ({
                    row: {
                        original: { device },
                    },
                }) => (
                    <>
                        <div>
                            <Link to={`/device/${device.ieee_address}/info`} className="link link-hover">
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
                // XXX: for some reason, the default sorting algorithm does not sort properly
                sortingFn: (rowA, rowB) => rowA.original.device.ieee_address.localeCompare(rowB.original.device.ieee_address),
            },
            {
                id: "model",
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
            },
            {
                id: "lqi",
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
                accessorFn: ({ state }) => convertLastSeenToDate(state.last_seen, bridgeConfig.advanced.last_seen)?.getTime(),
                cell: ({
                    row: {
                        original: { state },
                    },
                }) => <LastSeen lastSeen={state.last_seen} config={bridgeConfig.advanced.last_seen} />,
                enableColumnFilter: false,
            },
            {
                id: "availability",
                header: t("availability:availability"),
                accessorFn: ({ availabilityState }) => availabilityState.state,
                cell: ({
                    row: {
                        original: { device, availabilityState, availabilityEnabledForDevice },
                    },
                }) => {
                    return (
                        <Availability
                            disabled={device.disabled}
                            availability={availabilityState}
                            availabilityEnabledForDevice={availabilityEnabledForDevice}
                            availabilityFeatureEnabled={bridgeConfig.availability.enabled}
                        />
                    );
                },
                enableColumnFilter: false,
            },
            {
                id: "actions",
                header: () => (
                    <>
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
                    </>
                ),
                cell: ({
                    row: {
                        original: { device, state },
                    },
                }) => {
                    return (
                        <DeviceControlGroup
                            device={device}
                            state={state}
                            homeassistantEnabled={bridgeConfig.homeassistant.enabled}
                            renameDevice={renameDevice}
                            removeDevice={removeDevice}
                            configureDevice={configureDevice}
                            interviewDevice={interviewDevice}
                        />
                    );
                },
                enableSorting: false,
                enableColumnFilter: false,
            },
        ],
        [
            hideDisabled,
            batteryLowOnly,
            bridgeConfig.advanced.last_seen,
            bridgeConfig.availability.enabled,
            bridgeConfig.homeassistant.enabled,
            onHideDisabledChange,
            onBatteryLowOnlyChange,
            renameDevice,
            removeDevice,
            configureDevice,
            interviewDevice,
            t,
        ],
    );
    const visibleColumns = useMemo(
        () => ({
            friendly_name: true,
            ieee_address: true,
            model: true,
            last_seen: bridgeConfig.advanced.last_seen !== "disable",
            availability: bridgeConfig.availability.enabled || data.some((device) => device.availabilityEnabledForDevice),
            controls: true,
        }),
        [bridgeConfig.advanced.last_seen, bridgeConfig.availability.enabled, data],
    );

    return <Table id="all-devices" columns={columns} data={data} visibleColumns={visibleColumns} />;
}
