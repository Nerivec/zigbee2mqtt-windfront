import { type ChangeEvent, type JSX, memo, type SelectHTMLAttributes, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { AppState } from "../../store.js";
import type { Device, Group } from "../../types.js";
import SelectField from "../form-fields/SelectField.js";

interface DevicePickerProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange">, Pick<AppState, "devices"> {
    value: string | number;
    label?: string;
    groups?: Group[];
    onChange(device?: Device | Group): void;
}

const DevicePicker = memo((props: DevicePickerProps) => {
    const { t } = useTranslation("common");
    const { devices, value, label, onChange, groups = [], ...rest } = props;

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
                <optgroup key="Groups" label={t("groups")}>
                    {groupOptions}
                </optgroup>,
            );
            options.push(
                <optgroup key="Devices" label={t("devices")}>
                    {devicesOptions}
                </optgroup>,
            );
        } else {
            options.push(...devicesOptions);
        }

        return options;
    }, [devices, groups, t]);

    return (
        <SelectField name="device_picker" label={label} value={value} onChange={onSelectHandler} {...rest}>
            <option value="" disabled>
                {t("select_device")}
            </option>
            {options}
        </SelectField>
    );
});

export default DevicePicker;
