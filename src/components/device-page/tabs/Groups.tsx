import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback, useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { useAppSelector } from "../../../hooks/useApp.js";
import type { Device, Group } from "../../../types.js";
import { getEndpoints } from "../../../utils.js";
import { WebSocketApiRouterContext } from "../../../WebSocketApiRouterContext.js";
import Button from "../../Button.js";
import ConfirmButton from "../../ConfirmButton.js";
import EndpointPicker from "../../pickers/EndpointPicker.js";
import GroupPicker from "../../pickers/GroupPicker.js";

type GroupsProps = {
    device: Device;
};

export default function Groups({ device }: GroupsProps) {
    const { t } = useTranslation(["groups", "zigbee", "common"]);
    const groups = useAppSelector((state) => state.groups);
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const [endpoint, setEndpoint] = useState<string | number>("");
    const [groupId, setGroupId] = useState<string | number>("");
    const endpoints = useMemo(() => getEndpoints(device), [device]);
    const [memberGroups, nonMemberGroups] = useMemo(() => {
        const inGroups: [Group, number][] = [];
        const notInGroups: Group[] = [];

        for (const group of groups) {
            const groupMembers = group.members.filter((member) => member.ieee_address === device.ieee_address);

            if (groupMembers.length > 0) {
                for (const groupMember of groupMembers) {
                    inGroups.push([group, groupMember.endpoint]);
                }
            } else {
                notInGroups.push(group);
            }
        }

        return [inGroups, notInGroups];
    }, [groups, device.ieee_address]);

    const onGroupChange = useCallback(
        (selectedGroup: Group): void => {
            setGroupId(selectedGroup.id);
            setEndpoint(endpoints.values().next().value);
        },
        [endpoints],
    );

    const addToGroup = useCallback(
        async () =>
            await sendMessage("bridge/request/group/members/add", {
                group: groupId.toString(),
                endpoint,
                device: device.ieee_address,
            }),
        [sendMessage, groupId, device.ieee_address, endpoint],
    );

    const removeFromGroup = useCallback(
        async ([group, endpoint]: [Group, number]): Promise<void> =>
            await sendMessage("bridge/request/group/members/remove", {
                device: device.ieee_address,
                endpoint: endpoint,
                group: group.id.toString(),
            }),
        [sendMessage, device.ieee_address],
    );

    return (
        <>
            <div className="flex flex-row flex-wrap justify-around items-start gap-3 my-2">
                <div>
                    <h2 className="text-lg font-semibold">{t("add_to_group")}</h2>
                    <div className="mb-3">
                        <GroupPicker label={t("zigbee:group")} value={groupId} groups={nonMemberGroups} onChange={onGroupChange} required />
                        <EndpointPicker label={t("zigbee:endpoint")} values={endpoints} value={endpoint} onChange={(e) => setEndpoint(e)} required />
                    </div>
                    <Button<void>
                        onClick={addToGroup}
                        className="btn btn-primary"
                        disabled={endpoint == null || groupId == null || endpoint === "" || groupId === ""}
                    >
                        {t("add_to_group")}
                    </Button>
                </div>
            </div>
            <div className="flex flex-row flex-wrap justify-center gap-3 mt-3">
                {memberGroups.map(([group, endpoint]) => (
                    <ul className="w-[23rem] list bg-base-200 rounded-box shadow-md" key={`${group.id}-${endpoint}`}>
                        <li className="list-row grow">
                            <div>
                                <Link to={`/group/${group.id}/devices`} className="link link-hover">
                                    #{group.id} - {group.friendly_name}
                                    {endpoint ? ` (${t("endpoint")}: ${endpoint})` : ""}
                                </Link>
                                {device.description && (
                                    <div className="text-xs opacity-50 truncate" title={device.description}>
                                        {device.description}
                                    </div>
                                )}
                            </div>
                            <div className="list-col-wrap text-sm w-full gap-2">
                                <div className="badge badge-soft badge-ghost cursor-default me-2">
                                    {t("group_members")}: {group.members.length}
                                </div>
                                <div className="badge badge-soft badge-ghost cursor-default me-2">
                                    {t("group_scenes")}: {group.scenes.length}
                                </div>
                            </div>
                        </li>
                        <li className="flex flex-row flex-wrap gap-1 m-4 justify-around items-center">
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
                        </li>
                    </ul>
                ))}
            </div>
        </>
    );
}
