import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import Select, { type SingleValue } from "react-select";
import { REACT_SELECT_DEFAULT_CLASSNAMES } from "../../consts.js";
import type { AppState } from "../../store.js";
import type { BaseGroupedOption, BaseSelectOption, Device, Group } from "../../types.js";

interface DevicePickerProps {
    devices: AppState["devices"][number];
    value: string | number;
    label?: string;
    detail?: string;
    required?: boolean;
    disabled?: boolean;
    groups?: Group[];
    onChange(device?: Device | Group): void;
}

const DevicePicker = memo(({ devices, value, label, detail, required, disabled, onChange, groups = [] }: DevicePickerProps) => {
    const { t } = useTranslation("common");

    const onSelectHandler = (option: SingleValue<BaseSelectOption>): void => {
        if (option) {
            if (option.value.startsWith("0x") /* ieee */) {
                onChange(devices.find((device) => device.ieee_address === option.value));
            } else {
                const selectedId = Number.parseInt(option.value, 10);

                onChange(groups.find((g) => selectedId === g.id));
            }
        }
    };

    const options = useMemo(() => {
        // should always be: [0] devices, [1] groups
        const options: BaseGroupedOption[] = [];
        const devicesOptions: BaseSelectOption[] = devices
            .map((device) => ({
                value: device.ieee_address,
                label: `${device.friendly_name} ${device.definition?.model ? `(${device.definition?.model})` : ""}`,
            }))
            .sort((elA, elB) => elA.label.localeCompare(elB.label));

        if (groups?.length) {
            const groupOptions: BaseSelectOption[] = groups
                .map((group) => ({ value: `${group.id}`, label: group.friendly_name }))
                .sort((elA, elB) => elA.label.localeCompare(elB.label));

            options.push({ label: t(($) => $.devices), options: devicesOptions });
            options.push({ label: t(($) => $.groups), options: groupOptions });
        } else {
            options.push({ label: t(($) => $.devices), options: devicesOptions });
        }

        return options;
    }, [devices, groups, t]);

    const selected = useMemo<SingleValue<BaseSelectOption>>(() => {
        if (value == null || value === "") {
            return null;
        }

        if (typeof value === "number") {
            return options[1]?.options.find((o) => o.value === `${value}`) ?? null;
        }

        return options[0]?.options.find((o) => o.value === value) ?? null;
    }, [value, options]);

    return (
        <fieldset className="fieldset">
            {label && (
                <legend className="fieldset-legend">
                    {label}
                    {required ? " *" : ""}
                </legend>
            )}
            <Select
                unstyled
                placeholder={t(($) => $.select_device)}
                aria-label={label ?? t(($) => $.select_device)}
                options={options}
                value={selected}
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

export default DevicePicker;
