import NiceModal from "@ebay/nice-modal-react";
import { faEdit, faPlus, faServer, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ColumnDef } from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import type { Zigbee2MQTTAPI } from "zigbee2mqtt";
import Button from "../components/Button.js";
import ConfirmButton from "../components/ConfirmButton.js";
import InputField from "../components/form-fields/InputField.js";
import SelectField from "../components/form-fields/SelectField.js";
import { RenameGroupForm } from "../components/modal/components/RenameGroupModal.js";
import SourceDot from "../components/SourceDot.js";
import Table from "../components/table/Table.js";
import { useTable } from "../hooks/useTable.js";
import { API_NAMES, API_URLS, MULTI_INSTANCE, useAppStore } from "../store.js";
import type { Group } from "../types.js";
import { sendMessage } from "../websocket/WebSocketManager.js";

type GroupTableData = {
    sourceIdx: number;
    group: Group;
};

export default function GroupsPage() {
    const [newGroupFriendlyName, setNewGroupFriendlyName] = useState<string>("");
    const [newGroupId, setNewGroupId] = useState<string>("");
    const [newGroupSourceIdx, setNewGroupSourceIdx] = useState(0);
    const groups = useAppStore((state) => state.groups);
    const { t } = useTranslation(["groups", "common"]);

    const data = useMemo(() => {
        const renderGroups: GroupTableData[] = [];

        for (let sourceIdx = 0; sourceIdx < API_URLS.length; sourceIdx++) {
            for (const group of groups[sourceIdx]) {
                renderGroups.push({
                    sourceIdx,
                    group,
                });
            }
        }

        return renderGroups;
    }, [groups]);

    const onGroupCreateSubmit = useCallback(async (): Promise<void> => {
        const payload: Zigbee2MQTTAPI["bridge/request/group/add"] = { friendly_name: newGroupFriendlyName };

        if (newGroupId) {
            payload.id = newGroupId;
        }

        await sendMessage(newGroupSourceIdx, "bridge/request/group/add", payload);
        setNewGroupFriendlyName("");
        setNewGroupId("");
        setNewGroupSourceIdx(0);
    }, [newGroupFriendlyName, newGroupId, newGroupSourceIdx]);

    const onRenameClick = useCallback(
        async (sourceIdx: number, from: string, to: string) => await sendMessage(sourceIdx, "bridge/request/group/rename", { from, to }),
        [],
    );

    const onRemoveClick = useCallback(
        async ([sourceIdx, id]: [number, string]) => await sendMessage(sourceIdx, "bridge/request/group/remove", { id }),
        [],
    );

    const isValidNewGroup = useMemo(() => {
        if (newGroupFriendlyName) {
            return !newGroupId || !groups[newGroupSourceIdx].find((group) => group.id.toString() === newGroupId);
        }

        return false;
    }, [newGroupFriendlyName, newGroupId, newGroupSourceIdx, groups]);

    const columns = useMemo<ColumnDef<GroupTableData, unknown>[]>(
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
                accessorFn: ({ group }) => `${group.friendly_name} ${group.description ?? ""}`,
                cell: ({
                    row: {
                        original: { sourceIdx, group },
                    },
                }) => (
                    // min-w-0 serves to properly truncate content
                    <div className="flex-grow flex flex-col min-w-0">
                        <Link to={`/group/${sourceIdx}/${group.id}/devices`} className="link link-hover truncate">
                            {group.friendly_name}
                        </Link>
                        {group.description && (
                            <div className="max-w-3xs text-xs opacity-50 truncate" title={group.description}>
                                {group.description}
                            </div>
                        )}
                    </div>
                ),
                sortingFn: (rowA, rowB) => rowA.original.group.friendly_name.localeCompare(rowB.original.group.friendly_name),
                filterFn: "includesString",
                meta: {
                    filterVariant: "text",
                    textFaceted: true,
                },
            },
            {
                id: "group_id",
                minSize: 175,
                header: t("group_id"),
                accessorFn: ({ group }) => group.id,
                cell: ({
                    row: {
                        original: { sourceIdx, group },
                    },
                }) => (
                    <Link to={`/group/${sourceIdx}/${group.id}/devices`} className="link link-hover">
                        {group.id}
                    </Link>
                ),
                filterFn: "weakEquals",
                meta: {
                    filterVariant: "text",
                },
            },
            {
                id: "members",
                size: 125,
                header: t("group_members"),
                accessorFn: ({ group }) => group.members.length ?? 0,
                filterFn: "inNumberRange",
                meta: {
                    filterVariant: "range",
                },
            },
            {
                id: "scenes",
                size: 125,
                header: t("group_scenes"),
                accessorFn: ({ group }) => group.scenes.length ?? 0,
                filterFn: "inNumberRange",
                meta: {
                    filterVariant: "range",
                },
            },
            {
                id: "actions",
                minSize: 130,
                cell: ({
                    row: {
                        original: { sourceIdx, group },
                    },
                }) => (
                    <div className="join join-horizontal">
                        <Button<void>
                            className="btn btn-sm btn-square btn-outline btn-primary join-item"
                            onClick={async () =>
                                await NiceModal.show(RenameGroupForm, {
                                    sourceIdx,
                                    name: group.friendly_name,
                                    onRename: onRenameClick,
                                })
                            }
                            title={t("rename_group")}
                            disabled={group.friendly_name === "default_bind_group"}
                        >
                            <FontAwesomeIcon icon={faEdit} />
                        </Button>
                        <ConfirmButton<[number, string]>
                            title={t("remove_group")}
                            item={[sourceIdx, group.id.toString()]}
                            onClick={onRemoveClick}
                            className="btn btn-sm btn-square btn-outline btn-error join-item"
                            modalDescription={t("common:dialog_confirmation_prompt")}
                            modalCancelLabel={t("common:cancel")}
                        >
                            <FontAwesomeIcon icon={faTrash} />
                        </ConfirmButton>
                    </div>
                ),
                enableSorting: false,
                enableColumnFilter: false,
                enableGlobalFilter: false,
            },
        ],
        [onRenameClick, onRemoveClick, t],
    );

    const table = useTable({
        id: "all-groups",
        columns,
        data,
        visibleColumns: { source: MULTI_INSTANCE },
        sorting: [{ id: "friendly_name", desc: false }],
    });

    return (
        <>
            <div className="flex flex-row flex-wrap justify-center gap-2 mb-2">
                {MULTI_INSTANCE && (
                    <SelectField
                        name="source"
                        label={t("common:source")}
                        value={newGroupSourceIdx}
                        required
                        onChange={(e) => !e.target.validationMessage && setNewGroupSourceIdx(Number.parseInt(e.target.value, 10))}
                        className="select select-sm"
                    >
                        {API_NAMES.map((name, idx) => (
                            <option key={`${idx}-${name}`} value={idx}>
                                {name}
                            </option>
                        ))}
                    </SelectField>
                )}
                <InputField
                    type="text"
                    name="friendly_name"
                    label={t("common:friendly_name")}
                    value={newGroupFriendlyName}
                    placeholder={t("friendly_name_placeholder")}
                    onChange={(e) => setNewGroupFriendlyName(e.target.value)}
                    required
                    minLength={1}
                    className="input input-sm"
                />
                <InputField
                    type="number"
                    name="group_id"
                    label={t("group_id")}
                    value={newGroupId}
                    min={0}
                    max={255}
                    onChange={(e) => setNewGroupId(e.target.value)}
                    className="input input-sm"
                />
                <fieldset className="fieldset self-end">
                    <Button<void> onClick={onGroupCreateSubmit} className="btn btn-sm btn-outline btn-primary" disabled={!isValidNewGroup}>
                        <FontAwesomeIcon icon={faPlus} />
                        {t("create_group")}
                    </Button>
                </fieldset>
            </div>
            <Table id="all-groups" {...table} />
        </>
    );
}
