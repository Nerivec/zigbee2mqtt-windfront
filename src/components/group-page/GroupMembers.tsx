import { VirtuosoMasonry } from "@virtuoso.dev/masonry";
import { memo, useCallback, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useColumnCount } from "../../hooks/useColumnCount.js";
import { useAppStore } from "../../store.js";
import type { Device, Group } from "../../types.js";
import { sendMessage } from "../../websocket/WebSocketManager.js";
import GroupMember, { type GroupMemberProps } from "./GroupMember.js";

interface GroupMembersProps {
    sourceIdx: number;
    devices: Device[];
    group: Group;
}

const GroupMembers = memo(({ sourceIdx, devices, group }: GroupMembersProps) => {
    const deviceStates = useAppStore(useShallow((state) => state.deviceStates[sourceIdx]));
    const lastSeenConfig = useAppStore(useShallow((state) => state.bridgeInfo[sourceIdx].config.advanced.last_seen));
    const columnCount = useColumnCount();

    const removeDeviceFromGroup = useCallback(
        async (deviceIeee: string, endpoint: number): Promise<void> =>
            await sendMessage(sourceIdx, "bridge/request/group/members/remove", { device: deviceIeee, endpoint, group: group.id.toString() }),
        [sourceIdx, group.id],
    );

    const setDeviceState = useCallback(
        async (ieee: string, value: Record<string, unknown>): Promise<void> => {
            await sendMessage<"{friendlyNameOrId}/set">(
                sourceIdx,
                // @ts-expect-error templated API endpoint
                `${ieee}/set`,
                value,
            );
        },
        [sourceIdx],
    );

    const filteredData = useMemo(() => {
        const elements: GroupMemberProps["data"][] = [];

        for (const groupMember of group.members) {
            const device = devices.find((device) => device.ieee_address === groupMember.ieee_address);

            if (device) {
                elements.push({
                    sourceIdx,
                    groupMember,
                    device,
                    deviceState: deviceStates[device.friendly_name] ?? {},
                    lastSeenConfig,
                    removeDeviceFromGroup,
                    setDeviceState,
                });
            }
        }

        elements.sort((elA, elB) => elA.device.ieee_address.localeCompare(elB.device.ieee_address));

        return elements;
    }, [sourceIdx, group, devices, lastSeenConfig, deviceStates, removeDeviceFromGroup, setDeviceState]);

    return (
        <div>
            <VirtuosoMasonry
                key={`groupmembers-${filteredData.length}`}
                useWindowScroll={true}
                columnCount={columnCount}
                data={filteredData}
                ItemContent={GroupMember}
                className="gap-3"
            />
        </div>
    );
});

export default GroupMembers;
