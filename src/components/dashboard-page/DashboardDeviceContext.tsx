import { createContext, type PropsWithChildren, useCallback, useContext, useMemo, useState } from "react";
import type { WriteState } from "../features/FeatureReadingContext.js";

// State for a single feature (reported by DashboardFeatureWrapper)
export type FeatureState = {
    isReading: boolean;
    readTimedOut: boolean;
    writeState: WriteState | null;
    onSync: (() => void) | null;
    onRetry: (() => void) | null;
};

// Aggregated state exposed by the context
type DashboardDeviceState = {
    // Aggregate state (worst of all features)
    isAnyReading: boolean;
    isAnyPending: boolean;
    hasAnyConflict: boolean;
    hasAnyTimeout: boolean;

    // Registration functions for features
    registerFeature: (id: string, state: FeatureState) => void;
    unregisterFeature: (id: string) => void;

    // Actions
    syncAll: () => void;
    retryAll: () => void;
};

export const DashboardDeviceContext = createContext<DashboardDeviceState | null>(null);

export function useDashboardDevice() {
    return useContext(DashboardDeviceContext);
}

export function DashboardDeviceProvider({ children }: PropsWithChildren) {
    // Using useState with Map to ensure re-renders when features update
    const [features, setFeatures] = useState<Map<string, FeatureState>>(new Map());

    const registerFeature = useCallback((id: string, state: FeatureState) => {
        setFeatures((prev) => new Map(prev).set(id, state));
    }, []);

    const unregisterFeature = useCallback((id: string) => {
        setFeatures((prev) => {
            const next = new Map(prev);
            next.delete(id);
            return next;
        });
    }, []);

    const syncAll = useCallback(() => {
        for (const state of features.values()) {
            // Only sync features that have pending writes or timeouts
            // Skip features that are already idle/confirmed to reduce noise
            if (state.writeState?.isPending || state.writeState?.isConflict || state.writeState?.isTimedOut || state.readTimedOut) {
                state.onSync?.();
            }
        }
    }, [features]);

    const retryAll = useCallback(() => {
        for (const state of features.values()) {
            if (state.writeState?.isConflict || state.writeState?.isTimedOut || state.readTimedOut) {
                // If there's write conflict/timeout, retry the write
                // If there's read timeout, retry the read
                if (state.writeState?.isConflict || state.writeState?.isTimedOut) {
                    state.onRetry?.();
                } else if (state.readTimedOut) {
                    state.onSync?.();
                }
            }
        }
    }, [features]);

    const value = useMemo(() => {
        const featureList = Array.from(features.values());
        return {
            isAnyReading: featureList.some((f) => f.isReading),
            isAnyPending: featureList.some((f) => f.writeState?.isPending),
            hasAnyConflict: featureList.some((f) => f.writeState?.isConflict),
            hasAnyTimeout: featureList.some((f) => f.writeState?.isTimedOut || f.readTimedOut),
            registerFeature,
            unregisterFeature,
            syncAll,
            retryAll,
        };
    }, [features, registerFeature, unregisterFeature, syncAll, retryAll]);

    return <DashboardDeviceContext.Provider value={value}>{children}</DashboardDeviceContext.Provider>;
}
