import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type JSX, memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { useSearch } from "../../hooks/useSearch.js";
import type { TabName } from "../../pages/DevicePage.js";
import { API_URLS, useAppStore } from "../../store.js";
import type { Device } from "../../types.js";
import PopoverDropdown from "../PopoverDropdown.js";
import SourceDot from "../SourceDot.js";

interface HeaderDeviceSelectorProps {
    currentSourceIdx: number | undefined;
    currentDevice: Device | undefined;
    tab?: TabName;
}

const HeaderDeviceSelector = memo(({ currentSourceIdx, currentDevice, tab = "info" }: HeaderDeviceSelectorProps) => {
    const [searchTerm, normalizedSearchTerm, setSearchTerm] = useSearch();
    const { t } = useTranslation("common");
    const devices = useAppStore((state) => state.devices);

    const items = useMemo(() => {
        const elements: JSX.Element[] = [];

        for (let sourceIdx = 0; sourceIdx < API_URLS.length; sourceIdx++) {
            for (const device of devices[sourceIdx]) {
                if (device.type === "Coordinator" || (sourceIdx === currentSourceIdx && device.ieee_address === currentDevice?.ieee_address)) {
                    continue;
                }

                if (normalizedSearchTerm.length > 0 && !device.friendly_name.toLowerCase().includes(normalizedSearchTerm)) {
                    continue;
                }

                elements.push(
                    <li key={`${device.friendly_name}-${device.ieee_address}-${sourceIdx}`}>
                        <Link to={`/device/${sourceIdx}/${device.ieee_address}/${tab}`} onClick={() => setSearchTerm("")} className="dropdown-item">
                            {<SourceDot idx={sourceIdx} autoHide namePostfix=" - " />} {device.friendly_name}
                        </Link>
                    </li>,
                );
            }
        }

        elements.sort((elA, elB) => elA.key!.localeCompare(elB.key!));

        return elements;
    }, [devices, normalizedSearchTerm, currentSourceIdx, currentDevice, tab, setSearchTerm]);

    return (
        <PopoverDropdown
            name="header-device-selector"
            buttonChildren={
                <>
                    {currentSourceIdx !== undefined && <SourceDot idx={currentSourceIdx} autoHide />}
                    {currentDevice ? `${currentDevice.friendly_name} (${currentDevice.ieee_address})` : t("unknown_device")}
                </>
            }
            dropdownStyle="dropdown-start"
        >
            <label className="input" key="search">
                <FontAwesomeIcon icon={faMagnifyingGlass} />
                <input type="search" placeholder={t("type_to_filter")} onChange={(e) => setSearchTerm(e.target.value)} value={searchTerm} />
            </label>
            {items}
        </PopoverDropdown>
    );
});

export default HeaderDeviceSelector;
