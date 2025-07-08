import type React from "react";
import { type FunctionComponent, type JSX, memo, type PropsWithChildren, useMemo } from "react";
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
import Light from "./Light.js";
import List from "./List.js";
import Lock from "./Lock.js";
import Numeric from "./Numeric.js";
import Switch from "./Switch.js";
import Text from "./Text.js";

interface FeatureProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
    feature: FeatureWithAnySubFeatures;
    device: Device;
    onChange(value: Record<string, unknown>): void;
    onRead?(value: Record<string, unknown>): void;
    featureWrapperClass: FunctionComponent<PropsWithChildren<FeatureWrapperProps>>;
    minimal?: boolean;
    steps?: ValueWithLabelOrPrimitive[];
    parentFeatures: FeatureWithAnySubFeatures[];
    deviceState: DeviceState | Zigbee2MQTTDeviceOptions;
}

const featureToKey = (feature: FeatureProps["feature"]): string =>
    `${feature.type}-${feature.name}-${feature.label}-${feature.access}-${feature.category}-${feature.property}-${feature.endpoint}`;

const Feature = memo((props: FeatureProps): JSX.Element => {
    const { feature, device, deviceState, steps, onRead, onChange, featureWrapperClass: FeatureWrapper, minimal, parentFeatures } = props;
    const deviceValue = useMemo(
        () => (feature.property ? deviceState[feature.property] : undefined),
        [feature.property, deviceState[feature.property!]],
    );
    const key = useMemo(() => featureToKey(feature), [feature]);
    const genericParams = useMemo(
        () => ({
            device,
            deviceValue,
            onChange,
            onRead,
            featureWrapperClass: FeatureWrapper,
            minimal,
            parentFeatures,
        }),
        [device, deviceValue, onChange, onRead, FeatureWrapper, minimal, parentFeatures],
    );
    const wrapperParams = useMemo(() => ({ feature, onRead, deviceValue, parentFeatures }), [feature, onRead, deviceValue, parentFeatures]);

    switch (feature.type) {
        case "binary": {
            return (
                <FeatureWrapper key={key} {...wrapperParams}>
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

            // When parent is a list (this is when parentFeatures is not set), we don't
            // need to take the key of the deviceState (deviceState[feature.property])
            const specificDeviceState: DeviceState = parentFeatures ? (feature.property ? deviceState[feature.property] : deviceState) : deviceState;

            return (
                <FeatureWrapper key={key} {...wrapperParams}>
                    <FeatureSubFeatures feature={feature} key={key} {...genericParams} deviceState={specificDeviceState} />
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
});

export default Feature;
