import { type ChangeEvent, type FocusEvent, type KeyboardEvent, useRef, useState } from "react";

export type UseInputSubmitProps = {
    /** The committed value from parent */
    value: string;
    /** Called when the value should be committed */
    onSubmit: (value: string | null) => Promise<void>;
    /** Whether the input is disabled externally */
    disabled?: boolean;
    /** Whether to submit `empty string` or `null` when value to submit is `empty string` */
    submitEmptyAsNull?: boolean;
};

export type UseInputSubmit = {
    value: string;
    disabled: boolean;
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onBlur: (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onKeyDown: (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
};

export function useInputSubmit({ value, onSubmit, disabled, submitEmptyAsNull }: UseInputSubmitProps): UseInputSubmit {
    const prevValueRef = useRef<string>(value);
    const skipBlurRef = useRef<boolean>(false);
    const [draft, setDraft] = useState<string>(value);
    const [submitting, setSubmitting] = useState<boolean>(false);

    // keep draft in sync if committed value changes externally
    if (prevValueRef.current !== value) {
        prevValueRef.current = value;

        if (value !== draft) {
            setDraft(value);
        }
    }

    return {
        value: draft,
        disabled: disabled || submitting,
        onChange(e) {
            setDraft(e.target.value);
        },
        async onBlur(e) {
            if (skipBlurRef.current) {
                skipBlurRef.current = false;
                return;
            }

            const input = e.currentTarget;

            if (input.validationMessage) {
                return;
            }

            const submitValue = e.target.value;

            setDraft(submitValue);

            // only submit if value actually changed
            if (submitValue !== value) {
                setSubmitting(true);

                try {
                    await onSubmit(submitEmptyAsNull && submitValue === "" ? null : submitValue);
                } catch (error) {
                    console.error(error);
                    input.setCustomValidity(error.message);
                    input.reportValidity();
                } finally {
                    setSubmitting(false);
                }
            }
        },
        onKeyDown(e) {
            if (e.nativeEvent.isComposing) {
                return; // skip during composition
            }

            if (e.key === "Enter") {
                // for textarea, only submit on Enter without Shift
                if (e.currentTarget.tagName === "TEXTAREA" && e.shiftKey) {
                    return;
                }

                e.preventDefault();
                e.currentTarget.blur(); // triggers onBlur which calls submit, no double-trigger
            } else if (e.key === "Escape") {
                e.preventDefault();

                // skip submit, would otherwise submit pre-reset value (old value held at time of event)
                skipBlurRef.current = true;

                setDraft(value); // reset to committed value
                e.currentTarget.blur();
            }
        },
    };
}
