import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import startCase from "lodash/startCase.js";
import { type PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { type ColorFeature, FeatureAccessMode, type FeatureWithAnySubFeatures } from "../../types.js";
import { FeatureReadingContext, type WriteState } from "./FeatureReadingContext.js";
import { getFeatureIcon } from "./index.js";
import SyncRetryButton from "./SyncRetryButton.js";

// Frontend timeout for read operations - matches backend ZCL command timeout (10 seconds).
// This is purely for UI feedback; the backend handles actual device communication.
export const READ_TIMEOUT_MS = 10000;

export type FeatureWrapperProps = {
    feature: FeatureWithAnySubFeatures;
    parentFeatures: FeatureWithAnySubFeatures[];
    deviceValue?: unknown;
    deviceStateVersion?: number;
    onRead?(property: Record<string, unknown>): void;
    endpointSpecific?: boolean;
    /** When true, render children inline with label (used for Binary in batched composites) */
    inline?: boolean;
};

function isColorFeature(feature: FeatureWithAnySubFeatures): feature is ColorFeature {
    return feature.type === "composite" && (feature.name === "color_xy" || feature.name === "color_hs");
}

type SyncState = "idle" | "reading" | "timed_out";

export default function FeatureWrapper({
    children,
    feature,
    deviceValue,
    deviceStateVersion,
    onRead,
    endpointSpecific,
    parentFeatures,
    inline,
}: PropsWithChildren<FeatureWrapperProps>) {
    const { t } = useTranslation("zigbee");
    const [syncState, setSyncState] = useState<SyncState>("idle");
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastDeviceValueRef = useRef(deviceValue);
    const versionAtReadStartRef = useRef<number | undefined>(undefined);

    // Write state from child editors (RangeEditor, etc.)
    const [writeState, setWriteState] = useState<WriteState | null>(null);
    const [onRetry, setOnRetry] = useState<(() => void) | null>(null);

    // Derive boolean values for context provider
    const isReading = syncState === "reading";
    const readTimedOut = syncState === "timed_out";

    // @ts-expect-error `undefined` is fine
    const unit = feature.unit as string | undefined;
    const [fi, fiClassName] = getFeatureIcon(feature.name, deviceValue, unit);
    const isReadable = onRead !== undefined && (Boolean(feature.property && feature.access & FeatureAccessMode.GET) || isColorFeature(feature));
    const parentFeature = parentFeatures[parentFeatures.length - 1];
    const featureName = feature.name === "state" ? feature.property : feature.name;
    let label = feature.label || startCase(featureName);

    if (parentFeature?.label && feature.name === "state" && parentFeature.type !== "light" && parentFeature.type !== "switch") {
        label = `${parentFeature.label} ${feature.label.charAt(0).toLowerCase()}${feature.label.slice(1)}`;
    }

    // Clear reading/timeout state when device responds
    // We detect this by either: value changed, OR deviceStateVersion changed since read started
    useEffect(() => {
        if (syncState !== "idle") {
            const valueChanged = deviceValue !== lastDeviceValueRef.current;
            const versionChanged =
                deviceStateVersion !== undefined && versionAtReadStartRef.current !== undefined && deviceStateVersion > versionAtReadStartRef.current;

            if (valueChanged || versionChanged) {
                setSyncState("idle");
                versionAtReadStartRef.current = undefined;
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = null;
                }
            }
        }
        lastDeviceValueRef.current = deviceValue;
    }, [deviceValue, deviceStateVersion, syncState]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const onSyncClick = useCallback(
        (item: FeatureWithAnySubFeatures) => {
            if (item.property) {
                // Store version at read start to detect device responses
                versionAtReadStartRef.current = deviceStateVersion;
                setSyncState("reading");

                // Clear any existing timeout
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }

                // Set timeout - if no response, show timed out state
                // NOTE: Keep versionAtReadStartRef so late responses can still be detected
                timeoutRef.current = setTimeout(() => {
                    setSyncState("timed_out");
                    timeoutRef.current = null;
                }, READ_TIMEOUT_MS);

                onRead?.({ [item.property]: "" });
            }
        },
        [onRead, deviceStateVersion],
    );

    // Sync callback for editors to trigger a read
    const onSync = useCallback(() => {
        onSyncClick(feature);
    }, [onSyncClick, feature]);

    // Memoize context value to prevent unnecessary re-renders
    const contextValue = useMemo(
        () => ({
            isReading,
            readTimedOut,
            writeState,
            setWriteState,
            onRetry,
            setOnRetry,
            onSync: isReadable ? onSync : null,
        }),
        [isReading, readTimedOut, writeState, onRetry, isReadable, onSync],
    );

    return (
        <FeatureReadingContext.Provider value={contextValue}>
            <div className="list-row p-3">
                <div>
                    <FontAwesomeIcon icon={fi} className={fiClassName} size="2xl" />
                </div>
                {inline ? (
                    <div className="flex items-center gap-3 flex-1">
                        <div>
                            <div title={featureName}>
                                {label}
                                {!endpointSpecific && feature.endpoint ? ` (${t(($) => $.endpoint)}: ${feature.endpoint})` : ""}
                            </div>
                            <div className="text-xs font-semibold opacity-60">{feature.description}</div>
                        </div>
                        <div className="flex-1">{children}</div>
                    </div>
                ) : (
                    <>
                        <div>
                            <div title={featureName}>
                                {label}
                                {!endpointSpecific && feature.endpoint ? ` (${t(($) => $.endpoint)}: ${feature.endpoint})` : ""}
                            </div>
                            <div className="text-xs font-semibold opacity-60">{feature.description}</div>
                        </div>
                        <div className="list-col-wrap flex flex-col gap-2">{children}</div>
                    </>
                )}
                <SyncRetryButton />
            </div>
        </FeatureReadingContext.Provider>
    );
}
