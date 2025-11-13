import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import type { HomePageRecentActivityEntry } from "../../pages/HomePage.js";
import LastSeen from "../value-decorators/LastSeen.js";

export interface RecentActivityProps {
    entries: HomePageRecentActivityEntry[];
}

const RecentActivity = memo(({ entries }: RecentActivityProps) => {
    const { t } = useTranslation(["common", "availability"]);

    return (
        <section className="card bg-base-100">
            <div className="card-body py-3">
                <h2 className="card-title">{t(($) => $.recent_activity)}</h2>
                <ul className="list bg-base-100">
                    {entries.map((entry) => (
                        <li key={entry.device.friendly_name} className="list-row items-center p-2 min-w-0">
                            <div className="text-xs uppercase font-semibold opacity-60">
                                <LastSeen lastSeen={entry.lastSeen} config={entry.lastSeenConfig} />
                            </div>
                            <Link
                                to={`/device/${entry.sourceIdx}/${entry.device.ieee_address}/info`}
                                className="link link-hover font-semibold truncate"
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
                </ul>
            </div>
        </section>
    );
});

export default RecentActivity;
