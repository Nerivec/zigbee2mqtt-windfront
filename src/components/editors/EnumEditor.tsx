import { type ChangeEvent, memo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import Button from "../Button.js";
import DisplayValue from "../value-decorators/DisplayValue.js";

export type ValueWithLabel = {
    value: number;
    name: string;
    description?: string;
};

export type ValueWithLabelOrPrimitive = ValueWithLabel | number | string;

type EnumProps = {
    value?: ValueWithLabelOrPrimitive;
    onChange(value: unknown): void;
    values: ValueWithLabelOrPrimitive[];
    minimal?: boolean;
};

function isPrimitive(step?: ValueWithLabelOrPrimitive | null): step is number | string {
    return typeof step !== "object";
}

const EnumEditor = memo((props: EnumProps) => {
    const { onChange, values, value, minimal } = props;
    const { t } = useTranslation("common");
    const primitiveValue = isPrimitive(value);

    const onSelectChange = useCallback(
        (e: ChangeEvent<HTMLSelectElement>) => {
            const selectedValue = values.find((v) => (isPrimitive(v) ? v === e.target.value : v.value === Number.parseInt(e.target.value, 10)));

            onChange(selectedValue);
        },
        [values, onChange],
    );

    return minimal ? (
        <select className="select" onChange={onSelectChange} value={(primitiveValue ? value : value?.value) ?? ""}>
            <option value="" disabled>
                {t("select_value")}
            </option>
            {values.map((v) => {
                const primitive = isPrimitive(v);

                return (
                    <option key={primitive ? v : v.name} value={primitive ? v : v.value}>
                        {primitive ? v : v.name}
                    </option>
                );
            })}
        </select>
    ) : (
        <div className="flex flex-row flex-wrap gap-1">
            {values.map((v) => {
                const primitive = isPrimitive(v);
                const current = primitive ? v === value : v.value === (primitiveValue ? value : value?.value);

                return (
                    <Button<ValueWithLabelOrPrimitive>
                        key={primitive ? v : v.name}
                        className={`btn btn-soft btn-sm join-item${current ? " btn-active" : ""}`}
                        onClick={(item) => onChange(item)}
                        item={primitive ? v : v.value}
                        title={primitive ? `${v}` : v.description}
                    >
                        {primitive ? <DisplayValue value={v} name="" /> : v.name}
                    </Button>
                );
            })}
        </div>
    );
});

export default EnumEditor;
