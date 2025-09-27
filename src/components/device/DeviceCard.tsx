import { faRightLong } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type JSX, memo, type PropsWithChildren, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import type { DeviceState, FeatureWithAnySubFeatures, LastSeenConfig } from "../../types.js";
import Feature from "../features/Feature.js";
import { type BaseWithSubFeaturesProps, getFeatureKey } from "../features/index.js";
import SourceDot from "../SourceDot.js";
import LastSeen from "../value-decorators/LastSeen.js";
import Lqi from "../value-decorators/Lqi.js";
import PowerSource from "../value-decorators/PowerSource.js";
import DeviceImage from "./DeviceImage.js";

type Props = Omit<BaseWithSubFeaturesProps<FeatureWithAnySubFeatures>, "feature" | "deviceState"> &
    PropsWithChildren<{
        sourceIdx: number;
        hideSourceDot?: boolean;
        deviceState: DeviceState;
        features: FeatureWithAnySubFeatures[];
        lastSeenConfig: LastSeenConfig;
        endpoint?: number;
    }>;

const DeviceCard = memo(
    ({
        onChange,
        onRead,
        sourceIdx,
        hideSourceDot,
        device,
        endpoint,
        deviceState,
        lastSeenConfig,
        features,
        featureWrapperClass,
        children,
    }: Props) => {
        const { t } = useTranslation(["zigbee", "devicePage"]);
        const endpointName = endpoint != null ? device.endpoints[endpoint]?.name : undefined;
        const displayedFeatures = useMemo(() => {
            const elements: JSX.Element[] = [];

            for (const feature of features) {
                // XXX: show if feature has no endpoint?
                const endpointSpecific = endpoint != null && Boolean(feature.endpoint);

                if (!endpointSpecific || Number(feature.endpoint) === endpoint /* XXX: needed? */ || feature.endpoint === endpointName) {
                    elements.push(
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
                            endpointSpecific={endpointSpecific}
                        />,
                    );
                }
            }

            return elements;
        }, [endpointName, device, endpoint, deviceState, features, featureWrapperClass, onChange, onRead]);

        return (
            <>
                <div className="card-body p-2">
                    <div className="flex flex-row items-center gap-3 w-full">
                        <div className="flex-none h-11 w-11 overflow-visible">
                            {/* disabled always false because dashboard does not contain disabled devices */}
                            <DeviceImage disabled={false} device={device} otaState={deviceState.update?.state} />
                        </div>
                        <div className="min-w-0">
                            <Link to={`/device/${sourceIdx}/${device.ieee_address}/info`} className="link link-hover font-semibold">
                                {device.friendly_name}
                                {endpoint != null ? ` (${t(($) => $.endpoint)}: ${endpointName ? `${endpointName} / ` : ""}${endpoint})` : ""}
                            </Link>
                            {device.description && (
                                <div className="text-xs opacity-50 truncate" title={device.description}>
                                    {device.description}
                                </div>
                            )}
                            <div className="text-xs opacity-50" title={t(($) => $.last_seen)}>
                                <LastSeen lastSeen={deviceState.last_seen} config={lastSeenConfig} />
                            </div>
                            {!hideSourceDot && (
                                <span className="absolute top-2 right-2">
                                    <SourceDot idx={sourceIdx} autoHide />
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="text-sm w-full p-2 max-h-125 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
                        {displayedFeatures}
                    </div>
                    <div className="flex flex-row justify-end mb-2">
                        <Link to={`/device/${sourceIdx}/${device.ieee_address}/exposes`} className="btn btn-xs">
                            {t(($) => $.exposes, { ns: "devicePage" })} <FontAwesomeIcon icon={faRightLong} size="lg" />
                        </Link>
                    </div>
                </div>
                <div className="flex flex-row flex-wrap gap-1 mx-2 mb-2 justify-around items-center">
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
                    {children}
                </div>
            </>
        );
    },
);

export default DeviceCard;
