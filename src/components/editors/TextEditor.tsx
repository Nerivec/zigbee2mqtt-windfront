import { type InputHTMLAttributes, memo, useCallback } from "react";
import { useTrackedValue } from "../../hooks/useTrackedValue.js";

type TextProps = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
    value: string;
    onChange(value: string): Promise<void>;
};

const TextEditor = memo((props: TextProps) => {
    const { onChange, value, ...rest } = props;
    const { currentValue, setCurrentValue, consumeChange } = useTrackedValue(value);

    const onSubmit = useCallback(
        (e: { currentTarget: { validationMessage: string } }) => {
            if (!e.currentTarget.validationMessage && consumeChange()) {
                onChange(currentValue);
            }
        },
        [currentValue, consumeChange, onChange],
    );

    return (
        <input
            type="text"
            className="input validator"
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            onBlur={onSubmit}
            onKeyDown={(e) => {
                if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                    e.preventDefault();

                    if (e.currentTarget.validationMessage) {
                        e.currentTarget.reportValidity();
                    } else {
                        onSubmit(e);
                    }
                }
            }}
            {...rest}
        />
    );
});

export default TextEditor;
