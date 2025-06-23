import { type ChangeEvent, type DetailedHTMLProps, type FocusEvent, memo, type TextareaHTMLAttributes } from "react";

type TextAreaFieldProps = DetailedHTMLProps<TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement> & {
    name: string;
    label?: string;
    detail?: string;
    onChange?: (event: ChangeEvent<HTMLTextAreaElement>) => void;
    onBlur?: (event: FocusEvent<HTMLTextAreaElement>) => void;
};

const TextareaField = memo((props: TextAreaFieldProps) => {
    const { label, detail, onChange, onBlur, ...rest } = props;

    return (
        <fieldset className="fieldset">
            {label && <legend className="fieldset-legend">{label}</legend>}
            <textarea className={`textarea${props.required ? " validator" : ""}`} onChange={onChange} onBlur={onBlur} {...rest} />
            {detail && <div className="label">{detail}</div>}
        </fieldset>
    );
});

export default TextareaField;
