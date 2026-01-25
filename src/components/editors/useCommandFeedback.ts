import { useCallback, useEffect, useRef } from "react";
import type { CommandResponse } from "../../types.js";
import { generateTransactionId, registerDeviceSetCallback, unregisterDeviceSetCallback } from "../../websocket/WebSocketManager.js";
import { useFeatureReading, type WriteState } from "../features/FeatureReadingContext.js";

const SUCCESS_MS = 2000;
const TIMEOUT_MS = 10000;

/** Command status - matches backend response status with 'idle' for no pending request */
export type CommandStatus = "idle" | "pending" | "ok" | "error" | "queued" | "partial";

/**
 * Minimal hook for command feedback - replaces useEditorState's 632-line state machine.
 * Leverages existing WebSocketManager callback infrastructure for response handling.
 * Also registers retry callback via context for SyncRetryButton to use.
 */
export function useCommandFeedback(
    options: {
        sourceIdx?: number;
        batched?: boolean;
        onSuccess?: () => void;
        /** Called when command is queued for sleepy device (pending + final). Receives the sent payload for optimistic updates. */
        onQueued?: (sentPayload: unknown) => void;
    } = {},
) {
    const { sourceIdx, batched, onSuccess, onQueued } = options;
    const sentPayloadRef = useRef<unknown>(undefined);
    const { setWriteState, setOnRetry } = useFeatureReading();
    const statusRef = useRef<CommandStatus>("idle");
    const errorRef = useRef<CommandResponse["error"] | undefined>(undefined);
    const failedRef = useRef<Record<string, string> | undefined>(undefined);
    const txRef = useRef<string | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const lastSendFnRef = useRef<((txId?: string) => void) | null>(null);

    const update = useCallback(
        (status: CommandStatus, err?: CommandResponse["error"], failed?: Record<string, string>) => {
            statusRef.current = status;
            errorRef.current = err;
            failedRef.current = failed;
            if (batched || !setWriteState) return;
            const state: WriteState = {
                isPending: status === "pending",
                isConfirmed: status === "ok",
                isError: status === "error",
                isTimedOut: false,
                isQueued: status === "queued",
                isPartial: status === "partial",
                errorDetails: err,
                ...(failed && { failedAttributes: failed }),
            };
            setWriteState(state);
        },
        [batched, setWriteState],
    );

    useEffect(
        () => () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            if (txRef.current && sourceIdx !== undefined) unregisterDeviceSetCallback(sourceIdx, txRef.current);
        },
        [sourceIdx],
    );

    const send = useCallback(
        (sendFn: (txId?: string) => void, sentPayload?: unknown) => {
            sentPayloadRef.current = sentPayload;
            if (batched) {
                sendFn();
                return;
            }
            // Store for retry
            lastSendFnRef.current = sendFn;
            if (timerRef.current) clearTimeout(timerRef.current);
            update("pending");
            if (sourceIdx === undefined) {
                sendFn();
                return;
            }
            if (txRef.current) unregisterDeviceSetCallback(sourceIdx, txRef.current);
            const txId = generateTransactionId(sourceIdx);
            txRef.current = txId;
            registerDeviceSetCallback(
                sourceIdx,
                txId,
                (r) => {
                    if (txRef.current === txId) txRef.current = null;
                    if (r.status === "ok") {
                        update("ok");
                        onSuccess?.(); // Safe to clear state - backend will publish state update
                        timerRef.current = setTimeout(() => update("idle"), SUCCESS_MS);
                    } else if (r.status === "error") update("error", r.error);
                    else if (r.status === "partial") update("partial", undefined, r.failed);
                    else if (r.status === "pending") {
                        update("queued");
                        // If final=true, command was transmitted but can't confirm delivery (sleepy device).
                        // Call onQueued with sent payload for optimistic update, then onSuccess to clear local state.
                        // Note: This optimistic state is in-memory only - see pr-frontend.md for restart limitation.
                        //
                        // Future enhancement (pr-backend.md A): Backend could send final:false initially, then
                        // final:true when device wakes and confirms. This would enable green dot confirmation
                        // for sleepy devices. Currently we just clear to idle after 2s since no follow-up arrives.
                        if (r.z2m?.final) {
                            onQueued?.(sentPayloadRef.current);
                            onSuccess?.();
                            timerRef.current = setTimeout(() => update("idle"), SUCCESS_MS);
                        }
                    }
                },
                TIMEOUT_MS,
            );
            sendFn(txId);
        },
        [batched, sourceIdx, update, onSuccess, onQueued],
    );

    // Register retry callback - re-sends the last command
    // Note: setOnRetry(() => fn) wraps fn because setState(fn) treats fn as an updater
    useEffect(() => {
        if (batched || !setOnRetry) return;
        setOnRetry(() => () => {
            if (lastSendFnRef.current) {
                send(lastSendFnRef.current);
            }
        });
        return () => setOnRetry(() => undefined);
    }, [batched, setOnRetry, send]);

    const reset = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        update("idle");
    }, [update]);

    return { status: statusRef.current, errorDetails: errorRef.current, failedAttributes: failedRef.current, send, reset };
}
