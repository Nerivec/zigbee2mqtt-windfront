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

        // Check if any parent is a composite - if so, this composite is nested and should not be a root
        if (parentFeatures.some((parent) => parent.type === "composite")) {
            return false;
        }

        if (parentFeatures.length === 1) {
            // When parent is e.g. climate
            const parentType = parentFeatures[0].type;

            return parentType != null && parentType !== "composite" && parentType !== "list";
        }
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
        (value: Record<string, unknown>): Promise<void> => {
            setState((prev) => {
                const newState = { ...prev, ...value };

                if (!isRoot) {
                    if (type === "composite") {
                        const newValue = { ...deviceState, ...newState, ...value };

                        onChange(property ? { [property]: newValue } : newValue);
                    } else {
                        onChange(value);
                    }
                }

                return newState;
            });

            return Promise.resolve();
        },
        [deviceState, type, property, isRoot, onChange],
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
                    <Button className={`btn btn-primary ${minimal ? "btn-sm" : ""}`} onClick={onRootApply}>
                        {t(($) => $.apply)}
                    </Button>
                </div>
            )}
        </>
    );
}
