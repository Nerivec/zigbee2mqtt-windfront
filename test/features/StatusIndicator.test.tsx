import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { FeatureReadingContext, type FeatureReadingState, type WriteState } from "../../src/components/features/FeatureReadingContext.js";
import StatusIndicator from "../../src/components/features/StatusIndicator.js";

let container: HTMLDivElement | null = null;
let root: Root | null = null;

// Helper to render with context
function renderWithContext(contextValue: Partial<FeatureReadingState>) {
    const defaultContext: FeatureReadingState = {
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
        ...contextValue,
    };

    void act(() => {
        root?.render(createElement(FeatureReadingContext.Provider, { value: defaultContext }, createElement(StatusIndicator)));
    });

    return container;
}

describe("StatusIndicator", () => {
    beforeEach(() => {
        container = document.createElement("div");
        document.body.appendChild(container);
        root = createRoot(container);
    });

    afterEach(() => {
        void act(() => {
            root?.unmount();
        });
        container?.remove();
        container = null;
        root = null;
    });

    describe("Unknown state", () => {
        it("should show ? icon when value is unknown", () => {
            renderWithContext({ isUnknown: true });
            const questionMark = container?.textContent;
            expect(questionMark).toContain("?");
        });

        it("should show tooltip for unknown value", () => {
            renderWithContext({ isUnknown: true });
            const tooltip = container?.querySelector("[data-tip]");
            expect(tooltip?.getAttribute("data-tip")).toContain("unknown");
        });

        it("should not show ? when pending (even if unknown)", () => {
            const writeState: WriteState = {
                isPending: true,
                isError: false,
                isTimedOut: false,
                isConfirmed: false,
            };
            renderWithContext({ isUnknown: true, writeState });
            // Should show pending indicator, not ?
            const warningDot = container?.querySelector(".bg-warning");
            expect(warningDot).not.toBeNull();
        });
    });

    describe("Idle state", () => {
        it("should render nothing when idle (no writeState, not reading)", () => {
            renderWithContext({});
            // StatusIndicator returns null, so no visible children
            expect(container?.querySelector(".bg-error")).toBeNull();
            expect(container?.querySelector(".bg-warning")).toBeNull();
            expect(container?.querySelector(".bg-success")).toBeNull();
            expect(container?.querySelector("svg")).toBeNull();
        });

        it("should render nothing when writeState is all false", () => {
            const writeState: WriteState = {
                isPending: false,
                isError: false,
                isTimedOut: false,
                isConfirmed: false,
            };
            renderWithContext({ writeState });
            // StatusIndicator returns null, so no visible children
            expect(container?.querySelector(".bg-error")).toBeNull();
            expect(container?.querySelector(".bg-warning")).toBeNull();
            expect(container?.querySelector(".bg-success")).toBeNull();
            expect(container?.querySelector("svg")).toBeNull();
        });
    });

    describe("Error states (highest priority)", () => {
        it("should show red dot for error", () => {
            const writeState: WriteState = {
                isPending: false,
                isError: true,
                isTimedOut: false,
                isConfirmed: false,
            };
            renderWithContext({ writeState });
            const dot = container?.querySelector(".bg-error");
            expect(dot).not.toBeNull();
        });

        it("should show red dot for timeout", () => {
            const writeState: WriteState = {
                isPending: false,
                isError: false,
                isTimedOut: true,
                isConfirmed: false,
            };
            renderWithContext({ writeState });
            const dot = container?.querySelector(".bg-error");
            expect(dot).not.toBeNull();
        });

        it("should NOT show red dot for read timeout (? or nothing is sufficient)", () => {
            // Read timeout alone doesn't warrant a red error indicator
            // If value is unknown, the "?" shows; if known, old value remains visible
            renderWithContext({ readTimedOut: true });
            const dot = container?.querySelector(".bg-error");
            expect(dot).toBeNull();
        });

        it("should display error details in tooltip when available", () => {
            const writeState: WriteState = {
                isPending: false,
                isError: true,
                isTimedOut: false,
                isConfirmed: false,
                errorDetails: {
                    code: "TIMEOUT",
                    message: "Device did not respond",
                },
            };
            renderWithContext({ writeState });
            const tooltip = container?.querySelector("[data-tip]");
            expect(tooltip?.getAttribute("data-tip")).toContain("TIMEOUT");
            expect(tooltip?.getAttribute("data-tip")).toContain("Device did not respond");
        });

        it("should display ZCL status in tooltip when available", () => {
            const writeState: WriteState = {
                isPending: false,
                isError: true,
                isTimedOut: false,
                isConfirmed: false,
                errorDetails: {
                    code: "ZCL_ERROR",
                    message: "Invalid value",
                    zcl_status: 135,
                },
            };
            renderWithContext({ writeState });
            const tooltip = container?.querySelector("[data-tip]");
            expect(tooltip?.getAttribute("data-tip")).toContain("ZCL: 135");
        });
    });

    describe("Partial success state", () => {
        it("should show warning triangle for partial success", () => {
            const writeState: WriteState = {
                isPending: false,
                isError: false,
                isTimedOut: false,
                isConfirmed: false,
                isPartial: true,
                failedAttributes: { color_temp: "Unsupported" },
            };
            renderWithContext({ writeState });
            const svg = container?.querySelector("svg");
            expect(svg).not.toBeNull();
            const tooltip = container?.querySelector("[data-tip]");
            expect(tooltip?.getAttribute("data-tip")).toContain("Partial success");
            expect(tooltip?.getAttribute("data-tip")).toContain("color_temp: Unsupported");
        });

        it("should list multiple failed attributes", () => {
            const writeState: WriteState = {
                isPending: false,
                isError: false,
                isTimedOut: false,
                isConfirmed: false,
                isPartial: true,
                failedAttributes: {
                    color_temp: "Unsupported",
                    hue: "Out of range",
                },
            };
            renderWithContext({ writeState });
            const tooltip = container?.querySelector("[data-tip]");
            const tip = tooltip?.getAttribute("data-tip") || "";
            expect(tip).toContain("color_temp: Unsupported");
            expect(tip).toContain("hue: Out of range");
        });
    });

    describe("Queued state", () => {
        it("should show clock icon for queued write (sleepy device)", () => {
            const writeState: WriteState = {
                isPending: false,
                isError: false,
                isTimedOut: false,
                isConfirmed: false,
                isQueued: true,
            };
            renderWithContext({ writeState });
            const dot = container?.querySelector(".bg-warning");
            expect(dot).not.toBeNull();
            const tooltip = container?.querySelector("[data-tip]");
            expect(tooltip?.getAttribute("data-tip")).toContain("sleepy device");
        });

        it("should show warning dot for queued read (sleepy device)", () => {
            renderWithContext({ isReadQueued: true });
            const dot = container?.querySelector(".bg-warning");
            expect(dot).not.toBeNull();
            const tooltip = container?.querySelector("[data-tip]");
            expect(tooltip?.getAttribute("data-tip")).toContain("sleepy device");
        });
    });

    describe("Pending state", () => {
        it("should show warning dot when pending", () => {
            const writeState: WriteState = {
                isPending: true,
                isError: false,
                isTimedOut: false,
                isConfirmed: false,
            };
            renderWithContext({ writeState });
            const dot = container?.querySelector(".bg-warning");
            expect(dot).not.toBeNull();
        });

        it("should show warning dot when reading", () => {
            renderWithContext({ isReading: true });
            const dot = container?.querySelector(".bg-warning");
            expect(dot).not.toBeNull();
        });
    });

    describe("Confirmed state", () => {
        it("should show green dot when confirmed", () => {
            const writeState: WriteState = {
                isPending: false,
                isError: false,
                isTimedOut: false,
                isConfirmed: true,
            };
            renderWithContext({ writeState });
            const dot = container?.querySelector(".bg-success");
            expect(dot).not.toBeNull();
        });
    });

    describe("State priority", () => {
        it("should prioritize error over partial", () => {
            const writeState: WriteState = {
                isPending: false,
                isError: true,
                isTimedOut: false,
                isConfirmed: false,
                isPartial: true,
                failedAttributes: { color: "Error" },
            };
            renderWithContext({ writeState });
            // Should show error (red dot), not partial (warning triangle)
            const errorDot = container?.querySelector(".bg-error");
            expect(errorDot).not.toBeNull();
        });

        it("should prioritize partial over queued", () => {
            const writeState: WriteState = {
                isPending: false,
                isError: false,
                isTimedOut: false,
                isConfirmed: false,
                isPartial: true,
                isQueued: true,
                failedAttributes: { color: "Error" },
            };
            renderWithContext({ writeState });
            const tooltip = container?.querySelector("[data-tip]");
            expect(tooltip?.getAttribute("data-tip")).toContain("Partial success");
        });

        it("should prioritize queued over pending", () => {
            const writeState: WriteState = {
                isPending: true,
                isError: false,
                isTimedOut: false,
                isConfirmed: false,
                isQueued: true,
            };
            renderWithContext({ writeState });
            const tooltip = container?.querySelector("[data-tip]");
            expect(tooltip?.getAttribute("data-tip")).toContain("sleepy device");
        });
    });

    describe("Read states", () => {
        it("should show warning dot when reading", () => {
            renderWithContext({ isReading: true });
            const dot = container?.querySelector(".bg-warning");
            expect(dot).not.toBeNull();
        });

        it("should show warning dot when read is queued (sleepy device)", () => {
            renderWithContext({ isReadQueued: true });
            const dot = container?.querySelector(".bg-warning");
            expect(dot).not.toBeNull();
            const tooltip = container?.querySelector("[data-tip]");
            expect(tooltip?.getAttribute("data-tip")).toContain("sleepy device");
        });

        it("should show red dot with error details when read fails with error", () => {
            renderWithContext({
                readTimedOut: true,
                readErrorDetails: {
                    code: "TIMEOUT",
                    message: "Device did not respond",
                },
            });
            const dot = container?.querySelector(".bg-error");
            expect(dot).not.toBeNull();
            const tooltip = container?.querySelector("[data-tip]");
            expect(tooltip?.getAttribute("data-tip")).toContain("TIMEOUT");
            expect(tooltip?.getAttribute("data-tip")).toContain("Device did not respond");
        });

        it("should show ZCL status in read error tooltip when available", () => {
            renderWithContext({
                readTimedOut: true,
                readErrorDetails: {
                    code: "ZCL_ERROR",
                    message: "Unsupported attribute",
                    zcl_status: 134,
                },
            });
            const tooltip = container?.querySelector("[data-tip]");
            expect(tooltip?.getAttribute("data-tip")).toContain("ZCL: 134");
        });

        it("should NOT show red dot when readTimedOut but no error details (frontend timeout)", () => {
            // Frontend timeout without backend error details - "?" for unknown is sufficient
            renderWithContext({ readTimedOut: true });
            const errorDot = container?.querySelector(".bg-error");
            expect(errorDot).toBeNull();
        });

        it("should prioritize read queued over isReading", () => {
            // If both somehow set (shouldn't happen), queued takes priority
            renderWithContext({ isReading: true, isReadQueued: true });
            const tooltip = container?.querySelector("[data-tip]");
            expect(tooltip?.getAttribute("data-tip")).toContain("sleepy device");
        });
    });
});
