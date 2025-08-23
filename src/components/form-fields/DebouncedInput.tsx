import { type ChangeEventHandler, type InputHTMLAttributes, type KeyboardEventHandler, memo, useCallback, useEffect, useRef, useState } from "react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "defaultValue" | "type"> & {
    value: string | number;
    onChange: (value: string) => void;
    debounce?: number;
};

/**
 * Debounced input with `Esc` support for clearing.
 * Uses `type=text` to avoid browser-specific behaviors of `search`.
 */
const DebouncedInput = memo(({ value: initialValue, onChange, debounce = 500, ...props }: Props) => {
    const [value, setValue] = useState(initialValue.toString());
    const mountedRef = useRef(false);
    const lastEmittedRef = useRef<string | undefined>(undefined);

    useEffect(() => {
        setValue(initialValue.toString());
    }, [initialValue]);

    useEffect(() => {
        // skip if value already emitted
        if (lastEmittedRef.current === value) {
            return;
        }

        if (mountedRef.current === false) {
            lastEmittedRef.current = value; // treat as "already emitted"
            mountedRef.current = true;

            return;
        }

        const timeout = setTimeout(() => {
            if (lastEmittedRef.current !== value) {
                lastEmittedRef.current = value;
                onChange(value);
            }
        }, debounce);

        return () => clearTimeout(timeout);
    }, [value, debounce, onChange]);

    const onInputChange: ChangeEventHandler<HTMLInputElement> = useCallback((event) => {
        setValue(event.target.value);
    }, []);

    const onInputKeyDown: KeyboardEventHandler<HTMLInputElement> = useCallback((event) => {
        if (event.key === "Escape") {
            event.preventDefault();
            setValue("");
        }
    }, []);

    return <input {...props} type="text" value={value} onChange={onInputChange} onKeyDown={onInputKeyDown} />;
});

export default DebouncedInput;
