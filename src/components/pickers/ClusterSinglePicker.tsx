import { type JSX, memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import SelectField, { type SelectFieldProps } from "../form-fields/SelectField.js";
import type { ClusterGroup } from "./index.js";

export interface ClusterSinglePickerProps extends Omit<SelectFieldProps, "onChange" | "name"> {
    clusters: Set<string> | ClusterGroup[];
    value: string;
    onChange(cluster: string): void;
}

const ClusterSinglePicker = memo((props: ClusterSinglePickerProps) => {
    const { clusters, onChange, value, label, disabled, ...rest } = props;
    const { t } = useTranslation(["zigbee", "common"]);

    const options = useMemo(() => {
        const options: JSX.Element[] = [];

        if (Array.isArray(clusters)) {
            for (const group of clusters) {
                const groupOptions: JSX.Element[] = [];

                for (const cluster of group.clusters) {
                    groupOptions.push(
                        <option key={cluster} value={cluster}>
                            {cluster}
                        </option>,
                    );
                }

                options.push(
                    <optgroup key={group.name} label={t(group.name)}>
                        {groupOptions}
                    </optgroup>,
                );
            }
        } else {
            for (const cluster of clusters) {
                options.push(
                    <option key={cluster} value={cluster}>
                        {cluster}
                    </option>,
                );
            }
        }

        return options;
    }, [clusters, t]);

    return (
        <SelectField
            name="attribute_picker"
            label={label}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="select validator max-w-48"
            {...rest}
        >
            <option value="" disabled>
                {t("select_cluster")}
            </option>
            {options}
        </SelectField>
    );
});

export default ClusterSinglePicker;
