import { faBroom, faCircleNotch, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ColumnDef } from "@tanstack/react-table";
import { useCallback, useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import Button from "../components/Button.js";
import Table from "../components/table/Table.js";
import { useAppDispatch, useAppSelector } from "../hooks/useApp.js";
import { setTouchlinkIdentifyInProgress, setTouchlinkResetInProgress, setTouchlinkScan } from "../store.js";
import type { TouchlinkDevice } from "../types.js";
import { WebSocketApiRouterContext } from "../WebSocketApiRouterContext.js";

export default function TouchlinkPage() {
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const dispatch = useAppDispatch();
    const touchlinkDevices = useAppSelector((state) => state.touchlinkDevices);
    const devices = useAppSelector((state) => state.devices);
    const touchlinkIdentifyInProgress = useAppSelector((state) => state.touchlinkIdentifyInProgress);
    const touchlinkResetInProgress = useAppSelector((state) => state.touchlinkResetInProgress);
    const touchlinkScanInProgress = useAppSelector((state) => state.touchlinkScanInProgress);
    const touchlinkInProgress = touchlinkIdentifyInProgress || touchlinkResetInProgress;
    const { t } = useTranslation(["touchlink", "common", "zigbee"]);

    const onScanClick = useCallback(async () => {
        dispatch(setTouchlinkScan({ inProgress: true, devices: [] }));
        await sendMessage("bridge/request/touchlink/scan", "");
    }, [sendMessage, dispatch]);

    const onIdentifyClick = useCallback(
        async (device: TouchlinkDevice): Promise<void> => {
            dispatch(setTouchlinkIdentifyInProgress(true));
            await sendMessage("bridge/request/touchlink/identify", device);
        },
        [sendMessage, dispatch],
    );

    const onResetClick = useCallback(
        async (device: TouchlinkDevice): Promise<void> => {
            dispatch(setTouchlinkResetInProgress(true));
            await sendMessage("bridge/request/touchlink/factory_reset", device);
        },
        [sendMessage, dispatch],
    );

    const columns = useMemo<ColumnDef<TouchlinkDevice, unknown>[]>(
        () => [
            {
                id: "ieee_address",
                header: t("zigbee:ieee_address"),
                accessorFn: (touchlinkDevice) => touchlinkDevice.ieee_address,
                cell: ({ row: { original: touchlinkDevice } }) =>
                    devices.find((device) => device.ieee_address === touchlinkDevice.ieee_address) ? (
                        <Link to={`/device/${touchlinkDevice.ieee_address}/info`} className="link link-hover">
                            {touchlinkDevice.ieee_address}
                        </Link>
                    ) : (
                        touchlinkDevice.ieee_address
                    ),
                filterFn: "includesString",
                // XXX: for some reason, the default sorting algorithm does not sort properly
                sortingFn: (rowA, rowB) => rowA.original.ieee_address.localeCompare(rowB.original.ieee_address),
            },
            {
                id: "friendly_name",
                header: t("common:friendly_name"),
                accessorFn: (touchlinkDevice) => devices.find((device) => device.ieee_address === touchlinkDevice.ieee_address)?.friendly_name,
                filterFn: "includesString",
            },
            {
                id: "channel",
                header: t("zigbee:channel"),
                accessorFn: (touchlinkDevice) => touchlinkDevice.channel,
                filterFn: "includesString",
            },
            {
                id: "actions",
                header: "",
                cell: ({ row: { original: touchlinkDevice } }) => {
                    return (
                        <div className="join join-horizontal">
                            <Button<TouchlinkDevice>
                                disabled={touchlinkInProgress}
                                item={touchlinkDevice}
                                title={t("identify")}
                                className="btn btn-square btn-outline btn-primary join-item"
                                onClick={onIdentifyClick}
                            >
                                <FontAwesomeIcon
                                    icon={touchlinkIdentifyInProgress ? faCircleNotch : faExclamationTriangle}
                                    spin={touchlinkIdentifyInProgress}
                                />
                            </Button>
                            <Button<TouchlinkDevice>
                                disabled={touchlinkInProgress}
                                item={touchlinkDevice}
                                title={t("factory_reset")}
                                className="btn btn-square btn-outline btn-error join-item"
                                onClick={onResetClick}
                            >
                                <FontAwesomeIcon icon={touchlinkResetInProgress ? faCircleNotch : faBroom} spin={touchlinkResetInProgress} />
                            </Button>
                        </div>
                    );
                },
                enableSorting: false,
                enableColumnFilter: false,
            },
        ],
        [touchlinkIdentifyInProgress, touchlinkResetInProgress, touchlinkInProgress, devices, t, onIdentifyClick, onResetClick],
    );

    return touchlinkScanInProgress ? (
        <div className="flex flex-row justify-center items-center gap-2">
            <span className="loading loading-infinity loading-xl" />
        </div>
    ) : (
        <>
            <div className="flex flex-row flex-wrap justify-center items-center gap-2 mb-3">
                <Button className="btn btn-primary" onClick={onScanClick} disabled={touchlinkScanInProgress}>
                    {t("scan")}
                </Button>
            </div>

            <Table id="touchlink-devices" columns={columns} data={touchlinkDevices} />
        </>
    );
}
