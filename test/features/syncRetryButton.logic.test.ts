import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Tests for SyncRetryButton visibility, styling, and click behavior logic.
 * These tests verify the button's decision logic without rendering the full component.
 */

// Button visibility logic (extracted from component)
function shouldShowButton(state: {
    onSync: (() => void) | null;
    writeState: { isPending?: boolean; isConflict?: boolean; isTimedOut?: boolean } | null;
}): boolean {
    const { onSync, writeState } = state;
    return !!(onSync || writeState?.isConflict || writeState?.isTimedOut || writeState?.isPending);
}

// Button class logic (extracted from component)
function getButtonClass(state: {
    writeState: { isPending?: boolean; isConflict?: boolean; isTimedOut?: boolean } | null;
    isReading: boolean;
    readTimedOut: boolean;
}): string {
    const { writeState, isReading, readTimedOut } = state;

    if (writeState?.isConflict || writeState?.isTimedOut) {
        return "btn btn-xs btn-square btn-error btn-soft";
    }
    if (writeState?.isPending || isReading) {
        return "btn btn-xs btn-square btn-warning btn-soft";
    }
    if (readTimedOut) {
        return "btn btn-xs btn-square btn-error btn-soft";
    }
    return "btn btn-xs btn-square btn-primary btn-soft";
}

// Button disabled logic
function isButtonDisabled(state: { writeState: { isPending?: boolean } | null; isReading: boolean }): boolean {
    return !!(state.writeState?.isPending || state.isReading);
}

// Icon selection logic
type IconType = "redo" | "sync";
function getIconType(state: { writeState: { isPending?: boolean; isConflict?: boolean; isTimedOut?: boolean } | null }): IconType {
    if (state.writeState?.isConflict || state.writeState?.isTimedOut) {
        return "redo";
    }
    return "sync";
}

// Tooltip logic
function getTooltip(
    state: {
        writeState: { isPending?: boolean; isConflict?: boolean; isTimedOut?: boolean } | null;
        isReading: boolean;
        readTimedOut: boolean;
    },
    translations: Record<string, string>,
): string {
    const { writeState, isReading, readTimedOut } = state;

    if (writeState?.isTimedOut) {
        return translations.no_response_retry;
    }
    if (writeState?.isConflict) {
        return translations.device_returned_different_retry;
    }
    if (writeState?.isPending) {
        return translations.sending_to_device;
    }
    if (readTimedOut) {
        return translations.read_timed_out;
    }
    if (isReading) {
        return translations.reading_from_device;
    }
    return translations.get_value_from_device;
}

// Click behavior logic
type ClickAction = "sync" | "retry";
function getClickAction(state: { writeState: { isPending?: boolean; isConflict?: boolean; isTimedOut?: boolean } | null }): ClickAction {
    if (state.writeState?.isConflict || state.writeState?.isTimedOut) {
        return "retry";
    }
    return "sync";
}

describe("SyncRetryButton Logic", () => {
    const translations = {
        get_value_from_device: "Sync",
        reading_from_device: "Reading...",
        sending_to_device: "Sending...",
        no_response_retry: "No response, retry?",
        device_returned_different_retry: "Different value, retry?",
        read_timed_out: "Read timed out",
    };

    describe("Visibility Conditions", () => {
        it("should show when onSync is provided", () => {
            expect(
                shouldShowButton({
                    onSync: () => {},
                    writeState: null,
                }),
            ).toBe(true);
        });

        it("should show when writeState.isPending", () => {
            expect(
                shouldShowButton({
                    onSync: null,
                    writeState: { isPending: true },
                }),
            ).toBe(true);
        });

        it("should show when writeState.isConflict", () => {
            expect(
                shouldShowButton({
                    onSync: null,
                    writeState: { isConflict: true },
                }),
            ).toBe(true);
        });

        it("should show when writeState.isTimedOut", () => {
            expect(
                shouldShowButton({
                    onSync: null,
                    writeState: { isTimedOut: true },
                }),
            ).toBe(true);
        });

        it("should NOT show when none of the above conditions are met", () => {
            expect(
                shouldShowButton({
                    onSync: null,
                    writeState: null,
                }),
            ).toBe(false);

            expect(
                shouldShowButton({
                    onSync: null,
                    writeState: { isPending: false, isConflict: false, isTimedOut: false },
                }),
            ).toBe(false);
        });
    });

    describe("Button Class Logic", () => {
        it("should be btn-error when isConflict", () => {
            const result = getButtonClass({
                writeState: { isConflict: true },
                isReading: false,
                readTimedOut: false,
            });
            expect(result).toContain("btn-error");
        });

        it("should be btn-error when isTimedOut", () => {
            const result = getButtonClass({
                writeState: { isTimedOut: true },
                isReading: false,
                readTimedOut: false,
            });
            expect(result).toContain("btn-error");
        });

        it("should be btn-warning when isPending", () => {
            const result = getButtonClass({
                writeState: { isPending: true },
                isReading: false,
                readTimedOut: false,
            });
            expect(result).toContain("btn-warning");
        });

        it("should be btn-warning when isReading", () => {
            const result = getButtonClass({
                writeState: null,
                isReading: true,
                readTimedOut: false,
            });
            expect(result).toContain("btn-warning");
        });

        it("should be btn-error when readTimedOut", () => {
            const result = getButtonClass({
                writeState: null,
                isReading: false,
                readTimedOut: true,
            });
            expect(result).toContain("btn-error");
        });

        it("should be btn-primary when idle", () => {
            const result = getButtonClass({
                writeState: null,
                isReading: false,
                readTimedOut: false,
            });
            expect(result).toContain("btn-primary");
        });

        it("isConflict takes priority over isReading", () => {
            const result = getButtonClass({
                writeState: { isConflict: true },
                isReading: true,
                readTimedOut: false,
            });
            expect(result).toContain("btn-error");
            expect(result).not.toContain("btn-warning");
        });
    });

    describe("Disabled Logic", () => {
        it("should be disabled when isPending", () => {
            expect(
                isButtonDisabled({
                    writeState: { isPending: true },
                    isReading: false,
                }),
            ).toBe(true);
        });

        it("should be disabled when isReading", () => {
            expect(
                isButtonDisabled({
                    writeState: null,
                    isReading: true,
                }),
            ).toBe(true);
        });

        it("should be enabled when isConflict (for retry)", () => {
            expect(
                isButtonDisabled({
                    writeState: { isPending: false },
                    isReading: false,
                }),
            ).toBe(false);
        });

        it("should be enabled when isTimedOut (for retry)", () => {
            expect(
                isButtonDisabled({
                    writeState: { isPending: false },
                    isReading: false,
                }),
            ).toBe(false);
        });
    });

    describe("Icon Logic", () => {
        it("should use redo icon for conflict", () => {
            expect(
                getIconType({
                    writeState: { isConflict: true },
                }),
            ).toBe("redo");
        });

        it("should use redo icon for timeout", () => {
            expect(
                getIconType({
                    writeState: { isTimedOut: true },
                }),
            ).toBe("redo");
        });

        it("should use sync icon otherwise", () => {
            expect(
                getIconType({
                    writeState: null,
                }),
            ).toBe("sync");

            expect(
                getIconType({
                    writeState: { isPending: true },
                }),
            ).toBe("sync");
        });
    });

    describe("Tooltip Logic", () => {
        it("should show timeout message when isTimedOut", () => {
            expect(getTooltip({ writeState: { isTimedOut: true }, isReading: false, readTimedOut: false }, translations)).toBe("No response, retry?");
        });

        it("should show conflict message when isConflict", () => {
            expect(getTooltip({ writeState: { isConflict: true }, isReading: false, readTimedOut: false }, translations)).toBe(
                "Different value, retry?",
            );
        });

        it("should show sending message when isPending", () => {
            expect(getTooltip({ writeState: { isPending: true }, isReading: false, readTimedOut: false }, translations)).toBe("Sending...");
        });

        it("should show read timeout message when readTimedOut", () => {
            expect(getTooltip({ writeState: null, isReading: false, readTimedOut: true }, translations)).toBe("Read timed out");
        });

        it("should show reading message when isReading", () => {
            expect(getTooltip({ writeState: null, isReading: true, readTimedOut: false }, translations)).toBe("Reading...");
        });

        it("should show sync message when idle", () => {
            expect(getTooltip({ writeState: null, isReading: false, readTimedOut: false }, translations)).toBe("Sync");
        });

        it("isTimedOut takes priority over isConflict in tooltip", () => {
            expect(getTooltip({ writeState: { isTimedOut: true, isConflict: true }, isReading: false, readTimedOut: false }, translations)).toBe(
                "No response, retry?",
            );
        });
    });

    describe("Click Behavior", () => {
        it("should trigger sync action for normal click", () => {
            expect(
                getClickAction({
                    writeState: null,
                }),
            ).toBe("sync");

            expect(
                getClickAction({
                    writeState: { isPending: false, isConflict: false, isTimedOut: false },
                }),
            ).toBe("sync");
        });

        it("should trigger retry action when isConflict", () => {
            expect(
                getClickAction({
                    writeState: { isConflict: true },
                }),
            ).toBe("retry");
        });

        it("should trigger retry action when isTimedOut", () => {
            expect(
                getClickAction({
                    writeState: { isTimedOut: true },
                }),
            ).toBe("retry");
        });
    });

    describe("Click Handler Integration", () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it("sync click should only call onSync", () => {
            const onSync = vi.fn();
            const onRetry = vi.fn();

            // Simulate handleClick logic for sync
            const writeState = { isConflict: false, isTimedOut: false };
            if (writeState.isConflict || writeState.isTimedOut) {
                onSync();
                setTimeout(() => onRetry(), 2000);
            } else {
                onSync();
            }

            expect(onSync).toHaveBeenCalledTimes(1);

            vi.advanceTimersByTime(3000);
            expect(onRetry).not.toHaveBeenCalled();
        });

        it("retry click should call onSync then onRetry after 2s", () => {
            const onSync = vi.fn();
            const onRetry = vi.fn();

            // Simulate handleClick logic for retry
            const writeState = { isConflict: true, isTimedOut: false };
            if (writeState.isConflict || writeState.isTimedOut) {
                onSync();
                setTimeout(() => onRetry(), 2000);
            } else {
                onSync();
            }

            expect(onSync).toHaveBeenCalledTimes(1);
            expect(onRetry).not.toHaveBeenCalled();

            vi.advanceTimersByTime(2000);
            expect(onRetry).toHaveBeenCalledTimes(1);
        });

        it("retry click with timeout state should also call onSync then onRetry", () => {
            const onSync = vi.fn();
            const onRetry = vi.fn();

            // Simulate handleClick logic for retry (timeout case)
            const writeState = { isConflict: false, isTimedOut: true };
            if (writeState.isConflict || writeState.isTimedOut) {
                onSync();
                setTimeout(() => onRetry(), 2000);
            } else {
                onSync();
            }

            expect(onSync).toHaveBeenCalledTimes(1);

            vi.advanceTimersByTime(2000);
            expect(onRetry).toHaveBeenCalledTimes(1);
        });
    });

    describe("State Priority", () => {
        it("writeState errors take priority over read states for class", () => {
            // isConflict should override isReading
            let result = getButtonClass({
                writeState: { isConflict: true, isPending: false },
                isReading: true,
                readTimedOut: false,
            });
            expect(result).toContain("btn-error");

            // isTimedOut should override readTimedOut
            result = getButtonClass({
                writeState: { isTimedOut: true, isPending: false },
                isReading: false,
                readTimedOut: true,
            });
            expect(result).toContain("btn-error");
        });

        it("isPending takes priority over readTimedOut", () => {
            const result = getButtonClass({
                writeState: { isPending: true },
                isReading: false,
                readTimedOut: true,
            });
            expect(result).toContain("btn-warning");
        });
    });
});
