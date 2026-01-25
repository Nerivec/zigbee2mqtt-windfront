import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import startCase from "lodash/startCase.js";
import { type PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { type ColorFeature, type CommandResponse, FeatureAccessMode, type FeatureWithAnySubFeatures } from "../../types.js";
import { generateTransactionId, registerDeviceSetCallback, unregisterDeviceSetCallback } from "../../websocket/WebSocketManager.js";
import { FeatureReadingContext, type WriteState } from "../features/FeatureReadingContext.js";
import type { FeatureWrapperProps } from "../features/FeatureWrapper.js";
import { READ_TIMEOUT_MS } from "../features/FeatureWrapper.js";
import { getFeatureIcon } from "../features/index.js";
import StatusIndicator from "../features/StatusIndicator.js";

function isColorFeature(feature: FeatureWithAnySubFeatures): feature is ColorFeature {
    return feature.type === "composite" && (feature.name === "color_xy" || feature.name === "color_hs");
}

type SyncState = "idle" | "reading" | "queued" | "timed_out";

export default function DashboardFeatureWrapper({
    children,
    feature,
    deviceValue,
    deviceStateVersion,
    onRead,
    endpointSpecific,
    sourceIdx,
}: PropsWithChildren<FeatureWrapperProps>) {
    const { t } = useTranslation("zigbee");

    // Reading state management (mirrors FeatureWrapper)
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

    // Feature icon and name
    // @ts-expect-error `undefined` is fine
    const unit = feature.unit as string | undefined;
    const [fi, fiClassName] = getFeatureIcon(feature.name, deviceValue, unit);
    const isReadable = onRead !== undefined && (Boolean(feature.property && feature.access & FeatureAccessMode.GET) || isColorFeature(feature));
    const featureName = feature.name === "state" ? feature.property : feature.name;

    // Clear reading/timeout state when device responds
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

    // Sync callback - triggers a read from the device with Command Response API
    const onSync = useCallback(() => {
        if (feature.property && onRead) {
            versionAtReadStartRef.current = deviceStateVersion;
            setSyncState("reading");
            setReadErrorDetails(undefined); // Clear any previous error

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

            timeoutRef.current = setTimeout(() => {
                setSyncState("timed_out");
                timeoutRef.current = null;
                // Clean up transaction callback on timeout
                if (activeReadTransactionRef.current && sourceIdx !== undefined) {
                    unregisterDeviceSetCallback(sourceIdx, activeReadTransactionRef.current);
                    activeReadTransactionRef.current = null;
                }
            }, READ_TIMEOUT_MS);

            onRead({ [feature.property]: "" }, transactionId);
        }
    }, [feature.property, onRead, deviceStateVersion, sourceIdx]);

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
            <div className="flex flex-row items-center gap-1 mb-2">
                <StatusIndicator />
                <FontAwesomeIcon icon={fi} className={fiClassName} />
                <div className="grow-1" title={featureName}>
                    {startCase(featureName)}
                    {!endpointSpecific && <span title={t(($) => $.endpoint)}>{feature.endpoint ? ` (${feature.endpoint})` : null}</span>}
                </div>
                <div className="shrink-1">{children}</div>
            </div>
        </FeatureReadingContext.Provider>
    );
}
