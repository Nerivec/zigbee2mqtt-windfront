import NiceModal from "@ebay/nice-modal-react";
import { faBan, faPenToSquare, faServer } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ColumnDef } from "@tanstack/react-table";
import { type JSX, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import Button from "../components/Button.js";
import ConfirmButton from "../components/ConfirmButton.js";
import DeviceImage from "../components/device/DeviceImage.js";
import ReportingRow from "../components/device-page/ReportingRow.js";
import SelectField from "../components/form-fields/SelectField.js";
import { ReportingRuleModal } from "../components/modal/components/ReportingRuleModal.js";
import DevicePicker from "../components/pickers/DevicePicker.js";
import EndpointPicker from "../components/pickers/EndpointPicker.js";
import { makeDefaultReporting, type ReportingRule } from "../components/reporting/index.js";
import SourceDot from "../components/SourceDot.js";
import Table from "../components/table/Table.js";
import TableSearch from "../components/table/TableSearch.js";
import { useTable } from "../hooks/useTable.js";
import { NavBarContent } from "../layout/NavBarContext.js";
import { API_NAMES, API_URLS, MULTI_INSTANCE, useAppStore } from "../store.js";
import type { Device } from "../types.js";
import { getEndpoints } from "../utils.js";
import { sendMessage } from "../websocket/WebSocketManager.js";

type ReportingTableData = {
    sourceIdx: number;
    device: Device;
    rule: ReportingRule;
};

export default function ReportingPage(): JSX.Element {
    const devices = useAppStore((state) => state.devices);
    const { t } = useTranslation(["zigbee", "common"]);
    const [newRuleSourceIdx, setNewRuleSourceIdx] = useState(0);
    const [newRuleDevice, setNewRuleDevice] = useState<Device | null>(null);
    const [newRuleEndpoint, setNewRuleEndpoint] = useState<string>("");
    const [newRuleDraft, setNewRuleDraft] = useState<ReportingRule | null>(null);

    const data = useMemo<ReportingTableData[]>(() => {
        const rows: ReportingTableData[] = [];

        for (let sourceIdx = 0; sourceIdx < API_URLS.length; sourceIdx++) {
            for (const device of devices[sourceIdx]) {
                for (const endpointId in device.endpoints) {
                    const endpoint = device.endpoints[endpointId];

                    for (const reporting of endpoint.configured_reportings) {
                        rows.push({
                            sourceIdx,
                            device,
                            rule: { ...reporting, endpoint: endpointId },
                        });
                    }
                }
            }
        }

        return rows;
    }, [devices]);

    useEffect(() => {
        if (newRuleDevice && newRuleEndpoint) {
            setNewRuleDraft(makeDefaultReporting(newRuleDevice.ieee_address, newRuleEndpoint));
        } else {
            setNewRuleDraft(null);
        }
    }, [newRuleDevice, newRuleEndpoint]);

    const availableEndpoints = useMemo(() => getEndpoints(newRuleDevice), [newRuleDevice]);

    const applyRule = useCallback(async (sourceIdx: number, device: Device, rule: ReportingRule): Promise<void> => {
        const { cluster, endpoint, attribute, minimum_report_interval, maximum_report_interval, reportable_change } = rule;

        await sendMessage(sourceIdx, "bridge/request/device/configure_reporting", {
            id: device.ieee_address,
            endpoint,
            cluster,
            attribute,
            minimum_report_interval,
            maximum_report_interval,
            reportable_change,
            option: {},
        });
    }, []);

    const applyNewRule = useCallback(
        async (rule: ReportingRule): Promise<void> => {
            if (!newRuleDevice) {
                return;
            }

            await applyRule(newRuleSourceIdx, newRuleDevice, rule);
            setNewRuleSourceIdx(0);
            setNewRuleDevice(null);
            setNewRuleEndpoint("");
        },
        [applyRule, newRuleSourceIdx, newRuleDevice],
    );

    const columns = useMemo<ColumnDef<ReportingTableData, unknown>[]>(
        () => [
            {
                id: "source",
                size: 60,
                header: () => (
                    <span title={t(($) => $.source, { ns: "common" })}>
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
                meta: { filterVariant: "select", showFacetedOccurrences: true },
            },
            {
                id: "friendly_name",
                size: 250,
                minSize: 175,
                header: t(($) => $.friendly_name, { ns: "common" }),
                accessorFn: ({ device }) => `${device.friendly_name} ${device.ieee_address} ${device.definition?.model ?? ""}`,
                cell: ({
                    row: {
                        original: { sourceIdx, device },
                    },
                }) => (
                    <div className="flex items-center gap-3">
                        <div className="avatar">
                            <div className="h-11 w-11" style={{ overflow: "visible" }}>
                                <DeviceImage device={device} disabled={device.disabled} />
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
                meta: { filterVariant: "text", textFaceted: true },
            },
            {
                id: "endpoint",
                size: 85,
                header: t(($) => $.endpoint),
                accessorFn: ({ rule }) => rule.endpoint,
                filterFn: "equals",
                meta: { filterVariant: "text" },
            },
            {
                id: "cluster",
                minSize: 150,
                header: t(($) => $.cluster),
                accessorFn: ({ rule }) => rule.cluster,
                filterFn: "includesString",
                meta: { filterVariant: "text", textFaceted: true },
            },
            {
                id: "attribute",
                minSize: 150,
                header: t(($) => $.attribute),
                accessorFn: ({ rule }) => rule.attribute,
                filterFn: "includesString",
                meta: { filterVariant: "text", textFaceted: true },
            },
            {
                id: "min_rep_interval",
                size: 120,
                header: t(($) => $.min_rep_interval),
                accessorFn: ({ rule }) => rule.minimum_report_interval,
                filterFn: "inNumberRange",
                meta: { filterVariant: "range" },
            },
            {
                id: "max_rep_interval",
                size: 120,
                header: t(($) => $.max_rep_interval),
                accessorFn: ({ rule }) => rule.maximum_report_interval,
                filterFn: "inNumberRange",
                meta: { filterVariant: "range" },
            },
            {
                id: "min_rep_change",
                size: 120,
                header: t(($) => $.min_rep_change),
                accessorFn: ({ rule }) => rule.reportable_change,
                filterFn: "inNumberRange",
                meta: { filterVariant: "range" },
            },
            {
                id: "actions",
                size: 110,
                cell: ({
                    row: {
                        original: { sourceIdx, device, rule },
                    },
                }) => (
                    <div className="join join-horizontal">
                        <Button<void>
                            className="btn btn-sm btn-square btn-outline btn-primary join-item"
                            title={t(($) => $.edit, { ns: "common" })}
                            onClick={async () =>
                                await NiceModal.show(ReportingRuleModal, {
                                    sourceIdx,
                                    device,
                                    rule,
                                    onApply: async (updatedRule) => await applyRule(sourceIdx, device, updatedRule),
                                })
                            }
                        >
                            <FontAwesomeIcon icon={faPenToSquare} />
                        </Button>
                        {!rule.isNew ? (
                            <ConfirmButton<void>
                                title={t(($) => $.disable, { ns: "common" })}
                                className="btn btn-sm btn-square btn-error btn-outline join-item"
                                onClick={async () => await applyRule(sourceIdx, device, { ...rule, maximum_report_interval: 0xffff })}
                                modalDescription={t(($) => $.dialog_confirmation_prompt, { ns: "common" })}
                                modalCancelLabel={t(($) => $.cancel, { ns: "common" })}
                            >
                                <FontAwesomeIcon icon={faBan} />
                            </ConfirmButton>
                        ) : null}
                    </div>
                ),
                enableSorting: false,
                enableColumnFilter: false,
                enableGlobalFilter: false,
            },
        ],
        [applyRule, t],
    );

    const table = useTable({
        id: "all-reportings",
        columns,
        data,
        visibleColumns: { source: MULTI_INSTANCE },
        sorting: [
            { id: "friendly_name", desc: false },
            { id: "endpoint", desc: false },
        ],
    });

    return (
        <>
            <NavBarContent>
                <TableSearch {...table} />
            </NavBarContent>

            <div className="flex flex-row flex-wrap justify-center gap-2 mb-2">
                {MULTI_INSTANCE ? (
                    <SelectField
                        name="source"
                        label={t(($) => $.source, { ns: "common" })}
                        value={newRuleSourceIdx}
                        onChange={(e) => {
                            if (!e.target.validationMessage) {
                                setNewRuleSourceIdx(Number.parseInt(e.target.value, 10));
                                setNewRuleDevice(null);
                                setNewRuleEndpoint("");
                            }
                        }}
                        className="select"
                    >
                        {API_NAMES.map((name, idx) => (
                            <option key={`${idx}-${name}`} value={idx}>
                                {name}
                            </option>
                        ))}
                    </SelectField>
                ) : null}
                <DevicePicker
                    label={t(($) => $.device, { ns: "zigbee" })}
                    devices={devices[newRuleSourceIdx] ?? []}
                    value={newRuleDevice?.ieee_address ?? ""}
                    onChange={(entity) => {
                        if (entity && "ieee_address" in entity) {
                            setNewRuleDevice(entity);
                            setNewRuleEndpoint("");
                        } else {
                            setNewRuleDevice(null);
                        }
                    }}
                    disabled={(devices[newRuleSourceIdx] ?? []).length === 0}
                />
                <EndpointPicker
                    label={t(($) => $.source_endpoint, { ns: "common" })}
                    values={availableEndpoints}
                    value={newRuleEndpoint}
                    disabled={!newRuleDevice}
                    onChange={(endpoint) => setNewRuleEndpoint(String(endpoint))}
                />
                {newRuleDevice && newRuleDraft ? (
                    <ReportingRow
                        sourceIdx={newRuleSourceIdx}
                        device={newRuleDevice}
                        rule={newRuleDraft}
                        onApply={applyNewRule}
                        showDivider={false}
                    />
                ) : null}
            </div>

            <div className="mb-5">
                <Table id="all-reportings" {...table} />
            </div>
        </>
    );
}
