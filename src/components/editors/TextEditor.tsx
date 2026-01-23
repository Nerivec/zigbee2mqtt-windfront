import { type InputHTMLAttributes, memo, useEffect, useState } from "react";

type TextProps = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
    value: string;
    onChange(value: string): Promise<void>;
};

const TextEditor = memo((props: TextProps) => {
    const { onChange, value, ...rest } = props;
    const [currentValue, setCurrentValue] = useState<string>(value);

    useEffect(() => {
        setCurrentValue(value);
    }, [value]);

    return (
        <input
            type="text"
            className="input validator"
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            onBlur={(e) => !e.target.validationMessage && onChange(currentValue)}
            {...rest}
        />
    );
});

export default TextEditor;
