import { type ChangeEvent, memo, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "../Button.js";
import DisplayValue from "../value-decorators/DisplayValue.js";
import { useEditorState } from "./useEditorState.js";

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
    /** When true, parent manages state machine (e.g., when used as sub-component in RangeEditor) */
    controlled?: boolean;
    /** When true, changes are batched (Apply button) - only show editing state */
    batched?: boolean;
};

function isPrimitive(step?: ValueWithLabelOrPrimitive | null): step is number | string {
    return typeof step !== "object";
}

function getValueForComparison(v: ValueWithLabelOrPrimitive | undefined): unknown {
    if (v === undefined) return undefined;
    return isPrimitive(v) ? v : v.value;
}

const EnumEditor = memo((props: EnumProps) => {
    const { onChange, values, value, minimal, controlled, batched } = props;
    const { t } = useTranslation("common");
    const primitiveValue = isPrimitive(value);
    const currentValueForComparison = getValueForComparison(value);

    // Local state for tracking the selected value
    const [selectedValue, setSelectedValue] = useState(currentValueForComparison);

    // Only use state machine when not controlled by parent
    const { sentValue, isConfirmed, isConflict, isTimedOut, isPending, isReading, submit, getButtonClass, getSelectClass } = useEditorState<unknown>({
        value: currentValueForComparison,
        currentValue: selectedValue,
        onChange,
        isEqual: (a, b) => a === b,
        batched,
    });

    // Sync selected value from device value when not pending
    useEffect(() => {
        if (!isPending && !isConflict && !isTimedOut && sentValue === null) {
            setSelectedValue(currentValueForComparison);
        }
    }, [currentValueForComparison, isPending, isConflict, isTimedOut, sentValue]);

    const handleChange = useCallback(
        (selectedItem: ValueWithLabelOrPrimitive) => {
            const newValue = isPrimitive(selectedItem) ? selectedItem : selectedItem.value;
            setSelectedValue(newValue);

            if (controlled) {
                // Parent manages state, just call onChange directly
                onChange(selectedItem);
            } else {
                // We manage state, use submit for tracking
                submit(newValue);
            }
        },
        [controlled, onChange, submit],
    );

    const onSelectChange = useCallback(
        (e: ChangeEvent<HTMLSelectElement>) => {
            const selectedItem = values.find((v) => (isPrimitive(v) ? v === e.target.value : v.value === Number.parseInt(e.target.value, 10)));
            if (selectedItem !== undefined) {
                handleChange(selectedItem);
            }
        },
        [values, handleChange],
    );

    const onButtonClick = useCallback(
        (item: ValueWithLabelOrPrimitive) => {
            handleChange(item);
        },
        [handleChange],
    );

    // When controlled, don't show our own feedback
    if (controlled) {
        return minimal ? (
            <select className="select" onChange={onSelectChange} value={(primitiveValue ? value : value?.value) ?? ""}>
                <option value="" disabled>
                    {t(($) => $.select_value)}
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
                            className={`btn btn-outline btn-primary btn-sm join-item${current ? " btn-active" : ""}`}
                            onClick={onButtonClick}
                            item={primitive ? v : v.value}
                            title={primitive ? `${v}` : v.description}
                        >
                            {primitive ? <DisplayValue value={v} name="" /> : v.name}
                        </Button>
                    );
                })}
            </div>
        );
    }

    // Standalone mode with full state machine
    return minimal ? (
        <div className="flex flex-row gap-3 items-center w-full">
            <div className="flex-1">
                <select
                    className={`select ${getSelectClass()} ${isPending || isReading ? "animate-pulse" : ""}`}
                    onChange={onSelectChange}
                    value={(primitiveValue ? value : value?.value) ?? ""}
                >
                    <option value="" disabled>
                        {t(($) => $.select_value)}
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
            </div>
            {isConfirmed && (
                <span className="text-success text-lg" title="Device confirmed value">
                    ✓
                </span>
            )}
        </div>
    ) : (
        <div className="flex flex-row gap-3 items-center w-full">
            <div className={`flex flex-row flex-wrap gap-1 flex-1 ${isPending || isReading ? "animate-pulse" : ""}`}>
                {values.map((v) => {
                    const primitive = isPrimitive(v);
                    const itemValue = primitive ? v : v.value;
                    const current = itemValue === selectedValue;
                    return (
                        <Button<ValueWithLabelOrPrimitive>
                            key={primitive ? v : v.name}
                            className={getButtonClass(current)}
                            onClick={onButtonClick}
                            item={primitive ? v : v.value}
                            title={primitive ? `${v}` : v.description}
                        >
                            {primitive ? <DisplayValue value={v} name="" /> : v.name}
                        </Button>
                    );
                })}
            </div>
            {isConfirmed && (
                <span className="text-success text-lg" title="Device confirmed value">
                    ✓
                </span>
            )}
        </div>
    );
});

export default EnumEditor;
