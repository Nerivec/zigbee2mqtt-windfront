import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Zigbee2MQTTDeviceOptions } from "zigbee2mqtt";
import type { DeviceState, FeatureWithAnySubFeatures } from "../../types.js";
import Button from "../Button.js";
import type { ValueWithLabelOrPrimitive } from "../editors/EnumEditor.js";
import Feature from "./Feature.js";
import { READ_TIMEOUT_MS } from "./FeatureWrapper.js";
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
    const { t } = useTranslation("common");
    const combinedState = useMemo(() => ({ ...deviceState, ...state }), [deviceState, state]);
    const features = ("features" in feature && feature.features) || [];
    const isRoot = isFeatureRoot(type, parentFeatures);

    // Apply button state machine
    const [sentState, setSentState] = useState<CompositeState | null>(null);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [isTimedOut, setIsTimedOut] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastDeviceStateRef = useRef(deviceState);

    // Check if there are actual local changes (value differs from device)
    const hasLocalChanges = Object.keys(state).some((key) => state[key] !== deviceState?.[key]);

    // Helper to check if a specific property has a local change
    const propertyHasLocalChange = (prop: string): boolean => {
        // If Apply is pending/timed out, show amber for properties that were sent
        if (sentState !== null && prop in sentState) {
            return true;
        }
        // If not pending, show amber only if local value differs from device
        return prop in state && state[prop] !== deviceState?.[prop];
    };

    // biome-ignore lint/correctness/useExhaustiveDependencies: specific trigger
    useEffect(() => {
        setState({});
        setSentState(null);
        setIsConfirmed(false);
        setIsTimedOut(false);
    }, [device.ieee_address]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    // Detect device response for Apply button
    useEffect(() => {
        if (sentState !== null && deviceState !== lastDeviceStateRef.current) {
            // Device state changed - check if it matches what we sent
            const allMatch = Object.keys(sentState).every((key) => deviceState[key] === sentState[key]);
            if (allMatch) {
                setIsConfirmed(true);
                setIsTimedOut(false);
                setSentState(null);
                setState({}); // Clear local changes
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = null;
                }
            }
        }
        lastDeviceStateRef.current = deviceState;
    }, [deviceState, sentState]);

    // Timeout for Apply button confirmation
    useEffect(() => {
        if (sentState !== null && !isTimedOut) {
            timeoutRef.current = setTimeout(() => {
                setIsTimedOut(true);
            }, READ_TIMEOUT_MS);
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
    }, [sentState, isTimedOut]);

    const onFeatureChange = useCallback(
        (value: Record<string, unknown>): void => {
            setState((prev) => ({ ...prev, ...value }));
            // Clear confirmed state when user makes new changes
            setIsConfirmed(false);

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

        // Track the sent state for confirmation
        setSentState(state);
        setIsConfirmed(false);
        setIsTimedOut(false);

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
                    batched={isRoot}
                    hasLocalChange={isRoot && feature.property !== undefined && propertyHasLocalChange(feature.property)}
                />
            ))}
            {isRoot && (
                <div className="flex flex-row gap-3 items-center w-full">
                    <div className="flex-1" />
                    <Button
                        className={`btn ${minimal ? "btn-sm" : ""} ${
                            isConfirmed
                                ? "btn-success"
                                : isTimedOut
                                  ? "btn-error"
                                  : sentState !== null
                                    ? "btn-warning animate-pulse"
                                    : hasLocalChanges
                                      ? "btn-warning"
                                      : "btn-primary"
                        }`}
                        onClick={onRootApply}
                        disabled={!hasLocalChanges && sentState === null}
                    >
                        {t(($) => $.apply)}
                        {isConfirmed && " ✓"}
                    </Button>
                </div>
            )}
        </>
    );
}
