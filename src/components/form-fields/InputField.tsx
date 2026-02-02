import { type ChangeEvent, type DetailedHTMLProps, type InputHTMLAttributes, memo, useCallback, useEffect, useState } from "react";

type InputFieldProps = Omit<
    DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>,
    "onChange" | "onSubmit" | "defaultValue" | "value"
> & {
    name: string;
    label?: string;
    detail?: string;
    type?: "text" | "password" | "url" | "email";
    initialValue: string;
    onSubmit: (value: string) => void;
};

const InputField = memo((props: InputFieldProps) => {
    const { label, detail, onSubmit, initialValue, type = "text", ...rest } = props;
    const [currentValue, setCurrentValue] = useState<string>(initialValue);

    useEffect(() => {
        setCurrentValue(initialValue);
    }, [initialValue]);

    const onChangeHandler = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setCurrentValue(e.target.value);
    }, []);

    const onBlurHandler = useCallback(() => {
        if (currentValue !== initialValue) {
            onSubmit(currentValue);
        }
    }, [onSubmit, currentValue, initialValue]);

    const onKeyDownHandler = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
                e.preventDefault();
                if (currentValue !== initialValue) {
                    onSubmit(currentValue);
                }
            }
        },
        [onSubmit, currentValue, initialValue],
    );

    return (
        <fieldset className="fieldset">
            {label && (
                <legend className="fieldset-legend">
                    {label}
                    {props.required ? " *" : ""}
                </legend>
            )}
            <input
                className={`input min-w-xs${props.pattern || props.required ? " validator" : ""}`}
                type={type}
                value={currentValue}
                onChange={onChangeHandler}
                onBlur={onBlurHandler}
                onKeyDown={onKeyDownHandler}
                {...rest}
            />
            {detail && <p className="label whitespace-normal">{detail}</p>}
        </fieldset>
    );
});

export default InputField;
