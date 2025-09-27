import { memo, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Device, Group } from "../../types.js";
import { getEndpoints } from "../../utils.js";
import { sendMessage } from "../../websocket/WebSocketManager.js";
import Button from "../Button.js";
import DevicePicker from "../pickers/DevicePicker.js";
import EndpointPicker from "../pickers/EndpointPicker.js";

interface AddDeviceToGroupProps {
    sourceIdx: number;
    devices: Device[];
    group: Group;
}

const AddDeviceToGroup = memo(({ sourceIdx, devices, group }: AddDeviceToGroupProps) => {
    const [endpoint, setEndpoint] = useState<string | number>("");
    const [deviceIeee, setDeviceIeee] = useState<string>("");
    const endpoints = useMemo(() => getEndpoints(devices.find((device) => device.ieee_address === deviceIeee)), [deviceIeee, devices]);
    const { t } = useTranslation(["groups", "zigbee"]);

    const onDeviceChange = useCallback((selectedDevice: Device): void => {
        setDeviceIeee(selectedDevice.ieee_address);

        const deviceEndpoints = getEndpoints(selectedDevice);

        setEndpoint(deviceEndpoints.values().next().value);
    }, []);

    const onAddClick = useCallback(
        async () => await sendMessage(sourceIdx, "bridge/request/group/members/add", { group: group.id.toString(), endpoint, device: deviceIeee }),
        [sourceIdx, group.id, endpoint, deviceIeee],
    );

    return (
        <>
            <h2 className="text-lg font-semibold">{t(($) => $.add_to_group_header)}</h2>
            <div className="mb-3">
                <DevicePicker label={t(($) => $.device, { ns: "zigbee" })} value={deviceIeee} devices={devices} onChange={onDeviceChange} />
                <EndpointPicker
                    label={t(($) => $.endpoint, { ns: "zigbee" })}
                    values={endpoints}
                    value={endpoint}
                    onChange={(e) => setEndpoint(e)}
                    disabled={!deviceIeee}
                />
            </div>
            <Button<void> onClick={onAddClick} className="btn btn-primary" disabled={endpoint == null || endpoint === "" || !deviceIeee}>
                {t(($) => $.add_to_group)}
            </Button>
        </>
    );
});

export default AddDeviceToGroup;
