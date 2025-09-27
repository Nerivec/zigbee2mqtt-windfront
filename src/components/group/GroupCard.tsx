import { faListDots, faMagicWandSparkles, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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

const GroupCard = ({ sourceIdx, group, endpoint, removeFromGroup }: GroupCardProps["data"]) => {
    const { t } = useTranslation(["groups", "common", "zigbee"]);

    return (
        <div className="mb-3 card card-border bg-base-200 border-base-300 rounded-box shadow-md">
            <div className="card-body p-3">
                <div className="flex flex-row items-center gap-3 w-full">
                    <div className="min-w-0">
                        <Link to={`/group/${sourceIdx}/${group.id}/devices`} className="link link-hover">
                            #{group.id} - {group.friendly_name}
                            {endpoint ? ` (${t(($) => $.endpoint, { ns: "zigbee" })}: ${endpoint})` : ""}
                        </Link>
                        {group.description && (
                            <div className="text-xs opacity-50 truncate" title={group.description}>
                                {group.description}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex flex-row flex-wrap gap-1 mx-2 mb-2 justify-around items-center">
                <div className="badge badge-soft badge-ghost cursor-default me-2 tooltip" data-tip={t(($) => $.group_members)}>
                    <FontAwesomeIcon icon={faListDots} /> {group.members.length}
                </div>
                <div className="badge badge-soft badge-ghost cursor-default me-2 tooltip" data-tip={t(($) => $.group_scenes)}>
                    <FontAwesomeIcon icon={faMagicWandSparkles} />
                    {group.scenes.length}
                </div>
                <ConfirmButton<[Group, number]>
                    item={[group, endpoint]}
                    onClick={removeFromGroup}
                    className="btn btn-square btn-error btn-sm"
                    title={t(($) => $.remove_from_group)}
                    modalDescription={t(($) => $.dialog_confirmation_prompt, { ns: "common" })}
                    modalCancelLabel={t(($) => $.cancel, { ns: "common" })}
                >
                    <FontAwesomeIcon icon={faTrash} />
                </ConfirmButton>
            </div>
        </div>
    );
};

const GroupCardGuarded = (props: GroupCardProps) => {
    // when filtering, indexing can get "out-of-whack" it appears
    return props?.data ? <GroupCard {...props.data} /> : null;
};

export default GroupCardGuarded;
