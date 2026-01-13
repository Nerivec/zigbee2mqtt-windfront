import { useCallback, useEffect, useRef, useState } from "react";
import { useFeatureReading } from "../features/FeatureReadingContext.js";
import { READ_TIMEOUT_MS } from "../features/FeatureWrapper.js";

// Tailwind safelist: these classes are constructed dynamically at runtime (e.g., `${prefix}-warning`)
// so Tailwind's static analysis can't detect them. Keep them here as string literals.
// prettier-ignore
const _dependencies =
    "range-primary range-warning range-success range-error input-warning input-success input-error toggle-warning toggle-success toggle-error select-warning select-success select-error";

/**
 * useEditorState - State machine for device value editors with visual feedback
 *
 * PURPOSE:
 * Provides real-time visual feedback when users change device values (sliders, toggles, etc.)
 * Users see color-coded states: editing (amber), pending (amber+pulse), confirmed (green), error (red)
 *
 * TWO MODES:
 * 1. IMMEDIATE MODE (batched=false): Each change sends immediately to device, tracks confirmation
 * 2. BATCHED MODE (batched=true): Changes accumulate locally until Apply button is pressed
 *    (FeatureSubFeatures handles the Apply button state machine separately)
 *
 * STATE FLOW (Immediate Mode):
 *   idle → user edits → editing (amber)
 *                     → user submits → pending (amber+pulse, waiting for device)
 *                                    → device confirms → confirmed (green) → idle
 *                                    → device returns different value → conflict (red)
 *                                    → no response after 10s → timedOut (red)
 *
 * RACE CONDITION HANDLING:
 * If user makes rapid changes (e.g., toggle True→False→True quickly), multiple requests
 * are sent to the device. The hasOverwrittenRef flag tracks this:
 * - First submit: hasOverwritten=false
 * - Second submit while first pending: hasOverwritten=true
 * - When device responds with non-matching value:
 *   - If hasOverwritten: stay pending (response is for earlier request)
 *   - If !hasOverwritten: show conflict (device couldn't fulfill our single request)
 */

export type UseEditorStateOptions<T> = {
    /** Current device value from props */
    value: T;
    /** Current local editing value */
    currentValue: T;
    /** Callback to send value to device */
    onChange: (value: T) => void;
    /** Custom equality check (default: ===) */
    isEqual?: (a: T, b: T) => boolean;
    /** When true, changes are batched (Apply button) - only show editing state */
    batched?: boolean;
    /** Parent's local change indicator (for batched mode) */
    hasLocalChange?: boolean;
};

export type UseEditorStateReturn<T> = {
    // State
    sentValue: T | null;
    isConfirmed: boolean;
    isConflict: boolean;
    isTimedOut: boolean;
    isEditing: boolean;
    isPending: boolean;

    // From context
    isReading: boolean;
    readTimedOut: boolean;

    // Actions
    startEditing: () => void;
    stopEditing: () => void;
    /** Submit a value to device. Returns true if submitted. */
    submit: (value: T) => boolean;
    /** Reset states when user starts editing a new value */
    resetForEdit: () => void;
    /** Clear all states (for blur without submit) */
    clearStates: () => void;

    // Style helpers
    getInputClass: () => string;
    getRangeClass: (hasValue?: boolean) => string;
    getToggleClass: () => string;
    getButtonClass: (isActive: boolean) => string;
    getSelectClass: () => string;
};

const defaultIsEqual = <T>(a: T, b: T): boolean => a === b;

export function useEditorState<T>(options: UseEditorStateOptions<T>): UseEditorStateReturn<T> {
    const { value, currentValue, onChange, isEqual = defaultIsEqual, batched = false } = options;

    // ═══════════════════════════════════════════════════════════════════════════
    // STATE VARIABLES - Track the lifecycle of a value change request
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * sentValue - The value we're waiting for the device to confirm
     * - null: No pending request (idle state)
     * - T: We sent this value and are waiting for device to echo it back
     * Visual: When non-null, show amber+pulse to indicate "waiting for device"
     */
    const [sentValue, setSentValue] = useState<T | null>(null);

    /**
     * isConfirmed - Device successfully echoed back our exact value
     * - true: Device confirmed, show green checkmark (success state)
     * - Automatically clears after a few seconds or when user starts new edit
     * Visual: Green styling indicates "device accepted your change"
     */
    const [isConfirmed, setIsConfirmed] = useState(false);

    /**
     * isConflict - Device responded with a DIFFERENT value than we requested
     * - Example: User set brightness=100, device responded with brightness=80 (device limit)
     * - Only triggers for single requests (not during rapid overwrites, see hasOverwrittenRef)
     * Visual: Red styling + retry button. User can click retry to resend.
     */
    const [isConflict, setIsConflict] = useState(false);

    /**
     * isTimedOut - No response from device within READ_TIMEOUT_MS (10 seconds)
     * - Device may be offline, network issue, or ZCL command failed
     * - Different from isConflict: we don't know IF device received the command
     * Visual: Red styling + retry button. Same appearance as conflict, different tooltip.
     */
    const [isTimedOut, setIsTimedOut] = useState(false);

    /**
     * isEditing - User is actively editing (typing, dragging slider)
     * - Set when user focuses input or starts dragging
     * - Cleared when user blurs or value is confirmed
     * Visual: Amber styling to indicate "you have unsent changes"
     */
    const [isEditing, setIsEditing] = useState(false);

    // ═══════════════════════════════════════════════════════════════════════════
    // REFS - Values that persist across renders without triggering re-renders
    // ═══════════════════════════════════════════════════════════════════════════

    /** Timer handle for the 10-second confirmation timeout */
    const confirmTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    /** Previous device value - used to detect when device state changes */
    const lastValueRef = useRef(value);

    /** Last value we submitted - used to prevent duplicate submissions */
    const lastSubmittedRef = useRef<T | null>(null);

    /** Track last reported writeState to avoid unnecessary context updates */
    const lastWriteStateRef = useRef<{ isPending: boolean; isConflict: boolean; isTimedOut: boolean; isConfirmed: boolean } | null>(null);

    /**
     * hasOverwrittenRef - Tracks if user issued multiple requests while one was pending
     *
     * RACE CONDITION SCENARIO:
     * 1. User toggles True→False (request 1 sent)
     * 2. User toggles False→True (request 2 sent, hasOverwritten=true)
     * 3. Device responds with False (confirming request 1)
     *
     * WITHOUT this flag: We'd show conflict (False !== True)
     * WITH this flag: We stay pending (response is for request 1, still waiting for request 2)
     *
     * Reset to false when device confirms our latest sentValue
     */
    const hasOverwrittenRef = useRef<boolean>(false);

    // Context from FeatureWrapper - for read operations and parent communication
    const { isReading, readTimedOut, setWriteState, setOnRetry } = useFeatureReading();

    // ═══════════════════════════════════════════════════════════════════════════
    // DERIVED STATE
    // ═══════════════════════════════════════════════════════════════════════════

    /** In batched mode, show warning when local value differs from device */
    // Prefer parent's hasLocalChange if provided (accurate - parent tracks against original device state)
    // Fall back to local comparison for backwards compatibility
    const hasLocalChanges = batched && (options.hasLocalChange ?? !isEqual(currentValue, value));

    /** True when we're waiting for device confirmation (not in error state) */
    const isPending = batched ? false : sentValue !== null && !isConflict && !isTimedOut;

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (confirmTimeoutRef.current) {
                clearTimeout(confirmTimeoutRef.current);
            }
        };
    }, []);

    // Report write state to parent context (skip in batched mode - Apply button handles this)
    // Only update when values actually change to prevent unnecessary re-renders
    useEffect(() => {
        if (batched) return;
        const last = lastWriteStateRef.current;
        const changed =
            !last ||
            last.isPending !== isPending ||
            last.isConflict !== isConflict ||
            last.isTimedOut !== isTimedOut ||
            last.isConfirmed !== isConfirmed;
        if (changed) {
            lastWriteStateRef.current = { isPending, isConflict, isTimedOut, isConfirmed };
            setWriteState?.({
                isPending,
                isConflict,
                isTimedOut,
                isConfirmed,
            });
        }
    }, [batched, isPending, isConflict, isTimedOut, isConfirmed, setWriteState]);

    // Register retry callback with parent context (skip in batched mode)
    useEffect(() => {
        if (batched) return;
        const retryCallback = () => {
            // Only retry if we have a valid value to retry
            if (currentValue !== null && currentValue !== undefined) {
                setIsConflict(false);
                setIsTimedOut(false);
                setSentValue(currentValue);
                onChange(currentValue);
            }
        };
        setOnRetry?.(() => retryCallback);

        return () => {
            setOnRetry?.(null);
        };
    }, [batched, currentValue, onChange, setOnRetry]);

    // Clear confirmed state when sync button is clicked (new read starts)
    useEffect(() => {
        if (isReading) {
            setIsConfirmed(false);
        }
    }, [isReading]);

    // Timeout for device confirmation (skip in batched mode)
    useEffect(() => {
        if (batched) return;
        if (sentValue !== null && !isConflict && !isTimedOut) {
            confirmTimeoutRef.current = setTimeout(() => {
                setIsTimedOut(true);
            }, READ_TIMEOUT_MS);
        }

        return () => {
            if (confirmTimeoutRef.current) {
                clearTimeout(confirmTimeoutRef.current);
                confirmTimeoutRef.current = null;
            }
        };
    }, [batched, sentValue, isConflict, isTimedOut]);

    // Detect device response and update states (skip in batched mode)
    useEffect(() => {
        if (batched) {
            lastValueRef.current = value;
            return;
        }
        const valueChanged = !isEqual(value, lastValueRef.current);

        if (sentValue !== null && valueChanged) {
            if (isEqual(value, sentValue)) {
                // Device confirmed our value
                lastSubmittedRef.current = null;
                hasOverwrittenRef.current = false;
                setIsConfirmed(true);
                setIsConflict(false);
                setIsTimedOut(false);
                setSentValue(null);
                setIsEditing(false);
            } else {
                // Device responded with different value
                if (hasOverwrittenRef.current) {
                    // User issued multiple requests - this response is for an earlier one
                    // Stay pending, wait for our latest value to be confirmed
                } else {
                    // Single request, device genuinely responded with different value
                    setIsConflict(true);
                }
            }
        }
        lastValueRef.current = value;
    }, [batched, value, sentValue, isEqual]);

    // Actions
    const startEditing = useCallback(() => {
        setIsEditing(true);
    }, []);

    const stopEditing = useCallback(() => {
        if (lastSubmittedRef.current === null && !isConflict) {
            setIsEditing(false);
            setIsConfirmed(false);
        }
    }, [isConflict]);

    const submit = useCallback(
        (valueToSubmit: T): boolean => {
            // In batched mode, just call onChange without tracking
            if (batched) {
                onChange(valueToSubmit);
                return true;
            }
            // Don't submit if value hasn't changed from device value AND nothing is pending
            // (If something is pending, we need to submit to "correct" it)
            if (isEqual(valueToSubmit, value) && sentValue === null) {
                return false;
            }
            // Skip duplicate submissions
            if (lastSubmittedRef.current !== null && isEqual(valueToSubmit, lastSubmittedRef.current)) {
                return false;
            }
            // Only track pending state for non-null values (clearing doesn't need feedback)
            const shouldTrack = valueToSubmit !== null && valueToSubmit !== undefined;
            if (shouldTrack) {
                // If already pending, mark as overwritten (user issued multiple requests)
                if (sentValue !== null) {
                    hasOverwrittenRef.current = true;
                }
                lastSubmittedRef.current = valueToSubmit;
                setSentValue(valueToSubmit);
                setIsConfirmed(false);
                setIsConflict(false);
                setIsTimedOut(false);
            }
            onChange(valueToSubmit);
            return true;
        },
        [batched, value, onChange, isEqual, sentValue],
    );

    const resetForEdit = useCallback(() => {
        setIsEditing(true);
        setIsConfirmed(false);
        setIsConflict(false);
        setIsTimedOut(false);
        // Don't clear sentValue or lastSubmittedRef - we need to track in-flight requests
        // to ensure submit() sends corrections even when value matches device
    }, []);

    const clearStates = useCallback(() => {
        setIsEditing(false);
        setIsConfirmed(false);
    }, []);

    // ═══════════════════════════════════════════════════════════════════════════
    // STYLE HELPERS - Generate CSS classes based on current state
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Core state class generator - returns "{prefix}-{state}" based on current state
     * @param prefix - CSS class prefix (e.g., "input", "range", "toggle")
     * @param defaultClass - Class to return when no state is active
     * @param addPulse - Whether to add "animate-pulse" for isReading/isPending states
     * @param checkEditing - Whether to include isEditing in the state checks
     */
    const getStateClass = useCallback(
        (prefix: string, defaultClass = "", addPulse = false, checkEditing = true) => {
            const pulse = addPulse ? " animate-pulse" : "";
            if (hasLocalChanges) return `${prefix}-warning`;
            if (readTimedOut) return `${prefix}-error`;
            if (isReading) return `${prefix}-warning${pulse}`;
            if (isConfirmed) return `${prefix}-success`;
            if (isConflict) return `${prefix}-error`;
            if (isTimedOut) return `${prefix}-error`;
            if (isPending) return `${prefix}-warning${pulse}`;
            // In batched mode, don't show editing state on focus - Apply button handles indication
            if (checkEditing && isEditing && !batched) return `${prefix}-warning`;
            return defaultClass;
        },
        [hasLocalChanges, readTimedOut, isReading, isConfirmed, isConflict, isTimedOut, isPending, isEditing, batched],
    );

    const getInputClass = useCallback(() => getStateClass("input", "", true, true), [getStateClass]);

    const getRangeClass = useCallback((hasValue = true) => (hasValue ? getStateClass("range", "range-primary", false, true) : ""), [getStateClass]);

    const getToggleClass = useCallback(() => getStateClass("toggle", "", false, false), [getStateClass]);

    const getSelectClass = useCallback(() => getStateClass("select", "", false, false), [getStateClass]);

    // getButtonClass has different structure (base class + active state) so kept separate
    const getButtonClass = useCallback(
        (isActive: boolean) => {
            const base = "btn btn-outline btn-sm join-item";
            const activeClass = isActive ? " btn-active" : "";
            if (hasLocalChanges) return `${base} btn-warning${activeClass}`;
            if (readTimedOut) return `${base} btn-error${activeClass}`;
            if (isReading) return `${base} btn-warning${activeClass}`;
            if (isConfirmed) return `${base} btn-success${activeClass}`;
            if (isConflict) return `${base} btn-error${activeClass}`;
            if (isTimedOut) return `${base} btn-error${activeClass}`;
            if (isPending) return `${base} btn-warning${activeClass}`;
            return `${base} btn-primary${activeClass}`;
        },
        [hasLocalChanges, readTimedOut, isReading, isConfirmed, isConflict, isTimedOut, isPending],
    );

    return {
        // State
        sentValue,
        isConfirmed,
        isConflict,
        isTimedOut,
        isEditing,
        isPending,

        // From context
        isReading,
        readTimedOut,

        // Actions
        startEditing,
        stopEditing,
        submit,
        resetForEdit,
        clearStates,

        // Style helpers
        getInputClass,
        getRangeClass,
        getToggleClass,
        getButtonClass,
        getSelectClass,
    };
}
