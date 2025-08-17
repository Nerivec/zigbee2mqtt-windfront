import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type JSX, memo, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
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
    const [searchTerm, setSearchTerm] = useState<string>("");
    const { t } = useTranslation("common");
    const devices = useAppStore((state) => state.devices);

    const items = useMemo(() => {
        const elements: JSX.Element[] = [];

        for (let sourceIdx = 0; sourceIdx < API_URLS.length; sourceIdx++) {
            for (const device of devices[sourceIdx]) {
                if (
                    device.type !== "Coordinator" &&
                    device.friendly_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                    (sourceIdx !== currentSourceIdx || device.ieee_address !== currentDevice?.ieee_address)
                ) {
                    elements.push(
                        <li key={`${sourceIdx}-${device.ieee_address}-${device.friendly_name}`}>
                            <Link
                                to={`/device/${sourceIdx}/${device.ieee_address}/${tab}`}
                                onClick={() => setSearchTerm("")}
                                className="dropdown-item"
                            >
                                {API_URLS.length > 1 && <SourceDot idx={sourceIdx} />} {device.friendly_name}
                            </Link>
                        </li>,
                    );
                }
            }
        }
        return elements;
    }, [devices, searchTerm, currentSourceIdx, currentDevice, tab]);

    return (
        <PopoverDropdown
            name="header-device-selector"
            buttonChildren={
                <>
                    {API_URLS.length > 1 && currentSourceIdx !== undefined && <SourceDot idx={currentSourceIdx} />}
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
