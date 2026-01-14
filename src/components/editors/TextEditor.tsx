import { type InputHTMLAttributes, memo, useCallback, useEffect, useRef, useState } from "react";
import { useEditorState } from "./useEditorState.js";

type TextProps = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
    value: string;
    onChange(value: string): void;
    minimal?: boolean;
    /** When true, changes are batched (Apply button) - only show editing state */
    batched?: boolean;
    /** Parent's local change indicator (for batched mode) */
    hasLocalChange?: boolean;
};

const TextEditor = memo((props: TextProps) => {
    const { onChange, value, minimal, batched, hasLocalChange, ...rest } = props;
    const [currentValue, setCurrentValue] = useState<string>(value);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const {
        sentValue,
        isConfirmed,
        isConflict,
        isTimedOut,
        isEditing,
        isPending,
        isReading,
        readTimedOut,
        startEditing,
        stopEditing,
        submit,
        resetForEdit,
        getInputClass,
    } = useEditorState<string>({
        value,
        currentValue,
        onChange,
        batched,
        hasLocalChange,
    });

    // Cleanup debounce timer on unmount
    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    // Sync currentValue from device value when not editing and not pending
    useEffect(() => {
        if (!isEditing && sentValue === null) {
            setCurrentValue(value);
        }
    }, [value, isEditing, sentValue]);

    const onInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.value;
            setCurrentValue(newValue);
            resetForEdit();

            // Debounce: auto-submit after 2 seconds of no changes
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
            debounceRef.current = setTimeout(() => {
                submit(newValue);
                debounceRef.current = null;
            }, 2000);
        },
        [submit, resetForEdit],
    );

    const onFocus = useCallback(() => {
        if (!isEditing && sentValue === null) {
            setCurrentValue(value);
        }
        startEditing();
    }, [value, isEditing, sentValue, startEditing]);

    const onBlur = useCallback(
        (e: React.FocusEvent<HTMLInputElement>) => {
            // Cancel debounce timer since we're submitting now
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
                debounceRef.current = null;
            }
            let didSubmit = false;
            if (!e.target.validationMessage) {
                didSubmit = submit(currentValue);
            }
            if (!didSubmit) {
                stopEditing();
            }
        },
        [currentValue, submit, stopEditing],
    );

    const onKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter" && !e.currentTarget.validationMessage) {
                // Cancel debounce timer since we're submitting now
                if (debounceRef.current) {
                    clearTimeout(debounceRef.current);
                    debounceRef.current = null;
                }
                submit(currentValue);
                e.currentTarget.blur();
            }
        },
        [currentValue, submit],
    );

    return (
        <div className="flex flex-row gap-3 items-center w-full">
            <div className="flex-1">
                <input
                    type="text"
                    className={`input validator w-full max-w-xs ${getInputClass()} ${!isEditing && !isPending && !isConfirmed && !isConflict && !isTimedOut && !isReading && !readTimedOut ? "opacity-50" : ""}`}
                    value={currentValue}
                    onChange={onInputChange}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    onKeyDown={onKeyDown}
                    {...rest}
                />
            </div>
            {/* Status indicator - green tick for confirmed */}
            {isConfirmed && (
                <span className="text-success text-lg" title="Device confirmed value">
                    ✓
                </span>
            )}
        </div>
    );
});

export default TextEditor;
