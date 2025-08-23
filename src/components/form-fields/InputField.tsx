import { type ChangeEvent, type DetailedHTMLProps, type FocusEvent, type InputHTMLAttributes, memo } from "react";

type InputFieldProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & {
    name: string;
    label?: string;
    detail?: string;
    type: "text" | "number";
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
};

const InputField = memo((props: InputFieldProps) => {
    const { label, detail, onChange, onBlur, ...rest } = props;

    return (
        <fieldset className="fieldset">
            {label && (
                <legend className="fieldset-legend">
                    {label}
                    {props.required ? " *" : ""}
                </legend>
            )}
            <input className={`input min-w-xs${props.pattern || props.required ? " validator" : ""}`} onChange={onChange} onBlur={onBlur} {...rest} />
            {detail && <p className="label">{detail}</p>}
        </fieldset>
    );
});

export default InputField;
