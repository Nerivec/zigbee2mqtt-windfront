import { type JSX, memo, useCallback, useContext, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "../../store.js";
import type { Device, Group } from "../../types.js";
import { WebSocketApiRouterContext } from "../../WebSocketApiRouterContext.js";
import GroupMember from "./GroupMember.js";

interface GroupMembersProps {
    sourceIdx: number;
    devices: Device[];
    group: Group;
}

const GroupMembers = memo(({ sourceIdx, devices, group }: GroupMembersProps) => {
    const deviceStates = useAppStore(useShallow((state) => state.deviceStates[sourceIdx]));
    const lastSeenConfig = useAppStore(useShallow((state) => state.bridgeInfo[sourceIdx].config.advanced.last_seen));
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const removeMember = useCallback(
        async (deviceIeee: string, endpoint: number): Promise<void> =>
            await sendMessage(sourceIdx, "bridge/request/group/members/remove", { device: deviceIeee, endpoint, group: group.id.toString() }),
        [sourceIdx, group.id, sendMessage],
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
        [sourceIdx, sendMessage],
    );
    const groupMembers = useMemo(() => {
        const members: JSX.Element[] = [];

        for (const member of group.members) {
            const device = devices.find((device) => device.ieee_address === member.ieee_address);

            if (device) {
                members.push(
                    <div className="w-[23rem] card bg-base-200 rounded-box shadow-md" key={`${member.ieee_address}-${member.endpoint}`}>
                        <GroupMember
                            sourceIdx={sourceIdx}
                            removeDeviceFromGroup={removeMember}
                            device={device}
                            groupMember={member}
                            deviceState={deviceStates[device.friendly_name] ?? {}}
                            lastSeenConfig={lastSeenConfig}
                            setDeviceState={setDeviceState}
                        />
                    </div>,
                );
            }
        }

        return members;
    }, [sourceIdx, group, devices, lastSeenConfig, deviceStates, removeMember, setDeviceState]);

    return <div className="flex flex-row flex-wrap justify-center gap-3">{groupMembers}</div>;
});

export default GroupMembers;
