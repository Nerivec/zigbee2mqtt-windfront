import NiceModal from "@ebay/nice-modal-react";
import { faPenToSquare, faServer, faUnlink } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import { type JSX, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import Button from "../components/Button.js";
import {
    type Action,
    aggregateBindings,
    type BindingRule,
    type BindingRuleTargetDevice,
    type BindingRuleTargetGroup,
    getRuleDst,
    makeDefaultBinding,
} from "../components/binding/index.js";
import ConfirmButton from "../components/ConfirmButton.js";
import DeviceImage from "../components/device/DeviceImage.js";
import BindRow from "../components/device-page/BindRow.js";
import SelectField from "../components/form-fields/SelectField.js";
import { BindingRuleModal } from "../components/modal/components/BindingRuleModal.js";
import { BindingsBatchEditModal } from "../components/modal/components/BindingsBatchEditModal.js";
import IndeterminateCheckbox from "../components/ota-page/IndeterminateCheckbox.js";
import DevicePicker from "../components/pickers/DevicePicker.js";
import EndpointPicker from "../components/pickers/EndpointPicker.js";
import SourceDot from "../components/SourceDot.js";
import Table from "../components/table/Table.js";
import TableSearch from "../components/table/TableSearch.js";
import { useTable } from "../hooks/useTable.js";
import { NavBarContent } from "../layout/NavBarContext.js";
import { API_NAMES, MULTI_INSTANCE, useAppStore } from "../store.js";
import type { Device } from "../types.js";
import { getEndpoints } from "../utils.js";
import { sendMessage } from "../websocket/WebSocketManager.js";

export type BindingTableData = {
    sourceIdx: number;
    device: Device;
    rule: BindingRule;
};

export default function BindingsPage(): JSX.Element {
    const devices = useAppStore((state) => state.devices);
    const groups = useAppStore((state) => state.groups);
    const { t } = useTranslation(["zigbee", "common"]);
    const [newRuleSourceIdx, setNewRuleSourceIdx] = useState(0);
    const [newRuleDevice, setNewRuleDevice] = useState<Device | null>(null);
    const [newRuleSourceEndpoint, setNewRuleSourceEndpoint] = useState<string>("");
    const [newRuleDraft, setNewRuleDraft] = useState<BindingRule | null>(null);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

    // biome-ignore lint/correctness/useExhaustiveDependencies: specific trigger
    useEffect(() => {
        setRowSelection({});
    }, [devices]);

    const data = useMemo<BindingTableData[]>(() => {
        const rows: BindingTableData[] = [];

        for (let sourceIdx = 0; sourceIdx < API_NAMES.length; sourceIdx++) {
            const sourceDevices = devices[sourceIdx] ?? [];

            for (const device of sourceDevices) {
                for (const rule of aggregateBindings(device)) {
                    rows.push({
                        sourceIdx,
                        device,
                        rule,
                    });
                }
            }
        }

        return rows;
    }, [devices]);

    const rowSelectionCount = useMemo(() => Object.keys(rowSelection).length, [rowSelection]);

    // biome-ignore lint/correctness/useExhaustiveDependencies: can't dep table
    const actOnFilteredSelected = useCallback(
        async ([unbind, clusters]: [boolean | undefined, string[] | undefined]) => {
            const promises: Promise<void>[] = [];

            for (const row of table.table.getFilteredRowModel().rows) {
                if (row.getIsSelected()) {
                    const { sourceIdx, rule } = row.original;

                    promises.push(
                        sendMessage(sourceIdx, unbind ? "bridge/request/device/unbind" : "bridge/request/device/bind", {
                            from: rule.source.ieee_address,
                            from_endpoint: rule.source.endpoint,
                            to: rule.target.type === "group" ? rule.target.id : rule.target.ieee_address,
                            to_endpoint: rule.target.type === "endpoint" ? rule.target.endpoint : undefined,
                            clusters: clusters ?? rule.clusters,
                        }),
                    );
                }
            }

            setRowSelection({});

            if (promises.length > 0) {
                await Promise.allSettled(promises);
            }
        },
        [devices, groups],
    );

    const availableSourceEndpoints = useMemo(() => getEndpoints(newRuleDevice), [newRuleDevice]);

    useEffect(() => {
        if (newRuleDevice && newRuleSourceEndpoint) {
            setNewRuleDraft(makeDefaultBinding(newRuleDevice.ieee_address, newRuleSourceEndpoint));
        } else {
            setNewRuleDraft(null);
        }
    }, [newRuleSourceEndpoint, newRuleDevice]);

    const applyRule = useCallback(
        async (sourceIdx: number, action: Action, stateRule: BindingRule): Promise<void> => {
            const dst = getRuleDst(stateRule.target, devices[sourceIdx], groups[sourceIdx]);

            if (!dst) {
                return;
            }

            const payload = {
                from: stateRule.source.ieee_address,
                from_endpoint: stateRule.source.endpoint,
                to: dst.to,
                to_endpoint: dst.toEndpoint,
                clusters: stateRule.clusters,
            };

            if (action === "Bind") {
                await sendMessage(sourceIdx, "bridge/request/device/bind", payload);
            } else {
                await sendMessage(sourceIdx, "bridge/request/device/unbind", payload);
            }
        },
        [devices, groups],
    );

    const applyNewRule = useCallback(
        async ([action, rule]: [Action, BindingRule]): Promise<void> => {
            if (!newRuleDevice) {
                return;
            }

            await applyRule(newRuleSourceIdx, action, rule);
            setNewRuleSourceIdx(0);
            setNewRuleDevice(null);
            setNewRuleSourceEndpoint("");
        },
        [applyRule, newRuleSourceIdx, newRuleDevice],
    );

    const columns = useMemo<ColumnDef<BindingTableData, unknown>[]>(
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
                            <Link to={`/device/${sourceIdx}/${device.ieee_address}/bind`} className="link link-hover truncate">
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
                id: "source_endpoint",
                size: 110,
                header: t(($) => $.source_endpoint, { ns: "common" }),
                accessorFn: ({ rule }) => `${rule.source.endpoint}`,
                filterFn: "includesString",
                meta: { filterVariant: "text" },
            },
            {
                id: "type",
                size: 120,
                header: t(($) => $.type, { ns: "zigbee" }),
                accessorFn: ({ rule }) => t(($) => (rule.target.type === "group" ? $.group : $.device), { ns: "zigbee" }),
                filterFn: "equals",
                meta: { filterVariant: "select", showFacetedOccurrences: true },
            },
            {
                id: "destination",
                minSize: 200,
                header: t(($) => $.destination, { ns: "common" }),
                accessorFn: ({ sourceIdx, rule }) => {
                    if (rule.target.type === "group") {
                        const friendlyName = groups[sourceIdx].find((g) => g.id === (rule.target as BindingRuleTargetGroup).id)?.friendly_name;

                        return friendlyName ? friendlyName : `${t(($) => $.unknown)}: ${rule.target.id}`;
                    }

                    const friendlyName = devices[sourceIdx].find(
                        (d) => d.ieee_address === (rule.target as BindingRuleTargetDevice).ieee_address,
                    )?.friendly_name;

                    return friendlyName ? friendlyName : `${t(($) => $.unknown)}: ${rule.target.ieee_address}`;
                },
                filterFn: "includesString",
                meta: { filterVariant: "text", textFaceted: true },
            },
            {
                id: "destination_endpoint",
                minSize: 200,
                header: t(($) => $.destination_endpoint, { ns: "common" }),
                accessorFn: ({ rule }) => (rule.target.type === "group" ? "N/A" : `${rule.target.endpoint}`),
                filterFn: "includesString",
                meta: { filterVariant: "text" },
            },
            {
                id: "clusters",
                minSize: 200,
                header: t(($) => $.clusters, { ns: "common" }),
                accessorFn: ({ rule }) => rule.clusters.join(", "),
                cell: ({
                    row: {
                        original: { rule },
                    },
                }) => (
                    <div className="flex flex-row flex-wrap gap-1">
                        {rule.clusters.map((cluster) => (
                            <span key={cluster} className="badge badge-ghost badge-sm">
                                {cluster}
                            </span>
                        ))}
                    </div>
                ),
                filterFn: "includesString",
                meta: { filterVariant: "text" },
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
                                await NiceModal.show(BindingRuleModal, {
                                    sourceIdx,
                                    device,
                                    devices: devices[sourceIdx],
                                    groups: groups[sourceIdx],
                                    rule,
                                    onApply: async (args) => await applyRule(sourceIdx, args[0], args[1]),
                                })
                            }
                        >
                            <FontAwesomeIcon icon={faPenToSquare} />
                        </Button>
                        {!rule.isNew ? (
                            <ConfirmButton<void>
                                title={t(($) => $.unbind, { ns: "common" })}
                                className="btn btn-sm btn-square btn-error btn-outline join-item"
                                onClick={async () => await applyRule(sourceIdx, "Unbind", rule)}
                                modalDescription={t(($) => $.dialog_confirmation_prompt, { ns: "common" })}
                                modalCancelLabel={t(($) => $.cancel, { ns: "common" })}
                            >
                                <FontAwesomeIcon icon={faUnlink} />
                            </ConfirmButton>
                        ) : null}
                    </div>
                ),
                enableSorting: false,
                enableColumnFilter: false,
                enableGlobalFilter: false,
            },
        ],
        [applyRule, devices, groups, t],
    );

    const table = useTable({
        id: "all-bindings",
        columns,
        data,
        visibleColumns: { source: MULTI_INSTANCE },
        sorting: [
            { id: "friendly_name", desc: false },
            { id: "source_endpoint", desc: false },
        ],
        rowSelection,
        onRowSelectionChange: setRowSelection,
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
                                setNewRuleSourceEndpoint("");
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
                            setNewRuleSourceEndpoint("");
                        } else {
                            setNewRuleDevice(null);
                        }
                    }}
                    disabled={(devices[newRuleSourceIdx] ?? []).length === 0}
                />
                <EndpointPicker
                    label={t(($) => $.source_endpoint, { ns: "common" })}
                    values={availableSourceEndpoints}
                    value={newRuleSourceEndpoint}
                    disabled={!newRuleDevice}
                    onChange={(endpoint) => setNewRuleSourceEndpoint(String(endpoint))}
                />
                {newRuleDevice && newRuleDraft ? (
                    <BindRow
                        sourceIdx={newRuleSourceIdx}
                        device={newRuleDevice}
                        devices={devices[newRuleSourceIdx] ?? []}
                        groups={groups[newRuleSourceIdx] ?? []}
                        rule={newRuleDraft}
                        onApply={applyNewRule}
                        showDivider={false}
                    />
                ) : null}
            </div>

            <div className="mb-5">
                <div className="flex flex-row flex-wrap gap-2 px-2 pb-3">
                    <Button<void>
                        className="btn btn-outline btn-error btn-sm"
                        title={t(($) => $.edit_selected, { ns: "common" })}
                        onClick={async () =>
                            await NiceModal.show(BindingsBatchEditModal, {
                                devices,
                                selectedRows: table.table.getFilteredRowModel().rows.filter((r) => r.getIsSelected()),
                                onApply: actOnFilteredSelected,
                            })
                        }
                        disabled={rowSelectionCount === 0}
                    >
                        {`${t(($) => $.edit_selected, { ns: "common" })} (${rowSelectionCount})`}
                    </Button>
                    <ConfirmButton
                        item={[true, undefined]}
                        className="btn btn-outline btn-error btn-sm"
                        onClick={actOnFilteredSelected}
                        title={t(($) => $.disable_selected, { ns: "common" })}
                        disabled={rowSelectionCount === 0}
                        modalDescription={t(($) => $.dialog_confirmation_prompt, { ns: "common" })}
                        modalCancelLabel={t(($) => $.cancel, { ns: "common" })}
                    >
                        {`${t(($) => $.disable_selected, { ns: "common" })} (${rowSelectionCount})`}
                    </ConfirmButton>
                </div>
            </div>

            <div className="mb-5">
                <Table id="all-bindings" {...table} />
            </div>
        </>
    );
}
