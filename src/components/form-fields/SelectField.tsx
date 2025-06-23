import { type ChangeEvent, type DetailedHTMLProps, memo, type SelectHTMLAttributes } from "react";

export type SelectFieldProps = DetailedHTMLProps<SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement> & {
    name: string;
    label?: string;
    detail?: string;
    onChange(event: ChangeEvent<HTMLSelectElement>): void;
};

const SelectField = memo((props: SelectFieldProps) => {
    const { label, detail, onChange, children, ...rest } = props;

    return (
        <fieldset className="fieldset">
            {label && <legend className="fieldset-legend">{label}</legend>}
            <select className={`select${props.required ? " validator" : ""}`} onChange={onChange} {...rest}>
                {children}
            </select>
            {detail && <span className="label">{detail}</span>}
        </fieldset>
    );
});

export default SelectField;
