import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import Select, { type MultiValue } from "react-select";
import { REACT_SELECT_DEFAULT_CLASSNAMES } from "../../consts.js";
import type { AppState } from "../../store.js";
import type { BaseGroupedOption, BaseSelectOption, Device, Group } from "../../types.js";

export interface DeviceMultiPickerProps {
    devices: AppState["devices"][number];
    value: (string | number)[];
    label?: string;
    detail?: string;
    required?: boolean;
    disabled?: boolean;
    groups?: Group[];
    onChange(devices: (Device | Group)[]): void;
}

const DeviceMultiPicker = memo(({ devices, value, label, detail, required, disabled, onChange, groups = [] }: DeviceMultiPickerProps) => {
    const { t } = useTranslation("common");

    const [options, allOptions] = useMemo(() => {
        const options: BaseGroupedOption[] = [];
        const allOptions: BaseSelectOption[] = [];
        const devicesOptions: BaseSelectOption[] = devices
            .map((device) => ({
                value: device.ieee_address,
                label: `${device.friendly_name} ${device.definition?.model ? `(${device.definition?.model})` : ""}`,
            }))
            .sort((elA, elB) => elA.label.localeCompare(elB.label));

        for (const option of devicesOptions) {
            allOptions.push(option);
        }

        if (groups?.length) {
            const groupOptions: BaseSelectOption[] = groups
                .map((group) => ({ value: `${group.id}`, label: group.friendly_name }))
                .sort((elA, elB) => elA.label.localeCompare(elB.label));

            for (const option of groupOptions) {
                allOptions.push(option);
            }

            options.push({ label: t(($) => $.devices), options: devicesOptions });
            options.push({ label: t(($) => $.groups), options: groupOptions });
        } else {
            options.push({ label: t(($) => $.devices), options: devicesOptions });
        }

        return [options, allOptions];
    }, [devices, groups, t]);

    const selected = useMemo<MultiValue<BaseSelectOption>>(
        () => (value == null ? [] : allOptions.filter((o) => value.some((v) => o.value === (typeof v === "number" ? `${v}` : v)))),
        [value, allOptions],
    );

    const onSelectHandler = (option: MultiValue<BaseSelectOption>): void => {
        const selected = option
            .map((o) => {
                if (o.value.startsWith("0x")) {
                    return devices.find((device) => device.ieee_address === o.value);
                }

                const selectedId = Number.parseInt(o.value, 10);

                return groups.find((g) => selectedId === g.id);
            })
            .filter((d): d is Device | Group => d != null);

        onChange(selected);
    };

    return (
        <fieldset className="fieldset">
            {label && (
                <legend className="fieldset-legend">
                    {label}
                    {required ? " *" : ""}
                </legend>
            )}
            <Select<BaseSelectOption, true>
                unstyled
                placeholder={t(($) => $.select_device)}
                aria-label={label ?? t(($) => $.select_device)}
                options={options}
                value={selected}
                isMulti
                hideSelectedOptions
                isSearchable
                isDisabled={disabled}
                onChange={onSelectHandler}
                className="min-w-64"
                classNames={REACT_SELECT_DEFAULT_CLASSNAMES}
            />
            {detail && <span className="label">{detail}</span>}
        </fieldset>
    );
});

export default DeviceMultiPicker;
