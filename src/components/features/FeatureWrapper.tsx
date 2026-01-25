import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import startCase from "lodash/startCase.js";
import { type PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { CommandResponse } from "../../types.js";
import { type ColorFeature, FeatureAccessMode, type FeatureWithAnySubFeatures } from "../../types.js";
import { generateTransactionId, registerDeviceSetCallback, unregisterDeviceSetCallback } from "../../websocket/WebSocketManager.js";
import { FeatureReadingContext, type WriteState } from "./FeatureReadingContext.js";
import { getFeatureIcon } from "./index.js";
import StatusIndicator from "./StatusIndicator.js";
import SyncRetryButton from "./SyncRetryButton.js";

// Frontend timeout for read operations - matches backend ZCL command timeout (10 seconds).
// This is purely for UI feedback; the backend handles actual device communication.
export const READ_TIMEOUT_MS = 10000;

export type FeatureWrapperProps = {
    feature: FeatureWithAnySubFeatures;
    parentFeatures: FeatureWithAnySubFeatures[];
    deviceValue?: unknown;
    deviceStateVersion?: number;
    onRead?(property: Record<string, unknown>, transactionId?: string): void;
    endpointSpecific?: boolean;
    /** When true, render children inline with label (used for Binary in batched composites) */
    inline?: boolean;
    /** Source index for Command Response API (needed for read transaction callbacks) */
    sourceIdx?: number;
};

function isColorFeature(feature: FeatureWithAnySubFeatures): feature is ColorFeature {
    return feature.type === "composite" && (feature.name === "color_xy" || feature.name === "color_hs");
}

type SyncState = "idle" | "reading" | "queued" | "timed_out";

export default function FeatureWrapper({
    children,
    feature,
    deviceValue,
    deviceStateVersion,
    onRead,
    endpointSpecific,
    parentFeatures,
    inline,
    sourceIdx,
}: PropsWithChildren<FeatureWrapperProps>) {
    const { t } = useTranslation("zigbee");
    const [syncState, setSyncState] = useState<SyncState>("idle");
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastDeviceValueRef = useRef(deviceValue);
    const versionAtReadStartRef = useRef<number | undefined>(undefined);
    const activeReadTransactionRef = useRef<string | null>(null);

    // Write state from child editors (RangeEditor, etc.)
    const [writeState, setWriteState] = useState<WriteState | undefined>();
    const [onRetry, setOnRetry] = useState<(() => void) | undefined>();

    // Read error details from Command Response API
    const [readErrorDetails, setReadErrorDetails] = useState<CommandResponse["error"] | undefined>();

    // Derive boolean values for context provider
    const isReading = syncState === "reading";
    const isReadQueued = syncState === "queued";
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
    // This is a backup for when response callback doesn't fire (e.g., no transaction ID)
    useEffect(() => {
        if (syncState !== "idle") {
            const valueChanged = deviceValue !== lastDeviceValueRef.current;
            const versionChanged =
                deviceStateVersion !== undefined && versionAtReadStartRef.current !== undefined && deviceStateVersion > versionAtReadStartRef.current;

            if (valueChanged || versionChanged) {
                setSyncState("idle");
                setReadErrorDetails(undefined);
                versionAtReadStartRef.current = undefined;
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = null;
                }
            }
        }
        lastDeviceValueRef.current = deviceValue;
    }, [deviceValue, deviceStateVersion, syncState]);

    // Cleanup timeout and transaction callback on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            if (activeReadTransactionRef.current && sourceIdx !== undefined) {
                unregisterDeviceSetCallback(sourceIdx, activeReadTransactionRef.current);
                activeReadTransactionRef.current = null;
            }
        };
    }, [sourceIdx]);

    const onSyncClick = useCallback(
        (item: FeatureWithAnySubFeatures) => {
            if (item.property) {
                // Store version at read start to detect device responses
                versionAtReadStartRef.current = deviceStateVersion;
                setSyncState("reading");
                setReadErrorDetails(undefined); // Clear any previous error

                // Clear any existing timeout
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }

                // Clean up previous read transaction if any
                if (activeReadTransactionRef.current && sourceIdx !== undefined) {
                    unregisterDeviceSetCallback(sourceIdx, activeReadTransactionRef.current);
                }

                // Generate transaction ID and register callback for Command Response API
                let transactionId: string | undefined;
                if (sourceIdx !== undefined) {
                    transactionId = generateTransactionId(sourceIdx);
                    activeReadTransactionRef.current = transactionId;

                    registerDeviceSetCallback(
                        sourceIdx,
                        transactionId,
                        (response) => {
                            // Clear the active transaction ref
                            if (activeReadTransactionRef.current === transactionId) {
                                activeReadTransactionRef.current = null;
                            }

                            // Clear timeout since we got a response
                            if (timeoutRef.current) {
                                clearTimeout(timeoutRef.current);
                                timeoutRef.current = null;
                            }

                            switch (response.status) {
                                case "ok":
                                    // Read succeeded - set to idle immediately
                                    setSyncState("idle");
                                    setReadErrorDetails(undefined);
                                    versionAtReadStartRef.current = undefined;
                                    break;
                                case "pending":
                                    // Command queued for sleepy device
                                    setSyncState("queued");
                                    setReadErrorDetails(undefined);
                                    break;
                                case "error":
                                    // Read failed - capture error details
                                    setSyncState("timed_out");
                                    setReadErrorDetails(response.error);
                                    break;
                                case "partial":
                                    // Partial success - set to idle
                                    setSyncState("idle");
                                    setReadErrorDetails(undefined);
                                    versionAtReadStartRef.current = undefined;
                                    break;
                            }
                        },
                        READ_TIMEOUT_MS,
                    );
                }

                // Set timeout - if no response, show timed out state
                // NOTE: Keep versionAtReadStartRef so late responses can still be detected
                timeoutRef.current = setTimeout(() => {
                    setSyncState("timed_out");
                    timeoutRef.current = null;
                    // Clean up transaction callback on timeout
                    if (activeReadTransactionRef.current && sourceIdx !== undefined) {
                        unregisterDeviceSetCallback(sourceIdx, activeReadTransactionRef.current);
                        activeReadTransactionRef.current = null;
                    }
                }, READ_TIMEOUT_MS);

                onRead?.({ [item.property]: "" }, transactionId);
            }
        },
        [onRead, deviceStateVersion, sourceIdx],
    );

    // Sync callback for editors to trigger a read
    const onSync = useCallback(() => {
        onSyncClick(feature);
    }, [onSyncClick, feature]);

    // Determine if device value is unknown (null/undefined)
    const isUnknown = deviceValue === null || deviceValue === undefined;

    // Memoize context value to prevent unnecessary re-renders
    const contextValue = useMemo(
        () => ({
            isReading,
            isReadQueued,
            readTimedOut,
            readErrorDetails,
            isUnknown,
            writeState,
            setWriteState,
            onRetry,
            setOnRetry,
            onSync: isReadable ? onSync : undefined,
        }),
        [isReading, isReadQueued, readTimedOut, readErrorDetails, isUnknown, writeState, onRetry, isReadable, onSync],
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
                        <StatusIndicator />
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
                        <div className="list-col-wrap flex flex-row items-start gap-2">
                            <StatusIndicator />
                            <div className="flex flex-col gap-2">{children}</div>
                        </div>
                    </>
                )}
                <SyncRetryButton />
            </div>
        </FeatureReadingContext.Provider>
    );
}
