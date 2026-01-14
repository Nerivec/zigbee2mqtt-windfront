import { createElement, type ReactNode } from "react";
import { vi } from "vitest";
import { FeatureReadingContext, type FeatureReadingState } from "../../src/components/features/FeatureReadingContext.js";

export const createMockContext = (overrides: Partial<FeatureReadingState> = {}): FeatureReadingState => ({
    isReading: false,
    readTimedOut: false,
    writeState: null,
    setWriteState: vi.fn(),
    onRetry: null,
    setOnRetry: vi.fn(),
    onSync: null,
    ...overrides,
});

export const createContextWrapper = (contextValue: FeatureReadingState) => {
    return function ContextWrapper({ children }: { children: ReactNode }) {
        return createElement(FeatureReadingContext.Provider, { value: contextValue }, children);
    };
};
