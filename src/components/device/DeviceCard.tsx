import { faCircleRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type PropsWithChildren, memo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import type { DeviceState, FeatureWithAnySubFeatures, LastSeenConfig } from "../../types.js";
import Feature from "../features/Feature.js";
import { type BaseWithSubFeaturesProps, getFeatureKey } from "../features/index.js";
import LastSeen from "../value-decorators/LastSeen.js";
import Lqi from "../value-decorators/Lqi.js";
import PowerSource from "../value-decorators/PowerSource.js";
import DeviceImage from "./DeviceImage.js";

type Props = Omit<BaseWithSubFeaturesProps<FeatureWithAnySubFeatures>, "feature" | "deviceState"> &
    PropsWithChildren<{
        deviceState: DeviceState;
        features: FeatureWithAnySubFeatures[];
        lastSeenConfig: LastSeenConfig;
        endpoint?: string | number;
    }>;

const DeviceCard = memo(({ onChange, onRead, device, endpoint, deviceState, lastSeenConfig, features, featureWrapperClass, children }: Props) => {
    const { t } = useTranslation(["zigbee", "devicePage"]);

    return (
        <>
            <li className="list-row grow p-3">
                <div className="h-12 w-12" style={{ overflow: "visible" }}>
                    {/* disabled always false because dashboard does not contain disabled devices */}
                    <DeviceImage disabled={false} device={device} otaState={deviceState.update?.state} />
                </div>
                <div>
                    <Link to={`/device/${device.ieee_address}/info`} className="link link-hover">
                        {device.friendly_name}
                        {endpoint ? ` (${t("endpoint")}: ${endpoint})` : ""}
                    </Link>
                    <div className="text-xs opacity-50">{device.description || ""}</div>
                </div>
                <div className="list-col-wrap text-sm w-full">
                    {features.map(
                        (feature) =>
                            (!endpoint || !feature.endpoint || feature.endpoint === endpoint) && (
                                <Feature
                                    key={getFeatureKey(feature)}
                                    feature={feature}
                                    device={device}
                                    deviceState={deviceState}
                                    onChange={onChange}
                                    onRead={onRead}
                                    featureWrapperClass={featureWrapperClass}
                                    minimal={true}
                                    parentFeatures={[]}
                                />
                            ),
                    )}
                    <div className="flex flex-row items-center gap-1 mt-3">
                        <div className="grow-1" />
                        <Link to={`/device/${device.ieee_address}/exposes`} className="link link-secondary" title={t("devicePage:exposes")}>
                            <FontAwesomeIcon icon={faCircleRight} size="xl" />
                        </Link>
                    </div>
                </div>
            </li>
            <li className="flex flex-row flex-wrap gap-1 m-2 justify-around items-center">
                <span className="badge badge-soft badge-ghost cursor-default" title={t("last_seen")}>
                    <LastSeen lastSeen={deviceState.last_seen} config={lastSeenConfig} />
                </span>
                <span className="badge badge-soft badge-ghost cursor-default" title={t("lqi")}>
                    <Lqi value={deviceState.linkquality as number | undefined} />
                </span>
                <span className="badge badge-soft badge-ghost cursor-default" title={t("power")}>
                    <PowerSource
                        device={device}
                        batteryPercent={deviceState.battery as number}
                        batteryState={deviceState.battery_state as string}
                        batteryLow={deviceState.battery_low as boolean}
                        showLevel
                    />
                </span>
                {children}
            </li>
        </>
    );
});

export default DeviceCard;
