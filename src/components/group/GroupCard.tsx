import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import type { Group } from "../../types.js";
import ConfirmButton from "../ConfirmButton.js";

export type GroupCardProps = {
    data: {
        sourceIdx: number;
        group: Group;
        endpoint: number;
        removeFromGroup: ([group, endpoint]: [Group, number]) => Promise<void>;
    };
};

const GroupCard = memo(({ data: { sourceIdx, group, endpoint, removeFromGroup } }: GroupCardProps) => {
    const { t } = useTranslation(["groups", "common"]);

    return (
        <div className="mb-3 card bg-base-200 rounded-box shadow-md">
            <div className="card-body p-2">
                <div className="flex flex-row items-center gap-3 w-full">
                    <div className="min-w-0">
                        <Link to={`/group/${sourceIdx}/${group.id}/devices`} className="link link-hover">
                            #{group.id} - {group.friendly_name}
                            {endpoint ? ` (${t("endpoint")}: ${endpoint})` : ""}
                        </Link>
                        {group.description && (
                            <div className="text-xs opacity-50 truncate" title={group.description}>
                                {group.description}
                            </div>
                        )}
                    </div>
                </div>
                <div className="text-sm w-full p-2">
                    <div className="badge badge-soft badge-ghost cursor-default me-2">
                        {t("group_members")}: {group.members.length}
                    </div>
                    <div className="badge badge-soft badge-ghost cursor-default me-2">
                        {t("group_scenes")}: {group.scenes.length}
                    </div>
                </div>
            </div>
            <div className="flex flex-row flex-wrap gap-1 mx-2 mb-2 justify-around items-center">
                <ConfirmButton<[Group, number]>
                    item={[group, endpoint]}
                    onClick={removeFromGroup}
                    className="btn btn-square btn-error btn-sm"
                    title={t("remove_from_group")}
                    modalDescription={t("common:dialog_confirmation_prompt")}
                    modalCancelLabel={t("common:cancel")}
                >
                    <FontAwesomeIcon icon={faTrash} />
                </ConfirmButton>
            </div>
        </div>
    );
});

export default GroupCard;
