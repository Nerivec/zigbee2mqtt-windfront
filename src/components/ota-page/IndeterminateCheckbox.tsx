import { type DetailedHTMLProps, type InputHTMLAttributes, useEffect, useRef } from "react";

interface IndeterminateCheckboxProps extends Omit<DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, "className" | "type"> {
    indeterminate?: boolean;
}

export default function IndeterminateCheckbox({ indeterminate, ...rest }: IndeterminateCheckboxProps) {
    const ref = useRef<HTMLInputElement>(null!);

    // biome-ignore lint/correctness/useExhaustiveDependencies: specific trigger
    useEffect(() => {
        if (typeof indeterminate === "boolean") {
            ref.current.indeterminate = !rest.checked && indeterminate;
        }
    }, [ref, indeterminate]);

    return <input ref={ref} type="checkbox" className="checkbox" {...rest} />;
}
