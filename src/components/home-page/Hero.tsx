import { faAnglesDown, faBattery, faHeartPulse, faHourglassEnd, faLeaf, faPlug, faSignal, faSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { memo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";
import store2 from "store2";
import type { HomePageDataCounters, HomePageRecentActivityEntry } from "../../pages/HomePage.js";
import Button from "../Button.js";
import LastSeen from "../value-decorators/LastSeen.js";

export interface HeroProps extends HomePageDataCounters {
    lastActivity: HomePageRecentActivityEntry | undefined;
}

const SEARCH_AVAILABILITY_OFFLINE = [{ id: "availability", value: "Offline" }];
const SEARCH_TYPE_ROUTER = [{ id: "type", value: "Router" }];
const SEARCH_TYPE_END_DEVICE = [{ id: "type", value: "End device" }];
const SEARCH_TYPE_GREENPOWER = [{ id: "type", value: "GreenPower" }];
const SEARCH_LQI_LOW = [{ id: "lqi", value: [null, 50] }];
const SEARCH_LAST_SEEN_4H = [{ id: "last_seen", value: [240, null] }];

const Hero = memo(
    ({
        totalDevices,
        onlineDevices,
        disabledDevices,
        totalInstances,
        onlineInstances,
        routers,
        endDevices,
        gpDevices,
        lowLqiDevices,
        lastActivity,
    }: HeroProps) => {
        const navigate = useNavigate();
        const { t } = useTranslation(["common", "availability", "zigbee", "settings"]);
        const onQuickSearchClick = useCallback(
            (data: { id: string; value: unknown }[]) => {
                store2.set("table-filters_all-devices_columns", data);
                navigate("/devices", { replace: false });
            },
            [navigate],
        );

        return (
            <section className="card bg-base-100 w-full">
                <div className="card-body py-3">
                    <h2 className="card-title">{t(($) => $.overview)}</h2>
                    <div className="flex flex-row flex-wrap gap-y-3">
                        <div className="flex flex-row w-48 px-3 py-1 gap-4 border-dashed border-e border-current/25 last:border-e-0">
                            <div>
                                <div className="text-sm text-base-content/70">{t(($) => $.instances)}</div>
                                <div className={`font-semibold text-xl ${onlineInstances === totalInstances ? "" : "text-error"}`}>
                                    {onlineInstances} / {totalInstances}
                                </div>
                                {totalInstances > 0 && (
                                    <div className="text-xs text-base-content/50">
                                        {Math.round((onlineInstances / totalInstances) * 100)}% {t(($) => $.online, { ns: "availability" })}
                                    </div>
                                )}
                            </div>
                            <div className="self-center ml-auto text-primary">
                                <Link to="/settings/0/health" className="tooltip tooltip-bottom" data-tip={t(($) => $.health, { ns: "settings" })}>
                                    <FontAwesomeIcon icon={faHeartPulse} size="xl" />
                                </Link>
                            </div>
                        </div>
                        {lastActivity !== undefined && (
                            <div className="flex flex-row w-48 px-3 py-1 gap-4 border-dashed border-e border-current/25 last:border-e-0">
                                <div>
                                    <div className="text-sm text-base-content/70">{t(($) => $.last_activity)}</div>
                                    <div className="font-semibold text-xl">
                                        <LastSeen lastSeen={lastActivity.lastSeen} config={lastActivity.lastSeenConfig} />
                                    </div>
                                </div>
                                <div className="self-center ml-auto text-primary">
                                    <Button
                                        className="link tooltip tooltip-bottom"
                                        data-tip={`${t(($) => $.quick_search)}: ${t(($) => $.not_seen_in_a_while)}`}
                                        onClick={onQuickSearchClick}
                                        item={SEARCH_LAST_SEEN_4H}
                                    >
                                        <FontAwesomeIcon icon={faHourglassEnd} size="xl" />
                                    </Button>
                                </div>
                            </div>
                        )}
                        <div className="flex flex-row w-48 px-3 py-1 gap-4 border-dashed border-e border-current/25 last:border-e-0">
                            <div>
                                <div className="text-sm text-base-content/70">{t(($) => $.devices)}</div>
                                <div className="font-semibold text-xl">
                                    <span className={onlineDevices === totalDevices ? undefined : "text-error"}>
                                        {onlineDevices} / {totalDevices}
                                    </span>
                                    {disabledDevices > 0 && (
                                        <>
                                            {" "}
                                            <span className="text-sm text-base-content/75 tooltip tooltip-bottom" data-tip={t(($) => $.disabled)}>
                                                (+{disabledDevices})
                                            </span>
                                        </>
                                    )}
                                </div>
                                {totalDevices > 0 && (
                                    <div className="text-xs text-base-content/50">
                                        {Math.round((onlineDevices / totalDevices) * 100)}% {t(($) => $.online, { ns: "availability" })}
                                    </div>
                                )}
                            </div>
                            <div className="self-center ml-auto text-primary">
                                <Button
                                    className="link tooltip tooltip-bottom"
                                    data-tip={`${t(($) => $.quick_search)}: ${t(($) => $.offline, { ns: "availability" })}`}
                                    onClick={onQuickSearchClick}
                                    item={SEARCH_AVAILABILITY_OFFLINE}
                                >
                                    <span className="fa-layers fa-xl">
                                        <FontAwesomeIcon icon={faSignal} className="text-primary/60" />
                                        <FontAwesomeIcon icon={faSlash} transform="shrink-5 down-2 right-1" />
                                    </span>
                                </Button>
                            </div>
                        </div>
                        <div className="flex flex-row w-48 px-3 py-1 gap-4 border-dashed border-e border-current/25 last:border-e-0">
                            <div>
                                <div className="text-sm text-base-content/70">{t(($) => $.Router, { ns: "zigbee" })}</div>
                                <div className="font-semibold text-xl">{routers}</div>
                            </div>
                            <div className="self-center ml-auto text-primary">
                                <Button
                                    className="link tooltip tooltip-bottom"
                                    data-tip={`${t(($) => $.quick_search)}: ${t(($) => $.Router, { ns: "zigbee" })}`}
                                    onClick={onQuickSearchClick}
                                    item={SEARCH_TYPE_ROUTER}
                                >
                                    <FontAwesomeIcon icon={faPlug} size="xl" />
                                </Button>
                            </div>
                        </div>
                        <div className="flex flex-row w-48 px-3 py-1 gap-4 border-dashed border-e border-current/25 last:border-e-0">
                            <div>
                                <div className="text-sm text-base-content/70">{t(($) => $.EndDevice, { ns: "zigbee" })}</div>
                                <div className="font-semibold text-xl">{endDevices}</div>
                            </div>
                            <div className="self-center ml-auto text-primary">
                                <Button
                                    className="link tooltip tooltip-bottom"
                                    data-tip={`${t(($) => $.quick_search)}: ${t(($) => $.EndDevice, { ns: "zigbee" })}`}
                                    onClick={onQuickSearchClick}
                                    item={SEARCH_TYPE_END_DEVICE}
                                >
                                    <FontAwesomeIcon icon={faBattery} size="xl" />
                                </Button>
                            </div>
                        </div>
                        {gpDevices > 0 && (
                            <div className="flex flex-row w-48 px-3 py-1 gap-4 border-dashed border-e border-current/25 last:border-e-0">
                                <div>
                                    <div className="text-sm text-base-content/70">
                                        {t(($) => $.Router, { ns: "zigbee" })} - {t(($) => $.GreenPower, { ns: "zigbee" })}
                                    </div>
                                </div>
                                <div className="font-semibold text-xl">{gpDevices}</div>
                                <div className="self-center ml-auto text-primary">
                                    <Button
                                        className="link tooltip tooltip-bottom"
                                        data-tip={`${t(($) => $.quick_search)}: ${t(($) => $.GreenPower, { ns: "zigbee" })}`}
                                        onClick={onQuickSearchClick}
                                        item={SEARCH_TYPE_GREENPOWER}
                                    >
                                        <FontAwesomeIcon icon={faLeaf} size="xl" />
                                    </Button>
                                </div>
                            </div>
                        )}
                        {lowLqiDevices > 0 && (
                            <div className="flex flex-row w-48 px-3 py-1 gap-4 border-dashed border-e border-current/25 last:border-e-0">
                                <div>
                                    <div className="text-sm text-base-content/70">{t(($) => $.low_lqi, { ns: "zigbee" })}</div>
                                    <div className="font-semibold text-xl text-error">{lowLqiDevices}</div>
                                    <div className="text-xs text-base-content/50">{"< 50"}</div>
                                </div>
                                <div className="self-center ml-auto text-primary">
                                    <Button
                                        className="link tooltip tooltip-bottom"
                                        data-tip={`${t(($) => $.quick_search)}: ${t(($) => $.low_lqi, { ns: "zigbee" })}`}
                                        onClick={onQuickSearchClick}
                                        item={SEARCH_LQI_LOW}
                                    >
                                        <span className="fa-layers fa-xl">
                                            <FontAwesomeIcon icon={faSignal} className="text-primary/60" />
                                            <FontAwesomeIcon icon={faAnglesDown} transform="shrink-4 down-2" />
                                        </span>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        );
    },
);

export default Hero;
