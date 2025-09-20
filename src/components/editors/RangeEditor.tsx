import { type ChangeEvent, type InputHTMLAttributes, memo, useCallback, useEffect, useState } from "react";
import EnumEditor, { type ValueWithLabelOrPrimitive } from "./EnumEditor.js";

type RangeProps = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> & {
    value: number | "";
    unit?: string;
    onChange(value: number | null): void;
    steps?: ValueWithLabelOrPrimitive[];
    minimal?: boolean;
};

const RangeEditor = memo((props: RangeProps) => {
    const { onChange, value, min, max, unit, steps, minimal, ...rest } = props;
    const [currentValue, setCurrentValue] = useState<number | "">(value);
    const showRange = min != null && max != null;

    useEffect(() => {
        setCurrentValue(value);
    }, [value]);

    const onInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setCurrentValue(e.target.value ? e.target.valueAsNumber : "");
    }, []);

    const onSubmit = useCallback((e) => !e.target.validationMessage && onChange(currentValue === "" ? null : currentValue), [currentValue, onChange]);

    return (
        <div className="flex flex-row flex-wrap gap-3 items-center">
            {!minimal && steps ? <EnumEditor values={steps} onChange={onChange} value={currentValue} /> : null}
            {showRange ? (
                <div className="w-full max-w-xs">
                    <input
                        min={min}
                        max={max}
                        type="range"
                        className="range range-xs range-primary validator"
                        value={currentValue}
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
