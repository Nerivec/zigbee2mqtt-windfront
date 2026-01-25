import { createElement, type ReactNode } from "react";
import { vi } from "vitest";
import { FeatureReadingContext, type FeatureReadingState } from "../../src/components/features/FeatureReadingContext.js";

export const createMockContext = (overrides: Partial<FeatureReadingState> = {}): FeatureReadingState => ({
    isReading: false,
    isReadQueued: false,
    readTimedOut: false,
    readErrorDetails: undefined,
    isUnknown: false,
    writeState: undefined,
    setWriteState: vi.fn(),
    onRetry: undefined,
    setOnRetry: vi.fn(),
    onSync: undefined,
    ...overrides,
});

export const createContextWrapper = (contextValue: FeatureReadingState) => {
    return function ContextWrapper({ children }: { children: ReactNode }) {
        return createElement(FeatureReadingContext.Provider, { value: contextValue }, children);
    };
};
