import { type InputHTMLAttributes, memo, useCallback, useEffect, useState } from "react";
import { useCommandFeedback } from "./useCommandFeedback.js";

type TextProps = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
    value: string;
    onChange(value: string, transactionId?: string): void;
    minimal?: boolean;
    /** When true, changes are batched (Apply button) - only show editing state */
    batched?: boolean;
    /** Parent's local change indicator (for batched mode) */
    hasLocalChange?: boolean;
    /** Source index for transaction ID generation */
    sourceIdx?: number;
};

const TextEditor = memo((props: TextProps) => {
    const { onChange, value, minimal, batched, hasLocalChange, sourceIdx, ...rest } = props;
    const [currentValue, setCurrentValue] = useState<string>(value);
    const [isEditing, setIsEditing] = useState(false);

    const { send } = useCommandFeedback({ sourceIdx, batched });

    // Sync currentValue from device value when not editing
    useEffect(() => {
        if (!isEditing) setCurrentValue(value);
    }, [value, isEditing]);

    const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentValue(e.target.value);
    }, []);

    const onFocus = useCallback(() => setIsEditing(true), []);

    const onBlur = useCallback(
        (e: React.FocusEvent<HTMLInputElement>) => {
            if (!e.target.validationMessage) {
                send((txId) => onChange(currentValue, txId));
            }
            setIsEditing(false);
        },
        [currentValue, onChange, send],
    );

    const onKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter" && !e.currentTarget.validationMessage) {
                send((txId) => onChange(currentValue, txId));
                e.currentTarget.blur();
            }
        },
        [currentValue, onChange, send],
    );

    return (
        <div className="flex flex-row items-center gap-2">
            <input
                type="text"
                className="input validator"
                value={currentValue}
                onChange={onInputChange}
                onFocus={onFocus}
                onBlur={onBlur}
                onKeyDown={onKeyDown}
                {...rest}
            />
        </div>
    );
});

export default TextEditor;
