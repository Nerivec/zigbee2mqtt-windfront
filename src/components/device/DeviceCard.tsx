import { faRightLong } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { memo, type PropsWithChildren } from "react";
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
            <div className="card-body p-2">
                <div className="flex flex-row items-center gap-3 w-full">
                    <div className="flex-none h-11 w-11 overflow-visible">
                        {/* disabled always false because dashboard does not contain disabled devices */}
                        <DeviceImage disabled={false} device={device} otaState={deviceState.update?.state} />
                    </div>
                    <div className="min-w-0">
                        <Link to={`/device/${device.ieee_address}/info`} className="link link-hover">
                            {device.friendly_name}
                            {endpoint ? ` (${t("endpoint")}: ${endpoint})` : ""}
                        </Link>
                        {device.description && (
                            <div className="text-xs opacity-50 truncate" title={device.description}>
                                {device.description}
                            </div>
                        )}
                    </div>
                </div>
                <div className="text-sm w-full p-2">
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
                        <Link to={`/device/${device.ieee_address}/exposes`} className="btn btn-xs">
                            {t("devicePage:exposes")} <FontAwesomeIcon icon={faRightLong} size="lg" />
                        </Link>
                    </div>
                </div>
            </div>
            <div className="flex flex-row flex-wrap gap-1 mx-2 mb-2 justify-around items-center">
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
            </div>
        </>
    );
});

export default DeviceCard;
