import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import Select, { type SingleValue } from "react-select";
import { REACT_SELECT_DEFAULT_CLASSNAMES } from "../../consts.js";
import type { BaseGroupedOption, BaseSelectOption } from "../../types.js";
import type { ClusterGroup } from "./index.js";

export interface ClusterSinglePickerProps {
    clusters: Set<string> | ClusterGroup[];
    value: string;
    label?: string;
    required?: boolean;
    disabled?: boolean;
    onChange(cluster: string): void;
}

const ClusterSinglePicker = memo(({ clusters, onChange, value, label, disabled, required }: ClusterSinglePickerProps) => {
    const { t } = useTranslation(["zigbee", "common"]);

    const [options, allOptions] = useMemo(() => {
        const options: BaseGroupedOption[] = [];
        const allOptions: BaseSelectOption[] = [];

        if (Array.isArray(clusters)) {
            for (const group of clusters) {
                const groupOptions: BaseSelectOption[] = [];

                for (const cluster of group.clusters) {
                    const entry = { value: cluster, label: cluster };
                    groupOptions.push(entry);
                    allOptions.push(entry);
                }

                groupOptions.sort((elA, elB) => elA.label!.localeCompare(elB.label!));
                options.push({ label: t(($) => $[group.name]), options: groupOptions });
            }
        } else {
            const groupOptions: BaseSelectOption[] = [];

            for (const cluster of clusters) {
                const entry = { value: cluster, label: cluster };
                groupOptions.push(entry);
                allOptions.push(entry);
            }

            groupOptions.sort((elA, elB) => elA.label!.localeCompare(elB.label!));
            options.push({ label: t(($) => $.cluster), options: groupOptions });
        }

        return [options, allOptions];
    }, [clusters, t]);

    const selected = useMemo<SingleValue<BaseSelectOption>>(
        () => (value == null || value === "" ? null : (allOptions.find((o) => o.value === value) ?? null)),
        [value, allOptions],
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
                isSearchable
                isDisabled={disabled}
                onChange={(option) => {
                    if (option != null) {
                        onChange(option.value);
                    }
                }}
                className="min-w-64"
                classNames={REACT_SELECT_DEFAULT_CLASSNAMES}
            />
        </fieldset>
    );
});

export default ClusterSinglePicker;
