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
    const { t } = useTranslation(["composite", "common"]);
    const combinedState = useMemo(() => ({ ...deviceState, ...state }), [deviceState, state]);
    const features = ("features" in feature && feature.features) || [];
    const isRoot = isFeatureRoot(type, parentFeatures);

    // biome-ignore lint/correctness/useExhaustiveDependencies: specific trigger
    useEffect(() => {
        setState({});
    }, [device.ieee_address]);

    const onFeatureChange = useCallback(
        (value: Record<string, unknown>): void => {
            setState((prev) => ({ ...prev, ...value }));

            if (!isRoot) {
                if (type === "composite") {
                    onChange(property ? { [property]: { ...state, ...value } } : value);
                } else {
                    onChange(value);
                }
            }
        },
        [state, type, property, isRoot, onChange],
    );

    const onRootApply = useCallback((): void => {
        const newState = { ...deviceState, ...state };

        onChange(property ? { [property]: newState } : newState);
    }, [property, onChange, state, deviceState]);

    const onFeatureRead = useCallback(
        (prop: Record<string, unknown>): void => {
            if (type === "composite") {
                onRead?.(property ? { [property]: prop } : prop);
            } else {
                onRead?.(prop);
            }
        },
        [onRead, type, property],
    );

    return (
        <>
            {features.map((feature) => (
                <Feature
                    // @ts-expect-error typing failure
                    key={getFeatureKey(feature)}
                    // @ts-expect-error typing failure
                    feature={feature}
                    parentFeatures={parentFeatures ?? []}
                    device={device}
                    deviceState={combinedState}
                    onChange={onFeatureChange}
                    onRead={onFeatureRead}
                    featureWrapperClass={featureWrapperClass}
                    minimal={minimal}
                    endpointSpecific={endpointSpecific}
                    steps={steps?.[feature.name]}
                />
            ))}
            {isRoot && (
                <div className="self-end float-right">
                    <Button className={`btn btn-primary ${minimal ? "btn-sm" : ""}`} onClick={onRootApply}>
                        {t("common:apply")}
                    </Button>
                </div>
            )}
        </>
    );
}
