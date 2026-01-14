import { createContext, useContext } from "react";

// Write state reported by editors (RangeEditor, etc.)
export type WriteState = {
    isPending: boolean;
    isConflict: boolean;
    isTimedOut: boolean;
    isConfirmed: boolean;
};

export type FeatureReadingState = {
    // Read state (set by FeatureWrapper)
    isReading: boolean;
    readTimedOut: boolean;

    // Write state (set by editors like RangeEditor)
    writeState: WriteState | null;
    setWriteState: ((state: WriteState | null) => void) | null;

    // Retry callback (set by editor, called by FeatureWrapper button)
    onRetry: (() => void) | null;
    setOnRetry: ((fn: (() => void) | null) => void) | null;

    // Sync callback (provided by FeatureWrapper, called by editors for read)
    onSync: (() => void) | null;
};

export const FeatureReadingContext = createContext<FeatureReadingState>({
    isReading: false,
    readTimedOut: false,
    writeState: null,
    setWriteState: null,
    onRetry: null,
    setOnRetry: null,
    onSync: null,
});

export function useFeatureReading() {
    return useContext(FeatureReadingContext);
}
