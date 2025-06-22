import NiceModal from "@ebay/nice-modal-react";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ColumnDef } from "@tanstack/react-table";
import { useCallback, useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import type { Zigbee2MQTTAPI } from "zigbee2mqtt";
import { WebSocketApiRouterContext } from "../WebSocketApiRouterContext.js";
import Button from "../components/Button.js";
import ConfirmButton from "../components/ConfirmButton.js";
import InputField from "../components/form-fields/InputField.js";
import { RenameGroupForm } from "../components/modal/components/RenameGroupModal.js";
import Table from "../components/table/Table.js";
import { useAppSelector } from "../hooks/useApp.js";
import type { Group } from "../types.js";

export default function GroupsPage() {
    const [newGroupFriendlyName, setNewGroupFriendlyName] = useState<string>("");
    const [newGroupId, setNewGroupId] = useState<string>("");
    const groups = useAppSelector((state) => state.groups);
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const { t } = useTranslation(["groups", "common"]);

    const onGroupCreateSubmit = useCallback(async (): Promise<void> => {
        const payload: Zigbee2MQTTAPI["bridge/request/group/add"] = { friendly_name: newGroupFriendlyName };

        if (newGroupId) {
            payload.id = newGroupId;
        }

        await sendMessage("bridge/request/group/add", payload);
    }, [newGroupFriendlyName, newGroupId, sendMessage]);

    const onRenameClick = useCallback(
        async (from: string, to: string) => await sendMessage("bridge/request/group/rename", { from, to }),
        [sendMessage],
    );

    const onRemoveClick = useCallback(async (id: string) => await sendMessage("bridge/request/group/remove", { id }), [sendMessage]);

    const isValidNewGroup = useMemo(() => {
        if (newGroupFriendlyName) {
            return !newGroupId || !groups.find((group) => group.id.toString() === newGroupId);
        }

        return false;
    }, [newGroupFriendlyName, newGroupId, groups]);

    // biome-ignore lint/suspicious/noExplicitAny: tmp
    const columns = useMemo<ColumnDef<Group, any>[]>(
        () => [
            {
                id: "group_id",
                header: t("group_id"),
                accessorFn: (group) => group.id,
                cell: ({ row: { original: group } }) => (
                    <div className="flex items-center gap-3">
                        <div className="avatar" />
                        <div className="flex flex-col">
                            <Link to={`/group/${group.id}/devices`} className="link link-hover">
                                {group.id}
                            </Link>
                            {group.description && <div className="text-xs opacity-50">{group.description}</div>}
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
            },
            {
                id: "friendly_name",
                header: t("common:friendly_name"),
                accessorFn: (group) => group.friendly_name,
                cell: ({ row: { original: group } }) => (
                    <Link to={`/group/${group.id}/devices`} className="link link-hover">
                        {group.friendly_name}
                    </Link>
                ),
            },
            {
                id: "members",
                header: t("group_members"),
                accessorFn: (group) => group.members.length ?? 0,
                enableColumnFilter: false,
            },
            {
                id: "actions",
                header: "",
                cell: ({ row: { original: group } }) => (
                    <div className="join join-horizontal">
                        <Button<void>
                            className="btn btn-primary btn-sm join-item"
                            onClick={async () =>
                                await NiceModal.show(RenameGroupForm, {
                                    name: group.friendly_name,
                                    onRename: onRenameClick,
                                })
                            }
                            title={t("rename_group")}
                            disabled={group.friendly_name === "default_bind_group"}
                        >
                            <FontAwesomeIcon icon={faEdit} />
                        </Button>
                        <ConfirmButton<string>
                            title={t("remove_group")}
                            item={group.id.toString()}
                            onClick={onRemoveClick}
                            className="btn btn-error btn-sm join-item"
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

    return (
        <>
            <div className="collapse collapse-arrow bg-base-100 shadow mb-3">
                <input type="checkbox" />
                <div className="collapse-title text-lg font-semibold text-center">{t("create_group")}</div>
                <div className="collapse-content">
                    <div className="flex flex-row flex-wrap justify-center gap-2">
                        <InputField
                            type="text"
                            name="friendly_name"
                            label={t("common:friendly_name")}
                            value={newGroupFriendlyName}
                            placeholder={t("friendly_name_placeholder")}
                            onChange={(e) => setNewGroupFriendlyName(e.target.value)}
                            required
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
            <Table id="all-groups" columns={columns} data={groups} />
        </>
    );
}
