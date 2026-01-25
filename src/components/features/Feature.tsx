import type React from "react";
import type { FunctionComponent, JSX, PropsWithChildren } from "react";
import type { Zigbee2MQTTDeviceOptions } from "zigbee2mqtt";
import type { ColorFeature, Device, DeviceState, FeatureWithAnySubFeatures, GradientFeature } from "../../types.js";
import type { ValueWithLabelOrPrimitive } from "../editors/EnumEditor.js";
import Binary from "./Binary.js";
import Climate from "./Climate.js";
import Color from "./Color.js";
import Cover from "./Cover.js";
import Enum from "./Enum.js";
import Fan from "./Fan.js";
import FeatureSubFeatures from "./FeatureSubFeatures.js";
import type { FeatureWrapperProps } from "./FeatureWrapper.js";
import { Gradient } from "./Gradient.js";
import { getFeatureKey } from "./index.js";
import Light from "./Light.js";
import List from "./List.js";
import Lock from "./Lock.js";
import Numeric from "./Numeric.js";
import Switch from "./Switch.js";
import Text from "./Text.js";

interface FeatureProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
    feature: FeatureWithAnySubFeatures;
    device: Device;
    onChange(value: Record<string, unknown>, transactionId?: string): void;
    onRead?(value: Record<string, unknown>, transactionId?: string): void;
    featureWrapperClass: FunctionComponent<PropsWithChildren<FeatureWrapperProps>>;
    minimal?: boolean;
    endpointSpecific?: boolean;
    steps?: ValueWithLabelOrPrimitive[];
    parentFeatures: FeatureWithAnySubFeatures[];
    deviceState: DeviceState | Zigbee2MQTTDeviceOptions;
    deviceStateVersion?: number;
    /** When true, changes are batched and submitted via Apply button */
    batched?: boolean;
    /** When true, this feature has a local change pending Apply */
    hasLocalChange?: boolean;
    /** Source index for transaction ID generation */
    sourceIdx?: number;
}

export default function Feature({
    feature,
    device,
    deviceState,
    deviceStateVersion,
    steps,
    onRead,
    onChange,
    featureWrapperClass: FeatureWrapper,
    minimal,
    endpointSpecific,
    parentFeatures,
    batched,
    hasLocalChange,
    sourceIdx,
}: FeatureProps): JSX.Element {
    const deviceValue = feature.property ? deviceState[feature.property] : deviceState;
    const key = getFeatureKey(feature);
    const genericParams = {
        device,
        deviceValue,
        deviceStateVersion,
        onChange,
        onRead,
        featureWrapperClass: FeatureWrapper,
        minimal,
        endpointSpecific,
        parentFeatures,
        batched,
        hasLocalChange,
        sourceIdx,
    };
    const wrapperParams = { feature, onRead, deviceValue, deviceStateVersion, parentFeatures, endpointSpecific, sourceIdx };

    switch (feature.type) {
        case "binary": {
            return (
                <FeatureWrapper key={key} {...wrapperParams} inline={batched}>
                    <Binary feature={feature} key={key} {...genericParams} />
                </FeatureWrapper>
            );
        }
        case "numeric": {
            return (
                <FeatureWrapper key={key} {...wrapperParams}>
                    <Numeric feature={feature} key={key} {...genericParams} steps={steps} />
                </FeatureWrapper>
            );
        }
        case "list": {
            if (feature.name === "gradient" && feature.length_min != null && feature.length_max != null) {
                return (
                    <FeatureWrapper key={key} {...wrapperParams}>
                        <Gradient feature={feature as GradientFeature} key={key} {...genericParams} />
                    </FeatureWrapper>
                );
            }

            return (
                <FeatureWrapper key={key} {...wrapperParams}>
                    <List feature={feature} key={key} {...genericParams} />
                </FeatureWrapper>
            );
        }
        case "text": {
            return (
                <FeatureWrapper key={key} {...wrapperParams}>
                    <Text feature={feature} key={key} {...genericParams} />
                </FeatureWrapper>
            );
        }
        case "enum": {
            return (
                <FeatureWrapper key={key} {...wrapperParams}>
                    <Enum feature={feature} key={key} {...genericParams} />
                </FeatureWrapper>
            );
        }
        case "light": {
            return <Light feature={feature} key={key} {...genericParams} deviceState={deviceState} />;
        }
        case "switch": {
            return <Switch feature={feature} key={key} {...genericParams} deviceState={deviceState} />;
        }
        case "cover": {
            return <Cover feature={feature} key={key} {...genericParams} deviceState={deviceState} />;
        }
        case "lock": {
            return <Lock feature={feature} key={key} {...genericParams} deviceState={deviceState} />;
        }
        case "climate": {
            return <Climate feature={feature} key={key} {...genericParams} deviceState={deviceState} />;
        }
        case "fan": {
            return <Fan feature={feature} key={key} {...genericParams} deviceState={deviceState} />;
        }
        case "composite": {
            if (feature.name === "color_xy" || feature.name === "color_hs") {
                return (
                    <FeatureWrapper key={key} {...wrapperParams}>
                        <Color feature={feature as ColorFeature} key={key} {...genericParams} />
                    </FeatureWrapper>
                );
            }

            return (
                <FeatureWrapper key={key} {...wrapperParams}>
                    <FeatureSubFeatures
                        feature={feature}
                        key={key}
                        {...genericParams}
                        deviceState={feature.property ? deviceState[feature.property] : deviceState}
                    />
                </FeatureWrapper>
            );
        }
        default: {
            console.error("Unsupported feature", feature);

            return (
                <FeatureWrapper key={key} {...wrapperParams}>
                    <pre>{JSON.stringify(feature, null, 4)}</pre>
                </FeatureWrapper>
            );
        }
    }
}
