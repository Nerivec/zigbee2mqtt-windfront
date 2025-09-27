import { VirtuosoMasonry } from "@virtuoso.dev/masonry";
import { useCallback, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useColumnCount } from "../../../hooks/useColumnCount.js";
import { useAppStore } from "../../../store.js";
import type { Device, Group } from "../../../types.js";
import { sendMessage } from "../../../websocket/WebSocketManager.js";
import GroupCard, { type GroupCardProps } from "../../group/GroupCard.js";
import AddToGroup from "../AddToGroup.js";

type GroupsProps = {
    sourceIdx: number;
    device: Device;
};

export default function Groups({ sourceIdx, device }: GroupsProps) {
    const groups = useAppStore(useShallow((state) => state.groups[sourceIdx]));
    const columnCount = useColumnCount();

    const removeFromGroup = useCallback(
        async ([group, endpoint]: [Group, number]): Promise<void> =>
            await sendMessage(sourceIdx, "bridge/request/group/members/remove", {
                device: device.ieee_address,
                endpoint: endpoint,
                group: group.id.toString(),
            }),
        [sourceIdx, device.ieee_address],
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
            <div className="flex flex-row flex-wrap gap-4 mb-3 w-full">
                <div className="card card-border bg-base-200 border-base-300 rounded-box shadow-md flex-1">
                    <div className="card-body p-4">
                        <AddToGroup sourceIdx={sourceIdx} device={device} nonMemberGroups={nonMemberGroups} />
                    </div>
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
