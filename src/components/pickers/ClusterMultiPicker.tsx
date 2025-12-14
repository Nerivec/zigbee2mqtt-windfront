import { type DetailedHTMLProps, type InputHTMLAttributes, memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import Select, { type MultiValue } from "react-select";
import { REACT_SELECT_DEFAULT_CLASSNAMES } from "../../consts.js";
import type { BaseSelectOption } from "../../types.js";

export interface ClusterMultiPickerProps extends Omit<DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, "onChange"> {
    label?: string;
    clusters: Set<string>;
    value: string[];
    required?: boolean;
    disabled?: boolean;
    onChange(clusters: string[]): void;
}

const ClusterMultiPicker = memo(({ clusters, onChange, label, value, disabled, required }: ClusterMultiPickerProps) => {
    const { t } = useTranslation("zigbee");

    const options = useMemo((): BaseSelectOption[] => {
        const options: BaseSelectOption[] = [];

        for (const cluster of clusters) {
            options.push({ label: cluster, value: cluster });
        }

        options.sort((elA, elB) => elA.label.localeCompare(elB.label));

        return options;
    }, [clusters]);

    const selected = useMemo<MultiValue<BaseSelectOption>>(
        () => (value == null ? [] : options.filter((o) => value.includes(o.value))),
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
                placeholder={t(($) => $.select_cluster)}
                aria-label={label ?? t(($) => $.select_cluster)}
                options={options}
                value={selected}
                isMulti
                hideSelectedOptions
                isSearchable
                isDisabled={disabled}
                onChange={(option) => {
                    onChange(option.map((o) => o.value));
                }}
                className="min-w-64"
                classNames={REACT_SELECT_DEFAULT_CLASSNAMES}
            />
        </fieldset>
    );
});

export default ClusterMultiPicker;
