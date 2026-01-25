import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Zigbee2MQTTDeviceOptions } from "zigbee2mqtt";
import { useAppStore } from "../../store.js";
import type { DeviceState, FeatureWithAnySubFeatures } from "../../types.js";
import Button from "../Button.js";
import type { ValueWithLabelOrPrimitive } from "../editors/EnumEditor.js";
import { useCommandFeedback } from "../editors/useCommandFeedback.js";
import Feature from "./Feature.js";
import { type BaseFeatureProps, getFeatureKey } from "./index.js";

interface FeatureSubFeaturesProps extends Omit<BaseFeatureProps<FeatureWithAnySubFeatures>, "deviceValue"> {
    minimal?: boolean;
    steps?: Record<string, ValueWithLabelOrPrimitive[]>;
    parentFeatures?: FeatureWithAnySubFeatures[];
    deviceState: DeviceState | Zigbee2MQTTDeviceOptions;
    deviceStateVersion?: number;
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
    deviceStateVersion,
    featureWrapperClass,
    minimal,
    endpointSpecific,
    steps,
    sourceIdx,
}: FeatureSubFeaturesProps) {
    const { type, property } = feature;
    const [state, setState] = useState<CompositeState>({});
    const { t } = useTranslation("common");
    const combinedState = useMemo(() => ({ ...deviceState, ...state }), [deviceState, state]);
    const features = ("features" in feature && feature.features) || [];
    const isRoot = isFeatureRoot(type, parentFeatures);

    // Clear local state when command succeeds
    const clearLocalState = useCallback(() => setState({}), []);

    // Optimistically update device state when command is queued for sleepy device (pending + final).
    // This allows hasLocalChanges to become false (button turns blue) while keeping values visible.
    //
    // KNOWN LIMITATION: This optimistic state is in-memory only. If frontend/backend restarts
    // while a command is queued for a sleepy device, the UI reverts to old values (from state.db).
    // The queued command still executes when device wakes, but UI won't reflect the pending change.
    // See pr-frontend.md "Known Limitation: Restart While Command Queued" for details.
    // Future enhancement: backend could optimistically update state.db for pending+final commands.
    const updateDeviceStates = useAppStore((s) => s.updateDeviceStates);
    const onQueued = useCallback(
        (sentPayload: unknown) => {
            if (sourceIdx === undefined || !sentPayload || typeof sentPayload !== "object") return;
            // Update device state with the values we just sent
            updateDeviceStates(sourceIdx, [{ topic: device.friendly_name, payload: sentPayload as Record<string, unknown> }]);
        },
        [sourceIdx, device.friendly_name, updateDeviceStates],
    );

    // Use command feedback hook for Apply button state
    const { status, send } = useCommandFeedback({ sourceIdx, onSuccess: clearLocalState, onQueued });
    const isPending = status === "pending";
    const isQueued = status === "queued";
    const isConfirmed = status === "ok";
    const isTimedOut = status === "error";

    // Check if there are actual local changes (value differs from device)
    const hasLocalChanges = Object.keys(state).some((key) => state[key] !== deviceState?.[key]);

    // Helper to check if a specific property has a local change
    const propertyHasLocalChange = (prop: string): boolean => {
        // If Apply is pending/timed out, show amber for properties that were sent
        if (isPending && prop in state) {
            return true;
        }
        // If not pending, show amber only if local value differs from device
        return prop in state && state[prop] !== deviceState?.[prop];
    };

    // biome-ignore lint/correctness/useExhaustiveDependencies: specific trigger
    useEffect(() => {
        setState({});
    }, [device.ieee_address]);

    const onFeatureChange = useCallback(
        (value: Record<string, unknown>, transactionId?: string): void => {
            setState((prev) => ({ ...prev, ...value }));

            if (!isRoot) {
                if (type === "composite") {
                    onChange(property ? { [property]: { ...state, ...value } } : value, transactionId);
                } else {
                    onChange(value, transactionId);
                }
            }
        },
        [state, type, property, isRoot, onChange],
    );

    const onRootApply = useCallback((): void => {
        const newState = { ...deviceState, ...state };
        // The payload we send - used for optimistic update if queued
        const sentPayload = property ? { [property]: newState } : newState;
        send((txId) => onChange(sentPayload, txId), sentPayload);
    }, [property, onChange, state, deviceState, send]);

    const onFeatureRead = useCallback(
        (prop: Record<string, unknown>, transactionId?: string): void => {
            if (type === "composite") {
                onRead?.(property ? { [property]: prop } : prop, transactionId);
            } else {
                onRead?.(prop, transactionId);
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
                    deviceStateVersion={deviceStateVersion}
                    onChange={onFeatureChange}
                    onRead={onFeatureRead}
                    featureWrapperClass={featureWrapperClass}
                    minimal={minimal}
                    endpointSpecific={endpointSpecific}
                    steps={steps?.[feature.name]}
                    batched={isRoot}
                    hasLocalChange={isRoot && feature.property !== undefined && propertyHasLocalChange(feature.property)}
                    sourceIdx={sourceIdx}
                />
            ))}
            {isRoot && (
                <div className="flex flex-row gap-3 items-center w-full">
                    <div className="flex-1" />
                    {/* Button color matches StatusIndicator dot behavior:
                        green=confirmed, red=error, amber=pending/queued/hasChanges, blue=idle */}
                    <Button
                        className={`btn ${minimal ? "btn-sm" : ""} ${
                            isConfirmed
                                ? "btn-success"
                                : isTimedOut
                                  ? "btn-error"
                                  : isPending || isQueued
                                    ? "btn-warning"
                                    : hasLocalChanges
                                      ? "btn-warning"
                                      : "btn-primary"
                        }`}
                        onClick={onRootApply}
                    >
                        {t(($) => $.apply)}
                        {isConfirmed && " ✓"}
                    </Button>
                </div>
            )}
        </>
    );
}
