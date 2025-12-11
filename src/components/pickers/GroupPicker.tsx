import { memo, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import Select, { type SingleValue } from "react-select";
import { REACT_SELECT_DEFAULT_CLASSNAMES } from "../../consts.js";
import type { AppState } from "../../store.js";
import type { BaseSelectOption, Group } from "../../types.js";

interface GroupPickerProps {
    groups: AppState["groups"][number];
    label?: string;
    required?: boolean;
    disabled?: boolean;
    onChange(group?: Group): void;
}

const GroupPicker = memo(({ groups, label, required, disabled, onChange }: GroupPickerProps) => {
    const { t } = useTranslation("common");

    const onSelectHandler = useCallback(
        (option: SingleValue<BaseSelectOption>): void => {
            if (option) {
                const selectedId = Number.parseInt(option.value, 10);

                onChange(groups.find((g) => selectedId === g.id));
            }
        },
        [groups, onChange],
    );

    const options = useMemo(
        (): BaseSelectOption[] =>
            groups.map((group) => ({ value: `${group.id}`, label: group.friendly_name })).sort((elA, elB) => elA.label!.localeCompare(elB.label!)),
        [groups],
    );

    return (
        <fieldset className="fieldset">
            {label && (
                <legend className="fieldset-legend">
                    {label}
                    {required ? " *" : ""}
                </legend>
            )}
            <Select
                unstyled
                placeholder={t(($) => $.select_group)}
                aria-label={label ?? t(($) => $.select_group)}
                options={options}
                isSearchable
                isDisabled={disabled}
                onChange={onSelectHandler}
                className="min-w-96"
                classNames={REACT_SELECT_DEFAULT_CLASSNAMES}
            />
        </fieldset>
    );
});

export default GroupPicker;
