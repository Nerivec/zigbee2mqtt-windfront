import { memo, useCallback, useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../hooks/useApp.js";
import type { Device, Group } from "../../types.js";
import { getEndpoints } from "../../utils.js";
import { WebSocketApiRouterContext } from "../../WebSocketApiRouterContext.js";
import Button from "../Button.js";
import DevicePicker from "../pickers/DevicePicker.js";
import EndpointPicker from "../pickers/EndpointPicker.js";

interface AddDeviceToGroupProps {
    group: Group;
}

const AddDeviceToGroup = memo((props: AddDeviceToGroupProps) => {
    const [endpoint, setEndpoint] = useState<string | number>("");
    const [deviceIeee, setDeviceIeee] = useState<string>("");
    const { group } = props;
    const devices = useAppSelector((state) => state.devices);
    const endpoints = useMemo(() => getEndpoints(devices.find((device) => device.ieee_address === deviceIeee)), [deviceIeee, devices]);
    const { t } = useTranslation(["groups", "zigbee"]);
    const { sendMessage } = useContext(WebSocketApiRouterContext);

    const onDeviceChange = useCallback((selectedDevice: Device): void => {
        setDeviceIeee(selectedDevice.ieee_address);

        const deviceEndpoints = getEndpoints(selectedDevice);

        setEndpoint(deviceEndpoints.values().next().value);
    }, []);

    return (
        <>
            <h2 className="text-lg font-semibold">{t("add_to_group_header")}</h2>
            <div className="mb-3">
                <DevicePicker label={t("zigbee:device")} value={deviceIeee} devices={devices} onChange={onDeviceChange} />
                <EndpointPicker label={t("zigbee:endpoint")} values={endpoints} value={endpoint} onChange={(e) => setEndpoint(e)} />
            </div>
            <Button<void>
                onClick={async () =>
                    await sendMessage("bridge/request/group/members/add", { group: group.id.toString(), endpoint, device: deviceIeee })
                }
                className="btn btn-primary"
            >
                {t("add_to_group")}
            </Button>
        </>
    );
});

export default AddDeviceToGroup;
