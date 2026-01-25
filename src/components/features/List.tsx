import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppStore } from "../../store.js";
import {
    type Device,
    type DeviceState,
    FeatureAccessMode,
    type FeatureWithAnySubFeatures,
    type FeatureWithSubFeatures,
    type ListFeature,
} from "../../types.js";
import Button from "../Button.js";
import { useCommandFeedback } from "../editors/useCommandFeedback.js";
import BaseViewer from "./BaseViewer.js";
import Feature from "./Feature.js";
import FeatureWrapper from "./FeatureWrapper.js";
import { type BaseFeatureProps, clampList } from "./index.js";
import NoAccessError from "./NoAccessError.js";

type Props = BaseFeatureProps<ListFeature> & {
    parentFeatures: FeatureWithAnySubFeatures[];
};

function isListRoot(parentFeatures: FeatureWithAnySubFeatures[]) {
    if (parentFeatures !== undefined) {
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

const buildDefaultArray = (min: number, type: string) => (min > 0 ? Array(min).fill(type === "composite" ? {} : "") : []);

const List = memo((props: Props) => {
    const { t } = useTranslation("common");
    const { feature, minimal, parentFeatures, onChange, deviceValue, device, sourceIdx } = props;
    const { property, access = FeatureAccessMode.SET, item_type, length_min, length_max } = feature;
    const isRoot = isListRoot(parentFeatures);

    // Track local changes as sparse object (like FeatureSubFeatures uses state object)
    const [localChanges, setLocalChanges] = useState<Record<number, unknown>>({});

    // Clear local state when command succeeds
    const clearLocalChanges = useCallback(() => setLocalChanges({}), []);

    // Optimistically update device state when command is queued for sleepy device (pending + final).
    // See FeatureSubFeatures.tsx and pr-frontend.md for details on restart limitation.
    const updateDeviceStates = useAppStore((s) => s.updateDeviceStates);
    const onQueued = useCallback(
        (sentPayload: unknown) => {
            if (sourceIdx === undefined || !sentPayload || typeof sentPayload !== "object") return;
            updateDeviceStates(sourceIdx, [{ topic: device.friendly_name, payload: sentPayload as Record<string, unknown> }]);
        },
        [sourceIdx, device.friendly_name, updateDeviceStates],
    );

    // Use command feedback hook for Apply button state
    const { status, send } = useCommandFeedback({ sourceIdx, onSuccess: clearLocalChanges, onQueued });
    const isPending = status === "pending";
    const isQueued = status === "queued";
    const isConfirmed = status === "ok";
    const isTimedOut = status === "error";

    // Helper to extract device array from deviceValue prop
    const getDeviceArray = useCallback((): unknown[] => {
        if (deviceValue) {
            if (Array.isArray(deviceValue)) {
                return clampList(deviceValue, length_min, length_max, (min) => buildDefaultArray(min, item_type.type));
            }
            if (property && typeof deviceValue === "object") {
                const prop = (deviceValue as Record<string, unknown>)[property];
                if (prop) {
                    return clampList(prop as unknown[], length_min, length_max, (min) => buildDefaultArray(min, item_type.type));
                }
            }
        }
        return buildDefaultArray(length_min ?? 0, item_type.type);
    }, [deviceValue, property, item_type.type, length_min, length_max]);

    const deviceArray = getDeviceArray();

    // Compute combined value (like FeatureSubFeatures.combinedState)
    const combinedValue = useMemo(() => {
        const result = [...deviceArray];
        for (const [key, value] of Object.entries(localChanges)) {
            const index = Number(key);
            if (index < result.length) {
                result[index] = value;
            } else {
                // Handle added items beyond device array length
                result[index] = value;
            }
        }
        return result;
    }, [deviceArray, localChanges]);

    // Check if there are actual local changes
    const hasLocalChanges = Object.keys(localChanges).some((key) => localChanges[Number(key)] !== deviceArray[Number(key)]);

    // Helper to check if specific index has local change
    const itemHasLocalChange = useCallback(
        (itemIndex: number): boolean => {
            // If Apply is pending, show amber for items that were sent
            if (isPending && itemIndex in localChanges) {
                return true;
            }
            // If not pending, show amber only if local value differs from device
            return itemIndex in localChanges && localChanges[itemIndex] !== deviceArray[itemIndex];
        },
        [isPending, localChanges, deviceArray],
    );

    // Computed values for canAdd/canRemove
    const canAdd = length_max !== undefined && length_max > 0 ? combinedValue.length < length_max : true;
    const canRemove = length_min !== undefined && length_min > 0 ? combinedValue.length > length_min : true;

    // Reset on device change
    // biome-ignore lint/correctness/useExhaustiveDependencies: specific trigger
    useEffect(() => {
        setLocalChanges({});
    }, [device.ieee_address]);

    const onItemChange = useCallback(
        (itemValue: unknown, itemIndex: number) => {
            let newValue = itemValue;
            if (typeof itemValue === "object" && itemValue != null) {
                newValue = { ...(combinedValue[itemIndex] as object), ...itemValue };
            }

            setLocalChanges((prev) => ({ ...prev, [itemIndex]: newValue ?? "" }));

            if (!isRoot) {
                const newListValue = [...combinedValue];
                newListValue[itemIndex] = newValue ?? "";
                onChange(property ? { [property]: newListValue } : newListValue);
            }
        },
        [combinedValue, property, isRoot, onChange],
    );

    const addItem = useCallback(() => {
        const newIndex = combinedValue.length;
        setLocalChanges((prev) => ({
            ...prev,
            [newIndex]: item_type.type === "composite" ? {} : "",
        }));
    }, [combinedValue.length, item_type.type]);

    const removeItem = useCallback(
        (itemIndex: number) => {
            // For removal, we need to rebuild the changes map with shifted indices
            const newChanges: Record<number, unknown> = {};
            for (const [key, value] of Object.entries(localChanges)) {
                const idx = Number(key);
                if (idx < itemIndex) {
                    newChanges[idx] = value;
                } else if (idx > itemIndex) {
                    newChanges[idx - 1] = value;
                }
                // Skip idx === itemIndex (removed)
            }
            setLocalChanges(newChanges);

            if (!isRoot) {
                const newListValue = combinedValue.filter((_, i) => i !== itemIndex);
                onChange(property ? { [property]: newListValue } : newListValue);
            }
        },
        [localChanges, combinedValue, property, isRoot, onChange],
    );

    const onRootApply = useCallback((): void => {
        const sentPayload = property ? { [property]: combinedValue } : combinedValue;
        send((txId) => {
            onChange(sentPayload, txId);
        }, sentPayload);
    }, [property, onChange, combinedValue, send]);

    if (access & FeatureAccessMode.SET) {
        return (
            <>
                {combinedValue.map((itemValue, itemIndex) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: don't have a fixed value type
                    <div key={itemIndex} className="flex flex-row flex-wrap gap-2 items-center">
                        <Feature
                            feature={item_type as FeatureWithSubFeatures}
                            device={{} as Device}
                            deviceState={itemValue as DeviceState}
                            onChange={(value) => onItemChange(value, itemIndex)}
                            featureWrapperClass={FeatureWrapper}
                            parentFeatures={[...parentFeatures, feature]}
                            batched={isRoot}
                            hasLocalChange={isRoot && itemHasLocalChange(itemIndex)}
                        />
                        {canRemove && (
                            <Button<number> item={itemIndex} className="btn btn-sm btn-error btn-square" onClick={removeItem}>
                                -
                            </Button>
                        )}
                    </div>
                ))}
                {canAdd && (
                    <div className="flex flex-row flex-wrap gap-2">
                        <Button<void> className="btn btn-sm btn-success btn-square" onClick={addItem}>
                            +
                        </Button>
                    </div>
                )}
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

    if (access & FeatureAccessMode.STATE) {
        return <BaseViewer {...props} />;
    }

    return <NoAccessError {...props} />;
});

export default List;
