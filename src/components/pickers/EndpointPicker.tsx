import { type JSX, memo, type SelectHTMLAttributes, useMemo } from "react";
import { useTranslation } from "react-i18next";
import SelectField from "../form-fields/SelectField.js";

interface EndpointPickerProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
    onChange(endpoint: string | number): void;
    value?: string | number;
    label?: string;
    values: Set<string | number>;
}

const EndpointPicker = memo((props: EndpointPickerProps) => {
    const { value, values, disabled, onChange, label, ...rest } = props;
    const { t } = useTranslation("common");
    const hasOnlyOneEP = values.size === 1;

    const options = useMemo(() => {
        const options: JSX.Element[] = [];

        for (const value of values) {
            options.push(
                <option key={value} value={value}>
                    {value}
                </option>,
            );
        }

        return options;
    }, [values]);

    return (
        <SelectField
            name="endpoint_picker"
            label={label}
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            title={hasOnlyOneEP ? t("the_only_endpoint") : ""}
            disabled={(value && hasOnlyOneEP) || disabled}
            className="select validator max-w-32"
            {...rest}
        >
            <option value="" disabled>
                {t("select_endpoint")}
            </option>
            {options}
        </SelectField>
    );
});

export default EndpointPicker;
