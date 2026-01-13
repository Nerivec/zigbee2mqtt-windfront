import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { GradientFeature } from "../../types.js";
import Button from "../Button.js";
import ColorEditor from "../editors/ColorEditor.js";
import { getDeviceGamut } from "../editors/index.js";
import { READ_TIMEOUT_MS } from "./FeatureWrapper.js";
import { type BaseFeatureProps, clampList } from "./index.js";

type GradientProps = BaseFeatureProps<GradientFeature>;

const buildDefaultArray = (min: number): string[] => (min > 0 ? Array(min).fill("#ffffff") : []);

// Helper to compare arrays
const arraysEqual = (a: string[], b: string[]): boolean => a.length === b.length && a.every((v, i) => v === b[i]);

export const Gradient = memo((props: GradientProps) => {
    const {
        device,
        minimal,
        onChange,
        feature: { length_min, length_max, property },
        deviceValue,
    } = props;
    const { t } = useTranslation("common");

    // Track pending colors as full array (null = no local edits, use device value)
    const [pendingColors, setPendingColors] = useState<string[] | null>(null);

    // Apply button state machine (same pattern as List.tsx and FeatureSubFeatures)
    const [sentColors, setSentColors] = useState<string[] | null>(null);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [isTimedOut, setIsTimedOut] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastDeviceValueRef = useRef(deviceValue);

    // Helper to get device array from deviceValue prop
    const getDeviceArray = useCallback((): string[] => {
        if (deviceValue && Array.isArray(deviceValue)) {
            return clampList(deviceValue, length_min, length_max, (min) => buildDefaultArray(min));
        }
        return buildDefaultArray(length_min);
    }, [deviceValue, length_min, length_max]);

    const deviceArray = getDeviceArray();

    // Current colors = pending (if editing) or device array
    const colors = pendingColors ?? deviceArray;

    // Check if there are actual local changes
    const hasLocalChanges = pendingColors !== null && !arraysEqual(pendingColors, deviceArray);

    // Computed add/remove constraints
    const canAdd = length_max !== undefined && length_max > 0 ? colors.length < length_max : true;
    const canRemove = length_min !== undefined && length_min > 0 ? colors.length > length_min : true;

    // Reset on device change (same pattern as List.tsx)
    // biome-ignore lint/correctness/useExhaustiveDependencies: specific trigger
    useEffect(() => {
        setPendingColors(null);
        setSentColors(null);
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

    // Detect device response (same pattern as List.tsx)
    useEffect(() => {
        if (sentColors !== null && deviceValue !== lastDeviceValueRef.current) {
            // Device state changed - check if it matches what we sent
            const currentDeviceArray = getDeviceArray();
            if (arraysEqual(currentDeviceArray, sentColors)) {
                setIsConfirmed(true);
                setIsTimedOut(false);
                setSentColors(null);
                setPendingColors(null);
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = null;
                }
            }
        }
        lastDeviceValueRef.current = deviceValue;
    }, [deviceValue, sentColors, getDeviceArray]);

    // Timeout for confirmation (same pattern as List.tsx)
    useEffect(() => {
        if (sentColors !== null && !isTimedOut) {
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
    }, [sentColors, isTimedOut]);

    const gamut = useMemo(() => {
        if (device.definition) {
            return getDeviceGamut(device.definition.vendor, device.definition.description);
        }

        return "cie1931";
    }, [device.definition]);

    const setColor = useCallback(
        (idx: number, hex: string) => {
            setPendingColors((prev) => {
                const current = prev ?? deviceArray;
                const newColors = [...current];
                newColors[idx] = hex;
                return newColors;
            });
            setIsConfirmed(false);
        },
        [deviceArray],
    );

    const addColor = useCallback(() => {
        setPendingColors((prev) => {
            const current = prev ?? deviceArray;
            return [...current, "#ffffff"];
        });
        setIsConfirmed(false);
    }, [deviceArray]);

    const removeColor = useCallback(
        (idx: number) => {
            setPendingColors((prev) => {
                const current = prev ?? deviceArray;
                return current.filter((_, i) => i !== idx);
            });
            setIsConfirmed(false);
        },
        [deviceArray],
    );

    const onGradientApply = useCallback(() => {
        // Track the sent state for confirmation
        setSentColors(colors);
        setIsConfirmed(false);
        setIsTimedOut(false);
        onChange({ [property ?? "gradient"]: colors });
    }, [colors, property, onChange]);

    return (
        <>
            {colors.map((color, idx) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: not much data
                <div key={`${color}-${idx}`} className="flex flex-row flex-wrap gap-2 items-center">
                    <ColorEditor
                        onChange={(newColor: { hex: string }) => {
                            setColor(idx, newColor.hex);
                        }}
                        value={{ hex: color }}
                        format="hex"
                        gamut={gamut}
                        minimal={minimal}
                    />
                    {canRemove && (
                        <Button<number> item={idx} className="btn btn-sm btn-error" onClick={removeColor}>
                            -
                        </Button>
                    )}
                </div>
            ))}
            {canAdd && (
                <div className="flex flex-row flex-wrap gap-2">
                    <Button<void> className="btn btn-sm btn-success" onClick={addColor}>
                        +
                    </Button>
                </div>
            )}
            <div>
                <Button
                    className={`btn ${minimal ? "btn-sm" : ""} ${
                        isConfirmed
                            ? "btn-success"
                            : isTimedOut
                              ? "btn-error"
                              : sentColors !== null
                                ? "btn-warning animate-pulse"
                                : hasLocalChanges
                                  ? "btn-warning"
                                  : "btn-primary"
                    }`}
                    onClick={onGradientApply}
                    disabled={!hasLocalChanges && sentColors === null}
                >
                    {t(($) => $.apply)}
                    {isConfirmed && " ✓"}
                </Button>
            </div>
        </>
    );
});
