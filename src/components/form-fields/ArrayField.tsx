import { faCheck, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type FocusEvent, memo, useCallback, useEffect, useState } from "react";
import Button from "../Button.js";

type ArrayFieldProps = {
    defaultValues: (string | number)[];
    label?: string;
    detail?: string;
    type: "string" | "number";
    onSubmit(values: (string | number)[]): void;
};

const ArrayField = memo((props: ArrayFieldProps) => {
    const { defaultValues, label, detail, type, onSubmit } = props;
    const [currentValues, setCurrentValues] = useState<(string | number)[]>(defaultValues || []);

    useEffect(() => {
        setCurrentValues(defaultValues || []);
    }, [defaultValues]);

    const onAddClick = useCallback(() => {
        if (currentValues.length > 0) {
            setCurrentValues([...currentValues, ""]);
        } else {
            setCurrentValues([""]);
        }
    }, [currentValues]);

    const onApply = useCallback(
        () => onSubmit(type === "number" ? currentValues.filter((v) => typeof v === "number") : currentValues.filter((v) => !!v)),
        [type, currentValues, onSubmit],
    );

    return (
        <fieldset className="fieldset gap-2">
            {label && <legend className="fieldset-legend">{label}</legend>}
            <div className="flex flex-row flex-wrap gap-2">
                {currentValues.map((value, idx) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: lack of data
                    <div className="join min-w-xs" key={`${value}-${idx}`}>
                        <input
                            className="input join-item"
                            onBlur={(e: FocusEvent<HTMLInputElement>) => {
                                const newValues = Array.from(currentValues);
                                newValues[idx] = type === "number" ? (e.target.value ? e.target.valueAsNumber : "") : e.target.value;

                                setCurrentValues(newValues);
                            }}
                            type={type}
                            defaultValue={Number.isNaN(value) ? "" : value}
                        />
                        <Button<void>
                            className="btn btn-error btn-outline join-item"
                            onClick={() => {
                                const newValues = Array.from(currentValues);
                                newValues.splice(idx, 1);

                                setCurrentValues(newValues);
                            }}
                        >
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
                {detail && <p className="label">{detail}</p>}
            </div>
        </fieldset>
    );
});

export default ArrayField;
