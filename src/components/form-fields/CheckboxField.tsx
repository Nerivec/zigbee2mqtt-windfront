import { type ChangeEvent, type DetailedHTMLProps, type InputHTMLAttributes, memo } from "react";

type CheckboxFieldProps = Omit<DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, "type"> & {
    name: string;
    label?: string;
    detail?: string;
    onChange(event: ChangeEvent<HTMLInputElement>): void;
};

const CheckboxField = memo((props: CheckboxFieldProps) => {
    const { label, detail, onChange, ...rest } = props;

    return (
        <fieldset className="fieldset">
            {label && <legend className="fieldset-legend">{label}</legend>}
            {detail ? (
                <label className="label">
                    <input className={`checkbox${props.required ? " validator" : ""}`} type="checkbox" onChange={onChange} {...rest} />
                    {detail}
                </label>
            ) : (
                <input className={`checkbox${props.required ? " validator" : ""}`} type="checkbox" onChange={onChange} {...rest} />
            )}
        </fieldset>
    );
});

export default CheckboxField;
