import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppStore } from "../../store.js";
import type { GradientFeature } from "../../types.js";
import Button from "../Button.js";
import ColorEditor from "../editors/ColorEditor.js";
import { getDeviceGamut } from "../editors/index.js";
import { useCommandFeedback } from "../editors/useCommandFeedback.js";
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
        sourceIdx,
    } = props;
    const { t } = useTranslation("common");

    // Track pending colors as full array (null = no local edits, use device value)
    const [pendingColors, setPendingColors] = useState<string[] | null>(null);

    // Clear local state when command succeeds
    const clearPendingColors = useCallback(() => setPendingColors(null), []);

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
    const { status, send } = useCommandFeedback({ sourceIdx, onSuccess: clearPendingColors, onQueued });
    const isPending = status === "pending";
    const isQueued = status === "queued";
    const isConfirmed = status === "ok";
    const isTimedOut = status === "error";

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

    // Reset on device change
    // biome-ignore lint/correctness/useExhaustiveDependencies: specific trigger
    useEffect(() => {
        setPendingColors(null);
    }, [device.ieee_address]);

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
        },
        [deviceArray],
    );

    const addColor = useCallback(() => {
        setPendingColors((prev) => {
            const current = prev ?? deviceArray;
            return [...current, "#ffffff"];
        });
    }, [deviceArray]);

    const removeColor = useCallback(
        (idx: number) => {
            setPendingColors((prev) => {
                const current = prev ?? deviceArray;
                return current.filter((_, i) => i !== idx);
            });
        },
        [deviceArray],
    );

    const onGradientApply = useCallback(() => {
        const sentPayload = { [property ?? "gradient"]: colors };
        send((txId) => {
            onChange(sentPayload, txId);
        }, sentPayload);
    }, [colors, property, onChange, send]);

    return (
        <>
            {colors.map((color, idx) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: not much data
                <div key={`${color}-${idx}`} className="flex flex-row flex-wrap gap-2 items-center">
                    <ColorEditor
                        onChange={(newColor: { hex: string }) => {
                            setColor(idx, newColor.hex);

                            return Promise.resolve();
                        }}
                        value={{ hex: color }}
                        format="hex"
                        gamut={gamut}
                        minimal={minimal}
                        batched={true}
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
            <div className="flex flex-row gap-2 items-center">
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
                    onClick={onGradientApply}
                >
                    {t(($) => $.apply)}
                    {isConfirmed && " ✓"}
                </Button>
            </div>
        </>
    );
});
