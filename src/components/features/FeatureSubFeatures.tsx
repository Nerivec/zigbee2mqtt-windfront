import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Zigbee2MQTTDeviceOptions } from "zigbee2mqtt";
import type { DeviceState, FeatureWithAnySubFeatures } from "../../types.js";
import Button from "../Button.js";
import type { ValueWithLabelOrPrimitive } from "../editors/EnumEditor.js";
import Feature from "./Feature.js";
import { type BaseFeatureProps, getFeatureKey } from "./index.js";

interface FeatureSubFeaturesProps extends Omit<BaseFeatureProps<FeatureWithAnySubFeatures>, "deviceValue"> {
    minimal?: boolean;
    steps?: Record<string, ValueWithLabelOrPrimitive[]>;
    parentFeatures?: FeatureWithAnySubFeatures[];
    deviceState: DeviceState | Zigbee2MQTTDeviceOptions;
    endpointSpecific?: boolean;
}

interface CompositeState {
    [key: string]: unknown;
}

function isFeatureRoot(type: FeatureWithAnySubFeatures["type"], parentFeatures: FeatureWithAnySubFeatures[] | undefined) {
    if (type === "composite" && parentFeatures !== undefined) {
        if (parentFeatures.length === 0) {
            return true;
        }

        // none of the parents must be `composite` or `list` to be considered root
        return !parentFeatures.some(({ type }) => type === "composite" || type === "list");
    }

    return false;
}

export default function FeatureSubFeatures({
    feature,
    onChange,
    parentFeatures,
    onRead,
    device,
    deviceState,
    featureWrapperClass,
    minimal,
    endpointSpecific,
    steps,
}: FeatureSubFeaturesProps) {
    const { type, property } = feature;
    const [state, setState] = useState<CompositeState>({});
    const { t } = useTranslation("common");
    const combinedState = useMemo(() => ({ ...deviceState, ...state }), [deviceState, state]);
    const features = ("features" in feature && feature.features) || [];
    const isRoot = isFeatureRoot(type, parentFeatures);

    // biome-ignore lint/correctness/useExhaustiveDependencies: specific trigger
    useEffect(() => {
        setState({});
    }, [device.ieee_address]);

    const onFeatureChange = useCallback(
        async (value: Record<string, unknown>): Promise<void> => {
            setState((prev) => ({ ...prev, ...value }));

            if (!isRoot) {
                if (type === "composite") {
                    const newValue = { ...deviceState, ...state, ...value };

                    await onChange(property ? { [property]: newValue } : newValue);
                } else {
                    await onChange(value);
                }
            }
        },
        [deviceState, state, type, property, isRoot, onChange],
    );

    const onRootApply = useCallback(async (): Promise<void> => {
        const newState = { ...deviceState, ...state };

        await onChange(property ? { [property]: newState } : newState);
    }, [property, onChange, state, deviceState]);

    const onFeatureRead = useCallback(
        async (prop: Record<string, unknown>): Promise<void> => {
            if (type === "composite") {
                await onRead?.(property ? { [property]: prop } : prop);
            } else {
                await onRead?.(prop);
            }
        },
        [onRead, type, property],
    );

    return (
        <>
            {features.map((subFeature) => (
                <Feature
                    // @ts-expect-error typing failure
                    key={getFeatureKey(subFeature)}
                    // @ts-expect-error typing failure
                    feature={subFeature}
                    parentFeatures={[...(parentFeatures ?? []), feature]}
                    device={device}
                    deviceState={combinedState}
                    onChange={onFeatureChange}
                    onRead={onFeatureRead}
                    featureWrapperClass={featureWrapperClass}
                    minimal={minimal}
                    endpointSpecific={endpointSpecific}
                    steps={steps?.[subFeature.name]}
                />
            ))}
            {isRoot && (
                <div className="self-end float-right">
                    <Button className={`btn btn-primary ${minimal ? "btn-sm" : ""}`} onClick={onRootApply} title={feature.property ?? feature.name}>
                        {t(($) => $.apply)}
                    </Button>
                </div>
            )}
        </>
    );
}
