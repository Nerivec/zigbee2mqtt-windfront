import { type ChangeEvent, type JSX, memo, type SelectHTMLAttributes, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { AppState } from "../../store.js";
import type { Device, Group } from "../../types.js";
import SelectField from "../form-fields/SelectField.js";

interface DevicePickerProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
    devices: AppState["devices"][number];
    value: string | number;
    label?: string;
    groups?: Group[];
    onChange(device?: Device | Group): void;
}

const DevicePicker = memo(({ devices, value, label, onChange, groups = [], ...rest }: DevicePickerProps) => {
    const { t } = useTranslation("common");
    const [selectedName, setSelectedName] = useState<string>("");

    useEffect(() => {
        if (typeof value === "string") {
            const device = devices.find((device) => device.ieee_address === value);

            setSelectedName(device?.friendly_name ?? "");
        } else {
            const group = groups.find((g) => value === g.id);

            setSelectedName(group?.friendly_name ?? "");
        }
    }, [value, devices, groups]);

    const onSelectHandler = (e: ChangeEvent<HTMLSelectElement>): void => {
        const { value: selectedValue } = e.target;

        if (selectedValue.startsWith("0x") /* ieee */) {
            onChange(devices.find((device) => device.ieee_address === selectedValue));
        } else {
            const selectedId = Number.parseInt(selectedValue, 10);

            onChange(groups.find((g) => selectedId === g.id));
        }
    };

    const options = useMemo(() => {
        const options: JSX.Element[] = [];
        const devicesOptions = devices.map((device) => (
            <option title={device.definition?.description} key={device.ieee_address} value={device.ieee_address}>
                {device.friendly_name} {device.definition?.model ? `(${device.definition?.model})` : ""}
            </option>
        ));

        if (groups?.length) {
            const groupOptions = groups.map((group) => (
                <option key={group.id} value={group.id}>
                    {group.friendly_name}
                </option>
            ));

            options.push(
                <optgroup key="Groups" label={t(($) => $.groups)}>
                    {groupOptions}
                </optgroup>,
            );
            options.push(
                <optgroup key="Devices" label={t(($) => $.devices)}>
                    {devicesOptions}
                </optgroup>,
            );
        } else {
            options.push(...devicesOptions);
        }

        return options;
    }, [devices, groups, t]);

    return (
        <SelectField
            name="device_picker"
            label={label}
            value={value}
            title={selectedName}
            onChange={onSelectHandler}
            className="select validator w-64"
            {...rest}
        >
            <option value="" disabled>
                {t(($) => $.select_device)}
            </option>
            {options}
        </SelectField>
    );
});

export default DevicePicker;
