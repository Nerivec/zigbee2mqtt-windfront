import { type ChangeEvent, type JSX, memo, type SelectHTMLAttributes, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { AppState } from "../../store.js";
import type { Group } from "../../types.js";
import SelectField from "../form-fields/SelectField.js";

interface GroupPickerProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
    groups: AppState["groups"][number];
    value: string | number;
    label?: string;
    onChange(group?: Group): void;
}

const GroupPicker = memo(({ groups, value, label, onChange, ...rest }: GroupPickerProps) => {
    const { t } = useTranslation("common");

    const onSelectHandler = useCallback(
        (e: ChangeEvent<HTMLSelectElement>): void => {
            const { value: selectedValue } = e.target;

            const selectedId = Number.parseInt(selectedValue, 10);

            onChange(groups.find((g) => selectedId === g.id));
        },
        [groups, onChange],
    );

    const options = useMemo(() => {
        const options: JSX.Element[] = [];

        for (const group of groups) {
            options.push(
                <option key={group.id} value={group.id}>
                    {group.friendly_name}
                </option>,
            );
        }

        return options;
    }, [groups]);

    return (
        <SelectField name="group_picker" label={label} value={value} onChange={onSelectHandler} {...rest}>
            <option value="" disabled>
                {t(($) => $.select_group)}
            </option>
            {options}
        </SelectField>
    );
});

export default GroupPicker;
