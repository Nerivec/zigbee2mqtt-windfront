import { memo, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Zigbee2MQTTGroup } from "zigbee2mqtt";
import type { Device, Group } from "../../types.js";
import { getEndpoints } from "../../utils.js";
import { sendMessage } from "../../websocket/WebSocketManager.js";
import Button from "../Button.js";
import EndpointPicker from "../pickers/EndpointPicker.js";
import GroupPicker from "../pickers/GroupPicker.js";

interface AddToGroupProps {
    sourceIdx: number;
    device: Device;

    nonMemberGroups: Zigbee2MQTTGroup[];
}

const AddToGroup = memo(({ sourceIdx, device, nonMemberGroups }: AddToGroupProps) => {
    const { t } = useTranslation(["groups", "zigbee"]);
    const [endpoint, setEndpoint] = useState<string | number>("");
    const [groupId, setGroupId] = useState<string | number>("");

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
        [sourceIdx, groupId, device.ieee_address, endpoint],
    );

    return (
        <>
            <h2 className="text-lg font-semibold">{t(($) => $.add_to_group)}</h2>
            <div className="mb-3">
                <GroupPicker label={t(($) => $.group, { ns: "zigbee" })} value={groupId} groups={nonMemberGroups} onChange={onGroupChange} required />
                <EndpointPicker
                    label={t(($) => $.endpoint, { ns: "zigbee" })}
                    values={endpoints}
                    value={endpoint}
                    onChange={(e) => setEndpoint(e)}
                    required
                />
            </div>
            <Button<void>
                onClick={addToGroup}
                className="btn btn-primary"
                disabled={endpoint == null || groupId == null || endpoint === "" || groupId === ""}
            >
                {t(($) => $.add_to_group)}
            </Button>
        </>
    );
});

export default AddToGroup;
