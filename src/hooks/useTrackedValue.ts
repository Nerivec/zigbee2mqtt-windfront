import { useCallback, useEffect, useRef, useState } from "react";

export function useTrackedValue<T>(value: T) {
    const [currentValue, setCurrentValue] = useState(value);
    const lastSubmittedRef = useRef(value);

    useEffect(() => {
        lastSubmittedRef.current = value;
        setCurrentValue(value);
    }, [value]);

    // Marks ref before the caller's onChange so that a subsequent blur
    // (which fires synchronously after Enter) sees the value as already submitted.
    const consumeChange = useCallback(() => {
        if (currentValue !== lastSubmittedRef.current) {
            lastSubmittedRef.current = currentValue;
            return true;
        }
        return false;
    }, [currentValue]);

    return { currentValue, setCurrentValue, consumeChange };
}
