import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { useAppStore } from "../../store.js";
import type { Device } from "../../types.js";
import SourceDot from "../SourceDot.js";

export interface ActivityProps {
    devices: Record<number, Device[]>;
    maxRows: number;
}

const Activity = memo(({ devices, maxRows }: ActivityProps) => {
    const { t } = useTranslation(["common", "availability"]);
    const recentActivityFeed = useAppStore((state) => state.recentActivityFeed);
    const placeholderRows = useMemo(() => [...new Array(Math.max(0, maxRows - recentActivityFeed.length))], [maxRows, recentActivityFeed.length]);

    return (
        <section className="card bg-base-100">
            <div className="card-body py-3">
                <h2 className="card-title">{t(($) => $.recent_activity)}</h2>
                <ul className={`grid grid-rows-${maxRows} gap-1 w-full`}>
                    {recentActivityFeed.map((entry, i) => {
                        let ieeeAddress: string | undefined = entry.ieeeAddress;

                        if (!ieeeAddress) {
                            const device = devices[entry.sourceIdx].find((d) => d.friendly_name === entry.friendlyName);
                            ieeeAddress = device?.ieee_address;
                        }

                        return (
                            <li
                                key={`${entry.friendlyName}-${entry.sourceIdx}-${entry.activity}-${entry.time}-${i}`}
                                className="flex flex-row gap-1 items-center w-full px-1 rounded-field hover:bg-base-200"
                            >
                                <div className="text-xs font-semibold opacity-60 min-w-0 flex-1">
                                    <SourceDot idx={entry.sourceIdx} autoHide namePostfix=" –" className="me-1" />
                                    {ieeeAddress ? (
                                        <Link
                                            to={`/device/${entry.sourceIdx}/${ieeeAddress}/info`}
                                            className="link link-hover font-semibold truncate"
                                        >
                                            {entry.friendlyName}
                                        </Link>
                                    ) : (
                                        <span className="font-semibold truncate">{entry.friendlyName}</span>
                                    )}
                                    <span className="text-xs text-base-content/60 truncate">— {entry.activity}</span>
                                </div>
                                <div>
                                    <p className="text-xs text-base-content/60">{entry.time}</p>
                                </div>
                            </li>
                        );
                    })}
                    {placeholderRows.map((_v, i) => (
                        /** biome-ignore lint/suspicious/noArrayIndexKey: placeholders */
                        <li key={`placeholder-${i}`} className="flex flex-row gap-3 items-center">
                            <div className="w-full font-semibold text-xs text-base-content/0">-</div>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
});

export default Activity;
