import { faAnglesDown, faBan, faBattery, faHeartPulse, faLeaf, faPlug, faSignal, faSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { memo, type SetStateAction, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import type { HomePageDataCounters } from "../../pages/HomePage.js";
import { MULTI_INSTANCE } from "../../store.js";
import Button from "../Button.js";
import { QuickFilter } from "./index.js";

export interface HeroProps extends HomePageDataCounters {
    setQuickFilter: (value: SetStateAction<readonly [QuickFilter, unknown] | null>) => void;
    quickFilter: readonly [QuickFilter, unknown] | null;
}

const SEARCH_DISABLED = [QuickFilter.Disabled, true] as const;
const SEARCH_AVAILABILITY_OFFLINE = [QuickFilter.Availability, "offline"] as const;
const SEARCH_TYPE_ROUTER = [QuickFilter.Type, "Router"] as const;
const SEARCH_TYPE_END_DEVICE = [QuickFilter.Type, "EndDevice"] as const;
const SEARCH_TYPE_GREENPOWER = [QuickFilter.Type, "GreenPower"] as const;
const SEARCH_LQI_LOW = [QuickFilter.Lqi, 50] as const;

const Hero = memo(
    ({
        totalDevices,
        onlineDevices,
        maybeOnlineDevices,
        disabledDevices,
        anyAvailabilityEnabled,
        totalInstances,
        onlineInstances,
        routers,
        endDevices,
        gpDevices,
        lowLqiDevices,
        setQuickFilter,
        quickFilter,
    }: HeroProps) => {
        const { t } = useTranslation(["common", "availability", "zigbee", "settings"]);
        const onFilterClick = useCallback(
            (data) => {
                if (data[0] === QuickFilter.Type) {
                    setQuickFilter(quickFilter?.[0] === data[0] && quickFilter?.[1] === data[1] ? null : data);
                } else {
                    setQuickFilter(quickFilter?.[0] === data[0] ? null : data);
                }
            },
            [setQuickFilter, quickFilter],
        );

        return (
            <section className="card bg-base-100 w-full">
                <div className="card-body py-3">
                    <h2 className="card-title">{t(($) => $.overview)}</h2>
                    <div className="flex flex-row flex-wrap justify-center gap-y-3">
                        {MULTI_INSTANCE ? (
                            <div className="flex flex-row w-48 px-3 py-1 gap-4 justify-center justify-center border-dashed border-s border-e border-current/25">
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
                                <div className="self-center">
                                    <Link
                                        to="/settings/0/health"
                                        className="link text-primary tooltip tooltip-bottom"
                                        data-tip={t(($) => $.health, { ns: "settings" })}
                                    >
                                        <FontAwesomeIcon icon={faHeartPulse} size="xl" />
                                    </Link>
                                </div>
                            </div>
                        ) : null}
                        <div className="flex flex-row w-48 px-3 py-1 gap-4 justify-center border-dashed border-s border-e border-current/25">
                            <div>
                                <div className="text-sm text-base-content/70">{t(($) => $.devices)}</div>
                                <div className="font-semibold text-xl">{totalDevices}</div>
                                {disabledDevices > 0 && (
                                    <span className="text-sm text-xs text-base-content/50">
                                        +{disabledDevices} {t(($) => $.disabled)}
                                    </span>
                                )}
                            </div>
                            <div className="self-center">
                                <Button
                                    className={`link tooltip tooltip-bottom ${quickFilter?.[0] === SEARCH_DISABLED[0] ? "text-accent/80" : "text-primary/80"}`}
                                    data-tip={`${t(($) => $.quick_search)}: ${t(($) => $.disabled, { ns: "common" })}`}
                                    onClick={onFilterClick}
                                    item={SEARCH_DISABLED}
                                >
                                    <FontAwesomeIcon icon={faBan} size="xl" />
                                </Button>
                            </div>
                        </div>
                        {anyAvailabilityEnabled ? (
                            <div className="flex flex-row w-48 px-3 py-1 gap-4 justify-center border-dashed border-s border-e border-current/25">
                                <div>
                                    <div className="text-sm text-base-content/70">{t(($) => $.online, { ns: "availability" })}</div>
                                    <div className="font-semibold text-xl">
                                        <span className={onlineDevices === totalDevices ? undefined : "text-error"}>{onlineDevices}</span>
                                    </div>
                                    {maybeOnlineDevices > 0 && disabledDevices > 0 && (
                                        <span className="text-sm text-xs text-base-content/50">
                                            +{maybeOnlineDevices} {t(($) => $.unknown, { ns: "zigbee" })}
                                        </span>
                                    )}
                                </div>
                                <div className="self-center">
                                    <Button
                                        className={`link tooltip tooltip-bottom ${quickFilter?.[0] === SEARCH_AVAILABILITY_OFFLINE[0] ? "text-accent" : "text-primary"}`}
                                        data-tip={`${t(($) => $.quick_search)}: ${t(($) => $.offline, { ns: "availability" })}`}
                                        onClick={onFilterClick}
                                        item={SEARCH_AVAILABILITY_OFFLINE}
                                    >
                                        <span className="fa-layers fa-xl">
                                            <FontAwesomeIcon
                                                icon={faSignal}
                                                className={`${quickFilter?.[0] === SEARCH_AVAILABILITY_OFFLINE[0] ? "text-accent/70" : "text-primary/70"}`}
                                            />
                                            <FontAwesomeIcon icon={faSlash} transform="shrink-5 down-2 right-1" />
                                        </span>
                                    </Button>
                                </div>
                            </div>
                        ) : null}
                        <div className="flex flex-row w-48 px-3 py-1 gap-4 justify-center border-dashed border-s border-e border-current/25">
                            <div>
                                <div className="text-sm text-base-content/70">{t(($) => $.Router, { ns: "zigbee" })}</div>
                                <div className="font-semibold text-xl">{routers}</div>
                            </div>
                            <div className="self-center">
                                <Button
                                    className={`link tooltip tooltip-bottom ${quickFilter?.[0] === SEARCH_TYPE_ROUTER[0] && quickFilter[1] === SEARCH_TYPE_ROUTER[1] ? "text-accent/80" : "text-primary/80"}`}
                                    data-tip={`${t(($) => $.quick_search)}: ${t(($) => $.Router, { ns: "zigbee" })}`}
                                    onClick={onFilterClick}
                                    item={SEARCH_TYPE_ROUTER}
                                >
                                    <FontAwesomeIcon icon={faPlug} size="xl" />
                                </Button>
                            </div>
                        </div>
                        <div className="flex flex-row w-48 px-3 py-1 gap-4 justify-center border-dashed border-s border-e border-current/25">
                            <div>
                                <div className="text-sm text-base-content/70">{t(($) => $.EndDevice, { ns: "zigbee" })}</div>
                                <div className="font-semibold text-xl">{endDevices}</div>
                            </div>
                            <div className="self-center">
                                <Button
                                    className={`link tooltip tooltip-bottom ${quickFilter?.[0] === SEARCH_TYPE_END_DEVICE[0] && quickFilter[1] === SEARCH_TYPE_END_DEVICE[1] ? "text-accent/80" : "text-primary/80"}`}
                                    data-tip={`${t(($) => $.quick_search)}: ${t(($) => $.EndDevice, { ns: "zigbee" })}`}
                                    onClick={onFilterClick}
                                    item={SEARCH_TYPE_END_DEVICE}
                                >
                                    <FontAwesomeIcon icon={faBattery} size="xl" />
                                </Button>
                            </div>
                        </div>
                        {gpDevices > 0 && (
                            <div className="flex flex-row w-48 px-3 py-1 gap-4 justify-center border-dashed border-s border-e border-current/25">
                                <div>
                                    <div className="text-sm text-base-content/70">
                                        {t(($) => $.Router, { ns: "zigbee" })} - {t(($) => $.GreenPower, { ns: "zigbee" })}
                                    </div>
                                </div>
                                <div className="font-semibold text-xl">{gpDevices}</div>
                                <div className="self-center">
                                    <Button
                                        className={`link tooltip tooltip-bottom ${quickFilter?.[0] === SEARCH_TYPE_GREENPOWER[0] && quickFilter[1] === SEARCH_TYPE_GREENPOWER[1] ? "text-accent" : "text-primary"}`}
                                        data-tip={`${t(($) => $.quick_search)}: ${t(($) => $.GreenPower, { ns: "zigbee" })}`}
                                        onClick={onFilterClick}
                                        item={SEARCH_TYPE_GREENPOWER}
                                    >
                                        <FontAwesomeIcon icon={faLeaf} size="xl" />
                                    </Button>
                                </div>
                            </div>
                        )}
                        {lowLqiDevices > 0 && (
                            <div className="flex flex-row w-48 px-3 py-1 gap-4 justify-center border-dashed border-s border-e border-current/25">
                                <div>
                                    <div className="text-sm text-base-content/70">{t(($) => $.low_lqi, { ns: "zigbee" })}</div>
                                    <div className="font-semibold text-xl text-error">{lowLqiDevices}</div>
                                    <div className="text-xs text-base-content/50">{"< 50"}</div>
                                </div>
                                <div className="self-center">
                                    <Button
                                        className={`link tooltip tooltip-bottom ${quickFilter?.[0] === SEARCH_LQI_LOW[0] ? "text-accent" : "text-primary"}`}
                                        data-tip={`${t(($) => $.quick_search)}: ${t(($) => $.low_lqi, { ns: "zigbee" })}`}
                                        onClick={onFilterClick}
                                        item={SEARCH_LQI_LOW}
                                    >
                                        <span className="fa-layers fa-xl">
                                            <FontAwesomeIcon
                                                icon={faSignal}
                                                className={`${quickFilter?.[0] === SEARCH_LQI_LOW[0] ? "text-accent/70" : "text-primary/70"}`}
                                            />
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
