import { type JSX, memo, useCallback, useContext, useMemo } from "react";
import { WebSocketApiRouterContext } from "../../WebSocketApiRouterContext.js";
import { useAppSelector } from "../../hooks/useApp.js";
import type { Group } from "../../types.js";
import GroupMember from "./GroupMember.js";

interface GroupMembersProps {
    group: Group;
}

const GroupMembers = memo((props: GroupMembersProps) => {
    const { group } = props;
    const devices = useAppSelector((state) => state.devices);
    const deviceStates = useAppSelector((state) => state.deviceStates);
    const lastSeenConfig = useAppSelector((state) => state.bridgeInfo.config.advanced.last_seen);
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const removeMember = useCallback(
        async (deviceIeee: string, endpoint: number): Promise<void> =>
            await sendMessage("bridge/request/group/members/remove", { device: deviceIeee, endpoint, group: group.id.toString() }),
        [sendMessage, group.id],
    );
    const setDeviceState = useCallback(
        async (ieee: string, value: Record<string, unknown>): Promise<void> => {
            await sendMessage<"{friendlyNameOrId}/set">(
                // @ts-expect-error templated API endpoint
                `${ieee}/set`,
                value,
            );
        },
        [sendMessage],
    );
    const getDeviceState = useCallback(
        async (ieee: string, value: Record<string, unknown>): Promise<void> => {
            await sendMessage<"{friendlyNameOrId}/get">(
                // @ts-expect-error templated API endpoint
                `${ieee}/get`,
                value,
            );
        },
        [sendMessage],
    );
    const groupMembers = useMemo(() => {
        const members: JSX.Element[] = [];

        for (const member of group.members) {
            const device = devices.find((device) => device.ieee_address === member.ieee_address);

            if (device) {
                members.push(
                    <ul className="flex-auto basis-sm list bg-base-200 rounded-box shadow-md" key={`${member.ieee_address}-${member.endpoint}`}>
                        <GroupMember
                            removeDeviceFromGroup={removeMember}
                            device={device}
                            groupMember={member}
                            deviceState={deviceStates[device.friendly_name] ?? {}}
                            lastSeenConfig={lastSeenConfig}
                            setDeviceState={setDeviceState}
                            getDeviceState={getDeviceState}
                        />
                    </ul>,
                );
            }
        }

        return members;
    }, [group, devices, lastSeenConfig, deviceStates, removeMember, setDeviceState, getDeviceState]);

    return <div className="flex flex-row flex-wrap justify-between items-stretch gap-3">{groupMembers}</div>;
});

export default GroupMembers;
