import { type ChangeEvent, type InputHTMLAttributes, memo, useCallback, useEffect, useState } from "react";
import EnumEditor, { type ValueWithLabelOrPrimitive } from "./EnumEditor.js";
import { useCommandFeedback } from "./useCommandFeedback.js";

type RangeProps = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> & {
    value: number | "";
    unit?: string;
    onChange(value: number | null, transactionId?: string): void;
    steps?: ValueWithLabelOrPrimitive[];
    minimal?: boolean;
    /** When true, changes are batched (Apply button) - only show editing state */
    batched?: boolean;
    /** Source index for transaction ID generation */
    sourceIdx?: number;
};

const RangeEditor = memo((props: RangeProps) => {
    const { onChange, value, min, max, unit, steps, minimal, batched, sourceIdx, ...rest } = props;
    const [currentValue, setCurrentValue] = useState<number | "">(value);
    const showRange = min != null && max != null;

    const { send } = useCommandFeedback({ sourceIdx, batched });

    useEffect(() => {
        setCurrentValue(value);
    }, [value]);

    const onInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setCurrentValue(e.target.value ? e.target.valueAsNumber : "");
    }, []);

    const onSubmit = useCallback(
        (e: React.SyntheticEvent<HTMLInputElement>) => {
            if (!e.currentTarget.validationMessage) {
                send((txId) => onChange(currentValue === "" ? null : currentValue, txId));
            }
        },
        [currentValue, onChange, send],
    );

    const onKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
                onSubmit(e);
            }
        },
        [onSubmit],
    );

    const handleEnumChange = useCallback(
        (newValue: unknown) => {
            if (typeof newValue === "number") {
                setCurrentValue(newValue);
                send((txId) => onChange(newValue, txId));
            }
        },
        [onChange, send],
    );

    return (
        <div className="flex flex-row flex-wrap gap-3 items-center">
            {!minimal && steps ? (
                <EnumEditor values={steps} onChange={handleEnumChange} value={currentValue} controlled batched={batched} sourceIdx={sourceIdx} />
            ) : null}
            {showRange ? (
                <div className="w-full max-w-xs">
                    <input
                        min={min}
                        max={max}
                        type="range"
                        className="range range-xs range-primary validator"
                        value={currentValue === "" ? (typeof min === "number" ? min : 0) : currentValue}
                        onChange={onInputChange}
                        onTouchEnd={onSubmit}
                        onMouseUp={onSubmit}
                        onKeyUp={onSubmit}
                        {...rest}
                    />
                    <div className="flex justify-between px-1 mt-1 text-xs">
                        <span>{min}</span>
                        {minimal && <span>{currentValue}</span>}
                        <span>{max}</span>
                    </div>
                </div>
            ) : null}
            {(!minimal || !showRange) && (
                <label className="input">
                    <input
                        type="number"
                        className="grow validator"
                        value={currentValue}
                        onChange={onInputChange}
                        onBlur={onSubmit}
                        onKeyDown={onKeyDown}
                        min={min}
                        max={max}
                        {...rest}
                    />
                    {unit}
                </label>
            )}
        </div>
    );
});

export default RangeEditor;
