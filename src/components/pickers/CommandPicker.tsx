import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import Select, { type SingleValue } from "react-select";
import { useShallow } from "zustand/react/shallow";
import { REACT_SELECT_DEFAULT_CLASSNAMES } from "../../consts.js";
import { useAppStore } from "../../store.js";
import type { BaseSelectOption, CommandDefinition, Device } from "../../types.js";
import { getClusterCommands } from "../pickers/index.js";

interface CommandPickerProps {
    sourceIdx: number;
    cluster: string;
    device: Device;
    value: string | number;
    label?: string;
    required?: boolean;
    disabled?: boolean;
    onChange: (command: string, definition: CommandDefinition) => void;
}

const CommandPicker = memo(({ sourceIdx, cluster, device, onChange, value, label, required, disabled }: CommandPickerProps) => {
    const bridgeDefinitions = useAppStore(useShallow((state) => state.bridgeDefinitions[sourceIdx]));
    const { t } = useTranslation("zigbee");

    // retrieve cluster commands, priority to device custom if any, then ZH
    const clusterCommands = useMemo(
        () => getClusterCommands(bridgeDefinitions, device.ieee_address, cluster),
        [bridgeDefinitions, device.ieee_address, cluster],
    );

    const options = useMemo(() => {
        const cmds: BaseSelectOption[] = [];

        for (const key in clusterCommands) {
            cmds.push({ value: key, label: key });
        }

        return cmds;
    }, [clusterCommands]);

    const selected = useMemo<SingleValue<BaseSelectOption>>(
        () => (value == null || value === "" ? null : (options.find((o) => o.value === value) ?? null)),
        [value, options],
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
                placeholder={t(($) => $.select_command)}
                aria-label={label ?? t(($) => $.select_command)}
                options={options}
                value={selected}
                isSearchable
                isDisabled={disabled}
                onChange={(option) => {
                    if (option != null) {
                        onChange(option.value, clusterCommands[option.value]);
                    }
                }}
                className="min-w-64"
                classNames={REACT_SELECT_DEFAULT_CLASSNAMES}
            />
        </fieldset>
    );
});

export default CommandPicker;
