import { type ChangeEvent, type DetailedHTMLProps, type InputHTMLAttributes, memo, useCallback, useMemo } from "react";

export interface ClusterMultiPickerProps extends Omit<DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, "onChange"> {
    label?: string;
    clusters: Set<string>;
    value: string[];
    onChange(clusters: string[] | undefined): void;
}

const ClusterMultiPicker = memo((props: ClusterMultiPickerProps) => {
    const { clusters, onChange, label, value, disabled } = props;

    const onChangeHandler = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const { checked: isChecked, name } = e.target;
            let newVal = [...value];

            if (isChecked) {
                newVal.push(name);
            } else {
                newVal = newVal.filter((v) => v !== name);
            }

            onChange(newVal);
        },
        [onChange, value],
    );

    const options = useMemo(
        () =>
            Array.from(clusters)
                .sort((a, b) => a.toString().localeCompare(b.toString()))
                .map((cluster) => (
                    <label key={cluster} className="label" title={cluster}>
                        <input
                            className="checkbox checkbox-sm"
                            type="checkbox"
                            checked={value.includes(cluster)}
                            name={cluster}
                            value={cluster}
                            onChange={onChangeHandler}
                            disabled={disabled}
                        />
                        {cluster}
                    </label>
                )),
        [clusters, onChangeHandler, value, disabled],
    );

    return (
        <fieldset className="fieldset">
            {label && <legend className="fieldset-legend">{label}</legend>}
            <div className="flex flex-row flex-wrap gap-2">{options}</div>
        </fieldset>
    );
});

export default ClusterMultiPicker;
