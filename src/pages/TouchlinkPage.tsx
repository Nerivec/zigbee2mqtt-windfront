import { faBroom, faCircleNotch, faExclamationTriangle, faMagnifyingGlassPlus, faServer } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ColumnDef } from "@tanstack/react-table";
import { useCallback, useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import Button from "../components/Button.js";
import SelectField from "../components/form-fields/SelectField.js";
import SourceDot from "../components/SourceDot.js";
import Table from "../components/table/Table.js";
import { useTable } from "../hooks/useTable.js";
import { API_NAMES, API_URLS, useAppStore } from "../store.js";
import type { TouchlinkDevice } from "../types.js";
import { WebSocketApiRouterContext } from "../WebSocketApiRouterContext.js";

type TouchlinkTableData = {
    sourceIdx: number;
    touchlinkDevice: TouchlinkDevice;
    friendlyName: string | undefined;
    identifyInProgress: boolean;
    resetInProgress: boolean;
};

export default function TouchlinkPage() {
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const { t } = useTranslation(["touchlink", "common", "zigbee"]);
    const touchlinkDevices = useAppStore((state) => state.touchlinkDevices);
    const devices = useAppStore((state) => state.devices);
    const touchlinkIdentifyInProgress = useAppStore((state) => state.touchlinkIdentifyInProgress);
    const touchlinkResetInProgress = useAppStore((state) => state.touchlinkResetInProgress);
    const touchlinkScanInProgress = useAppStore((state) => Object.values(state.touchlinkScanInProgress).some((v) => v));
    const setTouchlinkIdentifyInProgress = useAppStore((state) => state.setTouchlinkIdentifyInProgress);
    const setTouchlinkResetInProgress = useAppStore((state) => state.setTouchlinkResetInProgress);
    const setTouchlinkScan = useAppStore((state) => state.setTouchlinkScan);
    const [scanIdx, setScanIdx] = useState(0);

    const data = useMemo((): TouchlinkTableData[] => {
        const renderDevices: TouchlinkTableData[] = [];

        for (let sourceIdx = 0; sourceIdx < API_URLS.length; sourceIdx++) {
            const sourceDevices = devices[sourceIdx];

            for (const touchlinkDevice of touchlinkDevices[sourceIdx]) {
                renderDevices.push({
                    sourceIdx,
                    touchlinkDevice,
                    friendlyName: sourceDevices.find((d) => d.ieee_address === touchlinkDevice.ieee_address)?.friendly_name,
                    identifyInProgress: touchlinkIdentifyInProgress[sourceIdx],
                    resetInProgress: touchlinkResetInProgress[sourceIdx],
                });
            }
        }

        return renderDevices;
    }, [devices, touchlinkDevices, touchlinkIdentifyInProgress, touchlinkResetInProgress]);

    const onScanClick = useCallback(
        async (sourceIdx: number) => {
            setTouchlinkScan(sourceIdx, { inProgress: true, devices: [] });
            await sendMessage(sourceIdx, "bridge/request/touchlink/scan", "");
        },
        [sendMessage, setTouchlinkScan],
    );

    const onIdentifyClick = useCallback(
        async ([sourceIdx, device]: [number, TouchlinkDevice]): Promise<void> => {
            setTouchlinkIdentifyInProgress(sourceIdx, true);
            await sendMessage(sourceIdx, "bridge/request/touchlink/identify", device);
        },
        [sendMessage, setTouchlinkIdentifyInProgress],
    );

    const onResetClick = useCallback(
        async ([sourceIdx, device]: [number, TouchlinkDevice]): Promise<void> => {
            setTouchlinkResetInProgress(sourceIdx, true);
            await sendMessage(sourceIdx, "bridge/request/touchlink/factory_reset", device);
        },
        [sendMessage, setTouchlinkResetInProgress],
    );

    const columns = useMemo<ColumnDef<TouchlinkTableData, unknown>[]>(
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
                id: "ieee_address",
                minSize: 175,
                header: t("zigbee:ieee_address"),
                accessorFn: ({ touchlinkDevice }) => touchlinkDevice.ieee_address,
                cell: ({
                    row: {
                        original: { sourceIdx, touchlinkDevice, friendlyName },
                    },
                }) =>
                    friendlyName ? (
                        <Link to={`/device/${sourceIdx}/${touchlinkDevice.ieee_address}/info`} className="link link-hover truncate">
                            {touchlinkDevice.ieee_address}
                        </Link>
                    ) : (
                        touchlinkDevice.ieee_address
                    ),
                // XXX: for some reason, the default sorting algorithm does not sort properly
                sortingFn: (rowA, rowB) => rowA.original.touchlinkDevice.ieee_address.localeCompare(rowB.original.touchlinkDevice.ieee_address),
                filterFn: "includesString",
                meta: {
                    filterVariant: "text",
                },
            },
            {
                id: "friendly_name",
                minSize: 175,
                header: t("common:friendly_name"),
                accessorFn: ({ friendlyName }) => friendlyName,
                filterFn: "includesString",
                sortingFn: (rowA, rowB) =>
                    (rowA.original.friendlyName ?? rowA.original.touchlinkDevice.ieee_address).localeCompare(
                        rowB.original.friendlyName ?? rowB.original.touchlinkDevice.ieee_address,
                    ),
                meta: {
                    filterVariant: "text",
                    textFaceted: true,
                },
            },
            {
                id: "channel",
                minSize: 175,
                header: t("zigbee:channel"),
                accessorFn: ({ touchlinkDevice }) => touchlinkDevice.channel,
                filterFn: "weakEquals",
                meta: {
                    filterVariant: "select",
                },
            },
            {
                id: "actions",
                minSize: 130,
                cell: ({
                    row: {
                        original: { sourceIdx, touchlinkDevice, resetInProgress, identifyInProgress },
                    },
                }) => {
                    return (
                        <div className="join join-horizontal">
                            <Button<[number, TouchlinkDevice]>
                                disabled={resetInProgress || identifyInProgress}
                                item={[sourceIdx, touchlinkDevice]}
                                title={t("identify")}
                                className="btn btn-sm btn-square btn-outline btn-primary join-item"
                                onClick={onIdentifyClick}
                            >
                                <FontAwesomeIcon icon={identifyInProgress ? faCircleNotch : faExclamationTriangle} spin={identifyInProgress} />
                            </Button>
                            <Button<[number, TouchlinkDevice]>
                                disabled={resetInProgress || identifyInProgress}
                                item={[sourceIdx, touchlinkDevice]}
                                title={t("factory_reset")}
                                className="btn btn-sm btn-square btn-outline btn-error join-item"
                                onClick={onResetClick}
                            >
                                <FontAwesomeIcon icon={resetInProgress ? faCircleNotch : faBroom} spin={resetInProgress} />
                            </Button>
                        </div>
                    );
                },
                enableSorting: false,
                enableColumnFilter: false,
                enableGlobalFilter: false,
            },
        ],
        [t, onIdentifyClick, onResetClick],
    );

    const table = useTable({
        id: "touchlink-devices",
        columns,
        data,
        visibleColumns: { source: API_URLS.length > 1 },
        sorting: [{ id: "friendly_name", desc: false }],
    });

    return touchlinkScanInProgress ? (
        <div className="flex flex-row justify-center items-center gap-2">
            <span className="loading loading-infinity loading-xl" />
        </div>
    ) : (
        <>
            <div className="flex flex-row flex-wrap justify-center items-center gap-2 mb-3">
                {API_NAMES.length > 1 && (
                    <SelectField
                        name="scan_idx_picker"
                        label={t("scan_source")}
                        value={scanIdx}
                        onChange={(e) => !e.target.validationMessage && !!e.target.value && setScanIdx(Number.parseInt(e.target.value, 10))}
                    >
                        <option value="" disabled>
                            {t("select_scan_source")}
                        </option>
                        {API_NAMES.map((name, idx) => (
                            <option key={name} value={idx}>
                                {name}
                            </option>
                        ))}
                    </SelectField>
                )}
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">&nbsp;</legend>
                    <Button<number> className="btn btn-outline btn-primary" item={scanIdx} onClick={onScanClick} disabled={touchlinkScanInProgress}>
                        <FontAwesomeIcon icon={faMagnifyingGlassPlus} />
                        {t("scan")}
                    </Button>
                </fieldset>
            </div>

            <Table id="touchlink-devices" {...table} />
        </>
    );
}
