import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import type { HomePageActivityEntry } from "../../pages/HomePage.js";
import LastSeen from "../value-decorators/LastSeen.js";

export interface ActivityProps {
    entries: HomePageActivityEntry[];
    recent: boolean;
    maxRows: number;
}

const Activity = memo(({ entries, recent, maxRows }: ActivityProps) => {
    const { t } = useTranslation(["common", "availability"]);
    const placeholderRows = useMemo(() => [...new Array(Math.max(0, maxRows - entries.length))], [maxRows, entries.length]);

    return (
        <section className="card bg-base-100">
            <div className="card-body py-3">
                <h2 className="card-title">{t(($) => (recent ? $.recent_activity : $.oldest_activity))}</h2>
                <ul className={`grid grid-rows-${maxRows} gap-1`}>
                    {entries.map((entry) => (
                        <li key={`${entry.device.ieee_address}-${entry.sourceIdx}`} className="flex flex-row gap-2 items-center min-w-0">
                            <div className="text-xs uppercase font-semibold opacity-60">
                                <LastSeen lastSeen={entry.lastSeen} config={entry.lastSeenConfig} />
                            </div>
                            <Link
                                to={`/device/${entry.sourceIdx}/${entry.device.ieee_address}/info`}
                                className="link link-hover font-semibold truncate grow"
                            >
                                {entry.device.friendly_name}
                            </Link>
                            <div
                                className={`text-xs uppercase font-semibold opacity-60 tooltip tooltip-left ${entry.availability === "online" ? "text-success" : "text-error"}`}
                                data-tip={t(($) => $.availability, { ns: "availability" })}
                            >
                                {entry.availability}
                            </div>
                        </li>
                    ))}
                    {placeholderRows.map((_v, i) => (
                        /** biome-ignore lint/suspicious/noArrayIndexKey: placeholders */
                        <li key={`placeholder-${i}`} className="flex flex-row gap-2 items-center min-w-0">
                            <div className="skeleton w-full font-semibold text-base-content/0">-</div>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
});

export default Activity;
