import { memo, type ReactNode, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import Select, { type SingleValue } from "react-select";
import { REACT_SELECT_DEFAULT_CLASSNAMES } from "../../consts.js";
import type { TabName } from "../../pages/DevicePage.js";
import { API_URLS, useAppStore } from "../../store.js";
import type { BaseSelectOption, Device } from "../../types.js";
import SourceDot from "../SourceDot.js";

interface HeaderDeviceSelectorProps {
    currentSourceIdx: number | undefined;
    currentDevice: Device | undefined;
    tab?: TabName;
}

interface SelectOption extends BaseSelectOption<ReactNode> {
    name: string;
    link: string;
}

const HeaderDeviceSelector = memo(({ currentSourceIdx, currentDevice, tab = "info" }: HeaderDeviceSelectorProps) => {
    const { t } = useTranslation("common");
    const devices = useAppStore((state) => state.devices);
    const navigate = useNavigate();

    const onSelectHandler = useCallback(
        (option: SingleValue<SelectOption>) => {
            if (option) {
                navigate(option.link);
            }
        },
        [navigate],
    );

    const options = useMemo(() => {
        const elements: SelectOption[] = [];

        for (let sourceIdx = 0; sourceIdx < API_URLS.length; sourceIdx++) {
            for (const device of devices[sourceIdx]) {
                if (device.type === "Coordinator" || (sourceIdx === currentSourceIdx && device.ieee_address === currentDevice?.ieee_address)) {
                    continue;
                }

                elements.push({
                    value: device.friendly_name,
                    label: (
                        <>
                            <SourceDot idx={sourceIdx} autoHide namePostfix=" – " /> {device.friendly_name}
                        </>
                    ),
                    name: `${sourceIdx} ${device.friendly_name}`,
                    link: `/device/${sourceIdx}/${device.ieee_address}/${tab}`,
                });
            }
        }

        elements.sort((elA, elB) => elA.name.localeCompare(elB.name));

        return elements;
    }, [devices, currentSourceIdx, currentDevice, tab]);

    return (
        <Select
            unstyled
            placeholder={
                currentDevice && currentSourceIdx !== undefined ? (
                    <>
                        <SourceDot idx={currentSourceIdx} autoHide namePostfix=" – " /> {currentDevice.friendly_name}
                    </>
                ) : (
                    t(($) => $.select_device)
                )
            }
            aria-label={t(($) => $.select_device)}
            options={options}
            isSearchable
            onChange={onSelectHandler}
            className="min-w-48 me-2"
            classNames={REACT_SELECT_DEFAULT_CLASSNAMES}
        />
    );
});

export default HeaderDeviceSelector;
