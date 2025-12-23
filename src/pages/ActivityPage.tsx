import { faArrowRightLong, faClose, faMagnifyingGlass, faMarker } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type JSX, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import Button from "../components/Button.js";
import DeviceImage from "../components/device/DeviceImage.js";
import DebouncedInput from "../components/form-fields/DebouncedInput.js";
import SourceDot from "../components/SourceDot.js";
import { useSearch } from "../hooks/useSearch.js";
import { NavBarContent } from "../layout/NavBarContext.js";
import { API_URLS, type RecentActivityEntry, useAppStore } from "../store.js";
import type { Device } from "../types.js";

export default function ActivityPage(): JSX.Element {
    const { t } = useTranslation("common");
    const devices = useAppStore((state) => state.devices);
    const recentActivity = useAppStore((state) => state.recentActivity);
    const [searchTerm, normalizedSearchTerm, setSearchTerm] = useSearch();
    const [highlightValue, normalizedHighlightValue, setHighlightValue] = useSearch();

    const data = useMemo(() => {
        const elements: { sourceIdx: number; device: Device; activity: RecentActivityEntry; highlighted: boolean }[] = [];

        for (let sourceIdx = 0; sourceIdx < API_URLS.length; sourceIdx++) {
            const sourceEntries = recentActivity[sourceIdx];
            const sourceDevices = devices[sourceIdx];

            for (const key in sourceEntries) {
                const device = sourceDevices.find((d) => d.friendly_name === key);

                if (
                    device !== undefined &&
                    (normalizedSearchTerm.length === 0 || device.friendly_name.toLowerCase().includes(normalizedSearchTerm))
                ) {
                    elements.push({
                        sourceIdx,
                        device,
                        activity: sourceEntries[key],
                        highlighted: normalizedHighlightValue.length > 0 && device.friendly_name.toLowerCase().includes(normalizedHighlightValue),
                    });
                }
            }
        }

        elements.sort((elA, elB) => elB.activity.timestamp - elA.activity.timestamp);

        return elements;
    }, [recentActivity, devices, normalizedSearchTerm, normalizedHighlightValue]);

    return (
        <>
            <NavBarContent>
                <div className="join">
                    <label className="input input-sm join-item">
                        <FontAwesomeIcon icon={faMagnifyingGlass} />
                        <DebouncedInput
                            onChange={setSearchTerm}
                            placeholder={t(($) => $.search, { ns: "common" })}
                            value={searchTerm}
                            disabled={data.length === 0}
                        />
                    </label>
                    <Button
                        item=""
                        onClick={setSearchTerm}
                        className="btn btn-sm btn-square btn-warning btn-outline join-item"
                        title={t(($) => $.clear, { ns: "common" })}
                        disabled={searchTerm.length === 0}
                    >
                        <FontAwesomeIcon icon={faClose} />
                    </Button>
                </div>
                <div className="join me-1">
                    <label className="input input-sm join-item">
                        <FontAwesomeIcon icon={faMarker} />
                        <DebouncedInput
                            onChange={setHighlightValue}
                            placeholder={t(($) => $.highlight, { ns: "common" })}
                            value={highlightValue}
                            disabled={data.length === 0}
                        />
                    </label>
                    <Button
                        item=""
                        onClick={setHighlightValue}
                        className="btn btn-sm btn-square btn-warning btn-outline join-item"
                        title={t(($) => $.clear, { ns: "common" })}
                        disabled={highlightValue === ""}
                    >
                        <FontAwesomeIcon icon={faClose} />
                    </Button>
                </div>
            </NavBarContent>

            <div className="flex flex-col mb-5">
                <ul className="list bg-base-100">
                    {data.map((entry) => (
                        <li
                            key={`${entry.device.friendly_name}-${entry.sourceIdx}-${entry.activity}`}
                            className={`list-row p-2 ${entry.highlighted ? "bg-accent text-accent-content" : ""}`}
                        >
                            <div className="size-10">
                                <DeviceImage device={entry.device} disabled={entry.device.disabled} noIndicator />
                            </div>
                            <div className="min-w-0">
                                <div className="min-w-0">
                                    <SourceDot idx={entry.sourceIdx} autoHide namePostfix=" –" className="me-1" />
                                    <Link
                                        to={`/device/${entry.sourceIdx}/${entry.device.ieee_address}/info`}
                                        className="link link-hover font-semibold truncate"
                                    >
                                        {entry.device.friendly_name}
                                    </Link>
                                </div>
                                <div className="text-xs font-semibold min-w-0">
                                    <p className="text-xs text-base-content/70 truncate">
                                        [{new Date(entry.activity.timestamp).toLocaleString()}] {entry.activity.desc}
                                    </p>
                                </div>
                            </div>
                            <Link to={`/device/${entry.sourceIdx}/${entry.device.ieee_address}/info`} className="btn btn-square btn-ghost">
                                <FontAwesomeIcon icon={faArrowRightLong} />
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
}
