import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import type { HomePageDeviceData } from "../../pages/HomePage.js";
import SourceDot from "../SourceDot.js";
import LastSeen from "../value-decorators/LastSeen.js";
import Lqi from "../value-decorators/Lqi.js";
import PowerSource from "../value-decorators/PowerSource.js";
import DeviceImage from "./DeviceImage.js";

export interface DeviceTileProps extends HomePageDeviceData {}

const DeviceTile = memo(({ sourceIdx, device, deviceState, deviceAvailability, lastSeenConfig, onClick }: DeviceTileProps) => {
    const { t } = useTranslation("zigbee");
    const description = device.description ?? device.definition?.description;

    return (
        <article
            className={`mb-2 card h-[95px] bg-base-200 rounded-box shadow-md ${deviceAvailability === "disabled" ? "card-dash border-warning/40" : deviceAvailability === "offline" ? "card-border border-error/50" : "card-border border-base-300"} cursor-pointer will-change-transform transition-transform hover:-translate-y-1`}
            onClick={(event) => {
                if ((event.target as HTMLElement).nodeName !== "A") {
                    onClick(sourceIdx, device, event.currentTarget);
                }
            }}
        >
            <div className="card-body p-1">
                <div className="flex flex-row items-center gap-3 w-full">
                    <div className="flex-none h-11 w-11 overflow-visible">
                        <DeviceImage disabled={device.disabled} device={device} otaState={deviceState.update?.state} />
                    </div>
                    <div className="min-w-0">
                        <div className="truncate">
                            <Link to={`/device/${sourceIdx}/${device.ieee_address}/info`} className="truncate link link-hover font-semibold">
                                {device.friendly_name}
                            </Link>
                        </div>
                        {description && (
                            <div className="text-xs opacity-50 truncate" title={description}>
                                {description}
                            </div>
                        )}
                        <div className="text-xs opacity-50">
                            <LastSeen lastSeen={deviceState.last_seen} config={lastSeenConfig} />
                        </div>
                        <span className="absolute top-2 right-2">
                            <SourceDot idx={sourceIdx} autoHide />
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex flex-row flex-wrap gap-1 mx-2 mb-2 justify-end items-center">
                <span className="badge badge-soft badge-ghost cursor-default tooltip" data-tip={t(($) => $.lqi)}>
                    <Lqi value={deviceState.linkquality as number | undefined} />
                </span>
                <span className="badge badge-soft badge-ghost cursor-default tooltip" data-tip={t(($) => $.power)}>
                    <PowerSource
                        device={device}
                        batteryPercent={deviceState.battery as number}
                        batteryState={deviceState.battery_state as string}
                        batteryLow={deviceState.battery_low as boolean}
                        showLevel
                    />
                </span>
            </div>
        </article>
    );
});

const DeviceTileGuarded = (props: { data: DeviceTileProps }) => {
    // when filtering, indexing can get "out-of-whack" it appears
    return props?.data ? <DeviceTile {...props.data} /> : null;
};

export default DeviceTileGuarded;
