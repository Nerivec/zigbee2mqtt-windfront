import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import startCase from "lodash/startCase.js";
import { type PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { type ColorFeature, FeatureAccessMode, type FeatureWithAnySubFeatures } from "../../types.js";
import { FeatureReadingContext, type WriteState } from "../features/FeatureReadingContext.js";
import type { FeatureWrapperProps } from "../features/FeatureWrapper.js";
import { READ_TIMEOUT_MS } from "../features/FeatureWrapper.js";
import { getFeatureIcon } from "../features/index.js";
import { useDashboardDevice } from "./DashboardDeviceContext.js";

function isColorFeature(feature: FeatureWithAnySubFeatures): feature is ColorFeature {
    return feature.type === "composite" && (feature.name === "color_xy" || feature.name === "color_hs");
}

type SyncState = "idle" | "reading" | "timed_out";

export default function DashboardFeatureWrapper({
    children,
    feature,
    deviceValue,
    deviceStateVersion,
    onRead,
    endpointSpecific,
}: PropsWithChildren<FeatureWrapperProps>) {
    const { t } = useTranslation("zigbee");
    const dashboardCtx = useDashboardDevice();
    // Extract stable functions to avoid re-render loops
    const registerFeature = dashboardCtx?.registerFeature;
    const unregisterFeature = dashboardCtx?.unregisterFeature;

    // Reading state management (mirrors FeatureWrapper)
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

    // Feature icon and name
    // @ts-expect-error `undefined` is fine
    const unit = feature.unit as string | undefined;
    const [fi, fiClassName] = getFeatureIcon(feature.name, deviceValue, unit);
    const isReadable = onRead !== undefined && (Boolean(feature.property && feature.access & FeatureAccessMode.GET) || isColorFeature(feature));
    const featureName = feature.name === "state" ? feature.property : feature.name;

    // Stable feature ID for registration
    const featureId = feature.property || feature.name;

    // Clear reading/timeout state when device responds
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

    // Sync callback - triggers a read from the device
    const onSync = useCallback(() => {
        if (feature.property && onRead) {
            versionAtReadStartRef.current = deviceStateVersion;
            setSyncState("reading");

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(() => {
                setSyncState("timed_out");
                timeoutRef.current = null;
            }, READ_TIMEOUT_MS);

            onRead({ [feature.property]: "" });
        }
    }, [feature.property, onRead, deviceStateVersion]);

    // Register this feature's state with the device-level context
    useEffect(() => {
        if (registerFeature) {
            registerFeature(featureId, {
                isReading,
                readTimedOut,
                writeState,
                onSync: isReadable ? onSync : null,
                onRetry,
            });
        }

        return () => {
            unregisterFeature?.(featureId);
        };
    }, [registerFeature, unregisterFeature, featureId, isReading, readTimedOut, writeState, onSync, onRetry, isReadable]);

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
            <div className="flex flex-row items-center gap-1 mb-2">
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
