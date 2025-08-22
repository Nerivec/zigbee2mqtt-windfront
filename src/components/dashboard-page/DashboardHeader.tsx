import { faClose, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type Dispatch, memo, type SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import { API_URLS } from "../../store.js";
import Button from "../Button.js";
import DebouncedInput from "../form-fields/DebouncedInput.js";
import SourceSwitcher from "../SourceSwitcher.js";

interface DashboardHeaderProps {
    searchTerm: string;
    setSearchTerm: Dispatch<SetStateAction<string>>;
    showRouters: boolean;
    setShowRouters: Dispatch<SetStateAction<boolean>>;
    showEndDevices: boolean;
    setShowEndDevices: Dispatch<SetStateAction<boolean>>;
    selectedType: string;
    setSelectedType: Dispatch<SetStateAction<string>>;
    selectedProperty: string;
    setSelectedProperty: Dispatch<SetStateAction<string>>;
    sourceFilter: string;
    setSourceFilter: Dispatch<SetStateAction<string>>;
}

const DashboardHeader = memo(
    ({
        searchTerm,
        setSearchTerm,
        showRouters,
        setShowRouters,
        showEndDevices,
        setShowEndDevices,
        selectedType,
        setSelectedType,
        selectedProperty,
        setSelectedProperty,
        sourceFilter,
        setSourceFilter,
    }: DashboardHeaderProps) => {
        const { t } = useTranslation("common");

        return (
            <div className="flex flex-row flex-wrap justify-center items-center gap-3 mb-3 text-sm">
                <div className="join">
                    {/* biome-ignore lint/a11y/noLabelWithoutControl: wrapped input */}
                    <label className="input join-item">
                        <FontAwesomeIcon icon={faMagnifyingGlass} />
                        <DebouncedInput onChange={setSearchTerm} placeholder={t("search")} value={searchTerm} />
                    </label>
                    <Button item="" onClick={setSearchTerm} className="btn btn-square join-item" title={t("clear")}>
                        <FontAwesomeIcon icon={faClose} />
                    </Button>
                </div>
                <label className="label">
                    <input
                        type="checkbox"
                        className="checkbox checkbox-sm"
                        checked={showRouters}
                        onChange={(e) => setShowRouters(e.target.checked)}
                    />
                    {t("show_routers")}
                </label>
                <label className="label">
                    <input
                        type="checkbox"
                        className="checkbox checkbox-sm"
                        checked={showEndDevices}
                        onChange={(e) => setShowEndDevices(e.target.checked)}
                    />
                    {t("show_end_devices")}
                </label>
                <select className="select w-auto" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                    <option value="">{t("all_features")}</option>
                    <option value="climate">Climate</option>
                    <option value="cover">Cover</option>
                    <option value="fan">Fan</option>
                    <option value="light">Light</option>
                    <option value="lock">Lock</option>
                    <option value="switch">Switch</option>
                </select>
                <select className="select w-auto" value={selectedProperty} onChange={(e) => setSelectedProperty(e.target.value)}>
                    <option value="">{t("all_properties")}</option>
                    <option value="action">Action</option>
                    <option value="alarm">Alarm</option>
                    <option value="contact">Contact</option>
                    <option value="child_lock">Child Lock</option>
                    <option value="energy">Energy</option>
                    <option value="flow">Flow</option>
                    <option value="humidity">Humidity</option>
                    <option value="illuminance">Illuminance</option>
                    <option value="occupancy">Occupancy</option>
                    <option value="power">Power</option>
                    <option value="presence">Presence</option>
                    <option value="smoke">Smoke</option>
                    <option value="sound">Sound</option>
                    <option value="tamper">Tamper</option>
                    <option value="temperature">Temperature</option>
                    <option value="vibration">Vibration</option>
                    <option value="water_leak">Water Leak</option>
                </select>
                {API_URLS.length > 1 && <SourceSwitcher currentValue={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} />}
            </div>
        );
    },
);

export default DashboardHeader;
