import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import Select, { type SingleValue } from "react-select";
import { useShallow } from "zustand/react/shallow";
import { REACT_SELECT_DEFAULT_CLASSNAMES } from "../../consts.js";
import { useAppStore } from "../../store.js";
import type { AttributeDefinition, BaseSelectOption, Device } from "../../types.js";
import { getClusterAttributes } from "../reporting/index.js";

interface AttributePickerProps {
    sourceIdx: number;
    cluster: string;
    device: Device;
    value: string | number;
    label?: string;
    required?: boolean;
    disabled?: boolean;
    onChange: (attr: string, definition: AttributeDefinition) => void;
}

const AttributePicker = memo(({ sourceIdx, cluster, device, onChange, value, label, required, disabled }: AttributePickerProps) => {
    const bridgeDefinitions = useAppStore(useShallow((state) => state.bridgeDefinitions[sourceIdx]));
    const { t } = useTranslation("zigbee");

    // retrieve cluster attributes, priority to device custom if any, then ZH
    const clusterAttributes = useMemo(
        () => getClusterAttributes(bridgeDefinitions, device.ieee_address, cluster),
        [bridgeDefinitions, device.ieee_address, cluster],
    );

    const options = useMemo(() => {
        const attrs: BaseSelectOption[] = [];

        for (const key in clusterAttributes) {
            attrs.push({ value: key, label: key });
        }

        return attrs;
    }, [clusterAttributes]);

    const selected = useMemo<SingleValue<BaseSelectOption>>(
        () => (value == null || value === "" ? null : (options.find((o) => o.value === value) ?? null)),
        [value, options],
    );

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
                placeholder={t(($) => $.select_attribute)}
                aria-label={label ?? t(($) => $.select_attribute)}
                options={options}
                value={selected}
                isSearchable
                isDisabled={disabled}
                onChange={(option) => {
                    if (option != null) {
                        onChange(option.value, clusterAttributes[option.value]);
                    }
                }}
                className="min-w-64"
                classNames={REACT_SELECT_DEFAULT_CLASSNAMES}
            />
        </fieldset>
    );
});

export default AttributePicker;
