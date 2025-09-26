import { faCheck, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type DetailedHTMLProps, type FocusEvent, type InputHTMLAttributes, memo, useCallback, useEffect, useState } from "react";
import Button from "../Button.js";

type ArrayFieldProps = Omit<DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, "type"> & {
    defaultValues: (string | number)[];
    label?: string;
    detail?: string;
    type: "string" | "number";
    onSubmit(values: (string | number)[]): void;
};

const ArrayField = memo((props: ArrayFieldProps) => {
    const { defaultValues, label, detail, type, onSubmit, ...rest } = props;
    const [currentValues, setCurrentValues] = useState<(string | number)[]>(defaultValues || []);

    useEffect(() => {
        setCurrentValues(defaultValues || []);
    }, [defaultValues]);

    const setValue = useCallback(
        (idx: number, e: FocusEvent<HTMLInputElement>) => {
            setCurrentValues((prev) => {
                const newValues = Array.from(prev);
                newValues[idx] = type === "number" ? (e.target.value ? e.target.valueAsNumber : "") : e.target.value;

                return newValues;
            });
        },
        [type],
    );

    const onAddClick = useCallback(() => {
        setCurrentValues((prev) => [...prev, ""]);
    }, []);

    const onRemoveClick = useCallback((idx) => {
        setCurrentValues((prev) => {
            const newValues = Array.from(prev);
            newValues.splice(idx, 1);

            return newValues;
        });
    }, []);

    const onApply = useCallback(
        () => onSubmit(type === "number" ? currentValues.filter((v) => typeof v === "number") : currentValues.filter((v) => !!v)),
        [type, currentValues, onSubmit],
    );

    return (
        <fieldset className="fieldset gap-2">
            {label && (
                <legend className="fieldset-legend">
                    {label}
                    {props.required ? " *" : ""}
                </legend>
            )}
            <div className="flex flex-row flex-wrap gap-2">
                {currentValues.map((value, idx) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: lack of data
                    <div className="join min-w-xs" key={`${value}-${idx}`}>
                        <input
                            className="input join-item"
                            onBlur={(e: FocusEvent<HTMLInputElement>) => {
                                setValue(idx, e);
                            }}
                            type={type}
                            defaultValue={Number.isNaN(value) ? "" : value}
                            {...rest}
                        />
                        <Button<void> className="btn btn-error btn-outline join-item" onClick={() => onRemoveClick(idx)}>
                            <FontAwesomeIcon icon={faTrash} />
                        </Button>
                    </div>
                ))}
            </div>
            <div className="flex flex-row flex-wrap gap-2 items-center mt-1">
                <Button<void> onClick={onAddClick} className="btn btn-sm btn-square btn-success ms-2">
                    <FontAwesomeIcon icon={faPlus} />
                </Button>
                <Button<void> onClick={onApply} className="btn btn-sm btn-square btn-primary">
                    <FontAwesomeIcon icon={faCheck} />
                </Button>
                {detail && <p className="label text-wrap">{detail}</p>}
            </div>
        </fieldset>
    );
});

export default ArrayField;
