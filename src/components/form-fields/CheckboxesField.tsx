import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type ChangeEvent, type DetailedHTMLProps, type InputHTMLAttributes, memo, useCallback, useEffect, useState } from "react";
import Button from "../Button.js";

type CheckboxFieldProps = Omit<DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, "type"> & {
    names: string[];
    defaultsChecked: string[];
    label?: string;
    detail?: string;
    onSubmit(values: string[]): void;
};

const CheckboxesField = memo((props: CheckboxFieldProps) => {
    const { names, label, detail, defaultsChecked, onSubmit, ...rest } = props;
    const [currentValues, setCurrentValues] = useState<string[]>(defaultsChecked || []);

    useEffect(() => {
        setCurrentValues(defaultsChecked || []);
    }, [defaultsChecked]);

    const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setCurrentValues((prev) => (e.target.checked ? [...prev, e.target.name] : prev.filter((v) => v !== e.target.name)));
    }, []);

    const onApply = useCallback(() => onSubmit(currentValues), [currentValues, onSubmit]);

    return (
        <fieldset className="fieldset gap-2">
            {label && (
                <legend className="fieldset-legend">
                    {label}
                    {props.required ? " *" : ""}
                </legend>
            )}
            <div className="flex flex-row flex-wrap gap-2">
                {names.map((name) => (
                    <label className="label" key={name}>
                        <input
                            name={name}
                            className="checkbox"
                            type="checkbox"
                            onChange={onChange}
                            checked={currentValues.includes(name)}
                            {...rest}
                        />
                        {name}
                    </label>
                ))}
            </div>
            <div className="flex flex-row flex-wrap gap-2 items-center mt-1">
                <Button onClick={onApply} className="btn btn-sm btn-square btn-primary">
                    <FontAwesomeIcon icon={faCheck} />
                </Button>
                {detail && <p className="label text-wrap">{detail}</p>}
            </div>
        </fieldset>
    );
});

export default CheckboxesField;
