import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { type UseEditorStateOptions, useEditorState } from "../../src/components/editors/useEditorState.js";
import { READ_TIMEOUT_MS } from "../../src/components/features/FeatureWrapper.js";
import { createContextWrapper, createMockContext } from "../utils/mockContext.js";
import { renderHook } from "../utils/renderHook.js";

/**
 * Scenario-based tests that simulate complete user journeys through the editor state machine.
 * Each test represents a realistic user interaction pattern from start to finish.
 */

// Helper to create hook options with defaults
function createOptions<T>(overrides: Partial<UseEditorStateOptions<T>> & { value: T; currentValue: T }): UseEditorStateOptions<T> {
    return {
        onChange: vi.fn(),
        ...overrides,
    };
}

describe("useEditorState - User Journey Scenarios", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe("Text Input Flow", () => {
        it("complete flow: idle -> type -> editing -> blur/submit -> pending -> device confirms -> green", () => {
            const onChange = vi.fn();
            const mockContext = createMockContext();
            const { result, rerender } = renderHook((props: UseEditorStateOptions<string>) => useEditorState(props), {
                initialProps: createOptions({ value: "hello", currentValue: "hello", onChange }),
                wrapper: createContextWrapper(mockContext),
            });

            // Step 1: Initial idle state
            expect(result.current.isEditing).toBe(false);
            expect(result.current.isPending).toBe(false);
            expect(result.current.isConfirmed).toBe(false);
            expect(result.current.getInputClass()).toBe("");

            // Step 2: User focuses and starts typing
            act(() => {
                result.current.startEditing();
            });
            expect(result.current.isEditing).toBe(true);
            expect(result.current.getInputClass()).toBe("input-warning");

            // Step 3: User finishes typing "hello world" and blurs (triggers submit)
            act(() => {
                result.current.submit("hello world");
            });

            expect(result.current.isPending).toBe(true);
            expect(result.current.getInputClass()).toBe("input-warning animate-pulse");
            expect(onChange).toHaveBeenCalledWith("hello world");

            // Step 4: Device confirms the value
            rerender(createOptions({ value: "hello world", currentValue: "hello world", onChange }));

            expect(result.current.isConfirmed).toBe(true);
            expect(result.current.isPending).toBe(false);
            expect(result.current.isEditing).toBe(false);
            expect(result.current.getInputClass()).toBe("input-success");
        });

        it("flow with debounced auto-submit: type -> wait 2s -> auto-submit -> pending -> confirm", () => {
            const onChange = vi.fn();
            const mockContext = createMockContext();
            const { result, rerender } = renderHook((props: UseEditorStateOptions<string>) => useEditorState(props), {
                initialProps: createOptions({ value: "initial", currentValue: "initial", onChange }),
                wrapper: createContextWrapper(mockContext),
            });

            // User starts typing
            act(() => {
                result.current.startEditing();
            });

            // Simulate debounced submit (TextEditor does this after 2s of no typing)
            act(() => {
                result.current.submit("new value");
            });

            expect(result.current.isPending).toBe(true);

            // Device confirms
            rerender(createOptions({ value: "new value", currentValue: "new value", onChange }));

            expect(result.current.isConfirmed).toBe(true);
        });
    });

    describe("Slider Flow", () => {
        it("complete flow: idle -> drag -> release -> pending -> device confirms -> green", () => {
            const onChange = vi.fn();
            const mockContext = createMockContext();
            const { result, rerender } = renderHook((props: UseEditorStateOptions<number>) => useEditorState(props), {
                initialProps: createOptions({ value: 50, currentValue: 50, onChange }),
                wrapper: createContextWrapper(mockContext),
            });

            // Step 1: Initial idle state
            expect(result.current.isPending).toBe(false);
            expect(result.current.getRangeClass()).toBe("range-primary");

            // Step 2: User drags slider to 75 and releases (triggers submit)
            act(() => {
                result.current.submit(75);
            });

            expect(result.current.isPending).toBe(true);
            expect(result.current.getRangeClass()).toBe("range-warning");
            expect(onChange).toHaveBeenCalledWith(75);

            // Step 3: Device confirms
            rerender(createOptions({ value: 75, currentValue: 75, onChange }));

            expect(result.current.isConfirmed).toBe(true);
            expect(result.current.getRangeClass()).toBe("range-success");
        });

        it("continuous drag scenario: multiple rapid changes during drag", () => {
            const onChange = vi.fn();
            const mockContext = createMockContext();
            const { result, rerender } = renderHook((props: UseEditorStateOptions<number>) => useEditorState(props), {
                initialProps: createOptions({ value: 0, currentValue: 0, onChange }),
                wrapper: createContextWrapper(mockContext),
            });

            // User drags slider through multiple positions
            act(() => result.current.submit(25));
            act(() => result.current.submit(50));
            act(() => result.current.submit(75));
            act(() => result.current.submit(100));

            // Only waiting for final value
            expect(result.current.sentValue).toBe(100);
            expect(onChange).toHaveBeenCalledTimes(4);

            // Device catches up with intermediate values
            rerender(createOptions({ value: 50, currentValue: 100, onChange }));
            expect(result.current.isPending).toBe(true);
            expect(result.current.isConflict).toBe(false);

            // Device finally confirms final value
            rerender(createOptions({ value: 100, currentValue: 100, onChange }));
            expect(result.current.isConfirmed).toBe(true);
        });
    });

    describe("Toggle Rapid Changes", () => {
        it("ON -> click -> pending(OFF) -> click -> pending(ON) -> device(OFF) -> still pending -> device(ON) -> confirmed", () => {
            const onChange = vi.fn();
            const mockContext = createMockContext();
            const { result, rerender } = renderHook((props: UseEditorStateOptions<boolean>) => useEditorState(props), {
                initialProps: createOptions({ value: true, currentValue: true, onChange }),
                wrapper: createContextWrapper(mockContext),
            });

            // Initial: Toggle is ON
            expect(result.current.getToggleClass()).toBe("");

            // Step 1: User clicks toggle -> OFF
            act(() => {
                result.current.submit(false);
            });
            expect(result.current.sentValue).toBe(false);
            expect(result.current.isPending).toBe(true);

            // Step 2: User clicks toggle again -> ON (before device responds)
            act(() => {
                result.current.submit(true);
            });
            expect(result.current.sentValue).toBe(true);
            expect(result.current.isPending).toBe(true);

            // Step 3: Device confirms first request (OFF)
            rerender(createOptions({ value: false, currentValue: true, onChange }));

            // Should STILL be pending because we're waiting for ON
            expect(result.current.isPending).toBe(true);
            expect(result.current.isConflict).toBe(false);
            expect(result.current.sentValue).toBe(true);

            // Step 4: Device confirms second request (ON)
            rerender(createOptions({ value: true, currentValue: true, onChange }));

            expect(result.current.isConfirmed).toBe(true);
            expect(result.current.isPending).toBe(false);
            expect(result.current.getToggleClass()).toBe("toggle-success");
        });
    });

    describe("Conflict Resolution", () => {
        it("submit(100) -> pending -> device(80) -> conflict -> user sees error state", () => {
            const onChange = vi.fn();
            const mockContext = createMockContext();
            const { result, rerender } = renderHook((props: UseEditorStateOptions<number>) => useEditorState(props), {
                initialProps: createOptions({ value: 50, currentValue: 100, onChange }),
                wrapper: createContextWrapper(mockContext),
            });

            // Step 1: User sets brightness to 100%
            act(() => {
                result.current.submit(100);
            });
            expect(result.current.isPending).toBe(true);

            // Step 2: Device responds with 80 (device limit or actual state)
            rerender(createOptions({ value: 80, currentValue: 100, onChange }));

            // Should show conflict - device couldn't fulfill request
            expect(result.current.isConflict).toBe(true);
            expect(result.current.isPending).toBe(false);
            expect(result.current.getInputClass()).toBe("input-error");
            expect(result.current.getRangeClass()).toBe("range-error");
        });

        it("conflict state persists until user takes action", () => {
            const mockContext = createMockContext();
            const { result, rerender } = renderHook((props: UseEditorStateOptions<number>) => useEditorState(props), {
                initialProps: createOptions({ value: 50, currentValue: 100 }),
                wrapper: createContextWrapper(mockContext),
            });

            // Get into conflict state
            act(() => {
                result.current.submit(100);
            });
            rerender(createOptions({ value: 80, currentValue: 100 }));
            expect(result.current.isConflict).toBe(true);

            // Wait some time - conflict should persist
            act(() => {
                vi.advanceTimersByTime(30000);
            });
            expect(result.current.isConflict).toBe(true);

            // User starts editing again - resetForEdit clears conflict
            act(() => {
                result.current.resetForEdit();
            });
            expect(result.current.isConflict).toBe(false);
            expect(result.current.isEditing).toBe(true);
        });
    });

    describe("Timeout Recovery", () => {
        it("submit -> pending -> 10s -> timeout -> retry available -> retry -> pending -> confirm", () => {
            const onChange = vi.fn();
            const setOnRetry = vi.fn();
            const mockContext = createMockContext({ setOnRetry });
            const { result, rerender } = renderHook((props: UseEditorStateOptions<number>) => useEditorState(props), {
                initialProps: createOptions({ value: 50, currentValue: 75, onChange }),
                wrapper: createContextWrapper(mockContext),
            });

            // Step 1: User submits value
            act(() => {
                result.current.submit(75);
            });
            expect(result.current.isPending).toBe(true);
            expect(result.current.isTimedOut).toBe(false);

            // Step 2: Wait for timeout (10 seconds)
            act(() => {
                vi.advanceTimersByTime(READ_TIMEOUT_MS);
            });

            expect(result.current.isTimedOut).toBe(true);
            expect(result.current.isPending).toBe(false);
            expect(result.current.getInputClass()).toBe("input-error");

            // Step 3: Retry callback was registered (setOnRetry is called with a factory function)
            expect(setOnRetry).toHaveBeenCalled();
            const retryCallbackFactory = setOnRetry.mock.calls[0][0];
            expect(typeof retryCallbackFactory).toBe("function");

            // Step 4: Simulate retry button click (factory returns the actual callback)
            const retryCallback = retryCallbackFactory();
            act(() => {
                retryCallback();
            });

            expect(result.current.isPending).toBe(true);
            expect(result.current.isTimedOut).toBe(false);
            expect(onChange).toHaveBeenCalledTimes(2); // Original + retry

            // Step 5: Device finally confirms
            rerender(createOptions({ value: 75, currentValue: 75, onChange }));

            expect(result.current.isConfirmed).toBe(true);
            expect(result.current.getInputClass()).toBe("input-success");
        });

        it("timeout during slow network - device eventually responds", () => {
            const mockContext = createMockContext();
            const { result, rerender } = renderHook((props: UseEditorStateOptions<number>) => useEditorState(props), {
                initialProps: createOptions({ value: 50, currentValue: 75 }),
                wrapper: createContextWrapper(mockContext),
            });

            act(() => {
                result.current.submit(75);
            });

            // Timeout occurs
            act(() => {
                vi.advanceTimersByTime(READ_TIMEOUT_MS);
            });
            expect(result.current.isTimedOut).toBe(true);

            // But then device responds (late)
            rerender(createOptions({ value: 75, currentValue: 75 }));

            // Late response should clear timeout and confirm
            expect(result.current.isTimedOut).toBe(false);
            expect(result.current.isConfirmed).toBe(true);
        });
    });

    describe("Batched Mode", () => {
        it("multiple changes -> no pending tracking -> Apply button handles state", () => {
            const onChange = vi.fn();
            const setWriteState = vi.fn();
            const mockContext = createMockContext({ setWriteState });
            const { result } = renderHook((props: UseEditorStateOptions<number>) => useEditorState(props), {
                initialProps: createOptions({ value: 50, currentValue: 50, onChange, batched: true }),
                wrapper: createContextWrapper(mockContext),
            });

            // Step 1: Multiple edits in batched mode
            act(() => {
                result.current.submit(60);
            });
            act(() => {
                result.current.submit(70);
            });
            act(() => {
                result.current.submit(80);
            });

            // Each submit should call onChange (for local state updates)
            expect(onChange).toHaveBeenCalledTimes(3);

            // But no pending/confirmed tracking
            expect(result.current.isPending).toBe(false);
            expect(result.current.sentValue).toBeNull();
            expect(result.current.isConfirmed).toBe(false);

            // setWriteState should NOT be called in batched mode
            expect(setWriteState).not.toHaveBeenCalled();
        });

        it("batched mode shows hasLocalChanges warning when value differs", () => {
            const mockContext = createMockContext();
            const { result } = renderHook((props: UseEditorStateOptions<number>) => useEditorState(props), {
                initialProps: createOptions({ value: 50, currentValue: 80, batched: true }),
                wrapper: createContextWrapper(mockContext),
            });

            // Local value differs from device value
            // getInputClass should show warning for unsaved changes
            expect(result.current.getInputClass()).toBe("input-warning");
            expect(result.current.getRangeClass()).toBe("range-warning");
        });

        it("batched mode ignores timeout completely", () => {
            const mockContext = createMockContext();
            const { result } = renderHook((props: UseEditorStateOptions<number>) => useEditorState(props), {
                initialProps: createOptions({ value: 50, currentValue: 80, batched: true }),
                wrapper: createContextWrapper(mockContext),
            });

            act(() => {
                result.current.submit(80);
            });

            // Wait well past timeout
            act(() => {
                vi.advanceTimersByTime(READ_TIMEOUT_MS * 2);
            });

            // Should never timeout in batched mode
            expect(result.current.isTimedOut).toBe(false);
        });
    });

    describe("Edge Cases", () => {
        it("submitting null/undefined values does not track pending state", () => {
            const onChange = vi.fn();
            const mockContext = createMockContext();
            const { result } = renderHook((props: UseEditorStateOptions<string | null>) => useEditorState(props), {
                initialProps: createOptions({ value: "test", currentValue: null as string | null, onChange }),
                wrapper: createContextWrapper(mockContext),
            });

            act(() => {
                result.current.submit(null);
            });

            // onChange should be called
            expect(onChange).toHaveBeenCalledWith(null);

            // But pending state should not be tracked for null values
            expect(result.current.isPending).toBe(false);
        });

        it("rapid edit-submit-edit cycle maintains correct state", () => {
            const mockContext = createMockContext();
            const { result, rerender } = renderHook((props: UseEditorStateOptions<string>) => useEditorState(props), {
                initialProps: createOptions({ value: "a", currentValue: "a" }),
                wrapper: createContextWrapper(mockContext),
            });

            // Edit -> Submit -> Edit again before confirm
            act(() => result.current.startEditing());
            act(() => result.current.submit("b"));
            expect(result.current.isPending).toBe(true);

            // Start editing new value before device confirms
            // sentValue is preserved to track in-flight request (fixes race condition)
            act(() => result.current.resetForEdit());
            expect(result.current.isEditing).toBe(true);
            expect(result.current.sentValue).toBe("b"); // Still tracking in-flight request

            // Submit new value
            act(() => result.current.submit("c"));
            expect(result.current.sentValue).toBe("c");

            // Device confirms latest value
            rerender(createOptions({ value: "c", currentValue: "c" }));
            expect(result.current.isConfirmed).toBe(true);
        });
    });
});
