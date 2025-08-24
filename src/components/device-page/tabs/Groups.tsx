import { VirtuosoMasonry } from "@virtuoso.dev/masonry";
import { useCallback, useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";
import { useColumnCount } from "../../../hooks/useColumnCount.js";
import { useAppStore } from "../../../store.js";
import type { Device, Group } from "../../../types.js";
import { getEndpoints } from "../../../utils.js";
import { WebSocketApiRouterContext } from "../../../WebSocketApiRouterContext.js";
import Button from "../../Button.js";
import GroupCard, { type GroupCardProps } from "../../group/GroupCard.js";
import EndpointPicker from "../../pickers/EndpointPicker.js";
import GroupPicker from "../../pickers/GroupPicker.js";

type GroupsProps = {
    sourceIdx: number;
    device: Device;
};

export default function Groups({ sourceIdx, device }: GroupsProps) {
    const { t } = useTranslation(["groups", "zigbee", "common"]);
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const groups = useAppStore(useShallow((state) => state.groups[sourceIdx]));
    const [endpoint, setEndpoint] = useState<string | number>("");
    const [groupId, setGroupId] = useState<string | number>("");
    const columnCount = useColumnCount();

    const endpoints = useMemo(() => getEndpoints(device), [device]);

    const onGroupChange = useCallback(
        (selectedGroup: Group): void => {
            setGroupId(selectedGroup.id);
            setEndpoint(endpoints.values().next().value);
        },
        [endpoints],
    );

    const addToGroup = useCallback(
        async () =>
            await sendMessage(sourceIdx, "bridge/request/group/members/add", {
                group: groupId.toString(),
                endpoint,
                device: device.ieee_address,
            }),
        [sourceIdx, groupId, device.ieee_address, endpoint, sendMessage],
    );

    const removeFromGroup = useCallback(
        async ([group, endpoint]: [Group, number]): Promise<void> =>
            await sendMessage(sourceIdx, "bridge/request/group/members/remove", {
                device: device.ieee_address,
                endpoint: endpoint,
                group: group.id.toString(),
            }),
        [sourceIdx, device.ieee_address, sendMessage],
    );

    const [memberGroups, nonMemberGroups] = useMemo(() => {
        const inGroups: GroupCardProps["data"][] = [];
        const notInGroups: Group[] = [];

        for (const group of groups) {
            const groupMembers = group.members.filter((member) => member.ieee_address === device.ieee_address);

            if (groupMembers.length > 0) {
                for (const groupMember of groupMembers) {
                    inGroups.push({ sourceIdx, group, endpoint: groupMember.endpoint, removeFromGroup });
                }
            } else {
                notInGroups.push(group);
            }
        }

        return [inGroups, notInGroups];
    }, [sourceIdx, groups, device.ieee_address, removeFromGroup]);

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
            <div>
                <VirtuosoMasonry
                    key={`membergroups-${memberGroups.length}`}
                    useWindowScroll={true}
                    columnCount={columnCount}
                    data={memberGroups}
                    ItemContent={GroupCard}
                    className="gap-3"
                />
            </div>
        </>
    );
}
