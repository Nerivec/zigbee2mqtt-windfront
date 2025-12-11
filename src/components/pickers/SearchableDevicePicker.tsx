import { faAngleDown, faMagnifyingGlass, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type JSX, memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { AppState } from "../../store.js";
import type { Device, Group } from "../../types.js";

interface DevicePickerProps {
    devices: AppState["devices"][number];
    value: string | number;
    label?: string;
    groups?: Group[];
    disabled?: boolean;
    onChange(device?: Device | Group): void;
}

const SearchableDevicePicker = memo(({ devices, value, label, onChange, groups = [], disabled }: DevicePickerProps) => {
    const { t } = useTranslation("common");
    const [searchTerm, setSearchTerm] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    const selectedName = useMemo(() => {
        if (typeof value === "string" && value) {
            const device = devices.find((device) => device.ieee_address === value);

            return device?.friendly_name ?? "";
        }

        if (typeof value === "number") {
            const group = groups.find((g) => value === g.id);

            return group?.friendly_name ?? "";
        }

        return "";
    }, [value, devices, groups]);

    const onSelectDevice = useCallback(
        (device: Device) => {
            setSearchTerm("");
            setIsOpen(false);
            onChange(device);
        },
        [onChange],
    );

    const onSelectGroup = useCallback(
        (group: Group) => {
            setSearchTerm("");
            setIsOpen(false);
            onChange(group);
        },
        [onChange],
    );

    const onInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setSearchTerm(e.target.value);

            if (!isOpen) {
                setIsOpen(true);
            }
        },
        [isOpen],
    );

    const onInputFocus = useCallback(() => {
        setIsOpen(true);
    }, []);

    const onInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Escape") {
            e.preventDefault();
            setSearchTerm("");
            setIsOpen(false);
        }
    }, []);

    const onClearClick = useCallback(() => {
        setSearchTerm("");
        inputRef.current?.focus();
    }, []);

    const onToggleClick = useCallback(() => {
        setIsOpen((prev) => !prev);

        if (!isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: Event) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const items = useMemo(() => {
        const elements: JSX.Element[] = [];

        const devicesItems = devices
            .filter(
                (device) =>
                    normalizedSearchTerm.length === 0 ||
                    device.friendly_name.toLowerCase().includes(normalizedSearchTerm) ||
                    device.definition?.model?.toLowerCase().includes(normalizedSearchTerm) ||
                    device.ieee_address.toLowerCase().includes(normalizedSearchTerm),
            )
            .map((device) => (
                <li key={`device-${device.ieee_address}`}>
                    <button
                        type="button"
                        onClick={() => onSelectDevice(device)}
                        title={device.definition?.description}
                        className={value === device.ieee_address ? "active" : ""}
                    >
                        {device.friendly_name} {device.definition?.model ? `(${device.definition?.model})` : ""}
                    </button>
                </li>
            ))
            .sort((elA, elB) => elA.key!.localeCompare(elB.key!));

        if (groups?.length) {
            const groupItems = groups
                .filter((group) => normalizedSearchTerm.length === 0 || group.friendly_name.toLowerCase().includes(normalizedSearchTerm))
                .map((group) => (
                    <li key={`group-${group.id}`}>
                        <button type="button" onClick={() => onSelectGroup(group)} className={value === group.id ? "active" : ""}>
                            {group.friendly_name}
                        </button>
                    </li>
                ))
                .sort((elA, elB) => elA.key!.localeCompare(elB.key!));

            if (groupItems.length > 0) {
                elements.push(
                    <li key="groups-header" className="menu-title">
                        {t(($) => $.groups)}
                    </li>,
                );
                elements.push(...groupItems);
            }

            if (devicesItems.length > 0) {
                elements.push(
                    <li key="devices-header" className="menu-title">
                        {t(($) => $.devices)}
                    </li>,
                );
                elements.push(...devicesItems);
            }
        } else {
            elements.push(...devicesItems);
        }

        return elements;
    }, [devices, groups, normalizedSearchTerm, t, value, onSelectDevice, onSelectGroup]);

    return (
        <fieldset className="fieldset">
            {label && <legend className="fieldset-legend">{label}</legend>}
            <div ref={containerRef} className="relative w-96">
                <label className="input w-full flex items-center gap-2">
                    <FontAwesomeIcon icon={faMagnifyingGlass} className="opacity-50" />
                    <input
                        ref={inputRef}
                        type="text"
                        className="grow min-w-0"
                        placeholder={selectedName || t(($) => $.select_device)}
                        value={searchTerm}
                        onChange={onInputChange}
                        onFocus={onInputFocus}
                        onKeyDown={onInputKeyDown}
                        disabled={disabled}
                    />
                    {searchTerm && (
                        <button type="button" onClick={onClearClick} className="btn btn-ghost btn-xs btn-circle">
                            <FontAwesomeIcon icon={faXmark} />
                        </button>
                    )}
                    <button type="button" onClick={onToggleClick} className="btn btn-ghost btn-xs btn-circle" disabled={disabled}>
                        <FontAwesomeIcon icon={faAngleDown} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                </label>
                {isOpen && (
                    <ul
                        className="menu menu-vertical bg-base-200 rounded-box w-full mt-1 max-h-64 overflow-y-auto overflow-x-hidden absolute z-50 shadow-lg flex-nowrap"
                        style={{ scrollbarWidth: "thin" }}
                    >
                        {items.length > 0 ? items : <li className="p-2 text-base-content/60">{t(($) => $.no_results)}</li>}
                    </ul>
                )}
            </div>
        </fieldset>
    );
});

export default SearchableDevicePicker;
