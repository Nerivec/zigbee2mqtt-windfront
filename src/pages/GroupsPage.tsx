import NiceModal from "@ebay/nice-modal-react";
import { faEdit, faServer, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ColumnDef } from "@tanstack/react-table";
import { useCallback, useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import type { Zigbee2MQTTAPI } from "zigbee2mqtt";
import Button from "../components/Button.js";
import ConfirmButton from "../components/ConfirmButton.js";
import InputField from "../components/form-fields/InputField.js";
import { RenameGroupForm } from "../components/modal/components/RenameGroupModal.js";
import SourceDot from "../components/SourceDot.js";
import Table from "../components/table/Table.js";
import { useTable } from "../hooks/useTable.js";
import { API_URLS, useAppStore } from "../store.js";
import type { Group } from "../types.js";
import { WebSocketApiRouterContext } from "../WebSocketApiRouterContext.js";

type GroupTableData = {
    sourceIdx: number;
    group: Group;
};

export default function GroupsPage() {
    const [newGroupFriendlyName, setNewGroupFriendlyName] = useState<string>("");
    const [newGroupId, setNewGroupId] = useState<string>("");
    const [newGroupSourceIdx, setNewGroupSourceIdx] = useState(0);
    const groups = useAppStore((state) => state.groups);
    const { sendMessage } = useContext(WebSocketApiRouterContext);
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
    }, [newGroupFriendlyName, newGroupId, newGroupSourceIdx, sendMessage]);

    const onRenameClick = useCallback(
        async (sourceIdx: number, from: string, to: string) => await sendMessage(sourceIdx, "bridge/request/group/rename", { from, to }),
        [sendMessage],
    );

    const onRemoveClick = useCallback(
        async ([sourceIdx, id]: [number, string]) => await sendMessage(sourceIdx, "bridge/request/group/remove", { id }),
        [sendMessage],
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
                id: "group_id",
                header: t("group_id"),
                accessorFn: ({ group }) => group.id,
                cell: ({
                    row: {
                        original: { sourceIdx, group },
                    },
                }) => (
                    <div className="flex items-center gap-3">
                        <div className="avatar" />
                        <div className="flex-grow flex flex-col">
                            <Link to={`/group/${sourceIdx}/${group.id}/devices`} className="link link-hover">
                                {group.id}
                            </Link>
                            {group.description && (
                                <div className="max-w-xs text-xs opacity-50 truncate" title={group.description}>
                                    {group.description}
                                </div>
                            )}
                            <div className="flex flex-row gap-1 mt-0.5">
                                <span className="badge badge-soft badge-sm badge-ghost cursor-default">
                                    {t("scenes")}
                                    {": "}
                                    {group.scenes?.length ?? 0}
                                </span>
                            </div>
                        </div>
                    </div>
                ),
                filterFn: "includesString",
            },
            {
                id: "friendly_name",
                header: t("common:friendly_name"),
                accessorFn: ({ group }) => group.friendly_name,
                cell: ({
                    row: {
                        original: { sourceIdx, group },
                    },
                }) => (
                    <Link to={`/group/${sourceIdx}/${group.id}/devices`} className="link link-hover">
                        {group.friendly_name}
                    </Link>
                ),
                filterFn: "includesString",
            },
            {
                id: "members",
                header: t("group_members"),
                accessorFn: ({ group }) => group.members.length ?? 0,
                enableColumnFilter: false,
            },
            {
                id: "actions",
                header: "",
                cell: ({
                    row: {
                        original: { sourceIdx, group },
                    },
                }) => (
                    <div className="join join-horizontal">
                        <Button<void>
                            className="btn btn-square btn-outline btn-primary join-item"
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
                            className="btn btn-square btn-outline btn-error join-item"
                            modalDescription={t("common:dialog_confirmation_prompt")}
                            modalCancelLabel={t("common:cancel")}
                        >
                            <FontAwesomeIcon icon={faTrash} />
                        </ConfirmButton>
                    </div>
                ),
                enableSorting: false,
                enableColumnFilter: false,
            },
        ],
        [onRenameClick, onRemoveClick, t],
    );

    const { table } = useTable({ id: "all-groups", columns, data, visibleColumns: { source: API_URLS.length > 1 } });

    return (
        <>
            <div className="collapse collapse-arrow bg-base-100 shadow mb-3">
                <input type="checkbox" />
                <div className="collapse-title text-lg font-semibold text-center">{t("create_group")}</div>
                <div className="collapse-content">
                    <div className="flex flex-row flex-wrap justify-center gap-2">
                        {API_URLS.length > 1 && (
                            <InputField
                                type="number"
                                name="source"
                                label={t("common:source")}
                                defaultValue={newGroupSourceIdx}
                                min={0}
                                max={API_URLS.length - 1}
                                readOnly={API_URLS.length === 1}
                                required
                                onChange={(e) => !!e.target.validationMessage && e.target.value && setNewGroupSourceIdx(e.target.valueAsNumber)}
                            />
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
                        />
                        <InputField
                            type="number"
                            name="group_id"
                            label={t("group_id")}
                            value={newGroupId}
                            detail={t("common:optional")}
                            min={0}
                            max={255}
                            onChange={(e) => setNewGroupId(e.target.value)}
                        />
                        <Button<void> onClick={onGroupCreateSubmit} className="btn btn-primary self-center" disabled={!isValidNewGroup}>
                            {t("create_group")}
                        </Button>
                    </div>
                </div>
            </div>
            <Table id="all-groups" table={table} />
        </>
    );
}
