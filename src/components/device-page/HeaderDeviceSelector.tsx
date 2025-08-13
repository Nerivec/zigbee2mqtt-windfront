import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { memo, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import type { TabName } from "../../pages/DevicePage.js";
import type { AppState } from "../../store.js";
import type { Device } from "../../types.js";
import PopoverDropdown from "../PopoverDropdown.js";

interface HeaderDeviceSelectorProps {
    devices: AppState["devices"];
    currentDevice: Device | undefined;
    tab?: TabName;
}

const HeaderDeviceSelector = memo(({ devices, currentDevice, tab = "info" }: HeaderDeviceSelectorProps) => {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const { t } = useTranslation("common");
    const items = useMemo(
        () =>
            devices
                .filter(
                    (device) =>
                        device.type !== "Coordinator" &&
                        device.friendly_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                        device.ieee_address !== currentDevice?.ieee_address,
                )
                .map((device) => (
                    <li key={device.ieee_address}>
                        <Link to={`/device/${device.ieee_address}/${tab}`} onClick={() => setSearchTerm("")} className="dropdown-item">
                            {device.friendly_name}
                        </Link>
                    </li>
                )),
        [devices, currentDevice, searchTerm, tab],
    );

    return (
        <PopoverDropdown
            name="header-device-selector"
            buttonChildren={`${currentDevice ? `${currentDevice.friendly_name} (${currentDevice.ieee_address})` : t("unknown_device")}`}
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
