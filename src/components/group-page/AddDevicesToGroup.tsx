import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { memo, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Device, Group } from "../../types.js";
import { getEndpoints, isDevice } from "../../utils.js";
import { sendMessage } from "../../websocket/WebSocketManager.js";
import Button from "../Button.js";
import DevicePicker from "../pickers/DevicePicker.js";
import EndpointPicker from "../pickers/EndpointPicker.js";

interface AddDevicesToGroupProps {
    sourceIdx: number;
    devices: Device[];
    group: Group;
}

interface SelectedItem {
    device: Device;
    endpoint: string | number;
}

const AddDevicesToGroup = memo(({ sourceIdx, devices: allDevices, group }: AddDevicesToGroupProps) => {
    const [devicePickerValue, setDevicePickerValue] = useState<Device['ieee_address']>("");
    const [selectedDevices, setSelectedDevices] = useState<SelectedItem[]>([]);

    const { t } = useTranslation(["groups", "zigbee", "common"]);

    const availableDevices = useMemo(() => {
        return allDevices.filter(
            ({ieee_address}) => {
                const isAlreadySelected = selectedDevices.some(({device}) => device.ieee_address === ieee_address);
                const isAlreadyMember = group.members.some((member) => member.ieee_address === ieee_address);
                
                return !isAlreadySelected && !isAlreadyMember;
            }
        );
    }, [allDevices, selectedDevices, group.members]);

    const onDevicePick = useCallback((selected: Device): void => {
        const deviceEndpoints = getEndpoints(selected);
        const firstEndpoint = deviceEndpoints.values().next().value ?? "";

        setSelectedDevices((prev) => [...prev, {device: selected, endpoint: firstEndpoint}]);
        setDevicePickerValue("");
    }, []);

    const onRemoveDeviceFromList = useCallback((device: Device): void => {
        setSelectedDevices((prev) => prev.filter(({device: {ieee_address}}) => device.ieee_address !== ieee_address));
    }, []);

    const onDeviceEndpointChange = useCallback((device: Device, endpoint: string | number): void => {
        setSelectedDevices((prev) => {
            return prev.map((item) => {
                if (item.device.ieee_address === device.ieee_address) {
                    return {...item, endpoint: endpoint};
                }
                return item;
            })
        });
    }, []);

    const onAddDevicesToGroupClick = useCallback(async () => {
        await Promise.all(selectedDevices.map(async ({device, endpoint}) => {
            if (endpoint === "") {
                return;
            }

            await sendMessage(sourceIdx, "bridge/request/group/members/add", {
                group: group.id.toString(),
                endpoint: endpoint,
                device: device.ieee_address,
            });
        }));

        setSelectedDevices([]);
        setDevicePickerValue("");
    }, [sourceIdx, group.id, selectedDevices]);

    const canAddDevicesToGroup =
        selectedDevices.length > 0 &&
        selectedDevices.every(({endpoint}) => !!endpoint);

    return (
        <>
            <h2 className="text-lg font-semibold">{t(($) => $.add_to_group_header)}</h2>
            <div className="mb-3 flex flex-col gap-3 grow">
                <DevicePicker
                    value={devicePickerValue}
                    devices={availableDevices}
                    onChange={onDevicePick}
                />

                {selectedDevices.length > 0 && (
                    <fieldset className="fieldset gap-2">
                        <div className="grid grid-cols-[minmax(0,1fr)_8rem_2.5rem] gap-x-2 gap-y-2 items-center">
                            <span className="text-sm font-medium">{t(($) => $.device, { ns: "zigbee" })}</span>
                            <span className="text-sm font-medium">{t(($) => $.endpoint, { ns: "zigbee" })}</span>
                            <span></span>
                            
                            {selectedDevices.map(({device, endpoint}) => {

                                return (
                                    <div key={device.ieee_address} className="contents">
                                        <div className="min-w-0 truncate text-sm flex flex-col" title={device.friendly_name}>
                                            <span>{device.friendly_name}</span>
                                            <span className="text-xs opacity-50 italic">{device.definition?.model}</span>
                                        </div>

                                        <EndpointPicker
                                            values={getEndpoints(device)}
                                            value={endpoint}
                                            onChange={(ep) => onDeviceEndpointChange(device, ep)}
                                        />
                                        
                                        <div className="flex justify-end">
                                            <Button<void>
                                                type="button"
                                                className="btn btn-square btn-outline btn-error btn-sm"
                                                title={t(($) => $.remove, { ns: "common" })}
                                                onClick={() => onRemoveDeviceFromList(device)}
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </fieldset>
                )}
            </div>
            
            <Button<void> onClick={onAddDevicesToGroupClick} className="btn btn-primary" disabled={!canAddDevicesToGroup}>
                {t(($) => $.add_to_group)}
            </Button>
        </>
    );
});

export default AddDevicesToGroup;
