import { type ChangeEvent, type InputHTMLAttributes, memo, useCallback, useEffect, useRef, useState } from "react";
import EnumEditor, { type ValueWithLabelOrPrimitive } from "./EnumEditor.js";
import { useEditorState } from "./useEditorState.js";

type RangeProps = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> & {
    value: number | "";
    unit?: string;
    onChange(value: number | null): void;
    steps?: ValueWithLabelOrPrimitive[];
    minimal?: boolean;
    /** When true, changes are batched (Apply button) - only show editing state */
    batched?: boolean;
    /** Parent's local change indicator (for batched mode) */
    hasLocalChange?: boolean;
};

const RangeEditor = memo((props: RangeProps) => {
    const { onChange, value, min, max, unit, steps, minimal, batched, hasLocalChange, ...rest } = props;
    const [currentValue, setCurrentValue] = useState<number | "">(value);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const showRange = min != null && max != null;

    // Convert "" to null for the hook (semantic equivalence)
    const deviceValue = value === "" ? null : value;
    const editingValue = currentValue === "" ? null : currentValue;

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
        getRangeClass,
    } = useEditorState<number | null>({
        value: deviceValue,
        currentValue: editingValue,
        onChange,
        batched,
        hasLocalChange,
    });

    // Auto-hide confirmation tick after 3 seconds in minimal mode
    const [showTick, setShowTick] = useState(false);
    useEffect(() => {
        if (minimal && isConfirmed) {
            setShowTick(true);
            const timer = setTimeout(() => setShowTick(false), 3000);
            return () => clearTimeout(timer);
        }
        setShowTick(false);
    }, [minimal, isConfirmed]);

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
        if (typeof value === "number" && !Number.isNaN(value)) {
            if (!isEditing && sentValue === null) {
                setCurrentValue(value);
            }
        }
    }, [value, isEditing, sentValue]);

    // Handler for range slider - NO debounce timer (sends on mouseUp/touchEnd/keyUp)
    // IMPORTANT: Don't call resetForEdit() here! That clears sentValue which breaks
    // the overwrite detection. If user drags while pending, we need to preserve
    // sentValue so submit() can detect the overwrite and set hasOverwritten=true.
    const onRangeChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const newValue: number | "" = e.target.value ? e.target.valueAsNumber : "";
        setCurrentValue(newValue);
        // Just update the local value - don't reset pending state!
        // The submit() on mouseUp will handle overwrite detection.
    }, []);

    // Handler for number input - WITH debounce timer (auto-sends after 2s pause)
    const onNumberInputChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const newValue: number | "" = e.target.value ? e.target.valueAsNumber : "";

            setCurrentValue(newValue);
            resetForEdit();

            // Debounce: auto-submit after 2 seconds of no changes
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
            debounceRef.current = setTimeout(() => {
                const valueToSend = newValue === "" ? null : newValue;
                submit(valueToSend);
                debounceRef.current = null;
            }, 2000);
        },
        [submit, resetForEdit],
    );

    // Wrapper for EnumEditor to track pending state
    const handleEnumChange = useCallback(
        (newValue: number | null) => {
            if (newValue !== null) {
                setCurrentValue(newValue);
            }
            submit(newValue);
        },
        [submit],
    );

    const onSubmit = useCallback(
        (e: React.SyntheticEvent<HTMLInputElement>) => {
            // Cancel debounce timer since we're submitting now
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
                debounceRef.current = null;
            }
            if (!e.currentTarget.validationMessage) {
                submit(editingValue);
            }
        },
        [editingValue, submit],
    );

    // Handle focus - enter editing mode (but don't reset value if already editing/pending)
    const onFocus = useCallback(() => {
        // Only initialize from device value if not already editing or pending
        if (!isEditing && sentValue === null) {
            if (typeof value === "number" && !Number.isNaN(value)) {
                setCurrentValue(value);
            }
        }
        startEditing();
    }, [value, isEditing, sentValue, startEditing]);

    // Handle blur - submit and exit editing mode
    const onBlur = useCallback(
        (e: React.FocusEvent<HTMLInputElement>) => {
            // Cancel debounce timer since we're submitting now
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
                debounceRef.current = null;
            }
            let didSubmit = false;
            if (!e.target.validationMessage) {
                didSubmit = submit(editingValue);
            }
            // Exit editing mode only if we didn't submit
            if (!didSubmit) {
                stopEditing();
            }
        },
        [editingValue, submit, stopEditing],
    );

    // Handle Enter key to submit
    const onKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter" && !e.currentTarget.validationMessage) {
                // Cancel debounce timer since we're submitting now
                if (debounceRef.current) {
                    clearTimeout(debounceRef.current);
                    debounceRef.current = null;
                }
                submit(editingValue);
                e.currentTarget.blur(); // Exit field after Enter
            }
        },
        [editingValue, submit],
    );

    return (
        <div className="flex flex-row gap-3 items-center w-full">
            <div className="flex flex-row flex-wrap gap-3 items-center flex-1">
                {!minimal && steps ? <EnumEditor values={steps} onChange={handleEnumChange} value={currentValue} controlled /> : null}
                {showRange ? (
                    <div className={`w-full max-w-xs ${isPending || isReading ? "animate-pulse" : ""}`}>
                        <input
                            min={min}
                            max={max}
                            type="range"
                            className={`range range-xs ${getRangeClass(currentValue !== "")} validator`}
                            value={currentValue === "" ? (typeof min === "number" ? min : 0) : currentValue}
                            onChange={onRangeChange}
                            onTouchEnd={onSubmit}
                            onMouseUp={onSubmit}
                            onKeyUp={onSubmit}
                            {...rest}
                        />
                        <div className="flex justify-between px-1 mt-1 text-xs">
                            <span>{min}</span>
                            {minimal && <span className={isPending || isReading ? "animate-pulse" : ""}>{currentValue}</span>}
                            <span>{max}</span>
                        </div>
                    </div>
                ) : null}
                {(!minimal || !showRange) && (
                    <label className={`input ${getInputClass()}`}>
                        <input
                            type="number"
                            className={`grow validator ${!isEditing && !isPending && !isConfirmed && !isConflict && !isTimedOut && !isReading && !readTimedOut ? "opacity-50" : ""}`}
                            value={currentValue}
                            onChange={onNumberInputChange}
                            onFocus={onFocus}
                            onBlur={onBlur}
                            onKeyDown={onKeyDown}
                            min={min}
                            max={max}
                            {...rest}
                        />
                        {unit}
                    </label>
                )}
            </div>
            {/* Status indicator - green tick for confirmed (auto-hides after 3s in minimal mode) */}
            {(minimal ? showTick : isConfirmed) && (
                <span className="text-success text-lg" title="Device confirmed value">
                    ✓
                </span>
            )}
        </div>
    );
});

export default RangeEditor;
