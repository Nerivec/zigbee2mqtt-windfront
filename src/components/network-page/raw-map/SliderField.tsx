import { FontAwesomeIcon, type FontAwesomeIconProps } from "@fortawesome/react-fontawesome";
import { type ChangeEvent, type DetailedHTMLProps, type InputHTMLAttributes, memo, useCallback, useEffect, useState } from "react";

type SliderFieldProps = Omit<
    DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>,
    "onSubmit" | "defaultValue" | "value" | "min" | "max"
> & {
    name: string;
    label: string;
    icon: FontAwesomeIconProps["icon"];
    min: number;
    max: number;
    step?: number;
    defaultValue: number | "";
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
    onSubmit?: (value: number | "", valid: boolean) => void;
};

const SliderField = memo((props: SliderFieldProps) => {
    const { label, icon, onChange, onSubmit, defaultValue, ...rest } = props;
    const [currentValue, setCurrentValue] = useState<number | "">(defaultValue);

    useEffect(() => {
        setCurrentValue(defaultValue);
    }, [defaultValue]);

    const onChangeHandler = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            setCurrentValue(e.target.value ? e.target.valueAsNumber : "");
            onChange?.(e);
        },
        [onChange],
    );

    const onSubmitHandler = useCallback(
        (e) => {
            onSubmit?.(currentValue, !e.target.validationMessage);
        },
        [onSubmit, currentValue],
    );

    return (
        <div className="flex flex-row flex-wrap items-center gap-2 bg-base-100 rounded-box px-2 pb-1" title={label}>
            <FontAwesomeIcon icon={icon} />
            <div className="">
                <input
                    className="range range-xs"
                    onChange={onChangeHandler}
                    onTouchEnd={onSubmitHandler}
                    onMouseUp={onSubmitHandler}
                    {...rest}
                    type="range"
                    value={currentValue}
                />
                <div className="flex justify-between px-1 mt-1 text-xs">
                    <span>{props.min}</span>
                    <span>{currentValue}</span>
                    <span>{props.max}</span>
                </div>
            </div>
        </div>
    );
});

export default SliderField;
