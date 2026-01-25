import { createContext, useContext } from "react";
import type { CommandResponse } from "../../types.js";

// Write state reported by editors (RangeEditor, etc.)
// Note: Value and status are decoupled - value shows device truth (from state channel),
// status dot shows command outcome (from response channel). No "conflict" detection needed.
export type WriteState = {
    isPending: boolean;
    isConfirmed: boolean;
    isTimedOut: boolean;
    /** Backend returned error response (SEND_FAILED, TIMEOUT, etc.) */
    isError?: boolean;
    // States from Command Response API
    isQueued?: boolean;
    isPartial?: boolean;
    // Error details
    errorDetails?: CommandResponse["error"];
    failedAttributes?: Record<string, string>;
    elapsedMs?: number;
};

export type FeatureReadingState = {
    // Read state (set by FeatureWrapper)
    isReading: boolean;
    isReadQueued: boolean;
    readTimedOut: boolean;
    /** Error details from failed read (Command Response API) */
    readErrorDetails?: CommandResponse["error"];

    // Value state (set by FeatureWrapper)
    isUnknown: boolean;

    // Write state (set by editors like RangeEditor)
    writeState: WriteState | undefined;
    setWriteState: ((state: WriteState | undefined) => void) | undefined;

    // Retry callback (set by editor, called by FeatureWrapper button)
    onRetry: (() => void) | undefined;
    setOnRetry: ((fn: (() => void) | undefined) => void) | undefined;

    // Sync callback (provided by FeatureWrapper, called by editors for read)
    onSync: (() => void) | undefined;
};

export const FeatureReadingContext = createContext<FeatureReadingState>({
    isReading: false,
    isReadQueued: false,
    readTimedOut: false,
    readErrorDetails: undefined,
    isUnknown: false,
    writeState: undefined,
    setWriteState: undefined,
    onRetry: undefined,
    setOnRetry: undefined,
    onSync: undefined,
});

export function useFeatureReading() {
    return useContext(FeatureReadingContext);
}
