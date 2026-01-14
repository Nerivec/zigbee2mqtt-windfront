import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    type Device,
    type DeviceState,
    FeatureAccessMode,
    type FeatureWithAnySubFeatures,
    type FeatureWithSubFeatures,
    type ListFeature,
} from "../../types.js";
import Button from "../Button.js";
import BaseViewer from "./BaseViewer.js";
import Feature from "./Feature.js";
import FeatureWrapper, { READ_TIMEOUT_MS } from "./FeatureWrapper.js";
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
    const { feature, minimal, parentFeatures, onChange, deviceValue, device } = props;
    const { property, access = FeatureAccessMode.SET, item_type, length_min, length_max } = feature;
    const isRoot = isListRoot(parentFeatures);

    // Track local changes as sparse object (like FeatureSubFeatures uses state object)
    const [localChanges, setLocalChanges] = useState<Record<number, unknown>>({});

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

    // Apply button state machine (exact same pattern as FeatureSubFeatures)
    const [sentState, setSentState] = useState<Record<number, unknown> | null>(null);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [isTimedOut, setIsTimedOut] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastDeviceValueRef = useRef(deviceValue);

    // Check if there are actual local changes (like FeatureSubFeatures line 67)
    const hasLocalChanges = Object.keys(localChanges).some((key) => localChanges[Number(key)] !== deviceArray[Number(key)]);

    // Helper to check if specific index has local change (like FeatureSubFeatures.propertyHasLocalChange)
    const itemHasLocalChange = useCallback(
        (itemIndex: number): boolean => {
            // If Apply is pending/timed out, show amber for items that were sent
            if (sentState !== null && itemIndex in sentState) {
                return true;
            }
            // If not pending, show amber only if local value differs from device
            return itemIndex in localChanges && localChanges[itemIndex] !== deviceArray[itemIndex];
        },
        [sentState, localChanges, deviceArray],
    );

    // Computed values for canAdd/canRemove (simpler than useState + useEffect)
    const canAdd = length_max !== undefined && length_max > 0 ? combinedValue.length < length_max : true;
    const canRemove = length_min !== undefined && length_min > 0 ? combinedValue.length > length_min : true;

    // Reset on device change (same as FeatureSubFeatures lines 79-85)
    // biome-ignore lint/correctness/useExhaustiveDependencies: specific trigger
    useEffect(() => {
        setLocalChanges({});
        setSentState(null);
        setIsConfirmed(false);
        setIsTimedOut(false);
    }, [device.ieee_address]);

    // Cleanup timeout on unmount (same as FeatureSubFeatures lines 87-94)
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    // Detect device response (same pattern as FeatureSubFeatures lines 96-113)
    useEffect(() => {
        if (sentState !== null && deviceValue !== lastDeviceValueRef.current) {
            // Device state changed - check if it matches what we sent
            const allMatch = Object.keys(sentState).every((key) => deviceArray[Number(key)] === sentState[Number(key)]);
            if (allMatch) {
                setIsConfirmed(true);
                setIsTimedOut(false);
                setSentState(null);
                setLocalChanges({}); // Clear local changes (like FeatureSubFeatures line 105)
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = null;
                }
            }
        }
        lastDeviceValueRef.current = deviceValue;
    }, [deviceValue, deviceArray, sentState]);

    // Timeout for confirmation (same as FeatureSubFeatures lines 115-129)
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

    // Update onItemChange (same pattern as FeatureSubFeatures.onFeatureChange lines 131-146)
    const onItemChange = useCallback(
        (itemValue: unknown, itemIndex: number) => {
            let newValue = itemValue;
            if (typeof itemValue === "object" && itemValue != null) {
                newValue = { ...(combinedValue[itemIndex] as object), ...itemValue };
            }

            setLocalChanges((prev) => ({ ...prev, [itemIndex]: newValue ?? "" }));
            // Clear confirmed state when user makes new changes
            setIsConfirmed(false);

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
        setIsConfirmed(false);
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
            setIsConfirmed(false);

            if (!isRoot) {
                const newListValue = combinedValue.filter((_, i) => i !== itemIndex);
                onChange(property ? { [property]: newListValue } : newListValue);
            }
        },
        [localChanges, combinedValue, property, isRoot, onChange],
    );

    // Update onRootApply (same pattern as FeatureSubFeatures lines 148-157)
    const onRootApply = useCallback((): void => {
        // Track the sent state for confirmation (like FeatureSubFeatures line 152)
        setSentState(localChanges);
        setIsConfirmed(false);
        setIsTimedOut(false);

        onChange(property ? { [property]: combinedValue } : combinedValue);
    }, [property, onChange, localChanges, combinedValue]);

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

    if (access & FeatureAccessMode.STATE) {
        return <BaseViewer {...props} />;
    }

    return <NoAccessError {...props} />;
});

export default List;
